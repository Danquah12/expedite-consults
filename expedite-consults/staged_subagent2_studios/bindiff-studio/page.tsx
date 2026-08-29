"use client";

import { useState, useMemo } from "react";
import { MALWARE_SAMPLES } from "@/data/samples";
import {
  FileDiff,
  GitCompare,
  Layers,
  Code,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Eye,
  FileCode,
  Cpu,
  Zap,
  Flame,
  Binary,
  ShieldCheck,
  Terminal,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Share2,
  Sliders,
  ExternalLink
} from "lucide-react";

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================

export type DiffStatus = "IDENTICAL" | "MODIFIED" | "ADDED" | "DELETED";

export interface BasicBlockNode {
  id: string;
  label: string;
  addressA?: string;
  addressB?: string;
  status: DiffStatus;
  x: number;
  y: number;
  width: number;
  height: number;
  instructionsA?: string[];
  instructionsB?: string[];
  description?: string;
  isMaliciousHook?: boolean;
}

export interface CFGEdge {
  from: string;
  to: string;
  type: "true" | "false" | "unconditional" | "call";
}

export interface DiffFunction {
  id: string;
  name: string;
  demangledName: string;
  addressA: string;
  addressB: string;
  similarity: number; // 0.0 - 1.0
  confidence: number; // 0.0 - 1.0
  algorithm: string;
  blocksA: number;
  blocksB: number;
  instructionsA: number;
  instructionsB: number;
  addedOpcodes: number;
  removedOpcodes: number;
  modifiedEdges: number;
  status: DiffStatus;
  category: "CORE_LOGIC" | "CRYPTO" | "NETWORK" | "SECURITY_CHECK" | "INITIALIZATION" | "HOOK_INJECTION";
  summary: string;
  assemblyDiff: Array<{
    lineNum: number;
    addrA?: string;
    bytesA?: string;
    asmA?: string;
    addrB?: string;
    bytesB?: string;
    asmB?: string;
    type: "SAME" | "ADD" | "DEL" | "MOD";
    note?: string;
  }>;
  cfgNodes: BasicBlockNode[];
  cfgEdges: CFGEdge[];
}

export interface BinaryPairPreset {
  id: string;
  title: string;
  category: "TROJAN_BACKDOOR" | "1_DAY_PATCH" | "PROCESS_HOLLOWING" | "SUPPLY_CHAIN";
  targetA: {
    name: string;
    version: string;
    arch: string;
    size: string;
    sha256: string;
    type: "CLEAN" | "UNPATCHED" | "ORIGINAL";
  };
  targetB: {
    name: string;
    version: string;
    arch: string;
    size: string;
    sha256: string;
    type: "WEAPONIZED" | "PATCHED" | "TROJANIZED";
  };
  overview: string;
  securityAdvisory: {
    cve?: string;
    cwe: string;
    cvssScore: number;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    vulnerabilityTitle: string;
    rootCauseDescription: string;
    patchMechanism: string;
    exploitabilityAssessment: string;
    mitigationGuidance: string[];
    pocTriggerCondition: string;
    generatedYaraRule: string;
  };
  functions: DiffFunction[];
}

// ==========================================
// PRESETS DATA (REALISTIC RE DISASSEMBLY & PATCHES)
// ==========================================

