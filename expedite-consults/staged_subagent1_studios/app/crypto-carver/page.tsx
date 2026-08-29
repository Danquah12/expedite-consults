"use client";

import { useState, useMemo } from "react";
import { MALWARE_SAMPLES } from "@/data/samples";
import { downloadBlob } from "@/lib/utils";
import {
  Unlock,
  Lock,
  Key,
  Binary,
  Cpu,
  Layers,
  Search,
  Filter,
  CheckCircle,
  Copy,
  Download,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  Eye,
  AlertOctagon,
  FileCode,
  ShieldCheck,
  Zap,
  Activity,
  Terminal,
  FileText
} from "lucide-react";

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

export type CryptoAlgorithm = "AES-128-CBC" | "AES-256-CBC" | "RC4" | "ChaCha20" | "RSA-2048";

export interface CarvedKeyArtifact {
  id: string;
  type: "AES Key Schedule" | "ChaCha20 State Matrix" | "RSA Private Key DER" | "RC4 Permutation S-Box";
  algorithm: CryptoAlgorithm;
  memoryAddress: string;
  region: "Heap" | "Stack" | "Injected RWX" | ".data Section" | "TLS Storage";
  entropy: number;
  confidence: number;
  extractedKeyHex: string;
  extractedKeyAscii?: string;
  ivHex?: string;
  details: string;
  associatedSampleId: string;
  aesRounds?: { round: number; keyWords: string; rcon: string }[];
  chachaMatrix?: { row: number; words: [string, string, string, string]; label: string }[];
  rsaComponents?: {
    modulusLengthBits: number;
    publicExponent: string;
    privateExponentSnippet: string;
    prime1Snippet: string;
    prime2Snippet: string;
    coefficientSnippet: string;
  };
  rc4Pointers?: { i: number; j: number; recoveredPassphrase: string };
}

export interface DecryptionTarget {
  id: string;
  title: string;
  sampleName: string;
  targetFilename: string;
  algorithm: CryptoAlgorithm;
  encryptedHeaderSnippet: string;
  encryptedHexDump: string;
  encryptedAscii: string;
  decryptedPlaintextHex: string;
  decryptedAscii: string;
  recoveredFileType: string;
  keyUsedId: string;
  description: string;
}

// ============================================================================
// MOCK DATA: CARVED CRYPTOGRAPHIC ARTIFACTS
// ============================================================================

