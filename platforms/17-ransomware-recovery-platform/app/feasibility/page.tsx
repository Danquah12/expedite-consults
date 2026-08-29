"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  HardDrive,
  RotateCcw,
  Key,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Sliders,
  TrendingUp,
  Cpu,
  Layers,
  FileCheck,
  Clock,
  DollarSign
} from "lucide-react";
import { MOCK_CASES, MOCK_BACKUP_SOURCES } from "@/data/recoveryData";

interface RecoveryAvenue {
  id: string;
  name: string;
  category: "BACKUP_RESTORE" | "SNAPSHOT_ROLLBACK" | "MEMORY_KEY_CARVE" | "DIRECT_DECRYPTION";
  feasibilityScorePct: number;
  dataIntegrityRating: "PERFECT_100" | "HIGH_95" | "MODERATE_75" | "LOW_PARTIAL";
  estimatedRTOHours: number;
  estimatedRPOHours: number;
  financialCostLevel: "LOW" | "MODERATE" | "HIGH";
  reinfectionRisk: "MINIMAL" | "MODERATE" | "HIGH";
  description: string;
  prerequisites: string[];
  keyRisks: string[];
  recommended: boolean;
}

const RECOVERY_AVENUES: RecoveryAvenue[] = [
  {
    id: "ave-1",
    name: "Immutable Cloud & Offsite Clean Backup Restore",
    category: "BACKUP_RESTORE",
    feasibilityScorePct: 98.5,
    dataIntegrityRating: "PERFECT_100",
    estimatedRTOHours: 6.2,
    estimatedRPOHours: 2.0,
    financialCostLevel: "LOW",
    reinfectionRisk: "MINIMAL",
    description: "Restore all 24 encrypted VM disk images from AWS S3 Object Lock vault (Snapshot taken 2 hours prior to attack).",
    prerequisites: ["Isolated VLAN quarantine sandbox active", "Double-roll KRBTGT identity reset"],
    keyRisks: ["2 hours of transactional data loss (RPO gap)", "Bandwidth egress transfer time (~6.2 hours)"],
    recommended: true
  },
  {
    id: "ave-2",
    name: "ZFS Storage SAN Snapshot Rollback",
    category: "SNAPSHOT_ROLLBACK",
    feasibilityScorePct: 72.0,
    dataIntegrityRating: "HIGH_95",
    estimatedRTOHours: 4.5,
    estimatedRPOHours: 6.0,
    financialCostLevel: "LOW",
    reinfectionRisk: "MODERATE",
    description: "Revert storage array LUNs to ZFS snapshot #20260823-0000. Fast restore, but potential persistence artifact retention.",
    prerequisites: ["Forensic disk clone preserved first", "Reinfection scanner verification"],
    keyRisks: ["Threat actor webshells may have been present in pre-encryption snapshot"],
    recommended: false
  },
  {
    id: "ave-3",
    name: "In-Memory Cryptographic Key Carving (Wanakiwi/Volatiliy)",
    category: "MEMORY_KEY_CARVE",
    feasibilityScorePct: 30.4,
    dataIntegrityRating: "PERFECT_100",
    estimatedRTOHours: 2.5,
    estimatedRPOHours: 0.0,
    financialCostLevel: "MODERATE",
    reinfectionRisk: "MINIMAL",
    description: "Extract ephemeral session keys directly from memory dumps captured prior to host power-down or process termination.",
    prerequisites: ["RAM capture uncorrupted", "Threat actor process PID maintained in active pool"],
    keyRisks: ["Low success probability if ransomware zeroed heap before exit"],
    recommended: false
  },
  {
    id: "ave-4",
    name: "Direct Algorithmic Flaw Decryption",
    category: "DIRECT_DECRYPTION",
    feasibilityScorePct: 15.0,
    dataIntegrityRating: "HIGH_95",
    estimatedRTOHours: 12.0,
    estimatedRPOHours: 0.0,
    financialCostLevel: "HIGH",
    reinfectionRisk: "MINIMAL",
    description: "Exploit cryptographic vulnerabilities (IV reuse or leaked private key leaks) using No More Ransom or Aegis DecryptIQ.",
    prerequisites: ["Known cryptographic implementation bug confirmed"],
    keyRisks: ["LockBit 3.0 uses sound Curve25519; algorithmic decryption unlikely without master key leak"],
    recommended: false
  }
];

