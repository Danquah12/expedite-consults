"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Send,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Binary,
  Key,
  HardDrive,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  Lock,
  Layers,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Code,
  Terminal,
  Cpu,
  AlertTriangle,
  FileCode,
  Fingerprint,
  Info,
  X
} from "lucide-react";
import { MOCK_CASES, MOCK_FILE_PATTERNS, MOCK_RANSOM_NOTES, MOCK_BACKUP_SOURCES } from "@/data/recoveryData";

interface CitationItem {
  id: string;
  title: string;
  category: "HASH" | "EVENT_LOG" | "PCAP" | "MERKLE_PROOF" | "MEMORY_DUMP";
  hashOrOffset: string;
  timestamp: string;
  system: string;
  rawDetails: string;
}

interface CopilotMessage {
  id: string;
  sender: "USER" | "ASSISTANT";
  timestamp: string;
  content: string;
  reasoningSteps?: string[];
  suggestedActions?: { label: string; actionType: string; payload?: string }[];
  citations?: CitationItem[];
}

const INITIAL_CITATIONS: Record<string, CitationItem> = {
  "cite-hash-1": {
    id: "cite-hash-1",
    title: "LockBit 3.0 Encryptor Payload Binary",
    category: "HASH",
    hashOrOffset: "SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    timestamp: "2026-08-23T06:14:12Z",
    system: "HYPERV-CLUSTER-01 (C:\\Windows\\Temp\\msupdate.exe)",
    rawDetails: "MD5: 8f4a12903b41e88e4dc39281a8b41190\nEntropy: 7.994 (High Packing / VMProtect 3.8)\nCompiler: MSVC 2022 v14.34\nImport Hashes: 91b0f512781cbfa1"
  },
  "cite-log-1": {
    id: "cite-log-1",
    title: "Security Event Log 4624 (Type 10 Remote Desktop Logon)",
    category: "EVENT_LOG",
    hashOrOffset: "Event Record ID: #8914022 | DC01.mercy.local",
    timestamp: "2026-08-23T05:45:00Z",
    system: "DC01.mercy.local (10.14.2.10)",
    rawDetails: "Account Name: svc_backup_mgmt\nLogon Type: 10 (RemoteInteractive)\nSource IP: 10.14.9.88 (CONTRACTOR-VDI-02)\nAuthentication Package: Kerberos\nPrivilege Tier: SeDebugPrivilege, SeBackupPrivilege"
  },
  "cite-log-2": {
    id: "cite-log-2",
    title: "Security Event Log 1102 (The Audit Log Was Cleared)",
    category: "EVENT_LOG",
    hashOrOffset: "Event Record ID: #8914105 | DC01.mercy.local",
    timestamp: "2026-08-23T06:05:30Z",
    system: "DC01.mercy.local",
    rawDetails: "Caller User Name: svc_backup_mgmt\nProcess: wevtutil.exe cl Security\nShadow Copy Action: vssadmin delete shadows /all /quiet\nStatus: Tamper Detected by Aegis Agent"
  },
  "cite-merkle-1": {
    id: "cite-merkle-1",
    title: "Cryptographic Merkle Proof Root (FRE 901 Seal)",
    category: "MERKLE_PROOF",
    hashOrOffset: "Merkle Root: 0x9f83a7bc3109aef890281b3799c2794103fa72390a184f88",
    timestamp: "2026-08-23T06:30:00Z",
    system: "AWS S3 Object Lock Vault (Immutable)",
    rawDetails: "Tree Depth: 16 Levels\nLeaf Count: 47,281 Encrypted File Hashes\nSigner: Aegis Forensic Hardware Security Module (HSM-01)\nRFC 6962 Proof Valid: YES (100% Cryptographic Match)"
  },
  "cite-mem-1": {
    id: "cite-mem-1",
    title: "RAM Dump LSASS Heap In-Memory Key Offsets",
    category: "MEMORY_DUMP",
    hashOrOffset: "Memory Base: 0x00007FF610400000 | Size: 16.0 GB",
    timestamp: "2026-08-23T06:45:00Z",
    system: "DC01.mercy.local (Raw Memory Dump)",
    rawDetails: "Carver Module: Aegis Wanakiwi & Mimikatz Heap Analyzer\nCurve25519 Ephemeral Public Key: 0x4a9b21f...\nMaster Key Schedule: Overwritten in memory by ransomware zeroing loop at PID 4920"
  }
};

