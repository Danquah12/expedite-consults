"use client";

import { useState, useMemo } from "react";
import { MALWARE_SAMPLES } from "@/data/samples";
import { downloadBlob } from "@/lib/utils";
import {
  ShieldAlert,
  ShieldCheck,
  ShieldHalf,
  Cpu,
  Layers,
  Search,
  Filter,
  CheckCircle,
  Copy,
  Download,
  Check,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  FileCode,
  Zap,
  Activity,
  Terminal,
  Server,
  Crosshair,
  Radio,
  Eye,
  Lock,
  Unlock,
  AlertOctagon,
  HardDrive
} from "lucide-react";

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

export interface SsdtEntry {
  index: string;
  syscallName: string;
  expectedAddress: string;
  currentAddress: string;
  hookType: "Pointer Redirection" | "Inline Trampoline (JMP)" | "Byte Patch" | "Clean (ntoskrnl)";
  status: "Hooked (Malicious)" | "Clean";
  hookingModule: string;
  maliciousIntent: string;
  restored: boolean;
}

export interface IrpDispatchEntry {
  driverName: string;
  devicePath: string;
  majorFunction: string;
  majorIndex: string;
  expectedFunction: string;
  liveFunctionPointer: string;
  targetModule: string;
  status: "Hijacked" | "Clean";
  impact: string;
  restored: boolean;
}

export interface DkomProcessEntry {
  pid: number;
  processName: string;
  eprocessAddress: string;
  activeProcessLinks: "Linked" | "Unlinked (Ghost Process)";
  psKeyCidTable: "Present" | "Missing";
  tokenPrivileges: string;
  pplStatus: string;
  threads: number;
  severity: "Critical" | "High" | "Clean";
  relinked: boolean;
}

export interface ByovdDriver {
  id: string;
  filename: string;
  vendor: string;
  cve: string;
  sha256: string;
  vulnerableIoctl: string;
  vulnerabilityClass: string;
  exploitedByThreatActors: string[];
  microsoftBlocklistStatus: "Blocked (Win 11 WDAC / HVCI)" | "Vulnerable / Unblocked";
  primitiveDescription: string;
  pocSnippet: string;
}

// ============================================================================
// MOCK DATA: KERNEL DATA STRUCTURES
// ============================================================================

const INITIAL_SSDT_ENTRIES: SsdtEntry[] = [
  {
    index: "0x0033",
    syscallName: "NtQueryDirectoryFile",
    expectedAddress: "0xFFFFF800'04218000 (ntoskrnl.exe)",
    currentAddress: "0xFFFFF800'06F21040 (tdss.sys + 0x1040)",
    hookType: "Pointer Redirection",
    status: "Hooked (Malicious)",
    hookingModule: "tdss.sys (TDSS / TDL4 Rootkit)",
    maliciousIntent: "Filters file enumeration requests; hides files matching prefix 'tdss_*' and rootkit loader binaries from Windows Explorer and cmd.exe dir.",
    restored: false
  },
  {
    index: "0x0036",
    syscallName: "NtQuerySystemInformation",
    expectedAddress: "0xFFFFF800'04221000 (ntoskrnl.exe)",
    currentAddress: "0xFFFFF800'06F21480 (tdss.sys + 0x1480)",
    hookType: "Inline Trampoline (JMP)",
    status: "Hooked (Malicious)",
    hookingModule: "tdss.sys (TDSS / TDL4 Rootkit)",
    maliciousIntent: "Splices SystemProcessInformation query results to erase rootkit PIDs (e.g. PID 4920, 6608) from Task Manager and Process Hacker.",
    restored: false
  },
  {
    index: "0x0026",
    syscallName: "NtOpenProcess",
    expectedAddress: "0xFFFFF800'04215000 (ntoskrnl.exe)",
    currentAddress: "0xFFFFF800'06F21890 (tdss.sys + 0x1890)",
    hookType: "Pointer Redirection",
    status: "Hooked (Malicious)",
    hookingModule: "tdss.sys (TDSS / TDL4 Rootkit)",
    maliciousIntent: "Returns STATUS_ACCESS_DENIED whenever security products (MsSense.exe, SentinelAgent.exe) attempt to open handles to rootkit processes.",
    restored: false
  },
  {
    index: "0x002C",
    syscallName: "NtTerminateProcess",
    expectedAddress: "0xFFFFF800'04219A00 (ntoskrnl.exe)",
    currentAddress: "0xFFFFF800'06F21CA0 (tdss.sys + 0x1CA0)",
    hookType: "Byte Patch",
    status: "Hooked (Malicious)",
    hookingModule: "tdss.sys (TDSS / TDL4 Rootkit)",
    maliciousIntent: "Blocks termination signals targeted at malicious worker services, rendering the malware process unkillable via standard Userland calls.",
    restored: false
  },
  {
    index: "0x0018",
    syscallName: "NtAllocateVirtualMemory",
    expectedAddress: "0xFFFFF800'04210000 (ntoskrnl.exe)",
    currentAddress: "0xFFFFF800'04210000 (ntoskrnl.exe)",
    hookType: "Clean (ntoskrnl)",
    status: "Clean",
    hookingModule: "ntoskrnl.exe",
    maliciousIntent: "Standard dispatch routine (unmodified).",
    restored: true
  },
  {
    index: "0x0050",
    syscallName: "NtProtectVirtualMemory",
    expectedAddress: "0xFFFFF800'04212400 (ntoskrnl.exe)",
    currentAddress: "0xFFFFF800'04212400 (ntoskrnl.exe)",
    hookType: "Clean (ntoskrnl)",
    status: "Clean",
    hookingModule: "ntoskrnl.exe",
    maliciousIntent: "Standard dispatch routine (unmodified).",
    restored: true
  }
];

