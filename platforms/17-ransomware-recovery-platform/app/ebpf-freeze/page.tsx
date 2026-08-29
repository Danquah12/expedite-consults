"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cpu,
  Key,
  Binary,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Terminal,
  RefreshCw,
  Search,
  Download,
  Copy,
  Layers,
  PauseCircle,
  Play,
  Flame,
  FileCode,
  HardDrive,
  Eye,
  Server,
  Crosshair,
  Radio,
  ArrowRight,
  Database,
  Sliders,
  Sparkles
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";
import { EbpfMonitoredProcess, CarvedKeyCandidate } from "@/types/recovery";

// Mock kernel monitored processes
const INITIAL_PROCESSES: EbpfMonitoredProcess[] = [
  {
    pid: 9028,
    ppid: 8812,
    name: "svchost_updater.exe",
    exePath: "C:\\Windows\\Temp\\svchost_updater.exe",
    sha256: "8f4c2b9a7d3e110a562bf0198cd44a9e223019ab7612f00a84d0b17849c23114",
    user: "mercy\\svc_backup_mgmt",
    osType: "WINDOWS_FLTMGR",
    status: "FROZEN",
    filesModifiedCount: 14,
    entropyJumpDelta: 7.94,
    writeBurstIops: 2840,
    hookTracepoint: "FLTMGR!FltpPerformPreCallbacks (IRP_MJ_WRITE)",
    freezeLatencyMs: 0.38,
    ramDumpAvailable: true,
    carvedKeysCount: 2,
    detectedFamily: "LockBit 3.0 (Black)"
  },
  {
    pid: 14208,
    ppid: 1104,
    name: "rust_enc_worker",
    exePath: "/tmp/.cache/rust_enc_worker",
    sha256: "e7a3d90184bbf102c98d71624391abf834612845cba908123efd61245890ac12",
    user: "root (UID 0)",
    osType: "LINUX_EBPF",
    status: "FROZEN",
    filesModifiedCount: 8,
    entropyJumpDelta: 7.89,
    writeBurstIops: 4120,
    hookTracepoint: "tracepoint/syscalls/sys_enter_write",
    freezeLatencyMs: 0.24,
    ramDumpAvailable: true,
    carvedKeysCount: 1,
    detectedFamily: "BlackCat / ALPHV"
  },
  {
    pid: 6184,
    ppid: 4420,
    name: "vss_shadow_del.exe",
    exePath: "C:\\ProgramData\\vss_shadow_del.exe",
    sha256: "33ab719280efc9812903bbad7891240182410982341908234190823419082341",
    user: "mercy\\domain_admin_compromised",
    osType: "WINDOWS_FLTMGR",
    status: "PREVENTED_ZEROIZATION",
    filesModifiedCount: 3,
    entropyJumpDelta: 7.81,
    writeBurstIops: 1200,
    hookTracepoint: "FLTMGR!FltpPerformPreCallbacks (IRP_MJ_SET_INFORMATION)",
    freezeLatencyMs: 0.45,
    ramDumpAvailable: true,
    carvedKeysCount: 1,
    detectedFamily: "Akira Ransomware"
  },
  {
    pid: 21904,
    ppid: 1802,
    name: "esx_encryptor_x64",
    exePath: "/vmfs/volumes/datastore1/esx_encryptor_x64",
    sha256: "9128301928409182309182039812039812093812093812093812093812093812",
    user: "esxi_root",
    osType: "LINUX_EBPF",
    status: "MONITORING",
    filesModifiedCount: 0,
    entropyJumpDelta: 3.41,
    writeBurstIops: 42,
    hookTracepoint: "kprobe/vfs_write",
    freezeLatencyMs: 0.29,
    ramDumpAvailable: false,
    carvedKeysCount: 0,
    detectedFamily: "Babuk ESXi Locker"
  }
];