const PREBUILT_QUERIES = [
  { label: "What happened?", query: "What happened during the initial breach and how did the ransomware spread?" },
  { label: "What should I recover first?", query: "What is the recommended recovery priority sequence across all infected systems?" },
  { label: "Why did the platform recommend isolation?", query: "Why did the Aegis platform recommend immediate VLAN isolation rather than system reboots?" },
  { label: "Which systems are at highest risk?", query: "Which systems and databases are currently at highest risk of catastrophic permanent data loss?" },
  { label: "Explain ChaCha20 + Curve25519 encryption", query: "Can we mathematically decrypt the LockBit 3.0 files without paying the ransom?" },
  { label: "Generate Board SITREP", query: "Draft an executive situation report for the Board of Directors with recovery timelines." }
];

export default function CopilotPage() {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "msg-1",
      sender: "ASSISTANT",
      timestamp: "2026-08-24T00:15:00Z",
      content: `Hello Commander. I am your **Air-Gapped Aegis Local Security Copilot** running locally on dedicated quantized neural hardware.

I have ingested all authorized forensic evidence for **Case INC-2026-8841 (Mercy General Health System / LockBit 3.0)**:
- **24 Virtual Machine disk images** and live RAM dumps
- **47,281 encrypted file header samples** (ChaCha20 + Curve25519)
- **AWS S3 Object Lock snapshot manifests** (Immutable Vault verified clean)
- **Active Directory event streams & Kerberos tickets**

How can I assist your investigation and recovery orchestration today?`,
      citations: [INITIAL_CITATIONS["cite-hash-1"], INITIAL_CITATIONS["cite-merkle-1"]]
    }
  ]);

  const [inputQuery, setInputQuery] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeCitation, setActiveCitation] = useState<CitationItem | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleSendQuery = (text: string) => {
    if (!text.trim()) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: "USER",
      timestamp: new Date().toISOString(),
      content: text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsProcessing(true);

    setTimeout(() => {
      let replyContent = "";
      let reasoningSteps: string[] = [];
      let citations: CitationItem[] = [];
      let suggestedActions: { label: string; actionType: string; payload?: string }[] = [];

      const lower = text.toLowerCase();

      if (lower.includes("what happened") || lower.includes("initial breach")) {
        reasoningSteps = [
          "Correlating Windows Security Event Logs across DC01 and Contractor VDI",
          "Inspecting Kerberos Ticket Granting Service (TGS) requests for svc_backup_mgmt",
          "Analyzing vssadmin execution traces and network egress flow PCAPs"
        ];
        replyContent = `**Incident Timeline & Root-Cause Summary:**

1. **Initial Vector (05:45 UTC):** Threat actor authenticated to \`CONTRACTOR-VDI-02\` using compromised third-party MSP credentials.
2. **Privilege Escalation (05:52 UTC):** LSASS memory dump on VDI yielded cached NTLM hash for service account \`svc_backup_mgmt\` (a Domain Admin alias).
3. **Shadow Copy Tampering (06:05 UTC):** Executed \`vssadmin delete shadows /all /quiet\` across 24 Hyper-V VMs to destroy local restore points.
4. **Mass Encryption (06:14 UTC):** Pushed **LockBit 3.0 (Black)** binary via PsExec and Group Policy Object (GPO) to \`SQL-CLINICAL-PROD\` and \`PACS-STORAGE-SAN\`.

Immutable AWS S3 Object Lock backups taken at 04:00 UTC (2 hours prior) remain **100% intact and uncompromised**.`;
        citations = [INITIAL_CITATIONS["cite-log-1"], INITIAL_CITATIONS["cite-log-2"], INITIAL_CITATIONS["cite-hash-1"]];
        suggestedActions = [
          { label: "Review Identity Defense", actionType: "NAV", payload: "/identity-defense" },
          { label: "Inspect Immutable S3 Backups", actionType: "NAV", payload: "/backup-assessment" }
        ];
      } else if (lower.includes("what should i recover first") || lower.includes("priority")) {
        reasoningSteps = [
          "Querying Digital Twin dependency graph for Tier-0 foundational dependencies",
          "Evaluating Kerberos KDC authentication prerequisite for database clusters",
          "Calculating patient safety RTO SLA requirements for Epic EHR"
        ];
        replyContent = `**Recommended Recovery Sequence (Dependency-Ordered):**

1. **Phase 1: Tier-0 Identity Core (\`DC01.mercy.local\`)**
   - *Why first:* SQL and Epic EHR require Active Directory Kerberos ticket validation to start database daemons.
   - *Action:* Restore DC01 in an isolated clean sandbox, perform double KRBTGT password roll, and verify 0 persistence tasks.

2. **Phase 2: Epic EHR Clinical Database (\`SQL-CLINICAL-PROD\`)**
   - *Why second:* Clinical inpatient care, ICU patient vitals, and emergency pharmacy depend directly on this database.
   - *Action:* Restore from AWS S3 Snapshot #20260823-0400UTC and execute \`DBCC CHECKDB\`.

3. **Phase 3: PACS Medical Imaging SAN (\`PACS-STORAGE-SAN-01\`)**
   - *Action:* Restore DICOM imaging arrays from secondary ZFS immutable snapshots.

4. **Phase 4: Patient Portal & Billing Web Farm**
   - *Action:* Re-image IIS worker nodes and enforce zero-trust egress filtering.`;
        citations = [INITIAL_CITATIONS["cite-merkle-1"]];
        suggestedActions = [
          { label: "Launch Recovery Plan Orchestrator", actionType: "NAV", payload: "/recovery-planner" },
          { label: "Open Tabletop Sandbox", actionType: "NAV", payload: "/sandbox" }
        ];
      } else if (lower.includes("why did the platform recommend isolation") || lower.includes("isolation")) {
        reasoningSteps = [
          "Checking active C2 beacon detection metrics on subnet 10.14.0.0/16",
          "Analyzing threat actor persistence hooks and scheduled task execution cycles",
          "Evaluating catastrophic reinfection risk of warm host reboot"
        ];
        replyContent = `**Isolation Recommendation Rationale:**

- **Preventing WORM Backup Targeting:** At 06:15 UTC, the threat actor attempted brute-force API calls against the backup gateway. Network isolation severed attacker C2 control before backup deletion scripts could execute.
- **RAM Dump Volatility:** System reboots wipe DRAM where critical symmetric key schedules, unencrypted mutexes, and forensic beacon sockets reside.
- **Lateral Worm Prevention:** LockBit 3.0 utilizes SMBv2 broadcast ARP sweeps to infect all adjacent endpoints within seconds. Immediate microsegmentation confined damage to 24 hosts instead of all 450 network endpoints.`;
        citations = [INITIAL_CITATIONS["cite-log-2"], INITIAL_CITATIONS["cite-mem-1"]];
        suggestedActions = [
          { label: "Check Automated Containment Rules", actionType: "NAV", payload: "/containment" }
        ];
      } else if (lower.includes("highest risk") || lower.includes("risk")) {
        reasoningSteps = [
          "Evaluating asset tiers, backup availability, and data exfiltration likelihood",
          "Cross-referencing darknet Tor leak blog staging metadata"
        ];
        replyContent = `**Highest Risk Asset Assessment:**

1. **\`SQL-CLINICAL-PROD\` (Epic EHR DB) — CRITICAL RISK**
   - *Risk:* 1.8 TB of patient HIPAA medical records confirmed staged for extortion on LockBit leak blog.
   - *Financial Impact:* $240,000 / hr downtime + potential HIPAA penalties.

2. **\`DC01.mercy.local\` (Primary Domain Controller) — HIGH RISK**
   - *Risk:* Kerberos KRBTGT hash compromised. Re-infects any clean host joined to domain unless double password rotation is executed.

3. **\`Local Volume Shadow Copies\` — 100% LOST**
   - *Risk:* Destroyed by attacker script. Recovery must rely 100% on immutable S3 backups.`;
        citations = [INITIAL_CITATIONS["cite-hash-1"], INITIAL_CITATIONS["cite-log-1"]];
        suggestedActions = [
          { label: "Open Exfiltration Assessor", actionType: "NAV", payload: "/exfiltration-assessor" },
          { label: "Open Clean Recovery Gatekeeper", actionType: "NAV", payload: "/clean-validation" }
        ];
      } else if (lower.includes("chacha20") || lower.includes("decrypt") || lower.includes("key")) {
        reasoningSteps = [
          "Performing cryptographic algorithm verification on .lockbit encrypted headers",
          "Checking ChaCha20 stream cipher key size (256-bit) and Curve25519 public key curve",
          "Evaluating in-memory heap key recovery feasibility"
        ];
        replyContent = `**Cryptographic Feasibility Analysis:**

- **Algorithm:** ChaCha20 symmetric stream cipher combined with asymmetric Curve25519 (ECDH) ephemeral key exchange.
- **Header Entropy:** 7.988 / 8.000 (Maximum cryptographic randomness).
- **Mathematical Decryption Probability without Attacker Private Key:** **0.00000001%** (Requires $2^{256}$ operations — computationally infeasible).
- **Memory Carving Status:** Threat actor payload executed \`RtlZeroMemory\` over heap key buffers immediately following encryption.
- **Verdict:** Paying for decryptor tool is high risk (15% tool failure rate). **Restoring from verified clean AWS S3 immutable backups is the guaranteed 98.5% success path.**`;
        citations = [INITIAL_CITATIONS["cite-hash-1"], INITIAL_CITATIONS["cite-mem-1"]];
        suggestedActions = [
          { label: "Open Cryptographic Analyzer", actionType: "NAV", payload: "/crypto-analysis" },
          { label: "View Recovery Decision Matrix", actionType: "NAV", payload: "/recovery-matrix" }
        ];
      } else {
        reasoningSteps = [
          "Parsing DFIR intelligence knowledge graph",
          "Querying incident case database for relevant forensic artifacts"
        ];
        replyContent = `Based on forensic telemetry for **INC-2026-8841**:
- Total Encrypted Hosts: **24 VM Nodes**
- Backup Integrity: **AWS S3 Object Lock Vault (Verified Clean)**
- Estimated Clean Recovery Time: **18.5 Hours**
- Financial Impact: **$145,000 / hr**

Please select any of the query chips or ask a specific tactical question regarding containment, identity recovery, cryptographic feasibility, or forensic chain-of-custody.`;
        citations = [INITIAL_CITATIONS["cite-merkle-1"]];
      }

      const assistantMsg: CopilotMessage = {
        id: `ast-${Date.now()}`,
        sender: "ASSISTANT",
        timestamp: new Date().toISOString(),
        content: replyContent,
        reasoningSteps,
        citations,
        suggestedActions
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsProcessing(false);
    }, 700);
  };

  const executeAction = (action: { label: string; actionType: string; payload?: string }) => {
    setActionFeedback(`Executed: ${action.label}`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "calc(100vh - 100px)" }}>
      {/* Top Banner Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(168,85,247,0.06) 50%, rgba(14,21,38,0.95) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "16px 22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.4)",
              borderRadius: 8,
              padding: "5px 9px",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <Bot size={17} color="var(--primary)" />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--primary)", letterSpacing: "0.08em" }}>
                AI COPILOT WORKSPACE
              </span>
            </div>
            <span className="badge-sev badge-success">AIR-GAPPED LOCAL INFERENCE</span>
            <span className="badge-sev badge-medium">ZERO TELEMETRY EGRESS</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--fg)" }}>
            Aegis Local Security Copilot & Evidence Reasoning Agent
          </h1>
        </div>

        {/* Model Spec Badge */}
        <div style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 11.5
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Cpu size={14} color="var(--purple)" />
            <span style={{ color: "var(--fg-2)" }}>Model: <strong>Llama-3-70B-CyberDFIR</strong></span>
          </div>
          <span style={{ color: "var(--border)" }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ShieldCheck size={14} color="var(--primary)" />
            <span style={{ color: "var(--primary)" }}>FRE 901 Merkle Verified</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout: Chat Stream (Left) + Evidence Citation Drawer (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: activeCitation ? "1.8fr 1.2fr" : "1fr", gap: 20, flex: 1, minHeight: 0 }}>
        
        {/* Left Column: Chat Conversation Stream */}
        <div className="card-tactical" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          
          {/* Pre-built Query Chips Bar */}
          <div style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--border)",
            background: "rgba(22,32,56,0.5)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            overflowX: "auto",
            flexShrink: 0
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
              <Sparkles size={12} color="var(--amber)" /> PROMPTS:
            </span>
            {PREBUILT_QUERIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(q.query)}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: "4px 12px",
                  color: "var(--fg-2)",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.color = "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--fg-2)";
                }}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((msg) => {
              const isUser = msg.sender === "USER";

              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignSelf: isUser ? "flex-end" : "flex-start",
                    maxWidth: isUser ? "80%" : "92%"
                  }}
                >
                  {!isUser && (
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(16,185,129,0.15)",
                      border: "1px solid rgba(16,185,129,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <Bot size={18} color="var(--primary)" />
                    </div>
                  )}

                  <div style={{
                    background: isUser ? "rgba(16,185,129,0.15)" : "var(--surface-2)",
                    border: isUser ? "1px solid rgba(16,185,129,0.4)" : "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10
                  }}>
                    {/* Message Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--muted)" }}>
                      <span style={{ fontWeight: 700, color: isUser ? "var(--primary)" : "var(--cyan)" }}>
                        {isUser ? "INCIDENT COMMANDER" : "AEGIS AI COPILOT"}
                      </span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>

                    {/* Reasoning Steps (if any) */}
                    {msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                      <div style={{
                        background: "rgba(6,182,212,0.06)",
                        border: "1px solid rgba(6,182,212,0.2)",
                        borderRadius: 6,
                        padding: "8px 12px",
                        fontSize: 11,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4
                      }}>
                        <div style={{ fontWeight: 800, color: "var(--cyan)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Terminal size={12} /> REASONING TRACE & CORRELATION:
                        </div>
                        {msg.reasoningSteps.map((step, sIdx) => (
                          <div key={sIdx} style={{ color: "var(--fg-2)", paddingLeft: 8 }}>
                            ↳ {step}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message Text Content */}
                    <div style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "var(--fg)",
                      whiteSpace: "pre-line"
                    }}>
                      {msg.content}
                    </div>

                    {/* Evidence Citation Chips */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, paddingTop: 8, borderTop: "1px solid var(--border-subtle)" }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)" }}>
                          EVIDENCE CITATIONS:
                        </span>
                        {msg.citations.map((cite) => (
                          <button
                            key={cite.id}
                            onClick={() => setActiveCitation(cite)}
                            style={{
                              background: activeCitation?.id === cite.id ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.04)",
                              border: activeCitation?.id === cite.id ? "1px solid var(--primary)" : "1px solid var(--border)",
                              borderRadius: 4,
                              padding: "2px 8px",
                              fontSize: 10.5,
                              color: "var(--primary)",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              cursor: "pointer",
                              fontFamily: "monospace"
                            }}
                          >
                            <Fingerprint size={11} />
                            {cite.title}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Action Triggers */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 6 }}>
                        {msg.suggestedActions.map((action, aIdx) => (
                          action.actionType === "NAV" && action.payload ? (
                            <Link
                              key={aIdx}
                              href={action.payload}
                              className="btn-secondary"
                              style={{ fontSize: 11, padding: "5px 10px", gap: 4, textDecoration: "none" }}
                            >
                              <ExternalLink size={12} color="var(--primary)" />
                              {action.label}
                            </Link>
                          ) : (
                            <button
                              key={aIdx}
                              onClick={() => executeAction(action)}
                              className="btn-secondary"
                              style={{ fontSize: 11, padding: "5px 10px", gap: 4 }}
                            >
                              <CheckCircle2 size={12} color="var(--cyan)" />
                              {action.label}
                            </button>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div style={{ display: "flex", gap: 12, alignItems: "center", color: "var(--primary)", fontSize: 12.5, padding: 8 }}>
                <RefreshCw size={16} className="animate-spin" />
                <span>Aegis reasoning engine analyzing forensic evidence graph...</span>
              </div>
            )}
          </div>

          {/* Action Feedback Notification */}
          {actionFeedback && (
            <div style={{ background: "rgba(16,185,129,0.2)", borderTop: "1px solid var(--primary)", padding: "6px 14px", fontSize: 11.5, color: "var(--primary)", fontWeight: 700 }}>
              ✓ {actionFeedback}
            </div>
          )}

          {/* Input Chat Box */}
          <div style={{ padding: 14, borderTop: "1px solid var(--border)", background: "var(--surface)", display: "flex", gap: 10 }}>
            <input
              type="text"
              placeholder="Ask Copilot regarding threat actor TTPs, encryption feasibility, recovery sequencing..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendQuery(inputQuery)}
              style={{
                flex: 1,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "var(--fg)",
                fontSize: 13,
                outline: "none"
              }}
            />
            <button
              onClick={() => handleSendQuery(inputQuery)}
              className="btn-primary"
              style={{ padding: "0 18px" }}
              disabled={isProcessing}
            >
              <Send size={15} />
              Send
            </button>
          </div>

        </div>

        {/* Right Column: Evidence Citation Drawer (Opens on Citation Click) */}
        {activeCitation && (
          <div className="card-tactical" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", borderLeft: "3px solid var(--primary)" }}>
            
            {/* Drawer Header */}
            <div style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--surface-2)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Fingerprint size={17} color="var(--primary)" />
                <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--fg)", letterSpacing: "0.04em" }}>
                  EVIDENCE CITATION INSPECTOR
                </span>
              </div>
              <button
                onClick={() => setActiveCitation(null)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}
              >
                <X size={17} />
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
              
              <div>
                <span className="badge-sev badge-medium" style={{ marginBottom: 6 }}>
                  {activeCitation.category} EVIDENCE
                </span>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)", marginTop: 4 }}>
                  {activeCitation.title}
                </h3>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: 6, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6, fontSize: 11.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>System Origin:</span>
                  <span style={{ fontWeight: 700, color: "var(--fg)" }}>{activeCitation.system}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Timestamp:</span>
                  <span style={{ fontFamily: "monospace", color: "var(--fg-2)" }}>{activeCitation.timestamp}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 4 }}>
                  <span style={{ color: "var(--muted)" }}>Identifier / Hash:</span>
                  <span style={{ fontFamily: "monospace", color: "var(--primary)", wordBreak: "break-all", background: "rgba(16,185,129,0.08)", padding: "4px 6px", borderRadius: 4 }}>
                    {activeCitation.hashOrOffset}
                  </span>
                </div>
              </div>

              {/* Raw Forensic Details */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                  Raw Cryptographic & Forensic Telemetry
                </div>
                <pre style={{
                  background: "#040711",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: 12,
                  color: "var(--fg-2)",
                  fontSize: 11,
                  fontFamily: "monospace",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap"
                }}>
                  {activeCitation.rawDetails}
                </pre>
              </div>

              {/* Chain of Custody & FRE 901 Stamp */}
              <div style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: 6,
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 6
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, color: "var(--primary)" }}>
                  <ShieldCheck size={16} />
                  Federal Rules of Evidence Rule 901 Certified
                </div>
                <p style={{ fontSize: 11, color: "var(--fg-2)", lineHeight: 1.4 }}>
                  This forensic artifact is cryptographically anchored in the immutable WORM audit ledger with SHA-256 Merkle root verification. Suitable for legal discovery, cyber insurance claims, and regulatory submission.
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
