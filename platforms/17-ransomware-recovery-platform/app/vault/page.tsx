"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Archive,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  Clock,
  Key,
  Database,
  Search,
  Eye,
  Trash2,
  FileCheck,
  Terminal,
  Activity,
  Layers,
  Radio,
  FileDown
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";

interface VaultObject {
  id: string;
  key: string;
  bucket: string;
  sizeGB: number;
  wormMode: "COMPLIANCE" | "GOVERNANCE";
  lockExpiresAt: string;
  legalHold: boolean;
  sha256Seal: string;
  replicationStatus: "REPLICATED_US_EAST" | "REPLICATED_EU_WEST" | "SYNCING";
  lastVerified: string;
  tamperAttempts: number;
  status: "LOCKED_WORM" | "VERIFYING" | "ALERT_TAMPER";
}

const MOCK_VAULT_OBJECTS: VaultObject[] = [
  {
    id: "vlt-001",
    key: "cases/INC-2026-8841/memory/DC01_LiveRAM_0823.raw.enc",
    bucket: "s3://aegis-worm-vault-compliance-prod",
    sizeGB: 32.0,
    wormMode: "COMPLIANCE",
    lockExpiresAt: "2033-08-23T00:00:00Z (7 Years)",
    legalHold: true,
    sha256Seal: "8f74a9c39e2b64d1f2e87a649b109e2381ab924e5b721894b819f72bc9a04182",
    replicationStatus: "REPLICATED_US_EAST",
    lastVerified: "2026-08-24T00:10:00Z",
    tamperAttempts: 0,
    status: "LOCKED_WORM"
  },
  {
    id: "vlt-002",
    key: "cases/INC-2026-8841/disks/SQL-CLINICAL-01_BitStream.vmdk.enc",
    bucket: "s3://aegis-worm-vault-compliance-prod",
    sizeGB: 500.0,
    wormMode: "COMPLIANCE",
    lockExpiresAt: "2033-08-23T00:00:00Z (7 Years)",
    legalHold: true,
    sha256Seal: "3a92f810bc8749e19a4e872c01948ba981726a45bd0192847291a0bce8293741",
    replicationStatus: "REPLICATED_EU_WEST",
    lastVerified: "2026-08-24T00:05:00Z",
    tamperAttempts: 1,
    status: "LOCKED_WORM"
  },
  {
    id: "vlt-003",
    key: "cases/INC-2026-8841/pcap/Core_Switch_Egress_Tshark.pcap.zst",
    bucket: "s3://aegis-worm-vault-compliance-prod",
    sizeGB: 4.8,
    wormMode: "GOVERNANCE",
    lockExpiresAt: "2029-08-23T00:00:00Z (3 Years)",
    legalHold: false,
    sha256Seal: "d7a41982bfe9418294a081726b4819c9018472910abce8491028374619a84712",
    replicationStatus: "REPLICATED_US_EAST",
    lastVerified: "2026-08-23T23:50:00Z",
    tamperAttempts: 0,
    status: "LOCKED_WORM"
  },
  {
    id: "vlt-004",
    key: "cases/INC-2026-8841/notes/Ransom_Note_Payload_Telemetry.json",
    bucket: "s3://aegis-worm-vault-compliance-prod",
    sizeGB: 0.2,
    wormMode: "COMPLIANCE",
    lockExpiresAt: "2036-08-23T00:00:00Z (10 Years)",
    legalHold: true,
    sha256Seal: "1948bc8192a01e9284726190abce8492019481726a45b8192847102938475619",
    replicationStatus: "REPLICATED_EU_WEST",
    lastVerified: "2026-08-24T00:12:00Z",
    tamperAttempts: 0,
    status: "LOCKED_WORM"
  }
];

