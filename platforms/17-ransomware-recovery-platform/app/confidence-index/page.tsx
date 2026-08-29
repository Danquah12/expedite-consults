"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Shield,
  ShieldCheck,
  ShieldAlert,
  HardDrive,
  Database,
  Key,
  Flame,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Download,
  Sparkles,
  RefreshCw,
  Sliders,
  Play,
  RotateCcw,
  CheckSquare,
  Award,
  Layers,
  ArrowRight
} from "lucide-react";
import { MOCK_CASES, MOCK_BACKUP_SOURCES } from "@/data/recoveryData";

interface RCIDimension {
  key: string;
  name: string;
  category: "AVAILABILITY" | "INTEGRITY" | "FRESHNESS" | "ERADICATION" | "IDENTITY" | "REINFECTION";
  score: number; // 0-100
  weight: number; // 0.15 - 0.20
  baselineBenchmark: number;
  description: string;
  auditMetrics: { label: string; value: string; pass: boolean }[];
  color: string;
}

interface ScenarioSimulation {
  id: string;
  title: string;
  description: string;
  dimensionKey: string;
  deltaScore: number;
  applied: boolean;
  category: "IDENTITY" | "BACKUP" | "CONTAINMENT" | "DECRYPTION" | "FORENSICS";
}

interface GapRemediationItem {
  id: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  title: string;
  dimensionName: string;
  potentialBoost: number;
  effortHours: number;
  owner: string;
  status: "ACTION_REQUIRED" | "IN_PROGRESS" | "RESOLVED";
}

const DEFAULT_DIMENSIONS: RCIDimension[] = [
  {
    key: "availability",
    name: "Data Availability & Reachability",
    category: "AVAILABILITY",
    score: 90,
    weight: 0.20,
    baselineBenchmark: 85,
    description: "Evaluates the proportion of operational volumes and databases with accessible snapshot images.",
    auditMetrics: [
      { label: "Storage Volumes with Online Images", value: "24 of 24 (100%)", pass: true },
      { label: "Storage Throughput to IRE", value: "1.2 GB/s NVMe Fabric", pass: true },
      { label: "Cold Archive Retrieve Delay", value: "< 2 hours", pass: true }
    ],
    color: "var(--primary)"
  },
  {
    key: "integrity",
    name: "Backup Integrity & Immutability",
    category: "INTEGRITY",
    score: 95,
    weight: 0.20,
    baselineBenchmark: 90,
    description: "Evaluates cryptographic WORM compliance, SHA-256 Merkle tree verification, and airgap preservation.",
    auditMetrics: [
      { label: "AWS S3 Object Lock Compliance", value: "Locked (Strict Mode)", pass: true },
      { label: "SHA-256 Merkle Tree Match", value: "100% Zero Bit Corruption", pass: true },
      { label: "Tape Airgap Integrity", value: "LTO-8 WORM Verified", pass: true }
    ],
    color: "var(--primary)"
  },
  {
    key: "freshness",
    name: "Backup Freshness & RPO Alignment",
    category: "FRESHNESS",
    score: 75,
    weight: 0.15,
    baselineBenchmark: 80,
    description: "Measures age of newest clean snapshot relative to pre-infection intrusion delta (RPO delta).",
    auditMetrics: [
      { label: "Snapshot Timestamp Delta", value: "2 hours prior to attack", pass: true },
      { label: "Estimated Transaction Loss", value: "1.8% of daily delta", pass: false },
      { label: "Transactional Log Replay", value: "Available in IRE", pass: true }
    ],
    color: "var(--amber)"
  },
  {
    key: "eradication",
    name: "Malware & Tooling Eradication",
    category: "ERADICATION",
    score: 80,
    weight: 0.15,
    baselineBenchmark: 85,
    description: "Confidence that threat actor stagers, webshells, and encryption binaries are fully eliminated.",
    auditMetrics: [
      { label: "YARA Rule Memory Sweeps", value: "0 Malicious Detections", pass: true },
      { label: "Known C2 Domains Sinkholed", value: "14 of 14 Blocked", pass: true },
      { label: "Dormant Scheduled Tasks", value: "1 Pending Verification", pass: false }
    ],
    color: "var(--cyan)"
  },
  {
    key: "identity",
    name: "Identity & AD Forest Resilience",
    category: "IDENTITY",
    score: 70,
    weight: 0.15,
    baselineBenchmark: 80,
    description: "Active Directory forest health, Kerberos KRBTGT integrity, and privileged account security posture.",
    auditMetrics: [
      { label: "KRBTGT Password Double-Roll", value: "Completed (2x 10h gap)", pass: true },
      { label: "Staged Compromised Accounts", value: "svc_backup_mgmt removed", pass: true },
      { label: "LAPS Re-keying Across Endpoints", value: "72% Completed", pass: false }
    ],
    color: "var(--amber)"
  },
  {
    key: "reinfection",
    name: "Reinfection Risk Resistance",
    category: "REINFECTION",
    score: 68,
    weight: 0.15,
    baselineBenchmark: 75,
    description: "Egress firewall filtering, tripwire canary defenses, and kernel integrity protection before reconnect.",
    auditMetrics: [
      { label: "Canary Tripwire Coverage", value: "85% of Restored Hosts", pass: true },
      { label: "Kernel EDR Micro-Telemetry", value: "Active on 24 VMs", pass: true },
      { label: "Perimeter Diode Egress Lock", value: "Active (0 B/s)", pass: true }
    ],
    color: "var(--rose)"
  }
];