export default function RecoveryFeasibilityPage() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [avenues, setAvenues] = useState<RecoveryAvenue[]>(RECOVERY_AVENUES);
  const [selectedAvenue, setSelectedAvenue] = useState<RecoveryAvenue>(RECOVERY_AVENUES[0]);

  // Decision Analysis Weights
  const [weightRTO, setWeightRTO] = useState(30);
  const [weightRPO, setWeightRPO] = useState(40);
  const [weightSafety, setWeightSafety] = useState(30);

  const activeCase = MOCK_CASES.find((c) => c.id === selectedCaseId) || MOCK_CASES[0];

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
              <Sparkles size={18} color="#10b981" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.01em" }}>
              Recovery Feasibility & Strategy Decision Engine
            </h1>
            <span className="badge-sev badge-success">Pillar 3: Recover & Orchestrate</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 840, lineHeight: 1.5 }}>
            Quantitatively benchmark all 4 potential recovery avenues: Clean Immutable Backups, Snapshot Rollbacks, In-Memory Key Carving, and Direct Decryptors.
            Automated MCDA algorithm selects the safest, lowest-data-loss path.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            background: "rgba(16,185,129,0.15)",
            border: "1px solid #10b981",
            borderRadius: 8,
            padding: "8px 14px",
            textAlign: "right"
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#10b981", textTransform: "uppercase" }}>
              Recommended Strategy
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
              IMMUTABLE BACKUP RESTORE
            </div>
          </div>
        </div>
      </div>

      {/* Top Benchmark KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Primary Path Feasibility
            </span>
            <TrendingUp size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#10b981" }}>
            98.5%
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Zero Bit-Rot / Immutability Verified
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Projected RTO
            </span>
            <Clock size={15} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#06b6d4" }}>
            6.2 Hours
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Full Restoral of 24 Core VMs
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Projected RPO Data Loss
            </span>
            <AlertTriangle size={15} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#f59e0b" }}>
            2.0 Hours
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            &lt; 0.1% Database Transaction Loss
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Reinfection Safety Score
            </span>
            <ShieldCheck size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#10b981" }}>
            99.9% Clean
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Isolated Sandbox Verification Mandated
          </div>
        </div>
      </div>

      {/* Main Grid: Comparative Avenue Cards & Strategy Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        {/* Left: 4 Recovery Avenues */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
              Evaluated Recovery Paths
            </h3>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              Ranked by Safety & Data Integrity
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {avenues.map((ave) => {
              const isSelected = selectedAvenue.id === ave.id;

              return (
                <div
                  key={ave.id}
                  onClick={() => setSelectedAvenue(ave)}
                  style={{
                    background: isSelected ? "var(--surface-3)" : "var(--surface-2)",
                    border: isSelected ? "1px solid var(--primary)" : ave.recommended ? "1px solid rgba(16,185,129,0.4)" : "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "16px 18px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 800, color: "#f8fafc", fontSize: 13.5 }}>
                          {ave.name}
                        </span>
                        {ave.recommended && (
                          <span className="badge-sev badge-success">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        Est. RTO: <strong style={{ color: "var(--fg-2)" }}>{ave.estimatedRTOHours}h</strong> · Data Loss (RPO): <strong style={{ color: "#f59e0b" }}>{ave.estimatedRPOHours}h</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: ave.feasibilityScorePct > 70 ? "#10b981" : ave.feasibilityScorePct > 30 ? "#f59e0b" : "#f43f5e" }}>
                        {ave.feasibilityScorePct}%
                      </div>
                      <div style={{ fontSize: 9.5, color: "var(--muted)", textTransform: "uppercase" }}>
                        Feasibility
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.45, margin: 0 }}>
                    {ave.description}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 8, fontSize: 10.5 }}>
                    <span style={{ color: "var(--muted)" }}>
                      Reinfection Risk: <strong style={{ color: ave.reinfectionRisk === "MINIMAL" ? "#10b981" : "#f59e0b" }}>{ave.reinfectionRisk}</strong>
                    </span>
                    <span style={{ color: "#06b6d4", display: "flex", alignItems: "center", gap: 4 }}>
                      Inspect Tactical Plan <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Strategy Deep Dive & Prerequisite Check */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div>
                <span className="badge-sev badge-success">
                  {selectedAvenue.category}
                </span>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", marginTop: 4 }}>
                  Tactical Execution Playbook
                </h3>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Mandatory Prerequisites */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Mandatory Operational Prerequisites
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                  {selectedAvenue.prerequisites.map((prereq, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "#f8fafc" }}>
                      <CheckCircle2 size={13} color="#10b981" />
                      <span>{prereq}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Residual Risks */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Residual Risks & Limitations
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                  {selectedAvenue.keyRisks.map((risk, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "#f59e0b" }}>
                      <AlertTriangle size={13} color="#f59e0b" />
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/recovery-planner"
                className="btn-primary"
                style={{ textDecoration: "none", justifyContent: "center", marginTop: 8 }}
              >
                Proceed to Master Plan Orchestrator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