export default function VaultPage() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [vaultObjects, setVaultObjects] = useState<VaultObject[]>(MOCK_VAULT_OBJECTS);
  const [selectedObject, setSelectedObject] = useState<VaultObject>(MOCK_VAULT_OBJECTS[0]);
  const [tamperAlert, setTamperAlert] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [tamperLogs, setTamperLogs] = useState<string[]>([
    "[00:05:12 UTC] S3:GetObjectLockRetention invoked for SQL-CLINICAL-01. Mode: COMPLIANCE. Status: 200 OK",
    "[00:10:45 UTC] S3:PutObjectTagging verified across dual replication regions (us-east-1 / eu-west-1)"
  ]);

  const activeCase = MOCK_CASES.find((c) => c.id === selectedCaseId) || MOCK_CASES[0];

  const totalVaultSizeGB = vaultObjects.reduce((acc, curr) => acc + curr.sizeGB, 0);

  const simulateTamperAttack = () => {
    const victim = selectedObject;
    setTamperLogs((prev) => [
      `[!] ATTACK TRIGGERED: Simulating unauthorized s3:DeleteObject on '${victim.key}'...`,
      `[!] AWS S3 Object Lock Engine: Denied request (HTTP 403 AccessDenied - ObjectUnderRetentionException)`,
      `[!] Compliance Mode Violation Alert dispatched to CISO & SIEM telemetry stream.`,
      ...prev
    ]);

    setTamperAlert(`TAMPER ATTEMPT BLOCKED: S3 Object Lock in COMPLIANCE mode successfully rejected unauthorized deletion on ${victim.key}. Tamper seal intact.`);

    setVaultObjects((prev) =>
      prev.map((o) => (o.id === victim.id ? { ...o, tamperAttempts: o.tamperAttempts + 1, status: "ALERT_TAMPER" } : o))
    );

    setTimeout(() => {
      setVaultObjects((prev) =>
        prev.map((o) => (o.id === victim.id ? { ...o, status: "LOCKED_WORM" } : o))
      );
    }, 4000);
  };

  const handleVerifySeal = (id: string) => {
    setVerifyingId(id);
    setTimeout(() => {
      setVerifyingId(null);
      setTamperLogs((prev) => [
        `[+] SHA-256 bit-stream integrity verified on ${id}. Zero bit-rot detected. Match: 100%.`,
        ...prev
      ]);
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(14,21,38,0.95) 0%, rgba(22,32,56,0.95) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Archive size={18} color="#10b981" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.01em" }}>
              Immutable Evidence Vault & Cold Storage Locker
            </h1>
            <span className="badge-sev badge-success">Pillar 2: Analyze & Preserve</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 840, lineHeight: 1.5 }}>
            Write-Once-Read-Many (WORM) storage locker protected by AWS S3 Object Lock (Compliance Mode).
            Prevents deletion or overwrite by threat actors or rogue root administrators, with real-time tamper tripwires.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={simulateTamperAttack}
            className="btn-secondary"
            style={{
              borderColor: "rgba(244,63,94,0.4)",
              color: "#f43f5e",
              background: "rgba(244,63,94,0.12)"
            }}
          >
            <Trash2 size={14} />
            Simulate Deletion Attack
          </button>
        </div>
      </div>

      {tamperAlert && (
        <div style={{
          background: "rgba(244,63,94,0.15)",
          border: "1px solid #f43f5e",
          borderRadius: 8,
          padding: "12px 16px",
          color: "#f43f5e",
          fontSize: 12.5,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={16} />
            <span>{tamperAlert}</span>
          </div>
          <button
            onClick={() => setTamperAlert(null)}
            style={{ background: "none", border: "none", color: "#f43f5e", cursor: "pointer", fontWeight: 700 }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              WORM Lock Status
            </span>
            <Lock size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#10b981" }}>
            COMPLIANCE MODE
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Zero Admin Bypass Allowed
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Total Vaulted Storage
            </span>
            <Database size={15} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#06b6d4" }}>
            {totalVaultSizeGB.toFixed(1)} GB
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Across 4 Locked Archives
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Legal Hold Status
            </span>
            <ShieldCheck size={15} color="#a855f7" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#a855f7" }}>
            ACTIVE (DOJ / HIPAA)
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Retention: Minimum 7 Years
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Replication Health
            </span>
            <Radio size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>
            Dual Region Sync
          </div>
          <div style={{ fontSize: 11, color: "#10b981", marginTop: 4 }}>
            us-east-1 + eu-west-1 Active
          </div>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        {/* Left: Vault Inventory Table */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <HardDrive size={16} color="#06b6d4" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
                S3 WORM Locked Evidence Objects
              </h3>
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
              BUCKET: aegis-worm-vault-compliance-prod
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>S3 Object Key</th>
                  <th>Size</th>
                  <th>WORM Mode</th>
                  <th>Retention Until</th>
                  <th>Tamper Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vaultObjects.map((obj) => {
                  const isSelected = selectedObject.id === obj.id;
                  const isVerifying = verifyingId === obj.id;

                  return (
                    <tr
                      key={obj.id}
                      onClick={() => setSelectedObject(obj)}
                      style={{
                        background: isSelected ? "rgba(16,185,129,0.08)" : undefined,
                        cursor: "pointer"
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: isSelected ? "#10b981" : "#f8fafc", fontSize: 12 }}>
                          {obj.key.split("/").pop()}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {obj.key}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: 11, color: "var(--fg-2)" }}>{obj.sizeGB} GB</span>
                      </td>

                      <td>
                        <span className={`badge-sev ${obj.wormMode === "COMPLIANCE" ? "badge-critical" : "badge-medium"}`}>
                          {obj.wormMode}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>{obj.lockExpiresAt.split(" ")[0]}</span>
                      </td>

                      <td>
                        <span style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: obj.status === "ALERT_TAMPER" ? "#f43f5e" : "#10b981",
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}>
                          {obj.status === "ALERT_TAMPER" ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                          {obj.status === "ALERT_TAMPER" ? "ATTACK BLOCKED" : "INTACT"}
                        </span>
                      </td>

                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerifySeal(obj.id);
                          }}
                          className="btn-secondary"
                          style={{ fontSize: 10.5, padding: "3px 8px" }}
                        >
                          <RefreshCw size={11} className={isVerifying ? "animate-spin" : ""} />
                          Verify Seal
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Object Metadata & Retention Policy Configuration */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Selected Object Card */}
          <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Lock size={16} color="#10b981" />
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "#f8fafc" }}>
                  WORM Lock Configuration
                </h3>
              </div>
              <span className="badge-sev badge-success">
                {selectedObject.replicationStatus}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Object Path
                </span>
                <div style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "#06b6d4",
                  wordBreak: "break-all",
                  marginTop: 3
                }}>
                  {selectedObject.key}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Cryptographic SHA-256 Bit Seal
                </span>
                <div style={{
                  background: "#050811",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  fontSize: 10.5,
                  fontFamily: "monospace",
                  color: "#10b981",
                  wordBreak: "break-all",
                  marginTop: 3
                }}>
                  {selectedObject.sha256Seal}
                </div>
              </div>

              <div style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 8
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#f8fafc", textTransform: "uppercase" }}>
                  Immutability Policy Guarantees
                </span>
                <div style={{ fontSize: 11, color: "var(--fg-2)", lineHeight: 1.5 }}>
                  In <strong>COMPLIANCE</strong> mode, no AWS account root user, IAM role, or support engineer can delete or shorten the retention period before <code>{selectedObject.lockExpiresAt}</code>.
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Tamper Detection Stream */}
          <div className="card-tactical" style={{ padding: 18, background: "#050811" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Terminal size={14} color="#10b981" />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#f8fafc", fontFamily: "monospace" }}>
                  S3 OBJECT LOCK TAMPER AUDIT LOG
                </span>
              </div>
              <span className="badge-sev badge-success">ACTIVE MONITOR</span>
            </div>

            <div style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#10b981",
              lineHeight: 1.6,
              maxHeight: 120,
              overflowY: "auto"
            }}>
              {tamperLogs.map((log, idx) => (
                <div key={idx} style={{ color: log.includes("ATTACK") ? "#f43f5e" : log.includes("SUCCESS") ? "#10b981" : "#94a3b8" }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