// Mock carved keys data
const INITIAL_CARVED_KEYS: CarvedKeyCandidate[] = [
  {
    id: "key-001",
    pid: 9028,
    algorithm: "AES-256-CTR",
    memoryOffsetHex: "0x00007FF6C01024A0",
    memoryRegion: "Process Heap (PAGE_READWRITE) [ntdll.dll!RtlAllocateHeap]",
    keyBytesHex: "E4 B2 91 88 4A 1F 09 CC D3 7A 55 10 99 2E 67 AB 81 40 2D FE 33 89 12 0B A7 66 C4 18 9E 32 50 7F",
    entropy: 7.96,
    verificationConfidencePct: 99.8,
    expandedRounds: [
      "Round 00: E4 B2 91 88 4A 1F 09 CC D3 7A 55 10 99 2E 67 AB",
      "Round 01: 81 40 2D FE 33 89 12 0B A7 66 C4 18 9E 32 50 7F",
      "Round 02: 4A 22 9F 11 00 DC 96 DD D3 B6 C3 CD 4A 98 A4 66",
      "Round 03: CB F8 D5 07 F8 71 C7 0C 5F 17 03 14 C1 25 53 6B",
      "Round 14: 19 8E A0 CC 43 99 B1 28 77 EE 40 1A 82 04 DF 55"
    ],
    status: "CONFIRMED_VALID",
    discoveredAt: "2026-08-24 01:04:12 UTC"
  },
  {
    id: "key-002",
    pid: 9028,
    algorithm: "RSA-2048-CRT",
    memoryOffsetHex: "0x00007FF6C0104800",
    memoryRegion: "CryptoAPI Context Blob [CRYPT_EXPORTABLE]",
    keyBytesHex: "30 82 04 A4 02 01 00 02 82 01 01 00 C4 99 81 20 7B E3 ... (2048 bits)",
    entropy: 7.91,
    verificationConfidencePct: 98.4,
    privateExponentSnippet: "d = 0x7c49b20891ae4409384729103984029384019283049182309481203984019283... [Modulus N Verified]",
    status: "CONFIRMED_VALID",
    discoveredAt: "2026-08-24 01:04:13 UTC"
  },
  {
    id: "key-003",
    pid: 14208,
    algorithm: "CHACHA20",
    memoryOffsetHex: "0x00007FFDF820A100",
    memoryRegion: "Rust Anonymous Mmap Region [mprotect PROT_READ]",
    keyBytesHex: "61 70 78 65 33 32 62 20 65 6e 69 6c 6b 20 65 74 9A 44 21 88 B3 71 C0 E4 91 22 55 AA 38 10 99 44",
    entropy: 7.99,
    verificationConfidencePct: 99.4,
    chachaStateMatrix: [
      [0x61707865, 0x33326220, 0x656e696c, 0x6b206574],
      [0x9a442188, 0xb371c0e4, 0x912255aa, 0x38109944],
      [0x81440923, 0x77aa1029, 0x48920194, 0x66bb3910],
      [0x00000001, 0x12345678, 0x9abcdef0, 0x0fedcba9]
    ],
    status: "CONFIRMED_VALID",
    discoveredAt: "2026-08-24 01:04:22 UTC"
  }
];

// Sample raw memory dump rows for the hex viewer
const MEMORY_HEX_DUMP = [
  { offset: "0x00007FF6C0102480", hex: "00 00 00 00 00 00 00 00 18 00 00 00 00 00 00 00", ascii: "................", highlight: false },
  { offset: "0x00007FF6C0102490", hex: "01 00 00 00 20 00 00 00 02 00 00 00 00 00 00 00", ascii: ".... ............", highlight: false },
  { offset: "0x00007FF6C01024A0", hex: "E4 B2 91 88 4A 1F 09 CC D3 7A 55 10 99 2E 67 AB", ascii: "...J..zU...g.", highlight: true, tag: "AES-256 KEY [0..15]" },
  { offset: "0x00007FF6C01024B0", hex: "81 40 2D FE 33 89 12 0B A7 66 C4 18 9E 32 50 7F", ascii: ".@-3.....f...2P.", highlight: true, tag: "AES-256 KEY [16..31]" },
  { offset: "0x00007FF6C01024C0", hex: "4A 22 9F 11 00 DC 96 DD D3 B6 C3 CD 4A 98 A4 66", ascii: "J\"..........J..f", highlight: true, tag: "ROUND KEY 1" },
  { offset: "0x00007FF6C01024D0", hex: "CB F8 D5 07 F8 71 C7 0C 5F 17 03 14 C1 25 53 6B", ascii: ".....q.._....%Sk", highlight: true, tag: "ROUND KEY 2" },
  { offset: "0x00007FF6C01024E0", hex: "00 00 00 00 FF FF FF FF 80 24 10 C0 F6 7F 00 00", ascii: ".........$......", highlight: false },
  { offset: "0x00007FF6C01024F0", hex: "74 65 73 74 2E 64 6F 63 78 2E 6C 6F 63 6B 62 69", ascii: "test.docx.lockbi", highlight: false, tag: "EXT_TARGET" },
  { offset: "0x00007FF6C0102500", hex: "74 00 00 00 00 00 00 00 5C 5C 4E 41 53 2D 30 31", ascii: "t.......\\\\NAS-01", highlight: false },
  { offset: "0x00007FF6C0102510", hex: "61 70 78 65 33 32 62 20 65 6e 69 6c 6b 20 65 74", ascii: "apxe32b enilk et", highlight: true, tag: "CHACHA20 CONSTANT" },
  { offset: "0x00007FF6C0102520", hex: "9A 44 21 88 B3 71 C0 E4 91 22 55 AA 38 10 99 44", ascii: ".D!..q...\"U.8..D", highlight: true, tag: "CHACHA20 KEY" },
  { offset: "0x00007FF6C0102530", hex: "81 44 09 23 77 AA 10 29 48 92 01 94 66 BB 39 10", ascii: ".D.#w..)H...f.9.", highlight: true, tag: "CHACHA20 KEY" },
  { offset: "0x00007FF6C0102540", hex: "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00", ascii: "................", highlight: false }
];

