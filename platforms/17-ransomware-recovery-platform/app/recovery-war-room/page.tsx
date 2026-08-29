"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
  FileText,
  Lock,
  Unlock,
  Key,
  Server,
  Database,
  ArrowRight,
  Send,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Sliders,
  ChevronRight,
  Printer,
  FileSpreadsheet
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";

interface WarRoomTask {
  id: string;
  title: string;
  assignedRole: "INCIDENT_COMMANDER" | "FORENSICS_LEAD" | "IDENTITY_ADMIN" | "DBA_LEAD" | "LEGAL_COUNSEL";
  assignedPerson: string;
  status: "DONE" | "IN_PROGRESS" | "PENDING_APPROVAL" | "QUEUED";
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  phase: string;
  durationEst: string;
}

interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  category: "EGRESS_UNBLOCK" | "DNS_CUTOVER" | "KRBTGT_DOUBLE_ROLL" | "SANDBOX_DETONATION";
  requiredApprovers: string[];
  currentApprovals: string[];
  status: "PENDING_SIGNATURE" | "APPROVED" | "REJECTED";
  timestamp: string;
}

interface TimelineEntry {
  id: string;
  timestamp: string;
  role: "SecOps" | "Forensics" | "DBA" | "Executive" | "Legal";
  author: string;
  action: string;
  verifiedHash: string;
}

const INITIAL_TASKS: WarRoomTask[] = [
  {
    id: "task-1",
    title: "Enforce network microsegmentation on Hyper-V VLAN 14",
    assignedRole: "INCIDENT_COMMANDER",
    assignedPerson: "Elena Rostova, CISSP",
    status: "DONE",
    priority: "CRITICAL",
    phase: "Phase 1: Containment",
    durationEst: "15 min"
  },
  {
    id: "task-2",
    title: "Capture bit-stream forensic RAM dump from DC01",
    assignedRole: "FORENSICS_LEAD",
    assignedPerson: "Marcus Vance, GCIH",
    status: "DONE",
    priority: "CRITICAL",
    phase: "Phase 1: Containment",
    durationEst: "30 min"
  },
  {
    id: "task-3",
    title: "Execute Kerberos KRBTGT double password roll in isolated AD sandbox",
    assignedRole: "IDENTITY_ADMIN",
    assignedPerson: "David Kross, GCFA",
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    phase: "Phase 2: Identity Recovery",
    durationEst: "45 min"
  },
  {
    id: "task-4",
    title: "Point-in-time restore of SQL-CLINICAL from AWS S3 Immutable Snapshot #0400UTC",
    assignedRole: "DBA_LEAD",
    assignedPerson: "Sarah Jenkins, CISM",
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    phase: "Phase 3: Database Hydration",
    durationEst: "120 min"
  },
  {
    id: "task-5",
    title: "Review SEC Form 8-K cyber material breach disclosure draft",
    assignedRole: "LEGAL_COUNSEL",
    assignedPerson: "Amanda Thorne, Esq. (Baker & Hostetler)",
    status: "PENDING_APPROVAL",
    priority: "HIGH",
    phase: "Phase 4: Regulatory & Governance",
    durationEst: "60 min"
  },
  {
    id: "task-6",
    title: "Execute DBCC CHECKDB integrity verification on PatientDB",
    assignedRole: "DBA_LEAD",
    assignedPerson: "Sarah Jenkins, CISM",
    status: "QUEUED",
    priority: "HIGH",
    phase: "Phase 3: Database Hydration",
    durationEst: "45 min"
  }
];

