"use client";

import React, { useState } from "react";
import {
  Users,
  Key,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  Lock,
  Unlock,
  Sparkles,
  Search,
  Filter,
  Layers,
  ChevronRight,
  ShieldAlert,
  Zap,
  RotateCcw
} from "lucide-react";

interface Signature {
  signerName: string;
  role: string;
  signedAt: string;
  signatureHash: string;
  decision: "APPROVE" | "REJECT";
}

interface ApprovalItem {
  id: string;
  actionType: "MASS_DECRYPTION" | "KERBEROS_DOUBLE_ROLL" | "DB_RESTORE_OVERWRITE" | "ENCLAVE_RECONNECT" | "RANSOM_PAYMENT_AUTH" | "EVIDENCE_SANITIZATION";
  title: string;
  description: string;
  requestedBy: string;
  requestorRole: string;
  timestamp: string;
  status: "PENDING_SIGNATURES" | "APPROVED" | "REJECTED" | "EXECUTED";
  requiredSignatures: number;
  currentSignatures: Signature[];
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM";
  affectedScope: string;
  expiresInMinutes: number;
}

const INITIAL_REQUESTS: ApprovalItem[] = [
  {
    id: "appr-001",
    actionType: "MASS_DECRYPTION",
    title: "Execute Automated In-Memory Decryption across 24 Hospital Hosts",
    description: "Launch Aegis ChaCha20 round-key decryption injector against 24 encrypted Hyper-V VMs. Replaces encrypted files in-place with decrypted data streams.",
    requestedBy: "Marcus Vance",
    requestorRole: "Lead Forensics Investigator",
    timestamp: "2026-08-24T00:05:00Z",
    status: "PENDING_SIGNATURES",
    requiredSignatures: 2,
    currentSignatures: [
      {
        signerName: "Elena Rostova, CISSP",
        role: "Lead Incident Commander",
        signedAt: "2026-08-24T00:12:00Z",
        signatureHash: "0x98f4e2a1b90c67d8f43210aa98bc32",
        decision: "APPROVE"
      }
    ],
    riskLevel: "HIGH",
    affectedScope: "24 Virtual Machines / 1.84 TB Clinical Data",
    expiresInMinutes: 45
  },
  {
    id: "appr-002",
    actionType: "KERBEROS_DOUBLE_ROLL",
    title: "Execute Enterprise-Wide Active Directory KRBTGT Double Password Roll",
    description: "Invalidates all active Kerberos TGT and TGS tickets enterprise-wide to purge Golden Ticket / Silver Ticket persistence. Forces re-authentication for 12,000 active domain sessions.",
    requestedBy: "David Kross",
    requestorRole: "Senior Identity Security Engineer",
    timestamp: "2026-08-23T22:30:00Z",
    status: "APPROVED",
    requiredSignatures: 2,
    currentSignatures: [
      {
        signerName: "Elena Rostova, CISSP",
        role: "CISO / Incident Commander",
        signedAt: "2026-08-23T22:45:00Z",
        signatureHash: "0x77ab43de890123fa4567bc8901de",
        decision: "APPROVE"
      },
      {
        signerName: "Dr. Arthur Vance",
        role: "Chief Medical Officer",
        signedAt: "2026-08-23T22:50:00Z",
        signatureHash: "0x33445566778899aabbccddeeff0011",
        decision: "APPROVE"
      }
    ],
    riskLevel: "CRITICAL",
    affectedScope: "Entire Active Directory Domain (mercy.local - 12,400 Users)",
    expiresInMinutes: 0
  },
  {
    id: "appr-003",
    actionType: "DB_RESTORE_OVERWRITE",
    title: "Overwrite Production Epic EHR SQL Database from Immutable S3 Snapshot #20260823-0400",
    description: "Performs full block-level restore of SQL-CLINICAL-01. Overwrites 840 GB corrupted storage volume with immutable snapshot taken 2 hours prior to attack vector insertion.",
    requestedBy: "Sarah Jenkins",
    requestorRole: "Recovery Operations Director",
    timestamp: "2026-08-23T23:15:00Z",
    status: "PENDING_SIGNATURES",
    requiredSignatures: 2,
    currentSignatures: [],
    riskLevel: "CRITICAL",
    affectedScope: "Production Patient EHR Database (Epic / InterSystems Caché)",
    expiresInMinutes: 30
  },
  {
    id: "appr-004",
    actionType: "ENCLAVE_RECONNECT",
    title: "Authorize Reintegration of Radiology PACS Subnet (VLAN 104) to Live Production",
    description: "Re-enables core routing switches between isolated forensic quarantine enclave and hospital network. All 6-point Clean Validation gates passed.",
    requestedBy: "Elena Rostova",
    requestorRole: "Incident Commander",
    timestamp: "2026-08-23T23:55:00Z",
    status: "PENDING_SIGNATURES",
    requiredSignatures: 2,
    currentSignatures: [
      {
        signerName: "Elena Rostova, CISSP",
        role: "CISO",
        signedAt: "2026-08-24T00:00:00Z",
        signatureHash: "0x11223344556677889900aabbccddeeff",
        decision: "APPROVE"
      }
    ],
    riskLevel: "HIGH",
    affectedScope: "PACS Radiology Storage Enclave (10.14.5.0/24)",
    expiresInMinutes: 60
  }
];

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<ApprovalItem[]>(INITIAL_REQUESTS);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [selectedReq, setSelectedReq] = useState<ApprovalItem | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signerName, setSignerName] = useState("Dr. Arthur Vance");
  const [signerRole, setSignerRole] = useState("Chief Medical Officer");
  const [signerPin, setSignerPin] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSign = () => {
    if (!signerPin) {
      alert("Please enter authorization PIN.");
      return;
    }
    if (!selectedReq) return;

    const newSig: Signature = {
      signerName,
      role: signerRole,
      signedAt: new Date().toISOString(),
      signatureHash: `0x${Math.random().toString(16).substring(2, 14)}890fa`,
      decision: "APPROVE"
    };

    setRequests(prev =>
      prev.map(r => {
        if (r.id === selectedReq.id) {
          const updatedSigs = [...r.currentSignatures, newSig];
          const isQuorumReached = updatedSigs.length >= r.requiredSignatures;
          return {
            ...r,
            currentSignatures: updatedSigs,
            status: isQuorumReached ? "APPROVED" : "PENDING_SIGNATURES"
          };
        }
        return r;
      })
    );

    setShowSignModal(false);
    setSignerPin("");
    showToast(`Signature recorded for ${selectedReq.id}. Quorum updated.`);
  };

  const handleExecute = (id: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: "EXECUTED" } : r))
    );
    showToast(`Action ${id} successfully executed on production enclave.`);
  };

  const filteredRequests = requests.filter(r => {
    if (activeFilter === "PENDING") return r.status === "PENDING_SIGNATURES";
    if (activeFilter === "APPROVED") return r.status === "APPROVED";
    if (activeFilter === "EXECUTED") return r.status === "EXECUTED";
    return true;
  });

  const pendingCount = requests.filter(r => r.status === "PENDING_SIGNATURES").length;
  const approvedCount = requests.filter(r => r.status === "APPROVED").length;
  const executedCount = requests.filter(r => r.status === "EXECUTED").length;

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
            <Users size={22} color="#10b981" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--fg)" }}>
                Dual-Custody Human Approval & Policy Governance
              </h1>
              <span className="badge-sev badge-success">PILLAR 5 · GOVERN</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Multi-signature authorization workflow for high-risk recovery actions (Decryption, Kerberos Roll, DB Overwrites).
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontSize: 11,
            color: "#10b981",
            background: "rgba(16,185,129,0.1)",
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid rgba(16,185,129,0.3)",
            fontWeight: 700
          }}>
            GOVERNANCE QUORUM: 2-OF-3 OFFICERS MANDATORY
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Pending Signatures
            </span>
            <Clock size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b", marginTop: 6 }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Awaiting 2nd Quorum Signer
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #10b981" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Approved & Ready
            </span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981", marginTop: 6 }}>
            {approvedCount}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Cryptographic quorum satisfied
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #06b6d4" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Executed Actions
            </span>
            <ShieldCheck size={16} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#06b6d4", marginTop: 6 }}>
            {executedCount}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Immutable audit ledger sealed
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #a855f7" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Policy Mode
            </span>
            <Lock size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#a855f7", marginTop: 6 }}>
            Strict M-of-N
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Zero unilateral execution
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {[
          { key: "ALL", label: `All Requests (${requests.length})` },
          { key: "PENDING", label: `Pending Signatures (${pendingCount})` },
          { key: "APPROVED", label: `Approved & Ready (${approvedCount})` },
          { key: "EXECUTED", label: `Executed History (${executedCount})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              background: activeFilter === tab.key ? "rgba(16, 185, 129, 0.2)" : "var(--surface)",
              color: activeFilter === tab.key ? "#10b981" : "var(--muted)",
              border: activeFilter === tab.key ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid var(--border)"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Approval Requests Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredRequests.map(req => {
          const sigsAcquired = req.currentSignatures.length;
          const isPending = req.status === "PENDING_SIGNATURES";
          const isApproved = req.status === "APPROVED";
          const isExecuted = req.status === "EXECUTED";

          return (
            <div
              key={req.id}
              className="card-tactical"
              style={{
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                border: isApproved ? "1px solid rgba(16,185,129,0.4)" : undefined
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 4,
                    background: "var(--surface-3)",
                    color: "#06b6d4",
                    fontFamily: "monospace"
                  }}>
                    {req.actionType}
                  </span>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                    {req.title}
                  </h3>
                  <span className={`badge-sev ${req.riskLevel === "CRITICAL" ? "badge-critical" : "badge-high"}`}>
                    {req.riskLevel} RISK
                  </span>
                </div>

                <span className={`badge-sev ${isApproved ? "badge-success" : isExecuted ? "badge-medium" : "badge-high"}`}>
                  {req.status.replace(/_/g, " ")}
                </span>
              </div>

              <p style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>
                {req.description}
              </p>

              {/* Scope and Signatures Bar */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--surface-2)",
                padding: "10px 14px",
                borderRadius: 6,
                fontSize: 11.5,
                flexWrap: "wrap",
                gap: 10
              }}>
                <div>
                  <span style={{ color: "var(--muted)" }}>Requested by: </span>
                  <strong style={{ color: "var(--fg)" }}>{req.requestedBy}</strong> ({req.requestorRole})
                </div>

                <div>
                  <span style={{ color: "var(--muted)" }}>Affected Scope: </span>
                  <strong style={{ color: "var(--fg)" }}>{req.affectedScope}</strong>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--muted)" }}>Quorum:</span>
                  <strong style={{ color: sigsAcquired >= req.requiredSignatures ? "#10b981" : "#f59e0b" }}>
                    {sigsAcquired} of {req.requiredSignatures} Signatures
                  </strong>
                </div>
              </div>

              {/* Existing Signers list */}
              {req.currentSignatures.length > 0 && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {req.currentSignatures.map((sig, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 4,
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                        fontSize: 11,
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <CheckCircle2 size={12} color="#10b981" />
                      <span><strong>{sig.signerName}</strong> ({sig.role})</span>
                      <span style={{ color: "var(--muted)", fontFamily: "monospace" }}>{sig.signatureHash.substring(0, 10)}...</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                {isPending && (
                  <button
                    onClick={() => {
                      setSelectedReq(req);
                      setShowSignModal(true);
                    }}
                    className="btn-primary"
                    style={{ fontSize: 12, padding: "6px 14px" }}
                  >
                    <Key size={13} />
                    <span>Provide 2nd Custody Signature</span>
                  </button>
                )}

                {isApproved && (
                  <button
                    onClick={() => handleExecute(req.id)}
                    className="btn-primary"
                    style={{ background: "#06b6d4", color: "#04100c", fontSize: 12, padding: "6px 14px" }}
                  >
                    <Zap size={13} />
                    <span>Execute High-Impact Recovery Action</span>
                  </button>
                )}

                {isExecuted && (
                  <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={13} /> Action Executed & Logged to Ledger
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Signing Modal */}
      {showSignModal && selectedReq && (
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
                <Key size={18} color="#10b981" />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
                  Dual-Custody Cryptographic Signature
                </h3>
              </div>
              <button
                onClick={() => setShowSignModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16 }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: 12, color: "var(--fg-2)" }}>
              Authorizing: <strong>{selectedReq.title}</strong>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Select Authorized Signer Identity:
              </label>
              <select
                value={signerName}
                onChange={e => {
                  setSignerName(e.target.value);
                  if (e.target.value.includes("Vance")) setSignerRole("Chief Medical Officer");
                  if (e.target.value.includes("Jenkins")) setSignerRole("Recovery Operations Director");
                  if (e.target.value.includes("Rostova")) setSignerRole("CISO / Incident Commander");
                }}
                className="tool-select"
              >
                <option value="Dr. Arthur Vance">Dr. Arthur Vance (Chief Medical Officer)</option>
                <option value="Sarah Jenkins">Sarah Jenkins (Recovery Operations Director)</option>
                <option value="Elena Rostova, CISSP">Elena Rostova, CISSP (CISO / Incident Commander)</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Cryptographic Security Token / PIN:
              </label>
              <input
                type="password"
                placeholder="Enter 6-digit hardware security token..."
                value={signerPin}
                onChange={e => setSignerPin(e.target.value)}
                className="tool-input"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <button
                onClick={() => setShowSignModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSign}
                className="btn-primary"
              >
                <CheckCircle2 size={13} />
                <span>Stamp Dual Signature</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