export default function EbpfFreezePage() {
  const [processes, setProcesses] = useState<EbpfMonitoredProcess[]>(INITIAL_PROCESSES);
  const [selectedPid, setSelectedPid] = useState<number>(9028);
  const [carvedKeys, setCarvedKeys] = useState<CarvedKeyCandidate[]>(INITIAL_CARVED_KEYS);
  const [isExecutingFreeze, setIsExecutingFreeze] = useState(false);
  const [freezeProgressStep, setFreezeProgressStep] = useState<number>(0);
  const [freezeLog, setFreezeLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"HEX_VIEWER" | "KEY_CARVER" | "SYSCALL_TELEMETRY" | "ZEROIZE_DEFENSE">("HEX_VIEWER");
  const [filterOs, setFilterOs] = useState<"ALL" | "WINDOWS_FLTMGR" | "LINUX_EBPF">("ALL");
  const [entropyThreshold, setEntropyThreshold] = useState<number>(7.80);
  const [exportedModalOpen, setExportedModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"JSON" | "HEX" | "AEGIS_RESTORE_BLOB">("JSON");
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const selectedProcess = processes.find(p => p.pid === selectedPid) || processes[0];
  const selectedKeys = carvedKeys.filter(k => k.pid === selectedPid);

  const filteredProcesses = processes.filter(p => {
    if (filterOs === "ALL") return true;
    return p.osType === filterOs;
  });

  // Simulated 1-Click Freeze & Rescue RAM Key workflow
  const handleTriggerFreezeAndRescue = (targetPid: number) => {
    setIsExecutingFreeze(true);
    setFreezeProgressStep(1);
    setFreezeLog([
      `[00.00ms] [FLTMGR/eBPF Hook] High-entropy burst threshold tripped (H = 7.94 > ${entropyThreshold}).`,
      `[00.12ms] [Kernel Minifilter] Invoking NtSuspendProcess(PID: ${targetPid}) thread freeze broadcast...`,
    ]);

    setTimeout(() => {
      setFreezeProgressStep(2);
      setFreezeLog(prev => [
        ...prev,
        `[00.38ms] [Kernel Success] All 18 worker threads suspended. Process memory execution blocked in kernel space.`,
        `[00.85ms] [RAM Dump] Capturing physical memory pages from VAD (Virtual Address Descriptor) tree...`
      ]);
    }, 600);

    setTimeout(() => {
      setFreezeProgressStep(3);
      setFreezeLog(prev => [
        ...prev,
        `[01.42ms] [AVX-512 Carver] Scanning 64MB process heap for AES round schedules and ChaCha20 state matrices...`,
        `[02.10ms] [Key Verification] Discovered valid 256-bit key schedule at 0x00007FF6C01024A0.`
      ]);
    }, 1200);

    setTimeout(() => {
      setFreezeProgressStep(4);
      setFreezeLog(prev => [
        ...prev,
        `[02.80ms] [Zeroization Prevented] Ransomware clean-up hook blocked. CryptDestroyKey pre-empted.`,
        `[03.15ms] [Enclave Export] Key validated against sample ciphertext. 100% loss-less decryption guaranteed!`
      ]);
      setProcesses(prev =>
        prev.map(p => (p.pid === targetPid ? { ...p, status: "FROZEN", carvedKeysCount: p.carvedKeysCount + 1 } : p))
      );
      setIsExecutingFreeze(false);
    }, 1900);
  };

  const handleCopyKey = (keyText: string, id: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "20px 24px", minHeight: "calc(100vh - 54px)" }}>
      {/* Header Studio Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.06) 50%, rgba(14,21,38,0.9) 100%)",
        border: "1px solid rgba(16,185,129,0.3)",
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
            background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(16,185,129,0.4)"
          }}>
            <Cpu size={24} color="#070b12" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", color: "#f8fafc" }}>
                Kernel eBPF Syscall Freeze & In-Memory Key Rescue Engine
              </h1>
              <span style={{
                background: "rgba(16,185,129,0.2)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.4)",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 800,
                fontFamily: "monospace"
              }}>
                FLTMGR.SYS + EBPF
              </span>
              <span style={{
                background: "rgba(6,182,212,0.15)",
                color: "#06b6d4",
                border: "1px solid rgba(6,182,212,0.35)",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "monospace"
              }}>
                SUB-0.5MS PRE-EMPTION
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 3 }}>
              Deep-kernel telemetry hooks into Windows FLTMGR.sys minifilters and Linux eBPF tracepoints (<code style={{ color: "#10b981" }}>sys_enter_write</code>). Intercepts encryption bursts and rescues AES/RSA/ChaCha20 round keys from live process RAM before zeroization.
            </p>
          </div>
        </div>

        {/* Global Action */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => handleTriggerFreezeAndRescue(selectedPid)}
            disabled={isExecutingFreeze}
            style={{
              background: isExecutingFreeze ? "rgba(245,158,11,0.2)" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              border: isExecutingFreeze ? "1px solid #f59e0b" : "none",
              color: isExecutingFreeze ? "#f59e0b" : "#04100c",
              padding: "9px 18px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 800,
              cursor: isExecutingFreeze ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 0 16px rgba(16,185,129,0.35)",
              transition: "all 0.2s ease"
            }}
          >
            {isExecutingFreeze ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
            <span>{isExecutingFreeze ? "FREEZING & CARVING..." : "1-Click Freeze & Rescue RAM Key"}</span>
          </button>

          <button
            onClick={() => setExportedModalOpen(true)}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              padding: "9px 14px",
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Download size={14} color="#06b6d4" />
            <span>Export Keys</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Quick Ribbon */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>KERNEL HOOK STATUS</span>
            <ShieldCheck size={14} color="#10b981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 4 }}>ARMED & ACTIVE</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>FLTMGR Altitude 385200 + eBPF</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>AVG FREEZE LATENCY</span>
            <Zap size={14} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#06b6d4", marginTop: 4 }}>0.32 ms</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>Sub-millisecond NtSuspendProcess</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>ENTROPY TRIGGER (ΔH)</span>
            <Sliders size={14} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#f59e0b", marginTop: 4 }}>&gt; 7.80 bits/byte</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>Shannon burst acceleration</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>RESCUED ROUND KEYS</span>
            <Key size={14} color="#a855f7" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#a855f7", marginTop: 4 }}>4 Extracted</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>AES-256 / RSA-2048 / ChaCha20</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>ZEROIZATION PREVENTED</span>
            <Lock size={14} color="#10b981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 4 }}>100% Rate</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>RAM heap preserved pre-exit</div>
        </div>
      </div>

      {/* Main Grid: Left Process Table / Right Live Hex & Key Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 16, flex: 1 }}>
        {/* Left Column: Monitored Processes & Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* OS Filter & Slider */}
          <div className="card-tactical" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--fg)" }}>KERNEL TELEMETRY FILTER</span>
              <div style={{ display: "flex", gap: 4 }}>
                {(["ALL", "WINDOWS_FLTMGR", "LINUX_EBPF"] as const).map(os => (
                  <button
                    key={os}
                    onClick={() => setFilterOs(os)}
                    style={{
                      background: filterOs === os ? "rgba(16,185,129,0.2)" : "var(--surface-2)",
                      border: filterOs === os ? "1px solid #10b981" : "1px solid var(--border)",
                      color: filterOs === os ? "#10b981" : "var(--muted)",
                      padding: "3px 8px",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {os.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
                <span>Entropy Freeze Threshold:</span>
                <strong style={{ color: "#f59e0b", fontFamily: "monospace" }}>{entropyThreshold.toFixed(2)} bits/B</strong>
              </div>
              <input
                type="range"
                min="6.5"
                max="7.99"
                step="0.05"
                value={entropyThreshold}
                onChange={(e) => setEntropyThreshold(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#10b981", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: "var(--muted)" }}>
                <span>6.5 (Aggressive)</span>
                <span>7.8 (Optimal Ransomware Burst)</span>
                <span>7.99 (Strict)</span>
              </div>
            </div>
          </div>

          {/* Process List */}
          <div className="card-tactical" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Activity size={14} color="#06b6d4" />
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--fg)" }}>MONITORED PROCESS PIPELINE</span>
              </div>
              <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>{filteredProcesses.length} ACTIVE</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "calc(100vh - 460px)", overflowY: "auto" }}>
              {filteredProcesses.map(proc => {
                const isSelected = proc.pid === selectedPid;
                return (
                  <div
                    key={proc.pid}
                    onClick={() => setSelectedPid(proc.pid)}
                    style={{
                      background: isSelected ? "rgba(16,185,129,0.08)" : "var(--surface-2)",
                      border: isSelected ? "1px solid rgba(16,185,129,0.4)" : "1px solid var(--border)",
                      borderRadius: 6,
                      padding: "10px 12px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          fontFamily: "monospace",
                          fontSize: 11,
                          fontWeight: 800,
                          color: isSelected ? "#10b981" : "#f8fafc"
                        }}>
                          {proc.name}
                        </span>
                        <span style={{ fontSize: 9.5, color: "var(--muted)", fontFamily: "monospace" }}>PID: {proc.pid}</span>
                      </div>
                      <span className={`badge-sev ${proc.status === "FROZEN" ? "badge-critical" : proc.status === "PREVENTED_ZEROIZATION" ? "badge-success" : "badge-medium"}`}>
                        {proc.status === "FROZEN" ? "❄️ FROZEN" : proc.status}
                      </span>
                    </div>

                    <div style={{ fontSize: 10.5, color: "var(--fg-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {proc.exePath}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, fontSize: 10, background: "rgba(0,0,0,0.2)", padding: "4px 8px", borderRadius: 4 }}>
                      <div>
                        <span style={{ color: "var(--muted)" }}>Entropy Δ: </span>
                        <strong style={{ color: proc.entropyJumpDelta > 7.5 ? "#f43f5e" : "#10b981", fontFamily: "monospace" }}>+{proc.entropyJumpDelta}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)" }}>IOPS: </span>
                        <strong style={{ color: "#06b6d4", fontFamily: "monospace" }}>{proc.writeBurstIops}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)" }}>Keys: </span>
                        <strong style={{ color: "#a855f7", fontFamily: "monospace" }}>{proc.carvedKeysCount} carved</strong>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 9.5, color: "var(--muted)" }}>
                      <span>Hook: <code style={{ color: "var(--fg-2)" }}>{proc.hookTracepoint.split(" ")[0]}</code></span>
                      <span style={{ color: "#10b981", fontWeight: 700 }}>{proc.freezeLatencyMs}ms freeze</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Kernel Freeze Execution Console */}
          {freezeLog.length > 0 && (
            <div className="card-tactical" style={{ padding: 12, background: "#050912", border: "1px solid rgba(16,185,129,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 11, fontWeight: 800, color: "#10b981" }}>
                <Terminal size={13} />
                <span>KERNEL SYS-FREEZE TRACE STREAM</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, fontFamily: "monospace", fontSize: 10, color: "#cbd5e1" }}>
                {freezeLog.map((log, idx) => (
                  <div key={idx} style={{ color: log.includes("Success") || log.includes("validated") ? "#10b981" : log.includes("tripped") ? "#f43f5e" : "#06b6d4" }}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Live RAM Hex Viewer & Key Carving Engine */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Sub-navigation Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
            {[
              { id: "HEX_VIEWER", label: "Live RAM Hex & Key Schedule Viewer", icon: Binary },
              { id: "KEY_CARVER", label: "Automated Cryptographic Key Carver", icon: Key },
              { id: "SYSCALL_TELEMETRY", label: "eBPF / FLTMGR Minifilter Hooks", icon: Server },
              { id: "ZEROIZE_DEFENSE", label: "Zeroization & Anti-Evasion Defenses", icon: ShieldCheck }
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
                    color: active ? "#10b981" : "var(--fg-2)",
                    background: active ? "rgba(16,185,129,0.12)" : "transparent",
                    border: active ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <Icon size={14} color={active ? "#10b981" : "var(--muted)"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: Live RAM Memory Hex Viewer */}
          {activeTab === "HEX_VIEWER" && (
            <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                      PHYSICAL RAM MEMORY DUMP — PID {selectedProcess.pid} ({selectedProcess.name})
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
                      VAD ROOT: 0x00007FF6C0000000
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    Captured instantaneously via kernel thread suspension before <code style={{ color: "#f43f5e" }}>RtlZeroMemory</code> execution.
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface-2)", padding: "4px 10px", borderRadius: 4, border: "1px solid var(--border)", fontSize: 11 }}>
                    <Search size={12} color="var(--muted)" />
                    <input
                      placeholder="Search Hex (e.g. E4 B2 91)..."
                      style={{ background: "transparent", border: "none", color: "var(--fg)", outline: "none", fontSize: 11, width: 140 }}
                    />
                  </div>
                  <button
                    onClick={() => handleTriggerFreezeAndRescue(selectedPid)}
                    style={{
                      background: "rgba(16,185,129,0.15)",
                      border: "1px solid rgba(16,185,129,0.4)",
                      color: "#10b981",
                      padding: "4px 10px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <RefreshCw size={12} />
                    <span>Re-Scan Heap</span>
                  </button>
                </div>
              </div>

              {/* Hex Dump Matrix */}
              <div style={{
                background: "#040711",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "12px 14px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 11.5,
                lineHeight: 1.6,
                overflowX: "auto"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "190px 1fr 180px 140px", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 6, color: "var(--muted)", fontSize: 10.5, fontWeight: 700 }}>
                  <span>OFFSET</span>
                  <span>HEX BYTES (32-BYTE ROW)</span>
                  <span>ASCII DECODED</span>
                  <span>CARVED ARTIFACT</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
                  {MEMORY_HEX_DUMP.map((row, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "190px 1fr 180px 140px",
                        gap: 12,
                        padding: "2px 0",
                        background: row.highlight ? "rgba(16,185,129,0.08)" : "transparent",
                        borderRadius: 3
                      }}
                    >
                      <span style={{ color: "#06b6d4" }}>{row.offset}</span>
                      <span style={{ color: row.highlight ? "#34d399" : "#94a3b8", letterSpacing: "0.04em", fontWeight: row.highlight ? 700 : 400 }}>
                        {row.hex}
                      </span>
                      <span style={{ color: row.highlight ? "#f8fafc" : "#64748b" }}>
                        {row.ascii}
                      </span>
                      <span>
                        {row.tag ? (
                          <span style={{
                            background: row.tag.includes("KEY") || row.tag.includes("CHACHA") ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)",
                            color: row.tag.includes("KEY") || row.tag.includes("CHACHA") ? "#10b981" : "#f59e0b",
                            border: "1px solid rgba(16,185,129,0.3)",
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: 3
                          }}>
                            {row.tag}
                          </span>
                        ) : (
                          <span style={{ color: "#475569", fontSize: 9.5 }}>—</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 11, color: "var(--muted)", paddingTop: 4 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "#10b981" }} />
                  <span>AES-256 / ChaCha20 Carved Key Candidate</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "#06b6d4" }} />
                  <span>Virtual Memory Offset</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "#f59e0b" }} />
                  <span>Target File / Extension String</span>
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Automated Key Carver */}
          {activeTab === "KEY_CARVER" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {selectedKeys.map(key => (
                <div key={key.id} className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: "rgba(16,185,129,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <Key size={16} color="#10b981" />
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc" }}>
                            {key.algorithm} MASTER RECOVERY KEY
                          </span>
                          <span className="badge-sev badge-success">
                            {key.verificationConfidencePct}% VERIFIED
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                          Offset: <code style={{ color: "#06b6d4" }}>{key.memoryOffsetHex}</code> · Region: {key.memoryRegion}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        onClick={() => handleCopyKey(key.keyBytesHex, key.id)}
                        style={{
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          color: copiedKeyId === key.id ? "#10b981" : "var(--fg)",
                          padding: "6px 12px",
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        {copiedKeyId === key.id ? <CheckCircle2 size={13} color="#10b981" /> : <Copy size={13} />}
                        <span>{copiedKeyId === key.id ? "COPIED HEX!" : "Copy Hex"}</span>
                      </button>

                      <Link
                        href="/cryptanalytic-bridge"
                        style={{
                          background: "rgba(16,185,129,0.15)",
                          border: "1px solid rgba(16,185,129,0.4)",
                          color: "#10b981",
                          padding: "6px 12px",
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 700,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <Zap size={13} />
                        <span>Send to Restore Engine</span>
                      </Link>
                    </div>
                  </div>

                  {/* Key Raw Bytes Box */}
                  <div style={{ background: "#050912", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 14px", fontFamily: "monospace" }}>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      RAW 256-BIT CRYPTOGRAPHIC KEY BYTES (HEXADECIMAL)
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#34d399", letterSpacing: "0.06em", wordBreak: "break-all" }}>
                      {key.keyBytesHex}
                    </div>
                  </div>

                  {/* Expanded Rounds / Matrix inspection */}
                  {key.expandedRounds && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--fg-2)" }}>AES-NI EXPANDED ROUND KEY SCHEDULE (14 ROUNDS):</span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        {key.expandedRounds.map((rnd, rIdx) => (
                          <div key={rIdx} style={{ background: "var(--surface-2)", padding: "4px 8px", borderRadius: 4, fontSize: 10.5, fontFamily: "monospace", color: "#cbd5e1" }}>
                            {rnd}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {key.chachaStateMatrix && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--fg-2)" }}>CHACHA20 4x4 STATE MATRIX (64 BYTES):</span>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, background: "var(--surface-2)", padding: 8, borderRadius: 6 }}>
                        {key.chachaStateMatrix.flat().map((word, wIdx) => (
                          <div key={wIdx} style={{ background: "#050912", padding: "6px 8px", borderRadius: 4, textAlign: "center", fontFamily: "monospace", fontSize: 11, color: wIdx < 4 ? "#06b6d4" : "#10b981", fontWeight: 700 }}>
                            0x{word.toString(16).padStart(8, "0").toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {key.privateExponentSnippet && (
                    <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 6, padding: "8px 12px", fontSize: 11, fontFamily: "monospace", color: "#06b6d4" }}>
                      {key.privateExponentSnippet}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: eBPF / FLTMGR Telemetry */}
          {activeTab === "SYSCALL_TELEMETRY" && (
            <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                DEEP-KERNEL FLTMGR & EBPF HOOK ARCHITECTURE
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <ShieldAlert size={16} color="#06b6d4" />
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#06b6d4" }}>Windows FLTMGR.sys Minifilter</span>
                  </div>
                  <p style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.5 }}>
                    Registers pre-operation callbacks at Altitude <strong>385200</strong> (<code style={{ color: "#10b981" }}>FSFilter Anti-Virus</code>). Intercepts <code style={{ color: "#06b6d4" }}>IRP_MJ_WRITE</code>, <code style={{ color: "#06b6d4" }}>IRP_MJ_CREATE</code>, and <code style={{ color: "#06b6d4" }}>IRP_MJ_SET_INFORMATION</code> before file contents reach the underlying NTFS/ReFS storage stack.
                  </p>
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4, fontFamily: "monospace", fontSize: 10, color: "var(--muted)" }}>
                    <div>• Callback: <code>FltpPerformPreCallbacks</code></div>
                    <div>• Shannon Burst Latency: <strong>0.38 ms</strong></div>
                    <div>• Action: <code>NtSuspendProcess</code> on high-entropy delta</div>
                  </div>
                </div>

                <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Cpu size={16} color="#10b981" />
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#10b981" }}>Linux eBPF Tracepoints & Kprobes</span>
                  </div>
                  <p style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.5 }}>
                    Attaches non-intrusive BPF programs to tracepoints <code style={{ color: "#10b981" }}>sys_enter_write</code> and <code style={{ color: "#10b981" }}>sys_enter_openat</code>. Computes rolling entropy buffers in ring memory maps (<code style={{ color: "#a855f7" }}>BPF_MAP_TYPE_RINGBUF</code>) with zero context switch overhead.
                  </p>
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4, fontFamily: "monospace", fontSize: 10, color: "var(--muted)" }}>
                    <div>• Probe: <code>tracepoint/syscalls/sys_enter_write</code></div>
                    <div>• RingBuf Latency: <strong>0.24 ms</strong></div>
                    <div>• Signal: <code>SIGSTOP</code> sent directly via eBPF helper</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Zeroize & Anti-Evasion Defenses */}
          {activeTab === "ZEROIZE_DEFENSE" && (
            <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                ANTI-ZEROIZATION & MEMORY PRESERVATION GUARDS
              </div>
              <p style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>
                Modern ransomware families (LockBit 3.0, BlackCat, Akira) call <code style={{ color: "#f43f5e" }}>RtlZeroMemory</code>, <code style={{ color: "#f43f5e" }}>CryptDestroyKey</code>, or <code style={{ color: "#f43f5e" }}>VirtualFree</code> immediately after encrypting files to prevent post-incident RAM forensics.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: 6, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#10b981", marginBottom: 4 }}>1. Pre-Emptive Thread Freeze</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    Suspends all process threads within 0.38ms of the 10th encrypted file, freezing execution before memory wipe routines are dispatched.
                  </div>
                </div>

                <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: 6, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#06b6d4", marginBottom: 4 }}>2. Copy-on-Write VAD Snapshot</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    Locks all <code style={{ color: "var(--fg-2)" }}>PAGE_READWRITE</code> heap pages into an immutable kernel ring-buffer, preventing destructive overwrites.
                  </div>
                </div>

                <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: 6, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#a855f7", marginBottom: 4 }}>3. CryptoAPI Handle Intercept</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    Detours <code style={{ color: "var(--fg-2)" }}>CryptReleaseContext</code> to retain symmetric session keys in the Aegis secure enclave vault.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Keys Modal */}
      {exportedModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          padding: 20
        }}>
          <div className="card-tactical" style={{ width: 640, maxWidth: "100%", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Key size={18} color="#10b981" />
                <span style={{ fontSize: 15, fontWeight: 800, color: "#f8fafc" }}>
                  Export Rescued In-Memory Encryption Keys
                </span>
              </div>
              <button
                onClick={() => setExportedModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {(["JSON", "HEX", "AEGIS_RESTORE_BLOB"] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  style={{
                    background: exportFormat === fmt ? "rgba(16,185,129,0.2)" : "var(--surface-2)",
                    border: exportFormat === fmt ? "1px solid #10b981" : "1px solid var(--border)",
                    color: exportFormat === fmt ? "#10b981" : "var(--muted)",
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {fmt.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            <div style={{
              background: "#040711",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: 12,
              fontFamily: "monospace",
              fontSize: 11,
              maxHeight: 280,
              overflowY: "auto",
              color: "#34d399"
            }}>
              {exportFormat === "JSON" ? (
                <pre style={{ margin: 0 }}>
{JSON.stringify({
  exportVersion: "2026.4",
  platform: "Aegis Recovery Platform 17",
  pid: selectedProcess.pid,
  processName: selectedProcess.name,
  discoveredKeys: selectedKeys.map(k => ({
    algorithm: k.algorithm,
    offset: k.memoryOffsetHex,
    keyHex: k.keyBytesHex,
    confidencePct: k.verificationConfidencePct,
    discoveredAt: k.discoveredAt
  }))
}, null, 2)}
                </pre>
              ) : exportFormat === "HEX" ? (
                <pre style={{ margin: 0 }}>
{selectedKeys.map(k => `# ${k.algorithm} (PID ${k.pid}) @ ${k.memoryOffsetHex}\n${k.keyBytesHex.replace(/\s+/g, "")}`).join("\n\n")}
                </pre>
              ) : (
                <pre style={{ margin: 0 }}>
{`-----BEGIN AEGIS RESTORE KEY BLOB-----
MIIEpAIBAAKCAQEAx9B2kYi4Sh8JzNN6VRCZLmercy098492801928340918230
E4B291884A1F09CCD37A5510992E67AB81402DFE3389120BA766C4189E32507F
-----END AEGIS RESTORE KEY BLOB-----`}
                </pre>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedKeys, null, 2));
                  setExportedModalOpen(false);
                }}
                style={{
                  background: "var(--primary)",
                  color: "#04100c",
                  padding: "8px 16px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Copy to Clipboard & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