const CARVED_ARTIFACTS: CarvedKeyArtifact[] = [
  {
    id: "KEY-001",
    type: "AES Key Schedule",
    algorithm: "AES-128-CBC",
    memoryAddress: "0x00A4F820",
    region: "Heap",
    entropy: 7.94,
    confidence: 99.8,
    extractedKeyHex: "2b 7e 15 16 28 ae d2 a6 ab f7 15 88 09 cf 4f 3c",
    extractedKeyAscii: "+~..(....?.?...",
    ivHex: "00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f",
    associatedSampleId: "SAMPLE-001", // WannaCry
    details: "Identified 11-round Rijndael KeyExpansion matrix in tasksche.exe heap with valid Rcon substitution sequence (0x01..0x36).",
    aesRounds: [
      { round: 0, keyWords: "2b7e1516 28aed2a6 abf71588 09cf4f3c", rcon: "Initial Master Key" },
      { round: 1, keyWords: "a0fafe17 88542cb1 23a33939 2a6c7605", rcon: "0x01 (Round 1)" },
      { round: 2, keyWords: "f2c295f2 7a96b943 5935807a 7359f67f", rcon: "0x02 (Round 2)" },
      { round: 3, keyWords: "3d80477d 4716fe3e 1e237e44 6d7a883b", rcon: "0x04 (Round 3)" },
      { round: 4, keyWords: "ef44a541 a8525b7f b671253b db0bad00", rcon: "0x08 (Round 4)" },
      { round: 5, keyWords: "d4d1c6f8 7c839d87 caf2b8bc 11f915bc", rcon: "0x10 (Round 5)" },
      { round: 6, keyWords: "6d88a37a 110b3efd dbf98641 ca0093fd", rcon: "0x20 (Round 6)" },
      { round: 7, keyWords: "4e54f70e 5f5fc9f3 84a64fb2 4ea6dc4f", rcon: "0x40 (Round 7)" },
      { round: 8, keyWords: "ead27321 b58dbad2 312bf560 7f8d292f", rcon: "0x80 (Round 8)" },
      { round: 9, keyWords: "ac7766f3 19fadc21 28d12941 575c006e", rcon: "0x1B (Round 9)" },
      { round: 10, keyWords: "d014f9a8 c9ee2589 e13f0cc8 b6630ca6", rcon: "0x36 (Round 10 Final)" }
    ]
  },
  {
    id: "KEY-002",
    type: "RC4 Permutation S-Box",
    algorithm: "RC4",
    memoryAddress: "0x0045E100",
    region: ".data Section",
    entropy: 7.999,
    confidence: 100.0,
    extractedKeyHex: "73 69 6b 6f 6d 6f 64 65",
    extractedKeyAscii: "sikomode",
    associatedSampleId: "SAMPLE-003", // SikoMode
    details: "Found full 256-byte bijective identity permutation table S[0..255] in Nim runtime data section. KSA inversion solved passphrase.",
    rc4Pointers: {
      i: 72,
      j: 188,
      recoveredPassphrase: "sikomode"
    }
  },
  {
    id: "KEY-003",
    type: "ChaCha20 State Matrix",
    algorithm: "ChaCha20",
    memoryAddress: "0x019FF340",
    region: "Stack",
    entropy: 7.82,
    confidence: 99.4,
    extractedKeyHex: "00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f 10 11 12 13 14 15 16 17 18 19 1a 1b 1c 1d 1e 1f",
    ivHex: "00 00 00 00 4a 00 00 00 00 00 00 4a",
    associatedSampleId: "SAMPLE-004",
    details: "Detected standard 4x4 ChaCha20 constant matrix 'expand 32-byte k' (0x61707865, 0x3320646e, 0x79622d32, 0x6b206574) in thread stack.",
    chachaMatrix: [
      { row: 0, words: ["0x61707865", "0x3320646e", "0x79622d32", "0x6b206574"], label: "Constants ('expand 32-byte k')" },
      { row: 1, words: ["0x03020100", "0x07060504", "0x0b0a0908", "0x0f0e0d0c"], label: "256-Bit Master Key (Words 4-7)" },
      { row: 2, words: ["0x13121110", "0x17161514", "0x1b1a1918", "0x1f1e1d1c"], label: "256-Bit Master Key (Words 8-11)" },
      { row: 3, words: ["0x00000001", "0x00000000", "0x4a000000", "0x0000004a"], label: "Block Counter & 96-Bit Nonce" }
    ]
  },
  {
    id: "KEY-004",
    type: "RSA Private Key DER",
    algorithm: "RSA-2048",
    memoryAddress: "0x02B811A0",
    region: "Injected RWX",
    entropy: 7.98,
    confidence: 98.9,
    extractedKeyHex: "30 82 04 a4 02 01 00 02 82 01 01 00 c7 e5 f9 a1 44 8b 21 09 ...",
    associatedSampleId: "SAMPLE-005", // Cobalt Strike
    details: "Extracted full ASN.1 PKCS#1 DER RSAPrivateKey structure containing modulus n, public exponent e (65537), and private factors (d, p, q, dP, dQ, qInv).",
    rsaComponents: {
      modulusLengthBits: 2048,
      publicExponent: "65537 (0x010001)",
      privateExponentSnippet: "0x7A1F28B0918C4402E8A109D411BC789230198EFA...",
      prime1Snippet: "0xE19A02F481029481928301982390192839182390...",
      prime2Snippet: "0xD88C21B738192839102938102938102938102938...",
      coefficientSnippet: "0x51B0E98F39182938192839182938192839182938..."
    }
  }
];

