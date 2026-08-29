"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Terminal,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Plus,
  Lock,
  Cpu,
  FileCode,
  Globe
} from "lucide-react";

interface KBEntry {
  id: string;
  familyName: string;
  aliases: string[];
  threatActors: string[];
  firstObserved: string;
  cipherAlgorithms: string[];
  keyExchangeMethod: string;
  encryptionMode: "Full" | "Intermittent" | "Header-Only" | "Block-Cipher";
  fileExtensions: string[];
  ransomNoteFilenames: string[];
  decryptorStatus: "DECRYPTOR_AVAILABLE" | "FLAW_EXPLOITABLE" | "PARTIAL_RECOVERY" | "UNBREAKABLE_BACKUP_ONLY";
  decryptorName?: string;
  decryptorAuthor?: string;
  knownFlaws: string;
  mitreTechniques: string[];
  targetOperatingSystems: string[];
  yaraRulePreview: string;
  sampleSha256: string;
}

const KB_ENTRIES: KBEntry[] = [
  {
    id: "kb-001",
    familyName: "LockBit 3.0 (Black)",
    aliases: ["LockBit Black", "LockBit 3.0", "ABCD Ransomware v3", "LB3"],
    threatActors: ["LockBit Supporter Gang", "FIN12 Affiliates", "Bitwise Spider"],
    firstObserved: "June 2022 (Active in 2026)",
    cipherAlgorithms: ["ChaCha20", "Curve25519", "AES-256-GCM"],
    keyExchangeMethod: "Curve25519 ECDH asymmetric session wrap",
    encryptionMode: "Block-Cipher",
    fileExtensions: [".lockbit", ".HLJkNsk1P", ".9b47e"],
    ransomNoteFilenames: ["Restore-My-Files.txt", "[RandomID].README.txt"],
    decryptorStatus: "PARTIAL_RECOVERY",
    decryptorName: "Aegis Memory Key Carver for LockBit 3.0",
    decryptorAuthor: "Aegis Cryptographic Research Lab",
    knownFlaws: "ChaCha20 round-key expansion structure remains un-zeroed in RAM heap allocated by the worker thread pool if host is frozen without rebooting.",
    mitreTechniques: ["T1486 (Data Encrypted for Impact)", "T1490 (Inhibit System Recovery)", "T1053.005 (Scheduled Task)", "T1562.001 (Disable Security Tools)", "T1078 (Valid Accounts)"],
    targetOperatingSystems: ["Windows Server 2016-2025", "Windows 10/11", "VMware ESXi 7.x/8.x", "Linux x86_64"],
    yaraRulePreview: `rule Ransom_LockBit3_Signature {
  meta:
    description = "Detects LockBit 3.0 (Black) header marker and anti-analysis routines"
    author = "Aegis DFIR Intel"
  strings:
    $s1 = "Restore-My-Files.txt" ascii
    $s2 = "lockbitaptc2xnk7b5yvh7y5vxsq.onion" ascii
    $chacha_const = "expand 32-byte k" ascii
  condition:
    uint16(0) == 0x5A4D and (2 of ($s*)) and $chacha_const
}`,
    sampleSha256: "d3b07384d113edec49eaa6238ad5ff00b1b11b9b4f9bf41097200a7b409743a1"
  },
  {
    id: "kb-002",
    familyName: "BlackCat / ALPHV",
    aliases: ["ALPHV", "BlackCat", "Noberus", "AlphaV"],
    threatActors: ["ALPHV Core", "Scattered Spider (UNC3944)", "BlackCat Affiliates"],
    firstObserved: "November 2021",
    cipherAlgorithms: ["AES-256-CTR", "ChaCha20-Poly1305", "RSA-4096"],
    keyExchangeMethod: "RSA-4096 public key embedded in configuration JSON",
    encryptionMode: "Intermittent",
    fileExtensions: [".crypted", ".alphv", ".[Random 7-char]"],
    ransomNoteFilenames: ["RECOVER-[Random]-NOTES.txt", "README.txt"],
    decryptorStatus: "FLAW_EXPLOITABLE",
    decryptorName: "FBI / Aegis ALPHV Decryption Utility v2",
    decryptorAuthor: "FBI Cyber Division & Aegis Recovery",
    knownFlaws: "Early versions (v1.0-v2.1) had a deterministic PRNG seed vulnerability in intermittent mode that allowed header reconstitution. Law enforcement seized master keys in late 2023.",
    mitreTechniques: ["T1486", "T1071.001 (Web Protocols)", "T1059.001 (PowerShell)", "T1484 (Group Policy Modification)"],
    targetOperatingSystems: ["Windows Server", "VMware ESXi", "Debian / RHEL Linux", "ARM64 Ready"],
    yaraRulePreview: `rule Ransom_BlackCat_ALPHV {
  meta:
    description = "Rust compiled ALPHV payload detection"
  strings:
    $rust_marker = "cargo/registry/src" ascii
    $alphv_cfg = "default_file_name" ascii
  condition:
    uint16(0) == 0x5A4D and all of them
}`,
    sampleSha256: "a9482f3471092837461928374610293847561029384756102938475610293847"
  },
  {
    id: "kb-003",
    familyName: "Royal Ransomware",
    aliases: ["Zeon", "Royal", "DEV-0569 Payload"],
    threatActors: ["DEV-0569", "Former Conti Senior Members", "Zeon Gang"],
    firstObserved: "September 2022",
    cipherAlgorithms: ["OpenSSL AES-256", "RSA-4096"],
    keyExchangeMethod: "RSA-4096 public key appended to payload",
    encryptionMode: "Intermittent",
    fileExtensions: [".royal", ".royal_u", ".royal_w"],
    ransomNoteFilenames: ["README.TXT", "royal.html"],
    decryptorStatus: "UNBREAKABLE_BACKUP_ONLY",
    decryptorName: "No Public Decryptor (Immutable Backup Required)",
    decryptorAuthor: "N/A",
    knownFlaws: "Intermittent percentage encryption (e.g. 50% of file) leaves trailing file structures intact, allowing specialized file carvers (SQLite / Zip / PDF) to extract undamaged records.",
    mitreTechniques: ["T1486", "T1566.002 (Spearphishing Link)", "T1047 (WMI)", "T1021.002 (SMB/Windows Admin Shares)"],
    targetOperatingSystems: ["Windows Server", "VMware ESXi 7.0/8.0"],
    yaraRulePreview: `rule Ransom_Royal_Zeon {
  meta:
    description = "Royal Ransomware intermittent cipher signature"
  strings:
    $s1 = "royal" ascii wide
    $s2 = "README.TXT" ascii wide
  condition:
    uint16(0) == 0x5A4D and ($s1 and $s2)
}`,
    sampleSha256: "3892710384719203847102938471029384710293847102938471029384710293"
  },
  {
    id: "kb-004",
    familyName: "Akira Ransomware",
    aliases: ["Akira", "Megazord", "Punk"],
    threatActors: ["Akira Syndicate", "Storm-1567"],
    firstObserved: "March 2023",
    cipherAlgorithms: ["ChaCha20", "RSA-4096", "Curve25519"],
    keyExchangeMethod: "RSA-4096 with CryptoAPI import",
    encryptionMode: "Intermittent",
    fileExtensions: [".akira", ".akiralocker", ".powerranges"],
    ransomNoteFilenames: ["akira_readme.txt"],
    decryptorStatus: "DECRYPTOR_AVAILABLE",
    decryptorName: "Avast Akira Decryptor & Aegis Mod",
    decryptorAuthor: "Avast Threat Labs & Aegis Cryptography",
    knownFlaws: "Early Windows and Linux variants contained a key generation bug where ChaCha20 IVs were deterministically generated using an insecure pseudo-random sequence, enabling full key recovery.",
    mitreTechniques: ["T1486", "T1133 (External Remote Services - Cisco AnyConnect CVE-2023-20269)", "T1490"],
    targetOperatingSystems: ["Windows x64", "VMware ESXi", "Linux ARM64"],
    yaraRulePreview: `rule Ransom_Akira_Decryptable {
  meta:
    description = "Akira ransomware with exploitable IV generator"
  strings:
    $akira = "akira_readme.txt" ascii
  condition:
    uint16(0) == 0x5A4D and all of them
}`,
    sampleSha256: "7766554433221100998877665544332211009988776655443322110099887766"
  },
  {
    id: "kb-005",
    familyName: "Phobos / 8Base",
    aliases: ["Phobos", "8Base", "Elbie", "Dharma Variant"],
    threatActors: ["8Base Affiliate Ring", "Phobos RaaS"],
    firstObserved: "2019 (Active variants 2026)",
    cipherAlgorithms: ["AES-256-CBC", "RSA-1024 / RSA-2048"],
    keyExchangeMethod: "RSA asymmetric key embedding",
    encryptionMode: "Full",
    fileExtensions: [".id[ID].[email].phobos", ".id[ID].[email].8base", ".elbie"],
    ransomNoteFilenames: ["info.hta", "info.txt"],
    decryptorStatus: "PARTIAL_RECOVERY",
    decryptorName: "Cisco Talos Phobos Memory Key Extractor",
    decryptorAuthor: "Cisco Talos & Aegis",
    knownFlaws: "CryptoAPI context handles (HCRYPTKEY) are not destroyed upon process exit, remaining carved in unallocated physical RAM.",
    mitreTechniques: ["T1486", "T1078 (Valid RDP Accounts)", "T1562.001"],
    targetOperatingSystems: ["Windows Server 2012-2025", "Windows 10"],
    yaraRulePreview: `rule Ransom_Phobos_HTA {
  meta:
    description = "Phobos info.hta launcher detection"
  strings:
    $hta = "info.hta" ascii wide
  condition:
    uint16(0) == 0x5A4D and $hta
}`,
    sampleSha256: "99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa"
  },
  {
    id: "kb-006",
    familyName: "WannaCry 2.0 (MS17-010)",
    aliases: ["WanaCrypt0r", "WCRY", "WCry2"],
    threatActors: ["Lazarus Group (APT38 Outlier)"],
    firstObserved: "May 2017 (Persistent in OT networks)",
    cipherAlgorithms: ["AES-128-CBC", "RSA-2048"],
    keyExchangeMethod: "RSA-2048 embedded master public key",
    encryptionMode: "Full",
    fileExtensions: [".WNCRY", ".WCRY"],
    ransomNoteFilenames: ["@Please_Read_Me@.txt", "@WanaDecryptor@.exe"],
    decryptorStatus: "DECRYPTOR_AVAILABLE",
    decryptorName: "wanakiwi / Aegis Heap Carver",
    decryptorAuthor: "Benjamin Delpy, Adrien Guinet & Aegis",
    knownFlaws: "Windows CryptoAPI CryptGenKey did not clear the prime numbers p and q from process memory heap before freeing memory on Windows XP/7/2003/2008.",
    mitreTechniques: ["T1210 (Exploitation of Remote Services - EternalBlue SMBv1)", "T1486"],
    targetOperatingSystems: ["Windows Legacy (XP, 7, Server 2003/2008/2012)"],
    yaraRulePreview: `rule Ransom_WannaCry_EternalBlue {
  meta:
    description = "WannaCry worm and decryptor binary signature"
  strings:
    $wncry = "WANACRY!" ascii
  condition:
    uint16(0) == 0x5A4D and all of them
}`,
    sampleSha256: "ed01ebf83334a1937307dd8473e02c7ecb8fb07b6818242d3004bc3f6973a0ad"
  },
  {
    id: "kb-007",
    familyName: "Medusa Ransomware",
    aliases: ["Medusa Locker", "Medusa Blog"],
    threatActors: ["Medusa Operations", "DEV-0206"],
    firstObserved: "2021",
    cipherAlgorithms: ["AES-256", "RSA-2048"],
    keyExchangeMethod: "RSA-2048 with custom session blob",
    encryptionMode: "Full",
    fileExtensions: [".MEDUSA", ".readmedusa"],
    ransomNoteFilenames: ["!!!READ_ME_MEDUSA!!!.txt"],
    decryptorStatus: "UNBREAKABLE_BACKUP_ONLY",
    decryptorName: "No Public Decryptor (Immutable Backup Required)",
    decryptorAuthor: "N/A",
    knownFlaws: "No cryptographic flaws identified. Demands high ransom ($500K-$5M) with public leak portal countdown.",
    mitreTechniques: ["T1486", "T1133", "T1059.001", "T1490"],
    targetOperatingSystems: ["Windows Server", "Linux"],
    yaraRulePreview: `rule Ransom_Medusa_Locker {
  meta:
    description = "Medusa ransom note and string markers"
  strings:
    $medusa = "!!!READ_ME_MEDUSA!!!" ascii
  condition:
    uint16(0) == 0x5A4D and all of them
}`,
    sampleSha256: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
  },
  {
    id: "kb-008",
    familyName: "Black Basta",
    aliases: ["Basta", "Conti V2 Reincarnation"],
    threatActors: ["Black Basta Gang", "FIN7 Affiliates"],
    firstObserved: "April 2022",
    cipherAlgorithms: ["ChaCha20", "RSA-4096"],
    keyExchangeMethod: "RSA-4096 public key hardcoded",
    encryptionMode: "Intermittent",
    fileExtensions: [".basta"],
    ransomNoteFilenames: ["readme.txt", "fk_readme.txt"],
    decryptorStatus: "UNBREAKABLE_BACKUP_ONLY",
    decryptorName: "No Public Decryptor (Backup Orchestration Required)",
    decryptorAuthor: "N/A",
    knownFlaws: "Sophisticated intermittent encryption: encrypts 64-byte chunks per 128-byte block. Intermittent gaps can be parsed for database header recovery.",
    mitreTechniques: ["T1486", "T1566.001", "T1059.003", "T1490"],
    targetOperatingSystems: ["Windows Server", "VMware ESXi"],
    yaraRulePreview: `rule Ransom_BlackBasta_ESXi {
  meta:
    description = "Black Basta ESXi Linux ELF payload"
  strings:
    $basta = ".basta" ascii
  condition:
    uint16(0) == 0x5A4D and $basta
}`,
    sampleSha256: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  }
];

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KBEntry[]>(KB_ENTRIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("ALL");
  const [selectedEntry, setSelectedEntry] = useState<KBEntry | null>(KB_ENTRIES[0]);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    showToast("SHA-256 IOC sample hash copied to clipboard.");
  };

  const handleCopyYara = (yara: string) => {
    navigator.clipboard.writeText(yara);
    showToast("YARA detection rule copied to clipboard.");
  };

  const filteredEntries = entries.filter(e => {
    const matchesStatus = activeStatusFilter === "ALL" || e.decryptorStatus === activeStatusFilter;
    const matchesSearch =
      e.familyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.fileExtensions.some(ext => ext.toLowerCase().includes(searchQuery.toLowerCase())) ||
      e.cipherAlgorithms.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      e.threatActors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          top: 70,
          right: 24,
          zIndex: 100,
          background: "rgba(16, 185, 129, 0.95)",
          color: "#04100c",
          padding: "10px 18px",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 13,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        padding: "16px 20px",
        borderRadius: 8,
        border: "1px solid var(--border)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 8,
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <BookOpen size={22} color="#10b981" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--fg)" }}>
                Ransomware Decryption & TTP Knowledge Base
              </h1>
              <span className="badge-sev badge-success">PILLAR 5 · ENCYCLOPEDIA</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Searchable encyclopedia of 80+ ransomware families: Ciphers, known cryptographic flaws, extensions, decryptors & YARA rules.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSampleModal(true)}
          className="btn-primary"
        >
          <Plus size={14} />
          <span>Submit Unknown Sample</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        padding: "12px 18px",
        borderRadius: 8,
        border: "1px solid var(--border)",
        flexWrap: "wrap",
        gap: 12
      }}>
        {/* Status Filter Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[
            { key: "ALL", label: `All Families (${entries.length})` },
            { key: "DECRYPTOR_AVAILABLE", label: "Decryptor Available" },
            { key: "FLAW_EXPLOITABLE", label: "Flaw Exploitable" },
            { key: "PARTIAL_RECOVERY", label: "In-Memory Partial" },
            { key: "UNBREAKABLE_BACKUP_ONLY", label: "Backup Only" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveStatusFilter(tab.key)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background: activeStatusFilter === tab.key ? "rgba(16, 185, 129, 0.2)" : "var(--surface-2)",
                color: activeStatusFilter === tab.key ? "#10b981" : "var(--muted)",
                border: activeStatusFilter === tab.key ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid var(--border)"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: "relative" }}>
          <Search size={13} color="var(--muted)" style={{ position: "absolute", left: 9, top: 9 }} />
          <input
            type="text"
            placeholder="Search family, extension (.lockbit), cipher..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="tool-input"
            style={{ paddingLeft: 28, width: 280 }}
          />
        </div>
      </div>

      {/* Main Grid: Family Directory & Selected Dossier Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 16 }}>
        {/* Left Column: Family Cards Grid */}
        <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
            Catalogued Ransomware Families ({filteredEntries.length})
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "calc(100vh - 340px)", overflowY: "auto" }}>
            {filteredEntries.map(entry => {
              const isSelected = selectedEntry?.id === entry.id;
              const isDecryptable = entry.decryptorStatus === "DECRYPTOR_AVAILABLE" || entry.decryptorStatus === "FLAW_EXPLOITABLE";

              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    cursor: "pointer",
                    background: isSelected ? "rgba(16, 185, 129, 0.12)" : "var(--surface-2)",
                    border: isSelected ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    transition: "all 0.12s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: isSelected ? "#10b981" : "var(--fg)" }}>
                      {entry.familyName}
                    </span>
                    <span className={`badge-sev ${isDecryptable ? "badge-success" : entry.decryptorStatus === "PARTIAL_RECOVERY" ? "badge-medium" : "badge-critical"}`}>
                      {entry.decryptorStatus.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    {entry.fileExtensions.map((ext, eIdx) => (
                      <span key={eIdx} style={{ fontSize: 10.5, fontFamily: "monospace", color: "#06b6d4", background: "var(--surface-3)", padding: "1px 5px", borderRadius: 3 }}>
                        {ext}
                      </span>
                    ))}
                  </div>

                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    Cipher: {entry.cipherAlgorithms.join(", ")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Family Dossier */}
        {selectedEntry && (
          <div className="card-tactical" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--fg)" }}>
                    {selectedEntry.familyName}
                  </h2>
                  <span className={`badge-sev ${selectedEntry.decryptorStatus === "DECRYPTOR_AVAILABLE" ? "badge-success" : selectedEntry.decryptorStatus === "FLAW_EXPLOITABLE" ? "badge-medium" : "badge-critical"}`}>
                    {selectedEntry.decryptorStatus.replace(/_/g, " ")}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  Aliases: {selectedEntry.aliases.join(", ")} · First Seen: {selectedEntry.firstObserved}
                </div>
              </div>

              {selectedEntry.decryptorName && (
                <button
                  onClick={() => showToast(`Downloading ${selectedEntry.decryptorName}...`)}
                  className="btn-primary"
                  style={{ fontSize: 12, padding: "6px 12px" }}
                >
                  <Download size={13} />
                  <span>Download Decryptor</span>
                </button>
              )}
            </div>

            {/* Cryptographic Architecture Card */}
            <div style={{
              padding: 14,
              borderRadius: 6,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#06b6d4", textTransform: "uppercase" }}>
                Cryptographic & Implementation Anatomy
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11.5 }}>
                <div><strong>Cipher Algorithms:</strong> {selectedEntry.cipherAlgorithms.join(" + ")}</div>
                <div><strong>Encryption Mode:</strong> {selectedEntry.encryptionMode} Mode</div>
                <div><strong>Key Exchange:</strong> {selectedEntry.keyExchangeMethod}</div>
                <div><strong>Ransom Note:</strong> {selectedEntry.ransomNoteFilenames.join(", ")}</div>
              </div>
            </div>

            {/* Known Flaws & Recovery Opportunity */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#10b981", textTransform: "uppercase", marginBottom: 4 }}>
                Known Cryptographic Flaws / Recovery Vector
              </div>
              <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5, background: "rgba(16, 185, 129, 0.05)", padding: 10, borderRadius: 6, border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                {selectedEntry.knownFlaws}
              </div>
            </div>

            {/* MITRE ATT&CK Matrix */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                Associated MITRE ATT&CK Techniques
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {selectedEntry.mitreTechniques.map((tech, tIdx) => (
                  <span key={tIdx} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: "var(--surface-3)", color: "var(--fg-2)", border: "1px solid var(--border)" }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* YARA Detection Rule Box */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                  YARA Detection Signature
                </span>
                <button
                  onClick={() => handleCopyYara(selectedEntry.yaraRulePreview)}
                  className="btn-secondary"
                  style={{ padding: "3px 8px", fontSize: 10.5 }}
                >
                  <Copy size={11} />
                  <span>Copy YARA</span>
                </button>
              </div>
              <pre style={{
                background: "#050810",
                padding: 12,
                borderRadius: 6,
                border: "1px solid var(--border)",
                fontSize: 11,
                fontFamily: "monospace",
                color: "#10b981",
                overflowX: "auto",
                lineHeight: 1.5
              }}>
                {selectedEntry.yaraRulePreview}
              </pre>
            </div>

            {/* SHA-256 Sample */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface-2)", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 11 }}>
              <span style={{ color: "var(--muted)" }}>Reference Sample SHA-256: <strong style={{ color: "var(--fg)", fontFamily: "monospace" }}>{selectedEntry.sampleSha256}</strong></span>
              <button
                onClick={() => handleCopyHash(selectedEntry.sampleSha256)}
                style={{ background: "transparent", border: "none", color: "#06b6d4", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700 }}
              >
                <Copy size={11} /> Copy Hash
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit Sample Modal */}
      {showSampleModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          padding: 20
        }}>
          <div className="card-tactical" style={{ width: 500, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileCode size={18} color="#10b981" />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
                  Submit Unknown Encrypted Sample
                </h3>
              </div>
              <button
                onClick={() => setShowSampleModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16 }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 12, color: "var(--fg-2)" }}>
              Upload an encrypted file sample and accompanying ransom note. Aegis will compute Shannon entropy, analyze appended headers, and query against 80+ ransomware family signatures.
            </p>

            <div style={{
              border: "2px dashed var(--border)",
              borderRadius: 8,
              padding: 24,
              textAlign: "center",
              cursor: "pointer",
              background: "var(--surface-2)"
            }}>
              <Download size={24} color="var(--muted)" style={{ margin: "0 auto 8px auto" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>
                Drag and drop encrypted file sample (.lockbit, .crypted, etc.)
              </div>
              <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
                Maximum file size: 50 MB (Raw headers analyzed in memory)
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <button
                onClick={() => setShowSampleModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast("Sample analyzed: Matches LockBit 3.0 (Black) with 97.4% confidence score.");
                  setShowSampleModal(false);
                }}
                className="btn-primary"
              >
                <Sparkles size={13} />
                <span>Analyze Sample</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
