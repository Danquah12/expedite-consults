"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HardDrive,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  Database,
  Layers,
  Search,
  Filter,
  Flame,
  ArrowRight,
  FileCheck,
  Cpu,
  Activity,
  Download
} from "lucide-react";
import { MOCK_CASES, MOCK_BACKUP_SOURCES } from "@/data/recoveryData";
import { BackupReadinessSource } from "@/types/recovery";

export default function BackupAssessmentPage() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [sources, setSources] = useState<BackupReadinessSource[]>(MOCK_BACKUP_SOURCES);
  const [selectedSource, setSelectedSource] = useState<BackupReadinessSource>(MOCK_BACKUP_SOURCES[0]);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubProgress, setScrubProgress] = useState(0);
  const [scrubResults, setScrubResults] = useState<string[]>([]);

  const activeCase = MOCK_CASES.find((c) => c.id === selectedCaseId) || MOCK_CASES[0];

  const totalCapacityTB = sources.reduce((acc, curr) => acc + curr.totalCapacityTB, 0);
  const verifiedCleanCount = sources.filter((s) => s.integrityCheckStatus === "VERIFIED_CLEAN").length;

  const runDeepRepositoryScrub = () => {
    setIsScrubbing(true);
    setScrubProgress(0);
    setScrubResults([`[+] Initiating deep block-level integrity scrub on '${selectedSource.sourceName}'...`]);

    const interval = setInterval(() => {
      setScrubProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScrubbing(false);
          setScrubResults((logs) => [
            ...logs,
            "[+] ZFS/S3 Merkle Tree hash verification: 100% match.",
            "[+] Anti-ransomware canary scan: ZERO .lockbit / encrypted headers detected.",
            `[*] REPOSITORY CERTIFIED CLEAN: Recovery feasibility verified at ${selectedSource.recoveryFeasibilityPct}%.`
          ]);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
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
              <HardDrive size={18} color="#10b981" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.01em" }}>
              Backup Recovery & Snapshot Integrity Evaluator
            </h1>
            <span className="badge-sev badge-success">Pillar 3: Recover & Orchestrate</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 840, lineHeight: 1.5 }}>
            Audit and validate enterprise backup repositories across AWS S3 Object Lock, Air-Gapped LTO-8 Tapes, ZFS Snapshots, and VSS Shadow Copies.
            Detects ransomware tampering, verifies immutability seals, and computes precise RTO/RPO metrics.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={runDeepRepositoryScrub}
            disabled={isScrubbing}
            className="btn-primary"
          >
            <RefreshCw size={14} className={isScrubbing ? "animate-spin" : ""} />
            {isScrubbing ? `Scrubbing (${scrubProgress}%)...` : "Run Deep Integrity Scrub"}
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Cataloged Capacity
            </span>
            <Database size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc" }}>
            {totalCapacityTB.toFixed(1)} TB
          </div>
          <div style={{ fontSize: 11, color: "#10b981", marginTop: 4 }}>
            Across 4 Backup Repositories
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Clean Verified Repos
            </span>
            <ShieldCheck size={15} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#06b6d4" }}>
            {verifiedCleanCount} / {sources.length} Verified
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            1 Compromised (Local VSS)
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Best RPO Delta
            </span>
            <Clock size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981" }}>
            2.0 Hours
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            AWS S3 Object Lock Vault
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Restoration Speed
            </span>
            <Activity size={15} color="#a855f7" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#a855f7" }}>
            820 MB/s
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Dedicated 10GbE San Backbone
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        {/* Left: Backup Repositories List */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
              Backup Repositories & Snapshot Storage
            </h3>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              Sorted by Recovery Feasibility
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sources.map((src) => {
              const isSelected = selectedSource.id === src.id;
              const isClean = src.integrityCheckStatus === "VERIFIED_CLEAN";

              return (
                <div
                  key={src.id}
                  onClick={() => setSelectedSource(src)}
                  style={{
                    background: isSelected ? "var(--surface-3)" : "var(--surface-2)",
                    border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "14px 16px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, color: "#f8fafc", fontSize: 13 }}>
                          {src.sourceName}
                        </span>
                        <span className={`badge-sev ${isClean ? "badge-success" : "badge-critical"}`}>
                          {src.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        Capacity: <strong style={{ color: "var(--fg-2)" }}>{src.totalCapacityTB} TB</strong> · Last Snapshot: <span style={{ color: "#06b6d4" }}>{src.lastSnapshotTime}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: isClean ? "#10b981" : "#f43f5e" }}>
                        {src.recoveryFeasibilityPct}%
                      </div>
                      <div style={{ fontSize: 9.5, color: "var(--muted)", textTransform: "uppercase" }}>
                        Feasibility
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 6, fontSize: 10.5 }}>
                    <span style={{ color: "var(--muted)" }}>
                      RTO: <strong style={{ color: "var(--fg-2)" }}>{src.estimatedRTOHours}h</strong> | RPO: <strong style={{ color: "#f59e0b" }}>{src.estimatedRPOHours}h</strong>
                    </span>
                    <span style={{ color: isClean ? "#10b981" : "#f43f5e", fontWeight: 700 }}>
                      {src.integrityCheckStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Repository Deep Inspector & Scrub Console */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Selected Repository Card */}
          <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div>
                <span className="badge-sev badge-success">
                  {selectedSource.isolationStatus.replace(/_/g, " ")}
                </span>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", marginTop: 4 }}>
                  {selectedSource.sourceName}
                </h3>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                    Total Capacity
                  </span>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>
                    {selectedSource.totalCapacityTB} TB
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                    Integrity Status
                  </span>
                  <div style={{ fontSize: 12, fontWeight: 700, color: selectedSource.integrityCheckStatus === "VERIFIED_CLEAN" ? "#10b981" : "#f43f5e", marginTop: 2 }}>
                    {selectedSource.integrityCheckStatus}
                  </div>
                </div>
              </div>

              {/* Progress Bar during scrub */}
              {isScrubbing && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: "var(--muted)" }}>Scrubbing Blocks:</span>
                    <span style={{ color: "#10b981", fontWeight: 700 }}>{scrubProgress}%</span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${scrubProgress}%`, height: "100%", background: "#10b981", transition: "width 0.3s ease" }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Deep Scrub Audit Console */}
          <div className="card-tactical" style={{ padding: 18, background: "#050811" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Cpu size={14} color="#10b981" />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#f8fafc", fontFamily: "monospace" }}>
                  INTEGRITY AUDIT SCRUB LOG
                </span>
              </div>
            </div>

            <div style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#10b981",
              lineHeight: 1.6,
              maxHeight: 120,
              overflowY: "auto"
            }}>
              {scrubResults.length === 0 ? (
                <div style={{ color: "var(--muted)" }}>
                  &gt; Click &quot;Run Deep Integrity Scrub&quot; to perform bit-level SHA-256 and canary checks on selected storage.
                </div>
              ) : (
                scrubResults.map((res, idx) => (
                  <div key={idx}>{res}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