const INITIAL_SCENARIOS: ScenarioSimulation[] = [
  {
    id: "scen-1",
    title: "Double-Roll Active Directory KRBTGT & Purge Compromised Accounts",
    description: "Invalidates all forged Golden/Silver Tickets across the forest.",
    dimensionKey: "identity",
    deltaScore: 18,
    applied: false,
    category: "IDENTITY"
  },
  {
    id: "scen-2",
    title: "Complete DBCC CHECKDB Consistency Validation on SQL-CLINICAL",
    description: "Validates 100% logical table consistency on restored database files.",
    dimensionKey: "freshness",
    deltaScore: 15,
    applied: false,
    category: "BACKUP"
  },
  {
    id: "scen-3",
    title: "Deploy Aegis Canary Tripwires & 24h Zero-Hit Observation",
    description: "Proves that dormant rootkits or logic bombs are not triggering in background.",
    dimensionKey: "reinfection",
    deltaScore: 22,
    applied: false,
    category: "FORENSICS"
  },
  {
    id: "scen-4",
    title: "Simulate Partial Backup Tape Sector Degradation (-15% Availability)",
    description: "Chaos drill: 2 offsite tape reels report CRC checksum mismatch.",
    dimensionKey: "availability",
    deltaScore: -20,
    applied: false,
    category: "BACKUP"
  }
];

const INITIAL_GAP_REMEDIATIONS: GapRemediationItem[] = [
  {
    id: "gap-01",
    priority: "CRITICAL",
    title: "Complete enterprise-wide LAPS password regeneration on all restored Tier-1 servers",
    dimensionName: "Identity Resilience",
    potentialBoost: 4.5,
    effortHours: 1.5,
    owner: "SecOps Lead",
    status: "ACTION_REQUIRED"
  },
  {
    id: "gap-02",
    priority: "HIGH",
    title: "Deploy 100% canary decoy files to all clinical EHR file shares before production reconnect",
    dimensionName: "Reinfection Risk",
    potentialBoost: 3.8,
    effortHours: 2.0,
    owner: "DFIR Lead",
    status: "IN_PROGRESS"
  },
  {
    id: "gap-03",
    priority: "MEDIUM",
    title: "Execute automated database page parity check across secondary SQL replicas",
    dimensionName: "Backup Freshness",
    potentialBoost: 2.2,
    effortHours: 1.0,
    owner: "DBA Team Lead",
    status: "ACTION_REQUIRED"
  }
];