const INITIAL_IRP_ENTRIES: IrpDispatchEntry[] = [
  {
    driverName: "\\Driver\\Disk",
    devicePath: "\\Device\\Harddisk0\\DR0",
    majorFunction: "IRP_MJ_READ",
    majorIndex: "0x04",
    expectedFunction: "disk.sys!DiskRead (0xFFFFF800'03810000)",
    liveFunctionPointer: "0xFFFFF801'09812480 [rootkit.sys]",
    targetModule: "rootkit.sys (Unsigned Ring 0 Hook)",
    status: "Hijacked",
    impact: "Intercepts MBR and VBR sector read requests, presenting clean partition tables while hiding malicious UEFI bootkit sectors.",
    restored: false
  },
  {
    driverName: "\\Driver\\Tcpip",
    devicePath: "\\Device\\Tcp",
    majorFunction: "IRP_MJ_DEVICE_CONTROL",
    majorIndex: "0x0E",
    expectedFunction: "tcpip.sys!TcpDeviceControl (0xFFFFF800'03950000)",
    liveFunctionPointer: "0xFFFFF801'09813100 [rootkit.sys]",
    targetModule: "rootkit.sys (Unsigned Ring 0 Hook)",
    impact: "Filters promiscuous packet captures to conceal outbound C2 beacons and raw TCP reverse shells from Wireshark & Npcap.",
    restored: false
  },
  {
    driverName: "\\Driver\\Ntfs",
    devicePath: "\\Device\\HarddiskVolume3",
    majorFunction: "IRP_MJ_CREATE",
    majorIndex: "0x00",
    expectedFunction: "ntfs.sys!NtfsFsdCreate (0xFFFFF800'03720000)",
    liveFunctionPointer: "0xFFFFF801'09812000 [rootkit.sys]",
    targetModule: "rootkit.sys (Unsigned Ring 0 Hook)",
    impact: "Prevents antivirus engines from opening file handles to protected malware payloads on disk (STATUS_OBJECT_NAME_NOT_FOUND).",
    restored: false
  },
  {
    driverName: "\\Driver\\KsecDD",
    devicePath: "\\Device\\KsecDD",
    majorFunction: "IRP_MJ_DEVICE_CONTROL",
    majorIndex: "0x0E",
    expectedFunction: "ksecdd.sys!KsecDeviceControl (0xFFFFF800'03610000)",
    liveFunctionPointer: "0xFFFFF800'03610000 [ksecdd.sys]",
    targetModule: "ksecdd.sys",
    status: "Clean",
    impact: "Clean driver dispatcher.",
    restored: true
  }
];