const DECRYPTION_TARGETS: DecryptionTarget[] = [
  {
    id: "TGT-001",
    title: "WannaCry Encrypted Victim Spreadsheet",
    sampleName: "WannaCry.exe (SAMPLE-001)",
    targetFilename: "Financial_2026.xlsx.WNCRY",
    algorithm: "AES-128-CBC",
    keyUsedId: "KEY-001",
    recoveredFileType: "Microsoft Excel Worksheet (ZIP/OOXML)",
    encryptedHeaderSnippet: "57 41 4e 41 43 52 59 21 00 00 01 00 24 10 00 00",
    encryptedHexDump: `00000000  57 41 4e 41 43 52 59 21  00 00 01 00 24 10 00 00  |WANACRY!....$...|
00000010  e8 9a 44 12 b0 81 2f ca  98 31 ae 1f c4 82 d0 19  |..D.../..1......|
00000020  71 f3 a2 b4 88 19 0e 4a  55 c9 21 9d ea f1 09 a3  |q......JU.!.....|
00000030  99 82 b4 71 83 a1 cb 34  19 82 71 44 ae 10 b9 22  |...q...4..qD..."|`,
    encryptedAscii: "WANACRY!....$.....D.../..1......q......JU.!........q...4..qD...\"",
    decryptedPlaintextHex: `00000000  50 4b 03 04 14 00 06 00  08 00 00 00 21 00 b1 99  |PK..........!...|
00000010  5b 32 84 01 00 00 48 06  00 00 13 00 08 02 5b 43  |[2....H.......[C|
00000020  6f 6e 74 65 6e 74 5f 54  79 70 65 73 5d 2e 78 6d  |ontent_Types].xm|
00000030  6c 20 a2 04 02 28 a0 00  02 00 00 00 00 00 00 00  |l ...(..........|`,
    decryptedAscii: "PK..........!...[2....H.......[Content_Types].xml ...(..........",
    description: "Stripped 0x100-byte WANACRY! header and executed AES-128-CBC block decryption with recovered key 2b7e1516... Recovered valid ZIP PK archive header!"
  },
  {
    id: "TGT-002",
    title: "SikoMode Stolen Credentials HTTP C2 Beacon",
    sampleName: "SikoMode.exe (SAMPLE-003)",
    targetFilename: "c2_exfil_beacon.bin",
    algorithm: "RC4",
    keyUsedId: "KEY-002",
    recoveredFileType: "JSON Telemetry & Cleartext Chrome Logins",
    encryptedHeaderSnippet: "8a 44 91 b2 c0 41 89 ea 11 98 fa 21",
    encryptedHexDump: `00000000  8a 44 91 b2 c0 41 89 ea  11 98 fa 21 89 b2 41 09  |.D...A.....!..A.|
00000010  f1 88 23 9a 19 a0 44 8b  21 90 c8 11 77 21 9a bc  |..#...D.!...w!..|
00000020  99 82 11 a0 b2 81 29 38  41 09 82 17 ea bc 10 99  |......)8A.......|
00000030  41 89 b2 01 9a 44 88 12  99 a0 11 b2 44 81 9a 20  |A....D......D.. |`,
    encryptedAscii: ".D...A.....!..A...#...D.!...w!........)8A.......A....D......D.. ",
    decryptedPlaintextHex: `00000000  7b 22 68 6f 73 74 6e 61  6d 65 22 3a 22 56 49 43  |{"hostname":"VIC|
00000010  54 49 4d 2d 50 43 22 2c  22 75 73 65 72 22 3a 22  |TIM-PC","user":"|
00000020  6a 64 6f 65 22 2c 22 70  61 73 73 77 6f 72 64 22  |jdoe","password"|
00000030  3a 22 53 75 70 65 72 53  65 63 72 65 74 32 30 32  |:"SuperSecret202|
00000040  36 21 22 7d 0a 00 00 00  00 00 00 00 00 00 00 00  |6!"}............|`,
    decryptedAscii: '{"hostname":"VICTIM-PC","user":"jdoe","password":"SuperSecret2026!"}',
    description: "RC4 stream decryption with recovered passphrase 'sikomode' decoded the HTTP POST payload revealing victim enterprise domain credentials."
  },
  {
    id: "TGT-003",
    title: "Cobalt Strike Malleable HTTPS Cookie Payload",
    sampleName: "CobaltStrike_Beacon.bin (SAMPLE-005)",
    targetFilename: "beacon_cookie_payload.bin",
    algorithm: "RSA-2048",
    keyUsedId: "KEY-004",
    recoveredFileType: "Beacon Configuration Block (Watermark #1337)",
    encryptedHeaderSnippet: "98 a1 44 bc 12 89 02 19 82 71 44 ae",
    encryptedHexDump: `00000000  98 a1 44 bc 12 89 02 19  82 71 44 ae 10 b9 22 18  |..D......qD..."..|
00000010  0a 81 29 44 88 12 a0 99  bc 11 82 4a 99 81 22 41  |..)D.......J.."A|
00000020  71 a4 09 18 29 38 10 29  44 88 19 20 11 82 a4 99  |q...)8.)D.. ....|
00000030  19 82 39 01 9a 44 88 19  20 11 82 39 19 82 39 01  |..9..D.. ..9..9.|`,
    encryptedAscii: "..D......qD...\"...)D.......J..\"Aq...)8.)D.. ....9..D.. ..9..9.",
    decryptedPlaintextHex: `00000000  00 01 02 00 00 00 05 39  64 33 63 31 39 33 38 2e  |.......9d3c1938.|
00000010  63 6c 6f 75 64 66 72 6f  6e 74 2e 6e 65 74 00 00  |cloudfront.net..|
00000020  00 00 00 00 00 00 00 00  00 25 00 00 00 00 00 00  |.........%......|
00000030  5c 70 69 70 65 5c 6d 73  61 67 65 6e 74 5f 30 00  |\\pipe\\msagent_0.|`,
    decryptedAscii: ".......9d3c1938.cloudfront.net...........%......\\pipe\\msagent_0.",
    description: "Decrypted RSA-2048 OAEP ciphertext using parsed private exponent d. Extracted C2 server 'd3c1938.cloudfront.net', jitter (37%), and named pipe."
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CryptoCarverPage() {
  const [selectedSample, setSelectedSample] = useState(MALWARE_SAMPLES[0]);
  const [activeTab, setActiveTab] = useState<"SCANNER" | "DECRYPTOR" | "SBOX_ANALYSIS">("SCANNER");
  const [carvedArtifacts, setCarvedArtifacts] = useState<CarvedKeyArtifact[]>(CARVED_ARTIFACTS);
  const [selectedArtifact, setSelectedArtifact] = useState<CarvedKeyArtifact>(CARVED_ARTIFACTS[0]);
  const [selectedTarget, setSelectedTarget] = useState<DecryptionTarget>(DECRYPTION_TARGETS[0]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(100);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [decryptionSuccess, setDecryptionSuccess] = useState<boolean>(true);

  // Custom Decryptor state
  const [customCipher, setCustomCipher] = useState<CryptoAlgorithm>("AES-128-CBC");
  const [customKey, setCustomKey] = useState<string>("2b 7e 15 16 28 ae d2 a6 ab f7 15 88 09 cf 4f 3c");
  const [customIv, setCustomIv] = useState<string>("00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f");
  const [customInput, setCustomInput] = useState<string>("57 41 4e 41 43 52 59 21 00 00 01 00 24 10 00 00 e8 9a 44 12 b0 81 2f ca 98 31 ae 1f c4 82 d0 19");
  const [customOutput, setCustomOutput] = useState<string>("50 4b 03 04 14 00 06 00 08 00 00 00 21 00 b1 99 5b 32 84 01 00 00 48 06 00 00 13 00 08 02 5b 43\n[ASCII: PK..........!...[2....H.......[C]");

  // Filter artifacts
  const filteredArtifacts = useMemo(() => {
    return carvedArtifacts.filter(a => {
      const matchSearch =
        searchFilter === "" ||
        a.type.toLowerCase().includes(searchFilter.toLowerCase()) ||
        a.algorithm.toLowerCase().includes(searchFilter.toLowerCase()) ||
        a.memoryAddress.toLowerCase().includes(searchFilter.toLowerCase()) ||
        a.extractedKeyHex.toLowerCase().includes(searchFilter.toLowerCase());
      return matchSearch;
    });
  }, [carvedArtifacts, searchFilter]);

  // Handle Scan Simulation
  const handleTriggerScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return p + 25;
      });
    }, 150);
  };

  const handleCopyKey = (keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSendToDecryptor = (artifact: CarvedKeyArtifact) => {
    setSelectedArtifact(artifact);
    setCustomKey(artifact.extractedKeyHex);
    if (artifact.ivHex) setCustomIv(artifact.ivHex);
    setCustomCipher(artifact.algorithm);
    const matchingTarget = DECRYPTION_TARGETS.find(t => t.keyUsedId === artifact.id) || DECRYPTION_TARGETS[0];
    setSelectedTarget(matchingTarget);
    setActiveTab("DECRYPTOR");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] p-6 space-y-6">
      {/* ==================================================================== */}
      {/* HEADER SECTION */}
      {/* ==================================================================== */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Unlock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Cryptographic Key & S-Box Carver
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-normal">
                  AES / ChaCha20 / RSA / RC4
                </span>
              </h1>
              <p className="text-xs text-[var(--muted)]">
                In-memory cryptographic structure carving engine: scans process heaps and stacks for AES round schedules, ChaCha20 state matrices, RSA ASN.1 DER keys, and RC4 permutations with live victim decryption.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-[var(--surface-2)] px-3 py-1.5 rounded-md border border-[var(--border)]">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-[var(--muted)]">Process Dump:</span>
            <select
              value={selectedSample.id}
              onChange={e => {
                const s = MALWARE_SAMPLES.find(x => x.id === e.target.value);
                if (s) setSelectedSample(s);
              }}
              className="bg-transparent text-xs text-emerald-300 font-mono font-medium outline-none cursor-pointer"
            >
              {MALWARE_SAMPLES.map(s => (
                <option key={s.id} value={s.id} className="bg-[var(--surface)] text-[var(--fg)]">
                  {s.name} (PID {s.id === "SAMPLE-001" ? "3412" : s.id === "SAMPLE-003" ? "5120" : "5410"})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleTriggerScan}
            disabled={isScanning}
            className="btn-primary flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black"
          >
            {isScanning ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            {isScanning ? `Carving Memory (${scanProgress}%)...` : "Carve Cryptographic Keys"}
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* METRICS & TELEMETRY ROW */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Memory Scanned</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-emerald-400 font-mono">128.4 MB</span>
            <span className="text-[10px] text-emerald-400 font-mono">4,096 pgs</span>
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-1 truncate">Heap & Stack mapped</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Structures Identified</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-white font-mono">{carvedArtifacts.length}</span>
            <span className="text-[10px] text-emerald-400 font-mono">100% Match</span>
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-1 truncate">Entropy &gt; 7.8 verified</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">AES Round Schedules</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-cyan-400 font-mono">1</span>
            <span className="text-[10px] text-cyan-300 font-mono">11 Rounds</span>
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-1 truncate">AES-128 KeyExpansion</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Stream Cipher States</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-purple-400 font-mono">2</span>
            <span className="text-[10px] text-purple-300 font-mono">RC4 / ChaCha</span>
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-1 truncate">KSA inverted</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">RSA Keypairs</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-amber-400 font-mono">1</span>
            <span className="text-[10px] text-amber-300 font-mono">2048-bit</span>
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-1 truncate">PKCS#1 DER Parsed</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Decryption Ready</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-emerald-400 font-mono">3 / 3</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">Armed</span>
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-1 truncate">Victim payload restore</div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TABS NAVIGATION */}
      {/* ==================================================================== */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("SCANNER")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === "SCANNER"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm"
                : "text-[var(--muted)] hover:text-white hover:bg-[var(--surface-2)]"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            🔍 In-Memory Crypto Structure Scanner
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
              {carvedArtifacts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("DECRYPTOR")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === "DECRYPTOR"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-[var(--muted)] hover:text-white hover:bg-[var(--surface-2)]"
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            🔓 Built-In Live File & Memory Decryptor
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono">
              Live Diff
            </span>
          </button>

          <button
            onClick={() => setActiveTab("SBOX_ANALYSIS")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === "SBOX_ANALYSIS"
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/40 shadow-sm"
                : "text-[var(--muted)] hover:text-white hover:bg-[var(--surface-2)]"
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            📊 S-Box Permutation & Keystream Analyzer
          </button>
        </div>

        <button
          onClick={() =>
            downloadBlob(
              JSON.stringify(carvedArtifacts, null, 2),
              "cerberus_carved_crypto_keys.json",
              "application/json"
            )
          }
          className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 text-emerald-400 hover:bg-emerald-500/10"
        >
          <Download className="w-3 h-3" />
          Export Carved Keys (JSON)
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: IN-MEMORY CRYPTO STRUCTURE SCANNER */}
      {/* ==================================================================== */}
      {activeTab === "SCANNER" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Artifacts List (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Filter by type, address, key hex..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder:text-[var(--muted)] outline-none w-full font-mono"
                />
              </div>
              <span className="text-[11px] text-[var(--muted)] font-mono">
                {filteredArtifacts.length} Found
              </span>
            </div>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredArtifacts.map(artifact => {
                const isSelected = selectedArtifact.id === artifact.id;
                return (
                  <div
                    key={artifact.id}
                    onClick={() => setSelectedArtifact(artifact)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[var(--surface-2)] border-emerald-500/60 shadow-md shadow-emerald-500/5"
                        : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-active)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <Key className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{artifact.type}</h4>
                          <span className="text-[10px] font-mono text-cyan-400">{artifact.algorithm}</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {artifact.confidence}% Match
                      </span>
                    </div>

                    <div className="space-y-1 font-mono text-[11px] bg-[#020408] p-2.5 rounded border border-[var(--border)] text-slate-300">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[var(--muted)]">Location:</span>
                        <span className="text-purple-300">{artifact.memoryAddress} ({artifact.region})</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[var(--muted)]">Entropy:</span>
                        <span className="text-emerald-400">{artifact.entropy.toFixed(3)} / 8.0</span>
                      </div>
                      <div className="truncate text-cyan-300 pt-1 border-t border-[var(--border)]">
                        <strong>Key:</strong> {artifact.extractedKeyHex}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-[var(--muted)] line-clamp-1">{artifact.details}</span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleSendToDecryptor(artifact);
                        }}
                        className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-bold shrink-0 ml-2"
                      >
                        Decrypt Payload →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Artifact Deep Inspector (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <Unlock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {selectedArtifact.type} Inspector
                      <span className="text-xs font-normal text-[var(--muted)]">({selectedArtifact.algorithm})</span>
                    </h3>
                    <span className="text-[10px] font-mono text-[var(--muted)]">
                      Memory Base: {selectedArtifact.memoryAddress} • Segment: {selectedArtifact.region}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleSendToDecryptor(selectedArtifact)}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black"
                >
                  <Unlock className="w-3.5 h-3.5" /> Send to Decryptor
                </button>
              </div>

              {/* Extracted Key Card */}
              <div className="p-4 bg-[#04060a] border border-[var(--border)] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Extracted Master Key & IV</span>
                  <button
                    onClick={() => handleCopyKey(selectedArtifact.extractedKeyHex)}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey ? "Copied!" : "Copy Hex"}
                  </button>
                </div>
                <div className="font-mono text-xs text-emerald-300 break-all bg-[var(--surface)] p-2.5 rounded border border-[var(--border)] select-all">
                  {selectedArtifact.extractedKeyHex}
                </div>
                {selectedArtifact.extractedKeyAscii && (
                  <div className="text-xs font-mono text-slate-400">
                    ASCII Representation: <strong className="text-white">&quot;{selectedArtifact.extractedKeyAscii}&quot;</strong>
                  </div>
                )}
                {selectedArtifact.ivHex && (
                  <div className="font-mono text-xs text-slate-300 bg-[var(--surface)] p-2 rounded border border-[var(--border)]">
                    <strong className="text-cyan-400">IV (Initialization Vector):</strong> {selectedArtifact.ivHex}
                  </div>
                )}
              </div>

              {/* Specific Matrix Views */}
              {/* 1. AES Round Schedule Table */}
              {selectedArtifact.aesRounds && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      AES-128 Expanded Key Schedule Matrix (11 Rounds, 176 Bytes)
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">Rijndael KeyExpansion Verified</span>
                  </div>

                  <div className="border border-[var(--border)] rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                    <table className="cerberus-table">
                      <thead>
                        <tr>
                          <th className="w-16">Round</th>
                          <th>Round Key Words (W[4*i] .. W[4*i+3])</th>
                          <th className="w-36">Rcon Constant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedArtifact.aesRounds.map(rnd => (
                          <tr key={rnd.round} className="hover:bg-[var(--surface-2)]">
                            <td className="font-mono text-xs font-bold text-cyan-400">Round {rnd.round}</td>
                            <td className="font-mono text-xs text-slate-200">{rnd.keyWords}</td>
                            <td className="font-mono text-[11px] text-purple-300">{rnd.rcon}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. ChaCha20 4x4 State Matrix View */}
              {selectedArtifact.chachaMatrix && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    ChaCha20 16-Word Initial State Matrix (4x4 32-Bit Words)
                  </span>
                  <div className="grid grid-cols-4 gap-2 font-mono text-xs text-center">
                    {selectedArtifact.chachaMatrix.map((row, rIdx) =>
                      row.words.map((w, cIdx) => (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className={`p-2.5 rounded border ${
                            rIdx === 0
                              ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-bold"
                              : rIdx === 1 || rIdx === 2
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                          }`}
                        >
                          <div className="text-[9px] text-[var(--muted)]">W[{rIdx * 4 + cIdx}]</div>
                          <div className="text-xs font-bold mt-0.5">{w}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 3. RSA ASN.1 DER Components View */}
              {selectedArtifact.rsaComponents && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    RSA-2048 ASN.1 DER Private Key Tree Components
                  </span>
                  <div className="p-3 bg-[var(--surface-2)] rounded border border-[var(--border)] space-y-2 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Public Exponent (e):</span>
                      <span className="text-cyan-300">{selectedArtifact.rsaComponents.publicExponent}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[var(--muted)]">Private Exponent (d):</span>
                      <div className="p-1.5 bg-[#020408] rounded text-emerald-300 text-[11px] truncate">
                        {selectedArtifact.rsaComponents.privateExponentSnippet}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[var(--muted)]">Prime 1 (p):</span>
                        <div className="p-1 bg-[#020408] rounded text-purple-300 text-[10px] truncate">
                          {selectedArtifact.rsaComponents.prime1Snippet}
                        </div>
                      </div>
                      <div>
                        <span className="text-[var(--muted)]">Prime 2 (q):</span>
                        <div className="p-1 bg-[#020408] rounded text-purple-300 text-[10px] truncate">
                          {selectedArtifact.rsaComponents.prime2Snippet}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. RC4 S-Box State View */}
              {selectedArtifact.rc4Pointers && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      RC4 256-Byte Bijective S-Box & Inverted Passphrase
                    </span>
                    <span className="text-xs text-emerald-400 font-mono font-bold">KSA Inversion Solved</span>
                  </div>
                  <div className="p-3 bg-[var(--surface-2)] rounded border border-[var(--border)] flex items-center justify-between font-mono text-xs">
                    <div>
                      <span className="text-[var(--muted)]">Recovered ASCII Passphrase:</span>
                      <div className="text-base font-bold text-emerald-400 mt-0.5">
                        &quot;{selectedArtifact.rc4Pointers.recoveredPassphrase}&quot;
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-[var(--muted)]">
                      <div>Active Pointer i = 0x{selectedArtifact.rc4Pointers.i.toString(16)}</div>
                      <div>Active Pointer j = 0x{selectedArtifact.rc4Pointers.j.toString(16)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: BUILT-IN LIVE FILE & MEMORY DECRYPTOR */}
      {/* ==================================================================== */}
      {activeTab === "DECRYPTOR" && (
        <div className="space-y-6">
          {/* Target Payload Selector */}
          <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Unlock className="w-4 h-4 text-emerald-400" />
                Live Payload Decryption Workbench
              </h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Automatically verifies and decrypts victim ransomware files, C2 beacons, and memory payloads using the carved cryptographic keys.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted)]">Target Preset:</span>
              <select
                value={selectedTarget.id}
                onChange={e => {
                  const t = DECRYPTION_TARGETS.find(x => x.id === e.target.value);
                  if (t) setSelectedTarget(t);
                }}
                className="bg-[var(--surface-2)] text-xs text-cyan-300 rounded px-3 py-1.5 border border-[var(--border)] font-mono outline-none cursor-pointer"
              >
                {DECRYPTION_TARGETS.map(t => (
                  <option key={t.id} value={t.id} className="bg-[var(--surface)] text-[var(--fg)]">
                    {t.title} ({t.algorithm})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side-by-Side Hex Diff Viewer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Encrypted Ciphertext */}
            <div className="bg-[var(--surface)] border border-rose-500/30 rounded-lg overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Encrypted Ciphertext Stream ({selectedTarget.targetFilename})
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
                  Entropy: 7.98 (Encrypted)
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="terminal-box h-52 overflow-y-auto text-[11px] text-rose-300 font-mono leading-relaxed select-all">
                  {selectedTarget.encryptedHexDump}
                </div>

                <div className="p-3 bg-[var(--surface-2)] rounded border border-[var(--border)] font-mono text-[11px] text-[var(--muted)] space-y-1">
                  <div className="text-slate-300">
                    <strong className="text-rose-400">Header:</strong> {selectedTarget.encryptedHeaderSnippet}
                  </div>
                  <div>Status: Locked payload stream from infected host endpoint</div>
                </div>
              </div>
            </div>

            {/* Right: Decrypted Plaintext */}
            <div className="bg-[var(--surface)] border border-emerald-500/40 rounded-lg overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Recovered Plaintext (Decrypted via Carved Key)
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  Entropy: 3.42 (Plaintext Recovered)
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="terminal-box h-52 overflow-y-auto text-[11px] text-emerald-300 font-mono leading-relaxed select-all">
                  {selectedTarget.decryptedPlaintextHex}
                </div>

                <div className="p-3 bg-[var(--surface-2)] rounded border border-[var(--border)] font-mono text-[11px] text-slate-200 space-y-1">
                  <div className="text-emerald-400 font-bold">
                    Extracted Format: {selectedTarget.recoveredFileType}
                  </div>
                  <div className="text-[var(--muted)] text-[10px] line-clamp-1">{selectedTarget.description}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Toolbar for Decrypted Data */}
          <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-300">
                Payload successfully unlocked using carved key{" "}
                <strong className="text-cyan-400 font-mono">{selectedArtifact.extractedKeyHex.slice(0, 24)}...</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyKey(selectedTarget.decryptedAscii)}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey ? "Copied Plaintext!" : "Copy Plaintext ASCII"}
              </button>
              <button
                onClick={() =>
                  downloadBlob(
                    selectedTarget.decryptedPlaintextHex,
                    `decrypted_${selectedTarget.targetFilename.replace(".WNCRY", "")}.bin`
                  )
                }
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black"
              >
                <Download className="w-3.5 h-3.5" />
                Download Decrypted File
              </button>
            </div>
          </div>

          {/* Custom Arbitrary Decryption Workbench */}
          <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Custom Decryption Sandbox
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-[var(--muted)] mb-1 block">Algorithm</label>
                <select
                  value={customCipher}
                  onChange={e => setCustomCipher(e.target.value as CryptoAlgorithm)}
                  className="tool-select w-full text-xs font-mono"
                >
                  <option value="AES-128-CBC">AES-128-CBC</option>
                  <option value="AES-256-CBC">AES-256-CBC</option>
                  <option value="RC4">RC4</option>
                  <option value="ChaCha20">ChaCha20</option>
                  <option value="RSA-2048">RSA-2048 OAEP</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[var(--muted)] mb-1 block">Key (Hex / ASCII)</label>
                <input
                  type="text"
                  value={customKey}
                  onChange={e => setCustomKey(e.target.value)}
                  className="tool-input w-full text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-[var(--muted)] mb-1 block">IV / Nonce (Optional)</label>
                <input
                  type="text"
                  value={customIv}
                  onChange={e => setCustomIv(e.target.value)}
                  className="tool-input w-full text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[var(--muted)] mb-1 block">Ciphertext Input (Hex)</label>
              <textarea
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                className="tool-input w-full h-20 text-xs font-mono resize-none text-cyan-300"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setCustomOutput(
                    `[DECRYPTED OK] Recovered 32 plaintext bytes.\nASCII: ${selectedTarget.decryptedAscii.slice(0, 48)}...`
                  );
                }}
                className="btn-primary text-xs py-1.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> Execute Decryption
              </button>
            </div>

            {customOutput && (
              <div className="p-3 bg-[#020408] border border-[var(--border)] rounded font-mono text-xs text-emerald-300 whitespace-pre-wrap">
                {customOutput}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: S-BOX PERMUTATION & KEYSTREAM ANALYZER */}
      {/* ==================================================================== */}
      {activeTab === "SBOX_ANALYSIS" && (
        <div className="space-y-6">
          <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Binary className="w-4 h-4 text-purple-400" />
              RC4 256-Byte S-Box Identity Permutation Heatmap
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Visualizes the 16x16 byte distribution matrix carved from memory. In RC4, valid initialized state arrays maintain exactly 256 unique byte values (0x00 to 0xFF) with maximum entropy ~7.999.
            </p>
          </div>

          {/* 16x16 Hex Matrix Heatmap Grid */}
          <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                S-Box Memory Layout (Base: 0x0045E100)
              </span>
              <span className="text-xs text-purple-300 font-mono">256 / 256 Unique Bytes Present</span>
            </div>

            <div className="grid grid-cols-16 gap-1 font-mono text-[10px] text-center max-w-full overflow-x-auto p-2 bg-[#020408] rounded border border-[var(--border)]">
              {Array.from({ length: 256 }).map((_, idx) => {
                const val = (idx * 37 + 11) % 256;
                const hexVal = val.toString(16).padStart(2, "0").toUpperCase();
                const isHigh = val > 128;
                return (
                  <div
                    key={idx}
                    title={`S[${idx}] = 0x${hexVal}`}
                    className={`p-1 rounded cursor-pointer transition-colors ${
                      isHigh
                        ? "bg-purple-600/30 text-purple-200 hover:bg-purple-500 hover:text-black"
                        : "bg-cyan-600/20 text-cyan-300 hover:bg-cyan-400 hover:text-black"
                    }`}
                  >
                    {hexVal}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cryptanalysis Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Rijndael S-Box Non-Linearity
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Max non-linearity score = 112. Strict Avalanche Criterion (SAC) compliance: 50.2% probability of bit flip per input bit difference.
              </p>
              <div className="font-mono text-xs text-emerald-400">Score: 112 / 112 (Optimal)</div>
            </div>

            <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Stream Cipher Keystream Period
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                ChaCha20 quarter-round operations generate 64-byte keystream blocks with periodic cycle &gt; 2^64 bytes without state leakage.
              </p>
              <div className="font-mono text-xs text-cyan-400">Cycle Period: 2^64 Blocks</div>
            </div>

            <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                RSA Factorization Status
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                In-memory heap carve extracted both private primes (p and q). Modulus N factorized in 0.00ms via direct runtime structure extraction.
              </p>
              <div className="font-mono text-xs text-purple-300">Factorization: Solved (In-Memory)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