const BINARY_PAIRS: BinaryPairPreset[] = [
  {
    id: "SILLYPUTTY_DIFF",
    title: "PuTTY v0.70 (Clean) vs. SillyPutty (Trojanized Backdoor)",
    category: "TROJAN_BACKDOOR",
    targetA: {
      name: "putty.exe (Official Release)",
      version: "0.70.0.0 (Clean Simon Tatham)",
      arch: "x86 (32-bit PE)",
      size: "1,048,576 bytes",
      sha256: "b45a0b764b85ceaa88d30e06e30bc064a75369cfa77239019283719283912839",
      type: "CLEAN"
    },
    targetB: {
      name: "sillyputty.exe (TCM Challenge)",
      version: "0.70.0.0 (Modified Trojan)",
      arch: "x86 (32-bit PE)",
      size: "1,085,440 bytes",
      sha256: "0fa642a8b30d35e1654ff4560799f2e347ad64da0ca0d5cfab4a259c7f66a2e4",
      type: "WEAPONIZED"
    },
    overview: "Comparison of authentic Simon Tatham PuTTY client against weaponized SillyPutty binary. BinDiff isolates rogue thread creation in WinMain redirecting execution to a hidden PowerShell TCP reverse shell bootstrap.",
    securityAdvisory: {
      cve: "CVE-2021-PUTTY-MOD-01",
      cwe: "CWE-506: Embedded Malicious Code",
      cvssScore: 9.3,
      severity: "CRITICAL",
      vulnerabilityTitle: "Trojanized SSH Client with Covert Reverse Shell Hook",
      rootCauseDescription: "The WinMain entry routine at 0x00412800 was modified. A call to CreateThread was inserted before the main Windows message loop (GetMessageA/DispatchMessageA). The new thread start address (0x00412880) constructs a base64/plaintext PowerShell command invoking System.Net.Sockets.TCPClient('192.168.195.139', 4444).",
      patchMechanism: "Reversion of WinMain to stock upstream codebase. Removal of rogue data strings in .data section and stripping of unauthorized KERNEL32!CreateThread import hook.",
      exploitabilityAssessment: "Immediate unauthenticated remote shell upon launching the executable by an unsuspecting user.",
      mitigationGuidance: [
        "Enforce cryptographic code-signing verification (Authenticode) on all internal desktop utility deployments.",
        "Block outbound TCP connections on non-standard ports (e.g. 4444) at endpoint EDR and perimeter firewalls.",
        "Deploy CERBERUS-RE YARA signature Trojan_Win32_SillyPutty across all endpoint storage volumes."
      ],
      pocTriggerCondition: "Execution of SillyPutty.exe under ordinary user privileges. Reverse shell spawns immediately without GUI alteration.",
      generatedYaraRule: `rule Trojan_Win32_SillyPutty_BinDiff {
    meta:
        description = "Detects SillyPutty rogue reverse shell thread patch"
        author = "CERBERUS-RE BinDiff Engine"
        reference = "TCM-Malware-Challenge-1"
        date = "2026-08-24"
    strings:
        $hook_bytes = { 68 80 28 41 00 6A 00 6A 00 E8 ?? ?? ?? ?? 85 C0 } // push offset worker; CreateThread
        $ps_str = "powershell.exe -w hidden -nop -c" ascii nocase
        $c2_ip = "192.168.195.139" ascii
    condition:
        uint16(0) == 0x5A4D and ($hook_bytes or ($ps_str and $c2_ip))
}`
    },
    functions: [
      {
        id: "FN-PUTTY-01",
        name: "WinMain",
        demangledName: "int __stdcall WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nShowCmd)",
        addressA: "0x004127A0",
        addressB: "0x004127A0",
        similarity: 0.74,
        confidence: 0.98,
        algorithm: "Control Flow Graph Isomorphism + Call Graph Topology",
        blocksA: 8,
        blocksB: 12,
        instructionsA: 42,
        instructionsB: 68,
        addedOpcodes: 26,
        removedOpcodes: 0,
        modifiedEdges: 4,
        status: "MODIFIED",
        category: "HOOK_INJECTION",
        summary: "WinMain prologue modified with injected CreateThread call spawning malicious worker subroutine at 0x00412880.",
        assemblyDiff: [
          { lineNum: 1, addrA: "0x004127A0", bytesA: "55", asmA: "push ebp", addrB: "0x004127A0", bytesB: "55", asmB: "push ebp", type: "SAME" },
          { lineNum: 2, addrA: "0x004127A1", bytesA: "8B EC", asmA: "mov ebp, esp", addrB: "0x004127A1", bytesB: "8B EC", asmB: "mov ebp, esp", type: "SAME" },
          { lineNum: 3, addrA: "0x004127A3", bytesA: "83 EC 20", asmA: "sub esp, 0x20", addrB: "0x004127A3", bytesB: "83 EC 20", asmB: "sub esp, 0x20", type: "SAME" },
          { lineNum: 4, addrA: "0x004127A6", bytesA: "E8 45 10 00 00", asmA: "call sub_004137F0 ; InitCommonControls", addrB: "0x004127A6", bytesB: "E8 45 10 00 00", asmB: "call sub_004137F0 ; InitCommonControls", type: "SAME" },
          { lineNum: 5, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x004127AB", bytesB: "6A 00", asmB: "push 0 ; lpThreadId", type: "ADD", note: "Rogue thread parameter" },
          { lineNum: 6, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x004127AD", bytesB: "6A 00", asmB: "push 0 ; dwCreationFlags", type: "ADD", note: "Run immediately" },
          { lineNum: 7, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x004127AF", bytesB: "6A 00", asmB: "push 0 ; lpParameter", type: "ADD" },
          { lineNum: 8, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x004127B1", bytesB: "68 80 28 41 00", asmB: "push 0x00412880 ; lpStartAddress (RogueWorker)", type: "ADD", note: "Points to reverse shell payload" },
          { lineNum: 9, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x004127B6", bytesB: "6A 00", asmB: "push 0 ; dwStackSize", type: "ADD" },
          { lineNum: 10, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x004127B8", bytesB: "6A 00", asmB: "push 0 ; lpThreadAttributes", type: "ADD" },
          { lineNum: 11, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x004127BA", bytesB: "FF 15 40 80 43 00", asmB: "call ds:[CreateThread]", type: "ADD", note: "Detached background execution" },
          { lineNum: 12, addrA: "0x004127AB", bytesA: "E8 A0 34 00 00", asmA: "call sub_00415C50 ; RegInitSettings", addrB: "0x004127C0", bytesB: "E8 A0 34 00 00", asmB: "call sub_00415C50 ; RegInitSettings", type: "SAME" },
          { lineNum: 13, addrA: "0x004127B0", bytesA: "85 C0", asmA: "test eax, eax", addrB: "0x004127C5", bytesB: "85 C0", asmB: "test eax, eax", type: "SAME" },
          { lineNum: 14, addrA: "0x004127B2", bytesA: "74 18", asmA: "jz loc_004127CC", addrB: "0x004127C7", bytesB: "74 18", asmB: "jz loc_004127E1", type: "SAME" },
        ],
        cfgNodes: [
          { id: "bb_entry", label: "WinMain Entry (0x4127A0)", addressA: "0x4127A0", addressB: "0x4127A0", status: "MODIFIED", x: 220, y: 30, width: 220, height: 75, instructionsA: ["push ebp", "mov ebp, esp", "sub esp, 0x20", "call InitCommonControls"], instructionsB: ["push ebp", "mov ebp, esp", "sub esp, 0x20", "call InitCommonControls", "call CreateThread (Hook)"] },
          { id: "bb_thread_hook", label: "Rogue CreateThread Block", addressB: "0x4127AB", status: "ADDED", isMaliciousHook: true, x: 490, y: 150, width: 230, height: 95, instructionsB: ["push 0x00412880 ; RogueWorker", "push 0 ; flags", "call [CreateThread]", "test eax, eax", "jnz loc_thread_ok"], description: "Malicious basic block inserted to initiate covert background thread" },
          { id: "bb_reg_init", label: "RegInitSettings (0x4127C0)", addressA: "0x4127AB", addressB: "0x4127C0", status: "IDENTICAL", x: 220, y: 170, width: 200, height: 60, instructionsA: ["call RegInitSettings", "test eax, eax"], instructionsB: ["call RegInitSettings", "test eax, eax"] },
          { id: "bb_msg_loop", label: "Windows Message Loop", addressA: "0x4127C0", addressB: "0x4127D5", status: "IDENTICAL", x: 220, y: 280, width: 200, height: 70, instructionsA: ["call GetMessageA", "call TranslateMessage", "call DispatchMessageA"], instructionsB: ["call GetMessageA", "call TranslateMessage", "call DispatchMessageA"] },
          { id: "bb_exit", label: "WinMain Epilogue", addressA: "0x4127E0", addressB: "0x4127F5", status: "IDENTICAL", x: 220, y: 390, width: 180, height: 50, instructionsA: ["mov esp, ebp", "pop ebp", "ret 0x10"], instructionsB: ["mov esp, ebp", "pop ebp", "ret 0x10"] }
        ],
        cfgEdges: [
          { from: "bb_entry", to: "bb_thread_hook", type: "unconditional" },
          { from: "bb_entry", to: "bb_reg_init", type: "true" },
          { from: "bb_thread_hook", to: "bb_reg_init", type: "unconditional" },
          { from: "bb_reg_init", to: "bb_msg_loop", type: "true" },
          { from: "bb_msg_loop", to: "bb_exit", type: "false" }
        ]
      },
      {
        id: "FN-PUTTY-02",
        name: "sub_00412880 (RogueWorker)",
        demangledName: "DWORD __stdcall RogueWorker(LPVOID lpThreadParameter)",
        addressA: "---",
        addressB: "0x00412880",
        similarity: 0.0,
        confidence: 1.0,
        algorithm: "Unmatched New Function (Target B Exclusive)",
        blocksA: 0,
        blocksB: 5,
        instructionsA: 0,
        instructionsB: 48,
        addedOpcodes: 48,
        removedOpcodes: 0,
        modifiedEdges: 5,
        status: "ADDED",
        category: "HOOK_INJECTION",
        summary: "Brand new isolated function not present in original PuTTY. Formats PowerShell string and calls ShellExecuteA.",
        assemblyDiff: [
          { lineNum: 1, addrA: "---", bytesA: "---", asmA: "[ABSENT IN ORIGINAL PUTTY.EXE]", addrB: "0x00412880", bytesB: "55", asmB: "push ebp", type: "ADD" },
          { lineNum: 2, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x00412881", bytesB: "8B EC", asmB: "mov ebp, esp", type: "ADD" },
          { lineNum: 3, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x00412883", bytesB: "81 EC 00 02 00 00", asmB: "sub esp, 0x200", type: "ADD" },
          { lineNum: 4, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x00412889", bytesB: "68 A0 40 43 00", asmB: "push 0x004340A0 ; 'powershell.exe -w hidden -nop...'", type: "ADD", note: "Encrypted/Plain C2 Payload string" },
          { lineNum: 5, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x0041288E", bytesB: "6A 00", asmB: "push 0 ; SW_HIDE", type: "ADD" },
          { lineNum: 6, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x00412890", bytesB: "6A 00", asmB: "push 0 ; lpDirectory", type: "ADD" },
          { lineNum: 7, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x00412892", bytesB: "68 C8 40 43 00", asmB: "push 0x004340C8 ; 'open'", type: "ADD" },
          { lineNum: 8, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x00412897", bytesB: "68 D0 40 43 00", asmB: "push 0x004340D0 ; 'cmd.exe'", type: "ADD" },
          { lineNum: 9, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x0041289C", bytesB: "6A 00", asmB: "push 0 ; hwnd", type: "ADD" },
          { lineNum: 10, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x0041289E", bytesB: "FF 15 48 80 43 00", asmB: "call ds:[ShellExecuteA]", type: "ADD", note: "Spawns hidden reverse shell" },
          { lineNum: 11, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x004128A4", bytesB: "33 C0", asmB: "xor eax, eax", type: "ADD" },
          { lineNum: 12, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x004128A6", bytesB: "C9", asmB: "leave", type: "ADD" },
          { lineNum: 13, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x004128A7", bytesB: "C2 04 00", asmB: "ret 4", type: "ADD" }
        ],
        cfgNodes: [
          { id: "bb_worker_entry", label: "Worker Entry (0x412880)", addressB: "0x412880", status: "ADDED", isMaliciousHook: true, x: 280, y: 50, width: 260, height: 80, instructionsB: ["push ebp", "mov ebp, esp", "sub esp, 0x200"], description: "Newly injected thread payload function" },
          { id: "bb_payload_exec", label: "Payload Dispatch (0x412889)", addressB: "0x412889", status: "ADDED", isMaliciousHook: true, x: 280, y: 170, width: 260, height: 110, instructionsB: ["push offset aPowershell", "push SW_HIDE", "push offset aOpen", "call [ShellExecuteA]"], description: "Executes hidden powershell reverse shell to 192.168.195.139:4444" },
          { id: "bb_worker_ret", label: "Thread Termination", addressB: "0x4128A4", status: "ADDED", x: 280, y: 320, width: 180, height: 50, instructionsB: ["xor eax, eax", "leave", "ret 4"] }
        ],
        cfgEdges: [
          { from: "bb_worker_entry", to: "bb_payload_exec", type: "unconditional" },
          { from: "bb_payload_exec", to: "bb_worker_ret", type: "unconditional" }
        ]
      },
      {
        id: "FN-PUTTY-03",
        name: "ssh_init",
        demangledName: "void *ssh_init(void *frontend, void **backend_handle)",
        addressA: "0x0042A140",
        addressB: "0x0042A140",
        similarity: 1.0,
        confidence: 1.0,
        algorithm: "Exact Byte & Hash Match",
        blocksA: 24,
        blocksB: 24,
        instructionsA: 186,
        instructionsB: 186,
        addedOpcodes: 0,
        removedOpcodes: 0,
        modifiedEdges: 0,
        status: "IDENTICAL",
        category: "CORE_LOGIC",
        summary: "Legitimate SSH protocol initialization logic unmodified. Client functions normally as a cover.",
        assemblyDiff: [
          { lineNum: 1, addrA: "0x0042A140", bytesA: "55", asmA: "push ebp", addrB: "0x0042A140", bytesB: "55", asmB: "push ebp", type: "SAME" },
          { lineNum: 2, addrA: "0x0042A141", bytesA: "8B EC", asmA: "mov ebp, esp", addrB: "0x0042A141", bytesB: "8B EC", asmB: "mov ebp, esp", type: "SAME" },
          { lineNum: 3, addrA: "0x0042A143", bytesA: "53", asmA: "push ebx", addrB: "0x0042A143", bytesB: "53", asmB: "push ebx", type: "SAME" },
          { lineNum: 4, addrA: "0x0042A144", bytesA: "56", asmA: "push esi", addrB: "0x0042A144", bytesB: "56", asmB: "push esi", type: "SAME" }
        ],
        cfgNodes: [
          { id: "bb_ssh_1", label: "ssh_init entry", addressA: "0x42A140", addressB: "0x42A140", status: "IDENTICAL", x: 260, y: 40, width: 180, height: 60, instructionsA: ["push ebp", "mov ebp, esp", "push ebx"], instructionsB: ["push ebp", "mov ebp, esp", "push ebx"] }
        ],
        cfgEdges: []
      },
      {
        id: "FN-PUTTY-04",
        name: "logevent",
        demangledName: "void logevent(void *frontend, const char *string)",
        addressA: "0x0041B200",
        addressB: "0x0041B200",
        similarity: 1.0,
        confidence: 1.0,
        algorithm: "Exact Byte Match",
        blocksA: 6,
        blocksB: 6,
        instructionsA: 34,
        instructionsB: 34,
        addedOpcodes: 0,
        removedOpcodes: 0,
        modifiedEdges: 0,
        status: "IDENTICAL",
        category: "CORE_LOGIC",
        summary: "Session event logging function identical across both binaries.",
        assemblyDiff: [],
        cfgNodes: [],
        cfgEdges: []
      }
    ]
  },
  {
    id: "MS17_010_PATCH_DIFF",
    title: "srv2.sys (MS17-010 EternalBlue Vulnerable vs. Patched KB4012212)",
    category: "1_DAY_PATCH",
    targetA: {
      name: "srv2.sys (Unpatched Windows 7/2008)",
      version: "6.1.7601.17514 (MS17-010 Vulnerable)",
      arch: "x64 (64-bit Kernel Driver)",
      size: "425,984 bytes",
      sha256: "9832109841298419284918294819284918294819284918294819284918294819",
      type: "UNPATCHED"
    },
    targetB: {
      name: "srv2.sys (Security Update KB4012212)",
      version: "6.1.7601.23677 (Patched Driver)",
      arch: "x64 (64-bit Kernel Driver)",
      size: "428,032 bytes",
      sha256: "7219830192830192830192830192830192830192830192830192830192830192",
      type: "PATCHED"
    },
    overview: "Dissection of the critical EternalBlue patch in Microsoft SMBv1 driver srv2.sys. BinDiff demonstrates how Microsoft inserted mathematical overflow verification checks into SrvOs2FeaListToNt to prevent integer truncation pool corruption.",
    securityAdvisory: {
      cve: "CVE-2017-0144",
      cwe: "CWE-190: Integer Overflow or Wraparound / CWE-122: Heap-based Buffer Overflow",
      cvssScore: 9.8,
      severity: "CRITICAL",
      vulnerabilityTitle: "Windows SMBv1 Remote Code Execution (EternalBlue / MS17-010)",
      rootCauseDescription: "In unpatched srv2!SrvOs2FeaListToNt, the driver calculates the buffer size needed to convert an OS/2 FEA (Full Extended Attribute) list to an NT FEA list. The mathematical calculation (Size = FeaListSize + 4) converts a 32-bit DWORD to a 16-bit WORD parameter passed to SrvAllocateNonPagedPool. Large FeaListSize values overflow 16 bits (0xFFFF), allocating a tiny pool chunk while subsequent memmove operations write huge data, triggering kernel pool overflow.",
      patchMechanism: "Added explicit upper-bound boundary checks in SrvOs2FeaListToNt: cmp edi, 0xFFFF; ja loc_overflow_error. If the FEA list length exceeds 16-bit capacity, the driver immediately aborts with STATUS_INVALID_PARAMETER (0xC000000D).",
      exploitabilityAssessment: "Remote unauthenticated code execution in Ring 0 (SYSTEM kernel space) via SMB port 445.",
      mitigationGuidance: [
        "Apply Microsoft Patch KB4012212 / KB4012215 immediately.",
        "Disable legacy SMBv1 protocol in Windows Features / Registry (Set SMB1 to 0).",
        "Block TCP Port 445 at internal subnet boundaries and edge firewalls."
      ],
      pocTriggerCondition: "Sending malformed SMB_COM_TRANSACTION2 request containing FEA list larger than 65535 bytes followed by SMB_COM_NT_TRANSACT secondary allocation groom.",
      generatedYaraRule: `rule Exploit_WinKernel_MS17_010_PatchDiff {
    meta:
        description = "Detects unpatched srv2.sys missing integer overflow check in SrvOs2FeaListToNt"
        author = "CERBERUS-RE Patch Guard"
        cve = "CVE-2017-0144"
    strings:
        // Vulnerable sequence missing DWORD boundary verification
        $vuln_seq = { 8B 7B 04 8D 47 04 66 89 44 24 ?? E8 ?? ?? ?? ?? }
        // Patched boundary comparison
        $patch_seq = { 81 FF FF FF 00 00 0F 87 ?? ?? ?? ?? } // cmp edi, 0x0000FFFF; ja error
    condition:
        uint16(0) == 0x5A4D and $vuln_seq and not $patch_seq
}`
    },
    functions: [
      {
        id: "FN-SMB-01",
        name: "SrvOs2FeaListToNt",
        demangledName: "NTSTATUS SrvOs2FeaListToNt(PFEA_LIST Os2FeaList, PFEA_LIST_NT *NtFeaList)",
        addressA: "0x0001C420",
        addressB: "0x0001C560",
        similarity: 0.81,
        confidence: 0.99,
        algorithm: "Small Primes Product + AST Subgraph Matching",
        blocksA: 14,
        blocksB: 18,
        instructionsA: 88,
        instructionsB: 114,
        addedOpcodes: 26,
        removedOpcodes: 0,
        modifiedEdges: 6,
        status: "MODIFIED",
        category: "SECURITY_CHECK",
        summary: "Integer overflow validation check added before SrvAllocateNonPagedPool invocation.",
        assemblyDiff: [
          { lineNum: 1, addrA: "0x0001C420", bytesA: "48 89 5C 24 08", asmA: "mov [rsp+8], rbx", addrB: "0x0001C560", bytesB: "48 89 5C 24 08", asmB: "mov [rsp+8], rbx", type: "SAME" },
          { lineNum: 2, addrA: "0x0001C425", bytesA: "48 89 74 24 10", asmA: "mov [rsp+16], rsi", addrB: "0x0001C565", bytesB: "48 89 74 24 10", asmB: "mov [rsp+16], rsi", type: "SAME" },
          { lineNum: 3, addrA: "0x0001C42A", bytesA: "8B 79 04", asmA: "mov edi, [rcx+4] ; FeaListSize", addrB: "0x0001C56A", bytesB: "8B 79 04", asmB: "mov edi, [rcx+4] ; FeaListSize", type: "SAME" },
          { lineNum: 4, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x0001C56D", bytesB: "81 FF FF FF 00 00", asmB: "cmp edi, 0x0000FFFF ; 16-bit WORD max", type: "ADD", note: "CRITICAL PATCH CHECK" },
          { lineNum: 5, addrA: "---", bytesA: "---", asmA: "---", addrB: "0x0001C573", bytesB: "0F 87 9B 00 00 00", asmB: "ja loc_overflow_abort ; Return STATUS_INVALID_PARAMETER", type: "ADD", note: "Halts buffer wraparound" },
          { lineNum: 6, addrA: "0x0001C42D", bytesA: "8D 47 04", asmA: "lea eax, [rdi+4]", addrB: "0x0001C579", bytesB: "8D 47 04", asmB: "lea eax, [rdi+4]", type: "SAME" },
          { lineNum: 7, addrA: "0x0001C430", bytesA: "66 89 44 24 20", asmA: "mov [rsp+0x20], ax ; 16-bit truncation", addrB: "0x0001C57C", bytesB: "66 89 44 24 20", asmB: "mov [rsp+0x20], ax ; Safe from overflow", type: "SAME" },
          { lineNum: 8, addrA: "0x0001C435", bytesA: "E8 B6 F0 FF FF", asmA: "call SrvAllocateNonPagedPool", addrB: "0x0001C581", bytesB: "E8 B6 F0 FF FF", asmB: "call SrvAllocateNonPagedPool", type: "SAME" }
        ],
        cfgNodes: [
          { id: "bb_smb_entry", label: "SrvOs2FeaListToNt Entry", addressA: "0x1C420", addressB: "0x1C560", status: "MODIFIED", x: 240, y: 30, width: 230, height: 75, instructionsA: ["mov [rsp+8], rbx", "mov edi, [rcx+4] ; FeaListSize", "lea eax, [rdi+4]"], instructionsB: ["mov [rsp+8], rbx", "mov edi, [rcx+4] ; FeaListSize", "cmp edi, 0xFFFF (Patch Check)"] },
          { id: "bb_smb_overflow_abort", label: "loc_overflow_abort", addressB: "0x1C614", status: "ADDED", x: 520, y: 150, width: 220, height: 75, instructionsB: ["mov eax, 0xC000000D ; STATUS_INVALID_PARAMETER", "mov rbx, [rsp+8]", "ret"], description: "New error handler preventing kernel pool memory corruption" },
          { id: "bb_smb_alloc", label: "Safe SrvAllocateNonPagedPool", addressA: "0x1C435", addressB: "0x1C581", status: "IDENTICAL", x: 240, y: 170, width: 230, height: 70, instructionsA: ["call SrvAllocateNonPagedPool", "test rax, rax", "jz loc_out_of_mem"], instructionsB: ["call SrvAllocateNonPagedPool", "test rax, rax", "jz loc_out_of_mem"] }
        ],
        cfgEdges: [
          { from: "bb_smb_entry", to: "bb_smb_overflow_abort", type: "true" },
          { from: "bb_smb_entry", to: "bb_smb_alloc", type: "false" }
        ]
      },
      {
        id: "FN-SMB-02",
        name: "SrvOs2FeaListSizeToNt",
        demangledName: "ULONG SrvOs2FeaListSizeToNt(PFEA_LIST FeaList)",
        addressA: "0x0001C310",
        addressB: "0x0001C390",
        similarity: 0.88,
        confidence: 0.95,
        algorithm: "Instruction Hash + Prime Decomposition",
        blocksA: 6,
        blocksB: 8,
        instructionsA: 38,
        instructionsB: 50,
        addedOpcodes: 12,
        removedOpcodes: 0,
        modifiedEdges: 2,
        status: "MODIFIED",
        category: "SECURITY_CHECK",
        summary: "Sanitizes DWORD arithmetic iteration when traversing linked FEA structures.",
        assemblyDiff: [],
        cfgNodes: [],
        cfgEdges: []
      }
    ]
  },
  {
    id: "SUNBURST_DIFF",
    title: "SolarWinds.Orion.Core.BusinessLayer.dll (Clean vs. Sunburst APT29)",
    category: "SUPPLY_CHAIN",
    targetA: {
      name: "SolarWinds.Orion.Core.BusinessLayer.dll (Clean)",
      version: "2019.4.5200.8890 (Uncompromised)",
      arch: ".NET CIL Assembly (x64)",
      size: "1,572,864 bytes",
      sha256: "3219084091823091823091823091823091823091823091823091823091823091",
      type: "ORIGINAL"
    },
    targetB: {
      name: "SolarWinds.Orion.Core.BusinessLayer.dll (Backdoored)",
      version: "2019.4.5200.9083 (Sunburst / Nobelium)",
      arch: ".NET CIL Assembly (x64)",
      size: "1,601,536 bytes",
      sha256: "ac1b2b4e4d3a1b7e4f8d9c2a1e0b5f6a7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f",
      type: "TROJANIZED"
    },
    overview: "Diff of the landmark SolarWinds supply-chain backdoor. BinDiff reveals the inserted OrionImprovementBusinessLayer class within the legitimate SolarWinds inventory update worker thread.",
    securityAdvisory: {
      cve: "CVE-2020-10148",
      cwe: "CWE-506: Embedded Malicious Code in Software Build Pipeline",
      cvssScore: 9.8,
      severity: "CRITICAL",
      vulnerabilityTitle: "Nation-State Supply Chain Backdoor (Sunburst / APT29)",
      rootCauseDescription: "APT29 compromised the SolarWinds build pipeline (SolarMarker) to inject a secondary class 'OrionImprovementBusinessLayer' during compile time. The class contains dormant timers (12-14 days), checks for active AV/EDR drivers via DefeatAnalysis(), and performs DGA domain queries to avsvmcloud.com.",
      patchMechanism: "Rebuilt pristine DLL from secured repository, revoked digital signature certificate, and integrated automated binary diff verification in CI/CD pipeline.",
      exploitabilityAssessment: "Widespread unauthenticated enterprise backdoor installed via legitimate software updates.",
      mitigationGuidance: [
        "Isolate all SolarWinds Orion servers and rotate SAML signing keys.",
        "Block outbound DNS requests to *.avsvmcloud.com and related DGA zones.",
        "Implement CERBERUS-RE binary hash pinning for all 3rd-party vendor updates."
      ],
      pocTriggerCondition: "Wait out 12-day dormancy period. Trigger DNS C2 lookup after confirming absence of analysis tools.",
      generatedYaraRule: `rule APT29_Sunburst_BinDiff_Hook {
    meta:
        description = "Detects Sunburst OrionImprovementBusinessLayer backdoor insertion"
        author = "CERBERUS-RE Threat Lab"
    strings:
        $class = "OrionImprovementBusinessLayer" ascii
        $dga_suffix = "avsvmcloud.com" ascii wide
        $guid_calc = { 72 ?? ?? ?? ?? 28 ?? ?? ?? ?? 6F ?? ?? ?? ?? 74 ?? }
    condition:
        uint16(0) == 0x5A4D and ($class and $dga_suffix)
}`
    },
    functions: [
      {
        id: "FN-SUN-01",
        name: "RefreshInternal",
        demangledName: "void SolarWinds.Orion.Core.BusinessLayer.BackgroundInventory.RefreshInternal()",
        addressA: "0x06001240",
        addressB: "0x06001240",
        similarity: 0.65,
        confidence: 0.97,
        algorithm: "CIL Bytecode Isomorphism + Metadata Token Diff",
        blocksA: 4,
        blocksB: 7,
        instructionsA: 28,
        instructionsB: 54,
        addedOpcodes: 26,
        removedOpcodes: 0,
        modifiedEdges: 3,
        status: "MODIFIED",
        category: "HOOK_INJECTION",
        summary: "BackgroundInventory thread modified to call OrionImprovementBusinessLayer.Initialize() asynchronously.",
        assemblyDiff: [
          { lineNum: 1, addrA: "IL_0000", bytesA: "00", asmA: "nop", addrB: "IL_0000", bytesB: "00", asmB: "nop", type: "SAME" },
          { lineNum: 2, addrA: "IL_0001", bytesA: "02", asmA: "ldarg.0", addrB: "IL_0001", bytesB: "02", asmB: "ldarg.0", type: "SAME" },
          { lineNum: 3, addrA: "IL_0002", bytesA: "28 34 00 00 06", asmA: "call void BaseRefresh()", addrB: "IL_0002", bytesB: "28 34 00 00 06", asmB: "call void BaseRefresh()", type: "SAME" },
          { lineNum: 4, addrA: "---", bytesA: "---", asmA: "---", addrB: "IL_0007", bytesB: "73 90 14 00 06", asmB: "newobj OrionImprovementBusinessLayer..ctor()", type: "ADD", note: "BACKDOOR INSTANTIATION" },
          { lineNum: 5, addrA: "---", bytesA: "---", asmA: "---", addrB: "IL_000C", bytesB: "6F 92 14 00 06", asmB: "callvirt void Initialize()", type: "ADD", note: "Starts 12-day dormancy timer" },
          { lineNum: 6, addrA: "IL_0007", bytesA: "2A", asmA: "ret", addrB: "IL_0011", bytesB: "2A", asmB: "ret", type: "SAME" }
        ],
        cfgNodes: [
          { id: "bb_sun_1", label: "RefreshInternal Entry", addressA: "IL_0000", addressB: "IL_0000", status: "MODIFIED", x: 260, y: 40, width: 220, height: 70, instructionsA: ["ldarg.0", "call BaseRefresh()"], instructionsB: ["ldarg.0", "call BaseRefresh()", "newobj OrionImprovementBusinessLayer"] },
          { id: "bb_sun_hook", label: "OrionImprovement Trigger", addressB: "IL_0007", status: "ADDED", isMaliciousHook: true, x: 260, y: 160, width: 240, height: 80, instructionsB: ["newobj OrionImprovement..ctor()", "callvirt Initialize()"], description: "Malicious class instantiation" },
          { id: "bb_sun_ret", label: "Method Epilogue", addressA: "IL_0007", addressB: "IL_0011", status: "IDENTICAL", x: 260, y: 280, width: 160, height: 50, instructionsA: ["ret"], instructionsB: ["ret"] }
        ],
        cfgEdges: [
          { from: "bb_sun_1", to: "bb_sun_hook", type: "unconditional" },
          { from: "bb_sun_hook", to: "bb_sun_ret", type: "unconditional" }
        ]
      }
    ]
  }
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function BinDiffStudioPage() {
  const [selectedPairId, setSelectedPairId] = useState<string>("SILLYPUTTY_DIFF");
  const [selectedFunctionId, setSelectedFunctionId] = useState<string>("FN-PUTTY-01");
  const [activeTab, setActiveTab] = useState<"ASM_DIFF" | "CFG_DIFF" | "MATCH_TABLE" | "SECURITY_ADVISORY">("ASM_DIFF");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showHexBytes, setShowHexBytes] = useState<boolean>(true);
  const [cfgZoom, setCfgZoom] = useState<number>(1.0);
  const [copiedYara, setCopiedYara] = useState<boolean>(false);
  const [selectedCfgNode, setSelectedCfgNode] = useState<BasicBlockNode | null>(null);

  // Active Pair & Active Function
  const currentPair = useMemo(() => {
    return BINARY_PAIRS.find((p) => p.id === selectedPairId) || BINARY_PAIRS[0];
  }, [selectedPairId]);

  const currentFunction = useMemo(() => {
    return currentPair.functions.find((f) => f.id === selectedFunctionId) || currentPair.functions[0];
  }, [currentPair, selectedFunctionId]);

  // Filtered Functions
  const filteredFunctions = useMemo(() => {
    return currentPair.functions.filter((fn) => {
      const matchSearch =
        fn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fn.demangledName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fn.addressA.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fn.addressB.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = filterCategory === "ALL" || fn.category === filterCategory;
      const matchStatus = filterStatus === "ALL" || fn.status === filterStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [currentPair, searchQuery, filterCategory, filterStatus]);

  // Metrics
  const metrics = useMemo(() => {
    const total = currentPair.functions.length;
    const identical = currentPair.functions.filter((f) => f.status === "IDENTICAL").length;
    const modified = currentPair.functions.filter((f) => f.status === "MODIFIED").length;
    const added = currentPair.functions.filter((f) => f.status === "ADDED").length;
    const deleted = currentPair.functions.filter((f) => f.status === "DELETED").length;
    const avgSim = total > 0 ? (currentPair.functions.reduce((acc, f) => acc + f.similarity, 0) / total) * 100 : 100;

    return { total, identical, modified, added, deleted, avgSim: avgSim.toFixed(1) };
  }, [currentPair]);

  const handleCopyYara = () => {
    navigator.clipboard.writeText(currentPair.securityAdvisory.generatedYaraRule);
    setCopiedYara(true);
    setTimeout(() => setCopiedYara(false), 2000);
  };

  const getStatusBadge = (status: DiffStatus) => {
    switch (status) {
      case "IDENTICAL":
        return <span className="badge-low" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><CheckCircle2 size={10} /> 100% IDENTICAL</span>;
      case "MODIFIED":
        return <span className="badge-high" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><AlertTriangle size={10} /> MODIFIED</span>;
      case "ADDED":
        return <span className="badge-critical" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Flame size={10} /> NEW / ROGUE</span>;
      case "DELETED":
        return <span className="badge-medium" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><XCircle size={10} /> REMOVED</span>;
    }
  };

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ================= HEADER & PRESET SELECTOR ================= */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{
                background: "rgba(6,182,212,0.15)",
                color: "var(--primary)",
                padding: "6px 10px",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.05em"
              }}>
                <FileDiff size={16} />
                BINDIFF &amp; DIAPHORA ENGINE
              </div>
              <span className="badge-critical">1-DAY PATCH ANALYZER</span>
              <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>AST Subgraph + Prime Sieve Matcher</span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--fg)" }}>
              Binary Diffing &amp; Patch Dissection Studio
            </h1>
            <p style={{ fontSize: 12.5, color: "var(--fg-2)", marginTop: 2, maxWidth: 950 }}>
              Autonomous binary comparison engine for identifying backdoored functions, newly hooked threads, compiler changes, and 1-day vulnerability security patches across x86, x64, and .NET binaries.
            </p>
          </div>

          {/* Preset Selector Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Preset Pair:</span>
            <select
              value={selectedPairId}
              onChange={(e) => {
                setSelectedPairId(e.target.value);
                const p = BINARY_PAIRS.find((bp) => bp.id === e.target.value);
                if (p && p.functions.length > 0) {
                  setSelectedFunctionId(p.functions[0].id);
                }
              }}
              className="tool-select"
              style={{ fontWeight: 700, minWidth: 320, borderColor: "var(--primary)" }}
            >
              {BINARY_PAIRS.map((pair) => (
                <option key={pair.id} value={pair.id}>
                  {pair.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Target A vs Target B Visual Banner */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 14,
          alignItems: "center",
          background: "var(--bg-dark)",
          padding: "12px 16px",
          borderRadius: 8,
          border: "1px solid var(--border)"
        }}>
          {/* Target A */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                background: currentPair.targetA.type === "CLEAN" ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)",
                color: currentPair.targetA.type === "CLEAN" ? "#10b981" : "#f59e0b",
                padding: "2px 6px",
                borderRadius: 4,
                border: "1px solid currentColor"
              }}>
                TARGET A ({currentPair.targetA.type})
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>
                {currentPair.targetA.name}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", gap: 12, fontFamily: "monospace" }}>
              <span>Ver: {currentPair.targetA.version}</span>
              <span>•</span>
              <span>Arch: {currentPair.targetA.arch}</span>
              <span>•</span>
              <span>Size: {currentPair.targetA.size}</span>
            </div>
          </div>

          {/* VS Divider */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--primary)",
            fontWeight: 800,
            fontSize: 11
          }}>
            VS
          </div>

          {/* Target B */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>
                {currentPair.targetB.name}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                background: currentPair.targetB.type === "WEAPONIZED" || currentPair.targetB.type === "TROJANIZED" ? "rgba(239,68,68,0.2)" : "rgba(6,182,212,0.2)",
                color: currentPair.targetB.type === "WEAPONIZED" || currentPair.targetB.type === "TROJANIZED" ? "#ef4444" : "#06b6d4",
                padding: "2px 6px",
                borderRadius: 4,
                border: "1px solid currentColor"
              }}>
                TARGET B ({currentPair.targetB.type})
              </span>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", gap: 12, fontFamily: "monospace" }}>
              <span>Ver: {currentPair.targetB.version}</span>
              <span>•</span>
              <span>Arch: {currentPair.targetB.arch}</span>
              <span>•</span>
              <span>Size: {currentPair.targetB.size}</span>
            </div>
          </div>
        </div>

        {/* Telemetry Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          <div style={{ background: "var(--surface-2)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Overall Similarity</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)", marginTop: 2 }}>{metrics.avgSim}%</div>
          </div>
          <div style={{ background: "var(--surface-2)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Functions Analyzed</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--fg)", marginTop: 2 }}>{metrics.total}</div>
          </div>
          <div style={{ background: "var(--surface-2)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Identical</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--green)", marginTop: 2 }}>{metrics.identical}</div>
          </div>
          <div style={{ background: "var(--surface-2)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Modified</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--yellow)", marginTop: 2 }}>{metrics.modified}</div>
          </div>
          <div style={{ background: "var(--surface-2)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>New / Rogue Blocks</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--red)", marginTop: 2 }}>{metrics.added}</div>
          </div>
        </div>
      </div>

      {/* ================= TABS NAVIGATION ================= */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        paddingBottom: 4,
        gap: 8,
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setActiveTab("ASM_DIFF")}
            className={activeTab === "ASM_DIFF" ? "btn-primary" : "btn-secondary"}
            style={{ fontSize: 12 }}
          >
            <Code size={13} />
            Side-by-Side Assembly Diff
          </button>
          <button
            onClick={() => setActiveTab("CFG_DIFF")}
            className={activeTab === "CFG_DIFF" ? "btn-primary" : "btn-secondary"}
            style={{ fontSize: 12 }}
          >
            <GitCompare size={13} />
            Interactive Visual CFG Graph
          </button>
          <button
            onClick={() => setActiveTab("MATCH_TABLE")}
            className={activeTab === "MATCH_TABLE" ? "btn-primary" : "btn-secondary"}
            style={{ fontSize: 12 }}
          >
            <Layers size={13} />
            Functions Matching Table ({currentPair.functions.length})
          </button>
          <button
            onClick={() => setActiveTab("SECURITY_ADVISORY")}
            className={activeTab === "SECURITY_ADVISORY" ? "btn-primary" : "btn-secondary"}
            style={{ fontSize: 12 }}
          >
            <ShieldAlert size={13} />
            1-Day Patch Security Advisory
          </button>
        </div>

        {/* Controls on Tab Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {activeTab === "ASM_DIFF" && (
            <button
              onClick={() => setShowHexBytes(!showHexBytes)}
              className="btn-secondary"
              style={{ fontSize: 11 }}
            >
              <Binary size={12} />
              {showHexBytes ? "Hide Raw Opcodes" : "Show Raw Opcodes"}
            </button>
          )}
          {activeTab === "CFG_DIFF" && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--surface-2)", padding: "3px 6px", borderRadius: 6, border: "1px solid var(--border)" }}>
              <button
                onClick={() => setCfgZoom(Math.max(0.6, cfgZoom - 0.1))}
                style={{ background: "none", border: "none", color: "var(--fg)", cursor: "pointer", padding: "2px 4px" }}
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span style={{ fontSize: 10, fontFamily: "monospace", minWidth: 36, textAlign: "center" }}>
                {Math.round(cfgZoom * 100)}%
              </span>
              <button
                onClick={() => setCfgZoom(Math.min(1.6, cfgZoom + 0.1))}
                style={{ background: "none", border: "none", color: "var(--fg)", cursor: "pointer", padding: "2px 4px" }}
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
              <button
                onClick={() => setCfgZoom(1.0)}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "2px 4px", fontSize: 10 }}
                title="Reset"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= TAB 1: SIDE-BY-SIDE ASSEMBLY DIFF ================= */}
      {activeTab === "ASM_DIFF" && (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
          {/* Left: Function List for Quick Switching */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxHeight: 700,
            overflowY: "auto"
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Functions in Pair ({currentPair.functions.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {currentPair.functions.map((fn) => {
                const isSelected = fn.id === selectedFunctionId;
                return (
                  <button
                    key={fn.id}
                    onClick={() => setSelectedFunctionId(fn.id)}
                    style={{
                      background: isSelected ? "rgba(6,182,212,0.12)" : "var(--surface-2)",
                      border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                      borderRadius: 6,
                      padding: "8px 10px",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      transition: "all 0.12s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? "var(--primary)" : "var(--fg)", fontFamily: "monospace" }}>
                        {fn.name}
                      </span>
                      {getStatusBadge(fn.status)}
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "monospace", display: "flex", justifyContent: "space-between" }}>
                      <span>Sim: {Math.round(fn.similarity * 100)}%</span>
                      <span>Δ {fn.addedOpcodes} added / {fn.removedOpcodes} del</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Side-by-Side Disassembly View */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}>
            {/* Function Meta Banner */}
            <div style={{
              background: "var(--surface-2)",
              padding: "10px 14px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", fontFamily: "monospace" }}>
                  {currentFunction.demangledName}
                </div>
                <div style={{ fontSize: 11, color: "var(--primary)", marginTop: 2 }}>
                  {currentFunction.summary}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {getStatusBadge(currentFunction.status)}
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--muted)" }}>
                  Algorithm: {currentFunction.algorithm}
                </span>
              </div>
            </div>

            {/* Split Disassembly Code Table */}
            <div style={{
              background: "#020408",
              border: "1px solid var(--border)",
              borderRadius: 6,
              overflowX: "auto",
              fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
              fontSize: 11.5
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                borderBottom: "1px solid var(--border)",
                background: "var(--surface-2)",
                fontSize: 11,
                fontWeight: 800,
                color: "var(--muted)",
                padding: "6px 12px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }} />
                  TARGET A: {currentPair.targetA.name} ({currentFunction.addressA})
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: currentFunction.status === "ADDED" || currentFunction.status === "MODIFIED" ? "#ef4444" : "#10b981" }} />
                  TARGET B: {currentPair.targetB.name} ({currentFunction.addressB})
                </div>
              </div>

              {/* Rows */}
              <div style={{ maxHeight: 520, overflowY: "auto" }}>
                {currentFunction.assemblyDiff.map((row, idx) => {
                  let rowBg = "transparent";
                  if (row.type === "ADD") rowBg = "rgba(16, 185, 129, 0.12)";
                  if (row.type === "DEL") rowBg = "rgba(239, 68, 68, 0.12)";
                  if (row.type === "MOD") rowBg = "rgba(245, 158, 11, 0.12)";

                  return (
                    <div
                      key={idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                        background: rowBg,
                        padding: "4px 12px",
                        lineHeight: 1.6
                      }}
                    >
                      {/* Side A */}
                      <div style={{
                        display: "flex",
                        gap: 10,
                        borderRight: "1px solid var(--border)",
                        paddingRight: 12,
                        color: row.type === "DEL" ? "#f87171" : "var(--fg-2)"
                      }}>
                        <span style={{ color: "var(--muted)", minWidth: 24, userSelect: "none" }}>{row.lineNum}</span>
                        {row.addrA && <span style={{ color: "#38bdf8", minWidth: 85 }}>{row.addrA}</span>}
                        {showHexBytes && row.bytesA && <span style={{ color: "var(--muted)", minWidth: 95 }}>{row.bytesA}</span>}
                        <span style={{ flex: 1, fontWeight: row.type === "DEL" ? 700 : 400 }}>{row.asmA || "---"}</span>
                      </div>

                      {/* Side B */}
                      <div style={{
                        display: "flex",
                        gap: 10,
                        paddingLeft: 12,
                        color: row.type === "ADD" ? "#34d399" : row.type === "MOD" ? "#fbbf24" : "var(--fg-2)"
                      }}>
                        <span style={{ color: "var(--muted)", minWidth: 24, userSelect: "none" }}>{row.lineNum}</span>
                        {row.addrB && <span style={{ color: "#38bdf8", minWidth: 85 }}>{row.addrB}</span>}
                        {showHexBytes && row.bytesB && <span style={{ color: "var(--muted)", minWidth: 95 }}>{row.bytesB}</span>}
                        <span style={{ flex: 1, fontWeight: row.type === "ADD" ? 700 : 400 }}>{row.asmB || "---"}</span>
                        {row.note && (
                          <span style={{
                            fontSize: 10,
                            background: "rgba(239, 68, 68, 0.2)",
                            color: "#f87171",
                            padding: "1px 6px",
                            borderRadius: 3,
                            height: "fit-content",
                            fontWeight: 700
                          }}>
                            {row.note}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: INTERACTIVE VISUAL CFG GRAPH ================= */}
      {activeTab === "CFG_DIFF" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
          {/* Main SVG Graph Canvas */}
          <div style={{
            background: "#03060c",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
            minHeight: 560,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Graph Header Legend */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>
                  Control Flow Graph (CFG) Diff: {currentFunction.name}
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>
                  ({currentFunction.cfgNodes.length} Basic Blocks, {currentFunction.cfgEdges.length} Branches)
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "#1e293b", border: "1px solid #475569" }} /> Identical Block
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(245, 158, 11, 0.2)", border: "1px solid #f59e0b" }} /> Modified
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444" }} /> Added / Rogue Hook
                </span>
              </div>
            </div>

            {/* SVG Renderer */}
            <div style={{
              flex: 1,
              position: "relative",
              overflow: "auto",
              background: "radial-gradient(circle, #0e1422 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              minHeight: 480
            }}>
              <svg
                width={800 * cfgZoom}
                height={500 * cfgZoom}
                viewBox="0 0 800 500"
                style={{ width: "100%", height: "100%" }}
              >
                <defs>
                  <marker id="arrow-true" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#10b981" />
                  </marker>
                  <marker id="arrow-false" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#ef4444" />
                  </marker>
                  <marker id="arrow-uncond" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#06b6d4" />
                  </marker>
                </defs>

                {/* Draw Edges */}
                {currentFunction.cfgEdges.map((edge, eIdx) => {
                  const fromNode = currentFunction.cfgNodes.find((n) => n.id === edge.from);
                  const toNode = currentFunction.cfgNodes.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  const startX = fromNode.x + fromNode.width / 2;
                  const startY = fromNode.y + fromNode.height;
                  const endX = toNode.x + toNode.width / 2;
                  const endY = toNode.y;

                  const color = edge.type === "true" ? "#10b981" : edge.type === "false" ? "#ef4444" : "#06b6d4";
                  const marker = edge.type === "true" ? "url(#arrow-true)" : edge.type === "false" ? "url(#arrow-false)" : "url(#arrow-uncond)";

                  const midY = (startY + endY) / 2;
                  const pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

                  return (
                    <g key={eIdx}>
                      <path
                        d={pathData}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        markerEnd={marker}
                      />
                    </g>
                  );
                })}

                {/* Draw Nodes */}
                {currentFunction.cfgNodes.map((node) => {
                  let fillColor = "var(--surface)";
                  let strokeColor = "var(--border)";
                  let badgeColor = "#64748b";

                  if (node.status === "MODIFIED") {
                    fillColor = "#141c2e";
                    strokeColor = "#f59e0b";
                    badgeColor = "#f59e0b";
                  } else if (node.isMaliciousHook || node.status === "ADDED") {
                    fillColor = "rgba(239, 68, 68, 0.15)";
                    strokeColor = "#ef4444";
                    badgeColor = "#ef4444";
                  }

                  const isSelected = selectedCfgNode?.id === node.id;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => setSelectedCfgNode(node)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Card Background */}
                      <rect
                        width={node.width}
                        height={node.height}
                        rx="6"
                        fill={fillColor}
                        stroke={isSelected ? "var(--primary)" : strokeColor}
                        strokeWidth={isSelected ? 3 : node.isMaliciousHook ? 2 : 1}
                      />

                      {/* Header Bar */}
                      <rect
                        width={node.width}
                        height="22"
                        rx="6"
                        fill="rgba(0,0,0,0.3)"
                      />

                      {/* Node Title */}
                      <text
                        x="10"
                        y="15"
                        fill="#f1f5f9"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {node.label}
                      </text>

                      {/* Status Tag */}
                      <text
                        x={node.width - 10}
                        y="15"
                        textAnchor="end"
                        fill={badgeColor}
                        fontSize="9"
                        fontWeight="800"
                        fontFamily="monospace"
                      >
                        {node.status}
                      </text>

                      {/* Instructions preview */}
                      {(node.instructionsB || node.instructionsA || []).slice(0, 3).map((instr, iIdx) => (
                        <text
                          key={iIdx}
                          x="10"
                          y={38 + iIdx * 15}
                          fill="#cbd5e1"
                          fontSize="9.5"
                          fontFamily="monospace"
                        >
                          {instr}
                        </text>
                      ))}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Right: Selected Node Disassembly Inspector */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: 6 }}>
                <Cpu size={14} color="var(--primary)" />
                Block Disassembly Inspector
              </div>
            </div>

            {selectedCfgNode ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>{selectedCfgNode.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", marginTop: 2 }}>
                    Target B Offset: {selectedCfgNode.addressB || "N/A"}
                  </div>
                </div>

                {selectedCfgNode.isMaliciousHook && (
                  <div style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    padding: "8px 10px",
                    borderRadius: 6,
                    color: "#f87171",
                    fontSize: 11,
                    lineHeight: 1.5
                  }}>
                    <strong>⚠️ Malicious Hook Detected:</strong> {selectedCfgNode.description || "Inserted control flow deviation."}
                  </div>
                )}

                {/* Target A vs Target B Block Code */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>
                    Opcodes &amp; Mnemonics
                  </div>
                  <div style={{
                    background: "#020408",
                    padding: 10,
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    fontFamily: "monospace",
                    fontSize: 11,
                    lineHeight: 1.6,
                    maxHeight: 280,
                    overflowY: "auto"
                  }}>
                    {(selectedCfgNode.instructionsB || selectedCfgNode.instructionsA || []).map((ins, idx) => (
                      <div key={idx} style={{ color: selectedCfgNode.isMaliciousHook ? "#34d399" : "#cbd5e1" }}>
                        {ins}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 10px", color: "var(--muted)", textAlign: "center", gap: 8 }}>
                <Eye size={24} />
                <span style={{ fontSize: 12 }}>Click any Basic Block node on the CFG canvas to inspect detailed instructions.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: FUNCTIONS MATCHING TABLE ================= */}
      {activeTab === "MATCH_TABLE" && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 14
        }}>
          {/* Table Filters & Search */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, maxWidth: 400 }}>
              <Search size={14} color="var(--muted)" />
              <input
                type="text"
                placeholder="Search function symbol, demangled name, or hex address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tool-input"
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="tool-select"
                style={{ fontSize: 11 }}
              >
                <option value="ALL">All Statuses</option>
                <option value="MODIFIED">Modified Only</option>
                <option value="ADDED">Added / Rogue Only</option>
                <option value="IDENTICAL">Identical Only</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="tool-select"
                style={{ fontSize: 11 }}
              >
                <option value="ALL">All Categories</option>
                <option value="HOOK_INJECTION">Hook Injection</option>
                <option value="SECURITY_CHECK">Security Check</option>
                <option value="CORE_LOGIC">Core Logic</option>
              </select>
            </div>
          </div>

          {/* Functions Table */}
          <div style={{ overflowX: "auto" }}>
            <table className="cerberus-table">
              <thead>
                <tr>
                  <th>Function Symbol &amp; Signature</th>
                  <th>Addr Target A</th>
                  <th>Addr Target B</th>
                  <th>Similarity %</th>
                  <th>Confidence</th>
                  <th>Basic Blocks (A/B)</th>
                  <th>Opcode Delta</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFunctions.map((fn) => {
                  const simPercent = Math.round(fn.similarity * 100);
                  let simColor = "#10b981";
                  if (simPercent < 80) simColor = "#ef4444";
                  else if (simPercent < 99) simColor = "#f59e0b";

                  return (
                    <tr key={fn.id}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: 700, color: "var(--fg)", fontFamily: "monospace" }}>{fn.name}</span>
                          <span style={{ fontSize: 10, color: "var(--muted)", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {fn.demangledName}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontFamily: "monospace", color: "#38bdf8" }}>{fn.addressA}</td>
                      <td style={{ fontFamily: "monospace", color: "#38bdf8" }}>{fn.addressB}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ flex: 1, height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden", minWidth: 60 }}>
                            <div style={{ width: `${simPercent}%`, height: "100%", background: simColor }} />
                          </div>
                          <span style={{ fontFamily: "monospace", fontWeight: 700, color: simColor, minWidth: 32 }}>
                            {simPercent}%
                          </span>
                        </div>
                      </td>
                      <td style={{ fontFamily: "monospace", color: "var(--fg-2)" }}>{fn.confidence.toFixed(2)}</td>
                      <td style={{ fontFamily: "monospace" }}>{fn.blocksA} / {fn.blocksB}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6, fontSize: 11, fontFamily: "monospace" }}>
                          <span style={{ color: "#34d399" }}>+{fn.addedOpcodes}</span>
                          <span style={{ color: "#f87171" }}>-{fn.removedOpcodes}</span>
                        </div>
                      </td>
                      <td>{getStatusBadge(fn.status)}</td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedFunctionId(fn.id);
                            setActiveTab("ASM_DIFF");
                          }}
                          className="btn-secondary"
                          style={{ padding: "4px 8px", fontSize: 10.5 }}
                        >
                          View Diff
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: 1-DAY PATCH SECURITY ADVISORY ================= */}
      {activeTab === "SECURITY_ADVISORY" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 16 }}>
          {/* Left: Advisory Analysis Document */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <span className="badge-critical" style={{ marginBottom: 6, display: "inline-block" }}>
                  {currentPair.securityAdvisory.severity} ADVISORY
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--fg)" }}>
                  {currentPair.securityAdvisory.vulnerabilityTitle}
                </h2>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--muted)", marginTop: 4, fontFamily: "monospace" }}>
                  {currentPair.securityAdvisory.cve && <span>CVE: {currentPair.securityAdvisory.cve}</span>}
                  <span>•</span>
                  <span>{currentPair.securityAdvisory.cwe}</span>
                  <span>•</span>
                  <span>CVSS: {currentPair.securityAdvisory.cvssScore} / 10.0</span>
                </div>
              </div>
            </div>

            {/* Root Cause & Assembly Dissection */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--primary)", textTransform: "uppercase" }}>
                1. Root Cause &amp; Assembly Divergence
              </div>
              <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, lineHeight: 1.6, color: "var(--fg-2)" }}>
                {currentPair.securityAdvisory.rootCauseDescription}
              </div>
            </div>

            {/* Patch Mechanism */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--green)", textTransform: "uppercase" }}>
                2. Patch Remediation Mechanism
              </div>
              <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, lineHeight: 1.6, color: "var(--fg-2)" }}>
                {currentPair.securityAdvisory.patchMechanism}
              </div>
            </div>

            {/* Exploitability Assessment */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--yellow)", textTransform: "uppercase" }}>
                3. Exploitability Assessment
              </div>
              <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, lineHeight: 1.6, color: "var(--fg-2)" }}>
                {currentPair.securityAdvisory.exploitabilityAssessment}
              </div>
            </div>

            {/* PoC Trigger Condition */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--red)", textTransform: "uppercase" }}>
                4. Proof-of-Concept (PoC) Trigger Condition
              </div>
              <div style={{ background: "#020408", padding: 12, borderRadius: 6, border: "1px solid var(--border)", fontFamily: "monospace", fontSize: 11, color: "#f87171", lineHeight: 1.5 }}>
                {currentPair.securityAdvisory.pocTriggerCondition}
              </div>
            </div>

            {/* Actionable Mitigations */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--fg)", textTransform: "uppercase" }}>
                5. Actionable Enterprise Mitigations
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {currentPair.securityAdvisory.mitigationGuidance.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--fg-2)" }}>
                    <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Generated YARA Rule & Export Box */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: 6 }}>
                  <ShieldCheck size={14} color="#10b981" />
                  Generated YARA Detection Rule
                </div>
                <button
                  onClick={handleCopyYara}
                  className="btn-secondary"
                  style={{ padding: "4px 8px", fontSize: 10 }}
                >
                  {copiedYara ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
                  {copiedYara ? "Copied" : "Copy"}
                </button>
              </div>

              <div style={{
                background: "#020408",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: 12,
                fontFamily: "monospace",
                fontSize: 11,
                color: "#94a3b8",
                lineHeight: 1.5,
                maxHeight: 380,
                overflowY: "auto",
                whiteSpace: "pre"
              }}>
                {currentPair.securityAdvisory.generatedYaraRule}
              </div>
            </div>

            {/* Quick Export Cards */}
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--fg)" }}>Export Patch Intelligence</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(currentPair, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${currentPair.id}_advisory.json`;
                    a.click();
                  }}
                  className="btn-secondary"
                  style={{ justifyContent: "center", fontSize: 11 }}
                >
                  <Download size={12} /> JSON Report
                </button>
                <button
                  onClick={() => {
                    const md = `# ${currentPair.securityAdvisory.vulnerabilityTitle}\n\n**Severity**: ${currentPair.securityAdvisory.severity}\n**CVSS**: ${currentPair.securityAdvisory.cvssScore}\n\n## Root Cause\n${currentPair.securityAdvisory.rootCauseDescription}\n\n## Patch Mechanism\n${currentPair.securityAdvisory.patchMechanism}\n\n## Mitigations\n${currentPair.securityAdvisory.mitigationGuidance.map(m => `- ${m}`).join("\n")}\n\n## YARA Rule\n\`\`\`yara\n${currentPair.securityAdvisory.generatedYaraRule}\n\`\`\``;
                    const blob = new Blob([md], { type: "text/markdown" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${currentPair.id}_security_advisory.md`;
                    a.click();
                  }}
                  className="btn-primary"
                  style={{ justifyContent: "center", fontSize: 11 }}
                >
                  <Download size={12} /> Markdown Doc
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