const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: "appr-1",
    title: "Break-Glass Isolated Enclave Egress Unblock",
    description: "Temporarily permits outbound TLS traffic to Microsoft Entra ID CRL verification endpoints from the isolated recovery sandbox.",
    requestedBy: "Marcus Vance (Forensics Lead)",
    category: "EGRESS_UNBLOCK",
    requiredApprovers: ["Elena Rostova (Incident Commander)", "Chief Information Security Officer"],
    currentApprovals: ["Elena Rostova (Incident Commander)"],
    status: "PENDING_SIGNATURE",
    timestamp: "2026-08-24T00:08:00Z"
  },
  {
    id: "appr-2",
    title: "Production Clinical Vlan DNS Cutover",
    description: "Re-points internal clinical workstation DNS resolvers to the newly certified clean DC01 and SQL-CLINICAL instance.",
    requestedBy: "Sarah Jenkins (Recovery Director)",
    category: "DNS_CUTOVER",
    requiredApprovers: ["Chief Medical Officer", "Incident Commander"],
    currentApprovals: [],
    status: "PENDING_SIGNATURE",
    timestamp: "2026-08-24T00:12:00Z"
  },
  {
    id: "appr-3",
    title: "Active Directory Forest Rebuild KRBTGT Double Roll",
    description: "Invalidates all existing Kerberos Ticket Granting Tickets (TGT) enterprise-wide to eliminate golden ticket persistence.",
    requestedBy: "David Kross (Identity Lead)",
    category: "KRBTGT_DOUBLE_ROLL",
    requiredApprovers: ["Incident Commander", "Enterprise Domain Admin"],
    currentApprovals: ["Elena Rostova (Incident Commander)", "Enterprise Domain Admin"],
    status: "APPROVED",
    timestamp: "2026-08-23T23:50:00Z"
  }
];

const INITIAL_TIMELINE: TimelineEntry[] = [
  {
    id: "tl-1",
    timestamp: "2026-08-24T00:15:22Z",
    role: "SecOps",
    author: "Elena Rostova (Commander)",
    action: "Quarantine boundary confirmed tight. Zero outbound C2 beacon egress detected on Snort sensor.",
    verifiedHash: "0x89a1...4f01"
  },
  {
    id: "tl-2",
    timestamp: "2026-08-24T00:10:04Z",
    role: "DBA",
    author: "Sarah Jenkins (DBA)",
    action: "AWS S3 restore stream running at 1.48 GB/s. Restored 840 GB / 1,840 GB (45.6% completed).",
    verifiedHash: "0x3bc7...19e4"
  },
  {
    id: "tl-3",
    timestamp: "2026-08-23T23:55:40Z",
    role: "Legal",
    author: "Amanda Thorne, Esq.",
    action: "OFAC sanctions screening cleared for case INC-2026-8841. Ransom negotiation flagged NOT RECOMMENDED due to immutable backup readiness.",
    verifiedHash: "0x771a...aa89"
  },
  {
    id: "tl-4",
    timestamp: "2026-08-23T23:40:12Z",
    role: "Forensics",
    author: "Marcus Vance (Forensics)",
    action: "SHA-256 Merkle root generated for 47,281 encrypted disk files. FRE 901 certificate sealed.",
    verifiedHash: "0x9f83...aef8"
  }
];