const INITIAL_DKOM_PROCESSES: DkomProcessEntry[] = [
  {
    pid: 4920,
    processName: "rootkit_agent.exe",
    eprocessAddress: "0xFFFFCB02'38901040",
    activeProcessLinks: "Unlinked (Ghost Process)",
    psKeyCidTable: "Present",
    tokenPrivileges: "0x1FFFFF (SeDebugPrivilege / Full SYSTEM)",
    pplStatus: "PsProtectedSignerWinTcb (Light 0x06)",
    threads: 4,
    severity: "Critical",
    relinked: false
  },
  {
    pid: 6608,
    processName: "xmr_miner_stealth.exe",
    eprocessAddress: "0xFFFFCB02'39120800",
    activeProcessLinks: "Unlinked (Ghost Process)",
    psKeyCidTable: "Present",
    tokenPrivileges: "0x1FFFFF (SeDebugPrivilege / Full SYSTEM)",
    pplStatus: "None (0x00)",
    threads: 8,
    severity: "High",
    relinked: false
  },
  {
    pid: 3412,
    processName: "WannaCry.exe",
    eprocessAddress: "0xFFFFCB02'37819000",
    activeProcessLinks: "Linked",
    psKeyCidTable: "Present",
    tokenPrivileges: "0x000010 (Standard User)",
    pplStatus: "None (0x00)",
    threads: 12,
    severity: "High",
    relinked: true
  },
  {
    pid: 620,
    processName: "lsass.exe",
    eprocessAddress: "0xFFFFCB02'30114000",
    activeProcessLinks: "Linked",
    psKeyCidTable: "Present",
    tokenPrivileges: "0x1FFFFF (SYSTEM)",
    pplStatus: "PsProtectedSignerLsa (0x04)",
    threads: 16,
    severity: "Clean",
    relinked: true
  }
];