export default function ConfidenceIndexPage() {
  const [dimensions, setDimensions] = useState<RCIDimension[]>(DEFAULT_DIMENSIONS);
  const [scenarios, setScenarios] = useState<ScenarioSimulation[]>(INITIAL_SCENARIOS);
  const [remediations, setRemediations] = useState<GapRemediationItem[]>(INITIAL_GAP_REMEDIATIONS);
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [reportExported, setReportExported] = useState(false);

  // Compute Master RCI
  const calculateOverallRCI = () => {
    let totalScore = 0;
    dimensions.forEach((dim) => {
      // Find scenarios affecting this dimension
      const appliedDeltas = scenarios
        .filter((s) => s.applied && s.dimensionKey === dim.key)
        .reduce((sum, s) => sum + s.deltaScore, 0);
      const effectiveScore = Math.min(100, Math.max(0, dim.score + appliedDeltas));
      totalScore += effectiveScore * dim.weight;
    });
    return Math.round(totalScore * 10) / 10;
  };

  const currentRCI = calculateOverallRCI();

  const getRCIGrade = (score: number) => {
    if (score >= 93) return { grade: "A+", label: "Optimal Recovery Posture", color: "var(--primary)" };
    if (score >= 85) return { grade: "A", label: "Highly Confident Recovery", color: "var(--primary)" };
    if (score >= 75) return { grade: "B+", label: "Adequate Recovery Readiness", color: "var(--cyan)" };
    if (score >= 65) return { grade: "C", label: "Moderate Risk Exposure", color: "var(--amber)" };
    return { grade: "D/F", label: "Critical Recovery Deficit", color: "var(--rose)" };
  };

  const gradeInfo = getRCIGrade(currentRCI);

  const toggleScenario = (scenarioId: string) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === scenarioId ? { ...s, applied: !s.applied } : s))
    );
  };

  const handleResolveGap = (gapId: string) => {
    setRemediations((prev) =>
      prev.map((g) => (g.id === gapId ? { ...g, status: "RESOLVED" } : g))
    );
  };

  const handleExportExecutiveReport = () => {
    setReportExported(true);
    setTimeout(() => setReportExported(false), 4000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid var(--border)",
          paddingBottom: 16
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: 4,
                background: "rgba(16, 185, 129, 0.15)",
                color: "var(--primary)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.08em"
              }}
            >
              Stage 8: GOVERN, LEARN & DISCLOSE
            </span>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>•</span>
            <span style={{ fontSize: 12, color: "var(--cyan)", fontWeight: 600 }}>
              Signature Recovery Governance Metric
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: 10 }}>
            <TrendingUp size={24} color="var(--primary)" />
            Recovery Confidence Index (RCI) Calculator
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 850 }}>
            Signature multi-dimensional scoring engine (0–100) combining Data Availability (90), Backup Integrity (95), Backup Freshness (75), Malware Eradication (80), Identity Resilience (70), and Reinfection Risk (68) with dynamic crisis scenario modeling.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            style={{
              background: "var(--surface-2)",
              color: "var(--fg)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              outline: "none"
            }}
          >
            {MOCK_CASES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} - {c.organization}
              </option>
            ))}
          </select>

          <button onClick={handleExportExecutiveReport} className="btn-primary">
            <Download size={14} />
            {reportExported ? "Executive Brief Exported!" : "Export Executive Scorecard"}
          </button>
        </div>
      </div>

      {/* Master Scoreboard & Executive Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
        {/* Left: Master Gauge Card */}
        <div
          className="card-tactical"
          style={{
            padding: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            background: "linear-gradient(180deg, var(--surface-2) 0%, var(--surface) 100%)",
            border: `1px solid ${gradeInfo.color}`
          }}
        >
          <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            OVERALL RECOVERY CONFIDENCE INDEX
          </span>

          <div style={{ position: "relative", margin: "16px 0" }}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                border: `6px solid ${gradeInfo.color}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 30px ${gradeInfo.color}33`
              }}
            >
              <div style={{ fontSize: 38, fontWeight: 900, color: "var(--fg)", lineHeight: 1 }}>
                {currentRCI}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, marginTop: 4 }}>
                OUT OF 100
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: gradeInfo.color,
              padding: "4px 14px",
              borderRadius: 20,
              background: "var(--surface-3)",
              border: "1px solid var(--border)"
            }}
          >
            GRADE {gradeInfo.grade} — {gradeInfo.label}
          </div>

          <div style={{ fontSize: 11.5, color: "var(--fg-2)", marginTop: 12, lineHeight: 1.4 }}>
            Aggregated across 6 weighted resilience dimensions and real-time forensic verifications.
          </div>
        </div>

        {/* Right: Executive Board KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <div className="card-tactical" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>RTO ESTIMATE ACCURACY</span>
              <Sparkles size={16} color="var(--primary)" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--primary)" }}>94.2%</div>
            <div style={{ fontSize: 11.5, color: "var(--fg-2)", marginTop: 4 }}>
              Expected recovery in <strong>6.2 Hours</strong> vs 18.5h SLA
            </div>
          </div>

          <div className="card-tactical" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>FINANCIAL DOWNTIME MITIGATED</span>
              <Award size={16} color="var(--cyan)" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--cyan)" }}>$1,420,000</div>
            <div style={{ fontSize: 11.5, color: "var(--fg-2)", marginTop: 4 }}>
              Direct operational loss avoided through clean restore
            </div>
          </div>

          <div className="card-tactical" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>CYBER INSURANCE PAYOUT FIT</span>
              <ShieldCheck size={16} color="var(--purple)" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--purple)" }}>98.6%</div>
            <div style={{ fontSize: 11.5, color: "var(--fg-2)", marginTop: 4 }}>
              Zero policy exclusions triggered (WORM verified)
            </div>
          </div>

          {/* Crisis Scenario Simulator Bar */}
          <div className="card-tactical" style={{ gridColumn: "span 3", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: 6 }}>
                <Sliders size={14} color="var(--cyan)" />
                Dynamic Crisis Scenario Simulator (&quot;What-If&quot; Stress Testing)
              </h3>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>Click pills to toggle scenario deltas</span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {scenarios.map((scen) => {
                const isPositive = scen.deltaScore > 0;
                return (
                  <button
                    key={scen.id}
                    onClick={() => toggleScenario(scen.id)}
                    style={{
                      background: scen.applied
                        ? isPositive
                          ? "rgba(16, 185, 129, 0.2)"
                          : "rgba(244, 63, 94, 0.2)"
                        : "var(--surface-2)",
                      border: scen.applied
                        ? `1px solid ${isPositive ? "var(--primary)" : "var(--rose)"}`
                        : "1px solid var(--border)",
                      color: scen.applied
                        ? isPositive
                          ? "var(--primary)"
                          : "var(--rose)"
                        : "var(--fg-2)",
                      borderRadius: 6,
                      padding: "8px 12px",
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.15s ease"
                    }}
                  >
                    <span>{isPositive ? `+${scen.deltaScore}` : scen.deltaScore} RCI</span>
                    <span>{scen.title}</span>
                    {scen.applied ? <CheckCircle2 size={13} /> : <Play size={11} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Multi-Dimensional Scoring Cards */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
            6 Signature Resilience Dimensions
          </h3>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            Weighted mathematical formula: Score = Σ (Dimension_Score × Weight)
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {dimensions.map((dim) => {
            const appliedDeltas = scenarios
              .filter((s) => s.applied && s.dimensionKey === dim.key)
              .reduce((sum, s) => sum + s.deltaScore, 0);
            const effectiveScore = Math.min(100, Math.max(0, dim.score + appliedDeltas));

            return (
              <div key={dim.key} className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>{dim.name}</h4>
                    <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>
                      Weight: {(dim.weight * 100).toFixed(0)}% • Benchmark: {dim.baselineBenchmark}
                    </span>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: effectiveScore >= 80 ? "var(--primary)" : effectiveScore >= 70 ? "var(--amber)" : "var(--rose)" }}>
                      {effectiveScore} <span style={{ fontSize: 11, color: "var(--muted)" }}>/ 100</span>
                    </div>
                    {appliedDeltas !== 0 && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: appliedDeltas > 0 ? "var(--primary)" : "var(--rose)" }}>
                        {appliedDeltas > 0 ? `+${appliedDeltas}` : appliedDeltas} simulated
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${effectiveScore}%`,
                      height: "100%",
                      background: effectiveScore >= 80 ? "var(--primary)" : effectiveScore >= 70 ? "var(--amber)" : "var(--rose)",
                      transition: "width 0.3s ease"
                    }}
                  />
                </div>

                <p style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.4 }}>
                  {dim.description}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "var(--surface-2)", padding: 10, borderRadius: 6, fontSize: 11 }}>
                  {dim.auditMetrics.map((met, mIdx) => (
                    <div key={mIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--muted)" }}>{met.label}:</span>
                      <span style={{ fontWeight: 700, color: met.pass ? "var(--primary)" : "var(--rose)" }}>
                        {met.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Gap Remediations Table */}
      <div className="card-tactical" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
              High-Impact Remediation Actions (Path to 95+ RCI)
            </h3>
            <p style={{ fontSize: 12, color: "var(--muted)" }}>
              Executing these prioritized security and operational measures directly elevates executive confidence.
            </p>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>PRIORITY</th>
              <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>RECOMMENDED REMEDIATION</th>
              <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>DIMENSION</th>
              <th style={{ textAlign: "center", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>POTENTIAL BOOST</th>
              <th style={{ textAlign: "center", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>STATUS</th>
              <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--muted)", fontWeight: 700 }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {remediations.map((gap) => (
              <tr key={gap.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "10px 12px" }}>
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: gap.priority === "CRITICAL" ? "rgba(244, 63, 94, 0.15)" : "rgba(245, 158, 11, 0.15)",
                      color: gap.priority === "CRITICAL" ? "var(--rose)" : "var(--amber)",
                      border: "1px solid var(--border)"
                    }}
                  >
                    {gap.priority}
                  </span>
                </td>
                <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--fg)" }}>
                  {gap.title}
                </td>
                <td style={{ padding: "10px 12px", color: "var(--cyan)", fontWeight: 600 }}>
                  {gap.dimensionName}
                </td>
                <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 800, color: "var(--primary)" }}>
                  +{gap.potentialBoost} RCI
                </td>
                <td style={{ padding: "10px 12px", textAlign: "center" }}>
                  <span style={{ fontSize: 10, color: gap.status === "RESOLVED" ? "var(--primary)" : "var(--muted)", fontWeight: 700 }}>
                    {gap.status.replace("_", " ")}
                  </span>
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                  {gap.status !== "RESOLVED" && (
                    <button
                      onClick={() => handleResolveGap(gap.id)}
                      className="btn-secondary"
                      style={{ padding: "4px 8px", fontSize: 10 }}
                    >
                      Execute Fix
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