export default function RecoveryWarRoomPage() {
  const [tasks, setTasks] = useState<WarRoomTask[]>(INITIAL_TASKS);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);
  const [timeline, setTimeline] = useState<TimelineEntry[]>(INITIAL_TIMELINE);
  const [activeFilterRole, setActiveFilterRole] = useState<string>("ALL");
  const [newLogEntry, setNewLogEntry] = useState<string>("");
  const [sitrepGenerated, setSitrepGenerated] = useState<boolean>(false);

  const handleApprove = (approvalId: string) => {
    setApprovals((prev) =>
      prev.map((appr) => {
        if (appr.id === approvalId) {
          return {
            ...appr,
            currentApprovals: Array.from(new Set([...appr.currentApprovals, "Chief Information Security Officer"])),
            status: "APPROVED"
          };
        }
        return appr;
      })
    );
  };

  const handlePostLog = () => {
    if (!newLogEntry.trim()) return;

    const entry: TimelineEntry = {
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      role: "Executive",
      author: "Incident Commander (You)",
      action: newLogEntry,
      verifiedHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
    };

    setTimeline((prev) => [entry, ...prev]);
    setNewLogEntry("");
  };

  const filteredTimeline = timeline.filter((t) => activeFilterRole === "ALL" || t.role === activeFilterRole);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Banner Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(244,63,94,0.08) 0%, rgba(16,185,129,0.06) 50%, rgba(14,21,38,0.95) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              background: "rgba(244,63,94,0.15)",
              border: "1px solid rgba(244,63,94,0.4)",
              borderRadius: 8,
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <ShieldAlert size={18} color="var(--rose)" />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--rose)", letterSpacing: "0.08em" }}>
                MAJOR INCIDENT WAR ROOM
              </span>
            </div>
            <span className="badge-sev badge-critical">INC-2026-8841 LIVE OPS</span>
            <span className="badge-sev badge-success">COMMANDER CONSOLE</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", marginBottom: 6 }}>
            Emergency Cyber Incident Recovery War Room
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 840, lineHeight: 1.5 }}>
            Unified real-time crisis command center coordinating host containment, isolated identity rebuilding, immutable database restoration, dual-custody authorization gates, and multi-disciplinary incident logs.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setSitrepGenerated(true)}
            className="btn-primary"
            style={{ padding: "10px 18px", fontSize: 13 }}
          >
            <FileSpreadsheet size={16} />
            Generate Board SITREP
          </button>
        </div>
      </div>

      {/* Host Status Counters Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <div className="card-tactical" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Total Affected Hosts</span>
            <Server size={16} color="var(--rose)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--rose)" }}>
            127 <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>Hosts</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            24 Core VMs + 103 Subnet Endpoints
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 16, borderLeft: "3px solid var(--primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Contained & Isolated</span>
            <Lock size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--primary)" }}>
            103 <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>/ 127 (81%)</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Microsegmentation active
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 16, borderLeft: "3px solid var(--cyan)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Actively Recovering</span>
            <RefreshCw size={16} color="var(--cyan)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--cyan)" }}>
            19 <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>Hosts</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            In isolated clean enclave
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 16, borderLeft: "3px solid var(--amber)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Pending Triage</span>
            <AlertTriangle size={16} color="var(--amber)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--amber)" }}>
            5 <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>Hosts</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Awaiting memory dumps
          </div>
        </div>
      </div>

      {/* Main Grid: Task Assignments (Left) + Dual Custody & Timeline (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr", gap: 20 }}>
        
        {/* Left Column: Team Task Assignments Board */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          <div className="card-tactical" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Users size={17} color="var(--primary)" />
                <h2 style={{ fontSize: 14.5, fontWeight: 800, color: "var(--fg)" }}>
                  Crisis Team Task Dispatch Board
                </h2>
              </div>
              <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
                6 ACTIVE ACTION ITEMS
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg)", lineHeight: 1.3 }}>
                      {task.title}
                    </div>
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: task.status === "DONE" ? "rgba(16,185,129,0.2)" : task.status === "IN_PROGRESS" ? "rgba(6,182,212,0.2)" : "rgba(245,158,11,0.2)",
                        color: task.status === "DONE" ? "var(--primary)" : task.status === "IN_PROGRESS" ? "var(--cyan)" : "var(--amber)",
                        border: "1px solid var(--border)",
                        fontFamily: "monospace"
                      }}
                    >
                      {task.status}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--muted)", paddingTop: 4, borderTop: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--fg-2)" }}>
                      👤 <strong>{task.assignedPerson}</strong> ({task.assignedRole})
                    </span>
                    <span>⏱ {task.durationEst}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Dual-Custody Approval Queue */}
          <div className="card-tactical" style={{ padding: 18, borderTop: "3px solid var(--amber)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Key size={17} color="var(--amber)" />
                <h2 style={{ fontSize: 14.5, fontWeight: 800, color: "var(--fg)" }}>
                  Dual-Custody Break-Glass Authorization Queue
                </h2>
              </div>
              <span className="badge-sev badge-high">M-OF-N SIGN-OFF</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {approvals.map((appr) => {
                const isApproved = appr.status === "APPROVED";

                return (
                  <div
                    key={appr.id}
                    style={{
                      background: isApproved ? "rgba(16,185,129,0.06)" : "rgba(245,158,11,0.06)",
                      border: isApproved ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(245,158,11,0.3)",
                      borderRadius: 8,
                      padding: 14,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>
                        {appr.title}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: isApproved ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)",
                          color: isApproved ? "var(--primary)" : "var(--amber)",
                          border: "1px solid var(--border)"
                        }}
                      >
                        {appr.status}
                      </span>
                    </div>

                    <p style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.4 }}>
                      {appr.description}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--muted)", paddingTop: 6, borderTop: "1px solid var(--border-subtle)" }}>
                      <div>
                        Approvals: <strong>{appr.currentApprovals.length} / {appr.requiredApprovers.length}</strong>
                      </div>

                      {!isApproved ? (
                        <button
                          onClick={() => handleApprove(appr.id)}
                          className="btn-primary"
                          style={{ fontSize: 11, padding: "4px 10px" }}
                        >
                          ✍ Sign Authorization Token
                        </button>
                      ) : (
                        <span style={{ color: "var(--primary)", fontWeight: 700 }}>
                          ✓ Certified by CISO & Commander
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Live Timeline Log & Collaboration Stream */}
        <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Radio size={17} color="var(--cyan)" />
              <h2 style={{ fontSize: 14.5, fontWeight: 800, color: "var(--fg)" }}>
                Live Incident Timeline & Decision Audit Log
              </h2>
            </div>

            {/* Filter Buttons */}
            <div style={{ display: "flex", gap: 4 }}>
              {["ALL", "SecOps", "Forensics", "DBA", "Legal", "Executive"].map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveFilterRole(role)}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 4,
                    border: "1px solid var(--border)",
                    background: activeFilterRole === role ? "rgba(6,182,212,0.2)" : "var(--surface-2)",
                    color: activeFilterRole === role ? "var(--cyan)" : "var(--muted)",
                    cursor: "pointer"
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Post Log Input */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Post incident decision log or commander directive..."
              value={newLogEntry}
              onChange={(e) => setNewLogEntry(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePostLog()}
              style={{
                flex: 1,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "8px 12px",
                color: "var(--fg)",
                fontSize: 12,
                outline: "none"
              }}
            />
            <button
              onClick={handlePostLog}
              className="btn-primary"
              style={{ padding: "0 14px", fontSize: 12 }}
            >
              <Send size={14} />
              Post Log
            </button>
          </div>

          {/* Timeline Feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
            {filteredTimeline.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        padding: "1px 6px",
                        borderRadius: 3,
                        background: item.role === "SecOps" ? "rgba(244,63,94,0.15)" : item.role === "DBA" ? "rgba(6,182,212,0.15)" : "rgba(16,185,129,0.15)",
                        color: item.role === "SecOps" ? "var(--rose)" : item.role === "DBA" ? "var(--cyan)" : "var(--primary)",
                        border: "1px solid var(--border)",
                        fontFamily: "monospace"
                      }}
                    >
                      {item.role}
                    </span>
                    <strong style={{ color: "var(--fg)" }}>{item.author}</strong>
                  </div>
                  <span style={{ color: "var(--muted)", fontFamily: "monospace" }}>
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.4 }}>
                  {item.action}
                </p>

                <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace", display: "flex", justifyContent: "space-between" }}>
                  <span>Cryptographic Proof: <span style={{ color: "var(--primary)" }}>{item.verifiedHash}</span></span>
                  <span>FRE 901 Sealed</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Board SITREP Modal */}
      {sitrepGenerated && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 20
        }}>
          <div className="card-tactical" style={{ maxWidth: 640, width: "100%", padding: 24, background: "var(--surface)", border: "1px solid var(--primary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileSpreadsheet size={20} color="var(--primary)" />
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--fg)" }}>
                  Executive Situation Report (SITREP #3)
                </h3>
              </div>
              <span className="badge-sev badge-critical">CONFIDENTIAL / BOARD ONLY</span>
            </div>

            <pre style={{
              background: "#040711",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: 14,
              color: "var(--fg-2)",
              fontSize: 11.5,
              fontFamily: "monospace",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              maxHeight: 380,
              overflowY: "auto"
            }}>
{`>>> AEGIS RECOVERY EXECUTIVE SITREP <<<
INCIDENT: INC-2026-8841 (Mercy General Health System)
DATE: August 24, 2026 | TIME: 00:15 UTC
THREAT ACTOR: LockBit 3.0 (FIN12 Affiliate)

1. EXECUTIVE EXECUTIVE SUMMARY:
- 24 Core Virtual Machines encrypted; 103 adjacent hosts isolated.
- Zero evidence of successful backup corruption. AWS S3 Object Lock snapshot at 04:00 UTC verified 100% clean.
- Active restore is underway. Estimated return to full clinical service: 18.5 Hours.

2. FINANCIAL & COMPLIANCE IMPACT:
- Current Operational Loss Rate: $145,000 / hr
- SEC Form 8-K: Drafted; 4-day material filing window in compliance.
- HIPAA Breach Notice: Staged for 47,000 affected records.

3. STRATEGIC RECOMMENDATION:
- Proceed with Strategy 1 (Clean Immutable Backup Restoration).
- Do NOT pay the $1,800,000 ransom demand.`}
            </pre>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button
                onClick={() => setSitrepGenerated(false)}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setSitrepGenerated(false);
                }}
                className="btn-primary"
              >
                <Printer size={14} />
                Print / Broadcast SITREP
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