const BYOVD_CATALOG: ByovdDriver[] = [
  {
    id: "BYOVD-01",
    filename: "gdrv.sys",
    vendor: "Giga-Byte Technology Co., Ltd.",
    cve: "CVE-2018-19320",
    sha256: "31f4719c1dd046f5869a925439a295804791552a42095f9c9df5b12da61e938e",
    vulnerableIoctl: "0xC3502808 / 0xC350280C",
    vulnerabilityClass: "Arbitrary Physical/Virtual Memory Read & Write Primitive",
    exploitedByThreatActors: ["RobbinHood Ransomware", "BlackByte Ransomware", "Scattered Spider"],
    microsoftBlocklistStatus: "Blocked (Win 11 WDAC / HVCI)",
    primitiveDescription: "Exposes IOCTL 0xC3502808 which maps arbitrary physical pages to user space without access validation, allowing attackers to zero out DbgkDebugObjectType or patch kernel callbacks.",
    pocSnippet: `HANDLE hDriver = CreateFileA("\\\\\\\\.\\\\GIO", GENERIC_READ | GENERIC_WRITE, 0, NULL, OPEN_EXISTING, 0, NULL);
// Arbitrary Kernel Write via Physical Mapping
DeviceIoControl(hDriver, 0xC3502808, &writeStruct, sizeof(writeStruct), NULL, 0, &bytesRet, NULL);`
  },
  {
    id: "BYOVD-02",
    filename: "mhyprot2.sys",
    vendor: "miHoYo Co., Ltd. (Genshin Impact Anti-Cheat)",
    cve: "CVE-2020-36667",
    sha256: "046e83b74381177699d7945d8b8e0b6df4b0f92b77a7f45c7d8ab4231b5c2132",
    vulnerableIoctl: "0x81034000 (Arbitrary Memory Read/Write & Process Kill)",
    vulnerabilityClass: "Ring 0 Termination of PPL Processes & Kernel Memory Modification",
    exploitedByThreatActors: ["Ransomware Operators", "LockBit 3.0", "Cuba Ransomware"],
    microsoftBlocklistStatus: "Blocked (Win 11 WDAC / HVCI)",
    primitiveDescription: "Allows unprivileged user processes to read/write any kernel address and invoke an internal kernel-level ZwTerminateProcess routine to kill Microsoft Defender, SentinelOne, and CrowdStrike agents.",
    pocSnippet: `HANDLE hDriver = CreateFileA("\\\\\\\\.\\\\mhyprot2", GENERIC_READ | GENERIC_WRITE, 0, NULL, OPEN_EXISTING, 0, NULL);
// Terminate Protected EDR Process by PID
DWORD targetPid = 5412; // EDR Agent PID
DeviceIoControl(hDriver, 0x81034000, &targetPid, sizeof(targetPid), NULL, 0, &bytesRet, NULL);`
  },
  {
    id: "BYOVD-03",
    filename: "RTCore64.sys",
    vendor: "Micro-Star International (MSI Afterburner)",
    cve: "CVE-2019-16098",
    sha256: "01ee8e0e8549daab5c6a1e94851214041d8b6712d4a13d100f28e207b6f68740",
    vulnerableIoctl: "0x80002048 (Mem Read) / 0x8000204C (Mem Write)",
    vulnerabilityClass: "Direct Arbitrary Physical & Virtual Memory R/W Primitive",
    exploitedByThreatActors: ["BlackCat / ALPHV", "AvosLocker", "UNC3944"],
    microsoftBlocklistStatus: "Blocked (Win 11 WDAC / HVCI)",
    primitiveDescription: "Exposes raw memory read and write primitives via IOCTL 0x80002048 and 0x8000204C, enabling attackers to clear PspCreateProcessNotifyRoutine arrays and disable Driver Signature Enforcement (CiOptions = 0).",
    pocSnippet: `HANDLE hDriver = CreateFileA("\\\\\\\\.\\\\RTCore64", GENERIC_READ | GENERIC_WRITE, 0, NULL, OPEN_EXISTING, 0, NULL);
// Patch g_CiOptions = 0 to load unsigned rootkit driver
DeviceIoControl(hDriver, 0x8000204C, &patchCiOptions, sizeof(patchCiOptions), NULL, 0, &bytesRet, NULL);`
  },
  {
    id: "BYOVD-04",
    filename: "dbutil_2_3.sys",
    vendor: "Dell Inc. (Firmware Update Utility)",
    cve: "CVE-2021-21551",
    sha256: "04a91983... (Dell Signed)",
    vulnerableIoctl: "0xDB000000",
    vulnerabilityClass: "Arbitrary Kernel Read/Write & Local Privilege Escalation",
    exploitedByThreatActors: ["Lazarus Group", "Fin7"],
    microsoftBlocklistStatus: "Blocked (Win 11 WDAC / HVCI)",
    primitiveDescription: "Unrestricted I/O control dispatch allows user-mode attackers to overwrite Token.Privileges inside target EPROCESS to obtain SYSTEM rights.",
    pocSnippet: `HANDLE hDriver = CreateFileA("\\\\\\\\.\\\\DBUtil_2_3", GENERIC_READ | GENERIC_WRITE, 0, NULL, OPEN_EXISTING, 0, NULL);`
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RootkitAnalyzerPage() {
  const [selectedSample, setSelectedSample] = useState(MALWARE_SAMPLES[0]);
  const [activeTab, setActiveTab] = useState<"SSDT" | "IRP" | "DKOM" | "BYOVD">("SSDT");
  const [ssdtEntries, setSsdtEntries] = useState<SsdtEntry[]>(INITIAL_SSDT_ENTRIES);
  const [irpEntries, setIrpEntries] = useState<IrpDispatchEntry[]>(INITIAL_IRP_ENTRIES);
  const [dkomProcesses, setDkomProcesses] = useState<DkomProcessEntry[]>(INITIAL_DKOM_PROCESSES);
  const [byovdDrivers] = useState<ByovdDriver[]>(BYOVD_CATALOG);
  const [selectedByovd, setSelectedByovd] = useState<ByovdDriver>(BYOVD_CATALOG[0]);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // SSDT Unhook Simulation
  const handleRestoreSsdt = (index: string) => {
    setSsdtEntries(prev =>
      prev.map(e => {
        if (e.index === index) {
          return {
            ...e,
            currentAddress: e.expectedAddress,
            hookType: "Clean (ntoskrnl)",
            status: "Clean",
            hookingModule: "ntoskrnl.exe",
            restored: true
          };
        }
        return e;
      })
    );
  };

  // Restore all SSDT Hooks
  const handleRestoreAllSsdt = () => {
    setSsdtEntries(prev =>
      prev.map(e => ({
        ...e,
        currentAddress: e.expectedAddress,
        hookType: "Clean (ntoskrnl)",
        status: "Clean",
        hookingModule: "ntoskrnl.exe",
        restored: true
      }))
    );
  };

  // IRP Unhook Simulation
  const handleRestoreIrp = (majorIndex: string) => {
    setIrpEntries(prev =>
      prev.map(e => {
        if (e.majorIndex === majorIndex) {
          return {
            ...e,
            liveFunctionPointer: e.expectedFunction,
            status: "Clean",
            targetModule: e.driverName.replace("\\Driver\\", "").toLowerCase() + ".sys",
            restored: true
          };
        }
        return e;
      })
    );
  };

  // DKOM Relink Simulation
  const handleRelinkProcess = (pid: number) => {
    setDkomProcesses(prev =>
      prev.map(p => {
        if (p.pid === pid) {
          return {
            ...p,
            activeProcessLinks: "Linked",
            severity: "Clean",
            relinked: true
          };
        }
        return p;
      })
    );
  };

  // Metrics
  const hookedSsdtCount = useMemo(() => ssdtEntries.filter(e => e.status === "Hooked (Malicious)").length, [ssdtEntries]);
  const hijackedIrpCount = useMemo(() => irpEntries.filter(e => e.status === "Hijacked").length, [irpEntries]);
  const hiddenDkomCount = useMemo(() => dkomProcesses.filter(p => p.activeProcessLinks.includes("Unlinked")).length, [dkomProcesses]);

  const handleCopyPoc = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] p-6 space-y-6">
      {/* ==================================================================== */}
      {/* HEADER SECTION */}
      {/* ==================================================================== */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldHalf className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Kernel Rootkit & Ring 0 Driver Dissector
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 font-mono font-normal">
                  Ring 0 Kernel Mode
                </span>
              </h1>
              <p className="text-xs text-[var(--muted)]">
                Windows Kernel Driver (.sys) reverse engineering suite: SSDT syscall table scanning, IRP MajorFunction hook detection, DKOM unlinked ghost process recovery, and BYOVD vulnerability intelligence.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-[var(--surface-2)] px-3 py-1.5 rounded-md border border-[var(--border)]">
            <Server className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs text-[var(--muted)]">Kernel Snapshot:</span>
            <span className="text-xs text-rose-300 font-mono font-bold">tdss.sys + gdrv.sys (Live Ring 0)</span>
          </div>

          <div className="flex items-center gap-2 bg-[var(--surface-2)] px-3 py-1.5 rounded-md border border-[var(--border)]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-[var(--muted)]">OS:</span>
            <span className="text-xs text-cyan-300 font-mono">Win 11 23H2 (x64)</span>
          </div>

          <button
            onClick={handleRestoreAllSsdt}
            className="btn-primary flex items-center gap-1.5 bg-rose-500 hover:bg-rose-400 text-black font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore All Kernel SSDT Hooks
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* METRICS & KERNEL HEALTH TELEMETRY */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Loaded Drivers</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-white font-mono">194</span>
            <span className="text-[10px] text-[var(--muted)] font-mono">Ring 0</span>
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-1 truncate">ntoskrnl.exe image base</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Hooked SSDT Syscalls</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold font-mono ${hookedSsdtCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {hookedSsdtCount}
            </span>
            <span className="text-[10px] text-rose-400 font-mono">KiServiceTable</span>
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-1 truncate">Syscall redirection active</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Hijacked IRP Dispatchers</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold font-mono ${hijackedIrpCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {hijackedIrpCount}
            </span>
            <span className="text-[10px] text-amber-400 font-mono">MajorFunction</span>
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-1 truncate">Disk & TCP stack intercepted</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">DKOM Ghost Processes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold font-mono ${hiddenDkomCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {hiddenDkomCount}
            </span>
            <span className="text-[10px] text-rose-400 font-mono">Unlinked</span>
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-1 truncate">ActiveProcessLinks spliced</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">BYOVD Drivers Detected</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-purple-400 font-mono">{byovdDrivers.length}</span>
            <span className="text-[10px] text-purple-300 font-mono">CVE Matched</span>
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-1 truncate">OEM vulnerable signed .sys</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Kernel Integrity</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold font-mono ${hookedSsdtCount === 0 && hiddenDkomCount === 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {hookedSsdtCount === 0 && hiddenDkomCount === 0 ? "100%" : "38%"}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono">CRITICAL</span>
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-1 truncate">Rootkit infection active</div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TABS NAVIGATION */}
      {/* ==================================================================== */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("SSDT")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === "SSDT"
                ? "bg-rose-500/15 text-rose-400 border border-rose-500/40 shadow-sm"
                : "text-[var(--muted)] hover:text-white hover:bg-[var(--surface-2)]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            ⚡ SSDT Dispatch Hook Scanner
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-mono">
              {hookedSsdtCount} Hooked
            </span>
          </button>

          <button
            onClick={() => setActiveTab("IRP")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === "IRP"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm"
                : "text-[var(--muted)] hover:text-white hover:bg-[var(--surface-2)]"
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            🔌 IRP MajorFunction Hook Detector
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono">
              {hijackedIrpCount} Hijacked
            </span>
          </button>

          <button
            onClick={() => setActiveTab("DKOM")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === "DKOM"
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/40 shadow-sm"
                : "text-[var(--muted)] hover:text-white hover:bg-[var(--surface-2)]"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            👻 DKOM Unlinked Process Scanner
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-mono">
              {hiddenDkomCount} Ghost PIDs
            </span>
          </button>

          <button
            onClick={() => setActiveTab("BYOVD")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === "BYOVD"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-[var(--muted)] hover:text-white hover:bg-[var(--surface-2)]"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            ⚠️ Signed Driver Vulnerability (BYOVD)
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono">
              {byovdDrivers.length} CVEs
            </span>
          </button>
        </div>

        <button
          onClick={() =>
            downloadBlob(
              `// CERBERUS-RE Kernel Rootkit Remediation Script\n// Restores SSDT Dispatch Table and Relinks EPROCESS Nodes\n\n# Unhook SSDT\nRestore-SSDT -All\n\n# Relink Ghost Processes\nRelink-EProcess -PID 4920\nRelink-EProcess -PID 6608\n\n# Block Vulnerable BYOVD Drivers\nSet-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\CI\\Config" -Name "VulnerableDriverBlocklistEnable" -Value 1`,
              "remediate_kernel_rootkit.ps1",
              "text/plain"
            )
          }
          className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 text-rose-400 hover:bg-rose-500/10"
        >
          <Download className="w-3 h-3" />
          Export Kernel Remediation (.ps1)
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: SSDT HOOK SCANNER */}
      {/* ==================================================================== */}
      {activeTab === "SSDT" && (
        <div className="space-y-6">
          <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-rose-400" />
                System Service Descriptor Table (SSDT / KiServiceTable) Hook Inspector
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Scans kernel syscall dispatch table entries (`ntoskrnl.exe!KiServiceTable`). Detects pointer redirections, inline trampoline JMPs, and byte patches installed by Ring 0 rootkits.
              </p>
            </div>

            <button
              onClick={handleRestoreAllSsdt}
              className="btn-success text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 1-Click Restore All Original Pointers
            </button>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">SSDT Dispatch Entries</span>
              <span className="text-xs text-rose-400 font-mono font-bold">
                {hookedSsdtCount} Hooked Routines Diverted to Rootkit
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="cerberus-table">
                <thead>
                  <tr>
                    <th className="w-20">Index</th>
                    <th className="w-52">Syscall Routine</th>
                    <th className="w-48">Expected Address</th>
                    <th className="w-52">Live Target Address</th>
                    <th className="w-36">Hook Type</th>
                    <th className="w-32">Status</th>
                    <th>Malicious Stealth Intent</th>
                    <th className="w-28 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ssdtEntries.map(entry => (
                    <tr key={entry.index} className="hover:bg-[var(--surface-2)]">
                      <td className="font-mono text-xs font-bold text-rose-400">{entry.index}</td>
                      <td>
                        <span className="font-mono text-xs font-bold text-white">{entry.syscallName}</span>
                      </td>
                      <td className="font-mono text-[11px] text-emerald-400">{entry.expectedAddress}</td>
                      <td className={`font-mono text-[11px] font-bold ${entry.status.includes("Hooked") ? "text-rose-400" : "text-emerald-400"}`}>
                        {entry.currentAddress}
                      </td>
                      <td>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            entry.hookType.includes("Clean")
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-bold"
                              : "bg-rose-500/15 text-rose-300 border-rose-500/30 font-bold"
                          }`}
                        >
                          {entry.hookType}
                        </span>
                      </td>
                      <td>
                        {entry.status.includes("Hooked") ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-2.5 h-2.5" /> HOOKED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            CLEAN
                          </span>
                        )}
                      </td>
                      <td className="text-xs text-slate-300 max-w-xs">{entry.maliciousIntent}</td>
                      <td className="text-right">
                        {entry.status.includes("Hooked") ? (
                          <button
                            onClick={() => handleRestoreSsdt(entry.index)}
                            className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono font-bold"
                          >
                            Unhook
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-mono">Restored</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: IRP MAJORFUNCTION DISPATCH HOOKS */}
      {/* ==================================================================== */}
      {activeTab === "IRP" && (
        <div className="space-y-6">
          <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-amber-400" />
              Driver Object MajorFunction Dispatch Table Scanner
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Scans `DRIVER_OBJECT.MajorFunction` function pointer arrays for critical storage (`\Driver\Disk`, `\Driver\Ntfs`) and network (`\Driver\Tcpip`) drivers. Detects malicious function pointer redirection outside valid driver `.text` bounds.
            </p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Driver Dispatch Table Inspector</span>
              <span className="text-xs text-amber-400 font-mono font-bold">
                {hijackedIrpCount} MajorFunctions Hijacked
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="cerberus-table">
                <thead>
                  <tr>
                    <th className="w-36">Driver Object</th>
                    <th className="w-32">Major Function</th>
                    <th className="w-16">Index</th>
                    <th className="w-52">Expected Function</th>
                    <th className="w-52">Live Target Function</th>
                    <th className="w-28">Status</th>
                    <th>Rootkit Interception Impact</th>
                    <th className="w-28 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {irpEntries.map(irp => (
                    <tr key={irp.majorIndex + irp.driverName} className="hover:bg-[var(--surface-2)]">
                      <td className="font-mono text-xs font-bold text-cyan-300">{irp.driverName}</td>
                      <td>
                        <span className="font-mono text-xs font-bold text-white">{irp.majorFunction}</span>
                      </td>
                      <td className="font-mono text-xs text-[var(--muted)]">{irp.majorIndex}</td>
                      <td className="font-mono text-[11px] text-emerald-400 truncate max-w-xs">{irp.expectedFunction}</td>
                      <td className={`font-mono text-[11px] font-bold ${irp.status === "Hijacked" ? "text-rose-400" : "text-emerald-400"}`}>
                        {irp.liveFunctionPointer}
                      </td>
                      <td>
                        {irp.status === "Hijacked" ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold">
                            HIJACKED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            CLEAN
                          </span>
                        )}
                      </td>
                      <td className="text-xs text-slate-300 max-w-xs">{irp.impact}</td>
                      <td className="text-right">
                        {irp.status === "Hijacked" ? (
                          <button
                            onClick={() => handleRestoreIrp(irp.majorIndex)}
                            className="text-xs px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono font-bold"
                          >
                            Restore IRP
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-mono">Restored</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: DKOM (DIRECT KERNEL OBJECT MANIPULATION) SCANNER */}
      {/* ==================================================================== */}
      {activeTab === "DKOM" && (
        <div className="space-y-6">
          <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                Direct Kernel Object Manipulation (DKOM) Process Scanner
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Cross-references the active `EPROCESS.ActiveProcessLinks` doubly linked list against `PspCidTable` (Kernel Process/Thread Handle Table) and CPU Thread Scheduling queues to detect ghost processes hidden from userland APIs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-mono border border-purple-500/40 font-bold">
                PspCidTable Brute-Force Complete
              </span>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Discovered Kernel Process Objects</span>
              <span className="text-xs text-purple-400 font-mono font-bold">
                {hiddenDkomCount} Unlinked Hidden Processes Detected
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="cerberus-table">
                <thead>
                  <tr>
                    <th className="w-20">PID</th>
                    <th className="w-48">Image Name</th>
                    <th className="w-48">EPROCESS Kernel Address</th>
                    <th className="w-48">ActiveProcessLinks Status</th>
                    <th className="w-36">PspCidTable Presence</th>
                    <th className="w-48">Token Privileges</th>
                    <th className="w-36">PPL Level</th>
                    <th className="w-28 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dkomProcesses.map(proc => (
                    <tr key={proc.pid} className="hover:bg-[var(--surface-2)]">
                      <td className="font-mono text-xs font-bold text-cyan-400">{proc.pid}</td>
                      <td>
                        <span className="font-mono text-xs font-bold text-white">{proc.processName}</span>
                      </td>
                      <td className="font-mono text-[11px] text-purple-300">{proc.eprocessAddress}</td>
                      <td>
                        {proc.activeProcessLinks.includes("Unlinked") ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-2.5 h-2.5" /> UNLINKED GHOST
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            Linked (Visible)
                          </span>
                        )}
                      </td>
                      <td className="font-mono text-xs text-emerald-400 font-bold">{proc.psKeyCidTable}</td>
                      <td className="font-mono text-[11px] text-amber-300">{proc.tokenPrivileges}</td>
                      <td className="font-mono text-[11px] text-slate-300">{proc.pplStatus}</td>
                      <td className="text-right">
                        {proc.activeProcessLinks.includes("Unlinked") ? (
                          <button
                            onClick={() => handleRelinkProcess(proc.pid)}
                            className="text-xs px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-mono font-bold"
                          >
                            Relink Node
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-mono">Linked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: BYOVD (BRING YOUR OWN VULNERABLE DRIVER) CATALOG */}
      {/* ==================================================================== */}
      {activeTab === "BYOVD" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Driver Catalog (5 cols) */}
          <div className="lg:col-span-5 space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {byovdDrivers.map(driver => {
              const isSelected = selectedByovd.id === driver.id;
              return (
                <div
                  key={driver.id}
                  onClick={() => setSelectedByovd(driver)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[var(--surface-2)] border-cyan-500/60 shadow-md shadow-cyan-500/5"
                      : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-active)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        {driver.filename}
                      </h4>
                      <span className="text-[10px] text-[var(--muted)]">{driver.vendor}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                      {driver.cve}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">{driver.primitiveDescription}</p>

                  <div className="mt-3 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] font-mono">
                    <span className="text-purple-300">IOCTL: {driver.vulnerableIoctl.slice(0, 16)}...</span>
                    <span className="text-cyan-400 hover:underline">Inspect PoC →</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected BYOVD Deep Dissection (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    {selectedByovd.filename} ({selectedByovd.vendor})
                  </h3>
                  <span className="text-[10px] font-mono text-rose-400 font-bold">{selectedByovd.cve}</span>
                </div>

                <span className="text-[10px] px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-mono border border-amber-500/40 font-bold">
                  {selectedByovd.microsoftBlocklistStatus}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-bold text-white uppercase tracking-wider">Vulnerability Mechanism</span>
                <p className="text-slate-300 leading-relaxed bg-[var(--surface-2)] p-3 rounded border border-[var(--border)]">
                  {selectedByovd.primitiveDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-[var(--surface-2)] rounded border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--muted)] block">Vulnerable IOCTL Code</span>
                  <span className="text-rose-400 font-bold mt-1 block">{selectedByovd.vulnerableIoctl}</span>
                </div>
                <div className="p-3 bg-[var(--surface-2)] rounded border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--muted)] block">Exploited By Real Threat Actors</span>
                  <span className="text-purple-300 font-bold mt-1 block truncate">
                    {selectedByovd.exploitedByThreatActors.join(", ")}
                  </span>
                </div>
              </div>

              {/* Exploit PoC / C Code Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Kernel Exploitation Harness (C / Win32 API)
                  </span>
                  <button
                    onClick={() => handleCopyPoc(selectedByovd.pocSnippet)}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy Harness"}
                  </button>
                </div>

                <div className="terminal-box text-[11px] text-cyan-300 font-mono select-all">
                  {selectedByovd.pocSnippet}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
