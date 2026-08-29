"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ListOrdered,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  Sliders,
  Play,
  RotateCcw,
  ArrowRight,
  Database,
  HardDrive,
  Key,
  Layers,
  FileCheck,
  Award,
  Zap,
  TrendingUp,
  Info
} from "lucide-react";
import { MOCK_CASES, MOCK_BACKUP_SOURCES } from "@/data/recoveryData";

export interface RecoveryStrategy {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  successProbabilityPct: number;
  timeHours: number;
  costUSD: number;
  dataIntegrityScorePct: number;
  reinfectionRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  rpoHours: number;
  dataLossEstPct: number;
  legalRisk: "MINIMAL" | "LOW" | "MODERATE" | "HIGH";
  pros: string[];
  cons: string[];
  prerequisites: string[];
  fallbackTrigger: string;
}

const STRATEGIES: RecoveryStrategy[] = [
  {
    id: "strat-1",
    name: "Strategy 1: Clean Immutable Backup Restoration",
    badge: "RECOMMENDED (PRIMARY)",
    tagline: "Cryptographically verified restore from AWS S3 Object Lock and ZFS immutable snapshots.",
    successProbabilityPct: 98.5,
    timeHours: 18.5,
    costUSD: 120000,
    dataIntegrityScorePct: 99.8,
    reinfectionRisk: "LOW",
    rpoHours: 2.0,
    dataLossEstPct: 0.1,
    legalRisk: "MINIMAL",
    pros: [
      "100% immune to ransomware threat actor double-cross or key bugs",
      "Cryptographically sealed against reinfection via isolated sandbox staging",
      "Complies with all SEC, HIPAA, and cyber insurance claims requirements",
      "Full forensic integrity preserved for law enforcement discovery"
    ],
    cons: [
      "Requires 18.5 hours total time for 24 VMs (approx. $145k/hr business downtime)",
      "High storage I/O compute bandwidth required during mass restore"
    ],
    prerequisites: [
      "Verified AWS S3 Object Lock snapshot hash (Snapshot 04:00 UTC)",
      "Clean AD DC01 quarantine forest rebuild completed",
      "Dual-custody authorization from Incident Commander & CISO"
    ],
    fallbackTrigger: "If S3 download bandwidth drops below 1.2 GB/s, pivot to Strategy 3."
  },
  {
    id: "strat-2",
    name: "Strategy 2: Valid Decryptor Tool & Negotiation",
    badge: "HIGH RISK / CONTINGENCY",
    tagline: "Procuring threat actor private key or public decryptor executable to reverse ChaCha20 cipher in-place.",
    successProbabilityPct: 15.0,
    timeHours: 4.0,
    costUSD: 1810000, // Includes ransom demand + legal escrow
    dataIntegrityScorePct: 62.0,
    reinfectionRisk: "CRITICAL",
    rpoHours: 0.0,
    dataLossEstPct: 28.5,
    legalRisk: "HIGH",
    pros: [
      "Fastest potential turnaround (4 hours runtime) if decryptor binary functions correctly",
      "Zero RPO snapshot rollback window (theoretically zero transaction delta)"
    ],
    cons: [
      "85% failure rate due to known LockBit 3.0 file header truncation bugs",
      "OFAC sanction violation liability if threat actor is affiliated with sanctioned entities",
      "Dormant persistence webshells & backdoors remain untouched in the OS",
      "Encourages repeat extortion targeting"
    ],
    prerequisites: [
      "OFAC Treasury sanctions compliance clearance from legal counsel",
      "Isolated VM sandbox testing of decryptor binary against canary files",
      "Board of Directors unanimous emergency vote"
    ],
    fallbackTrigger: "If test decryption corrupts > 2% of sample files, immediately abort to Strategy 1."
  },
  {
    id: "strat-3",
    name: "Strategy 3: Partial Recovery / Critical Tiers Only",
    badge: "FAST COMPROMISE",
    tagline: "Prioritized rapid spin-up of Tier-0 EHR and emergency care services; deferring back-office tiers.",
    successProbabilityPct: 85.0,
    timeHours: 8.0,
    costUSD: 65000,
    dataIntegrityScorePct: 88.0,
    reinfectionRisk: "MEDIUM",
    rpoHours: 4.5,
    dataLossEstPct: 5.0,
    legalRisk: "LOW",
    pros: [
      "Restores core patient life-safety and EHR systems in just 8.0 hours",
      "Significantly cuts cumulative operational downtime costs by $1.5M+",
      "Allows IT ops to focus 100% bandwidth on top 6 critical VMs"
    ],
    cons: [
      "Secondary systems (Billing, BI Analytics, Archive PACS) remain offline for 48+ hours",
      "Manual batch record reconciliation required post-recovery"
    ],
    prerequisites: [
      "Clinical Director approval for emergency paper chart backup mode",
      "Dedicated bandwidth reservation for Epic EHR SQL cluster"
    ],
    fallbackTrigger: "If Tier-0 dependencies fail consistency checks, expand to Strategy 1."
  },
  {
    id: "strat-4",
    name: "Strategy 4: Hybrid Rebuild & Standby Cloud Enclave",
    badge: "HYBRID ACCELERATION",
    tagline: "Deploying pre-hardened golden image templates in AWS cloud pilot-light, hydrating data from S3.",
    successProbabilityPct: 94.0,
    timeHours: 11.0,
    costUSD: 85000,
    dataIntegrityScorePct: 96.5,
    reinfectionRisk: "LOW",
    rpoHours: 1.5,
    dataLossEstPct: 0.5,
    legalRisk: "MINIMAL",
    pros: [
      "Bypasses contaminated on-premises Hyper-V hosts completely",
      "100% clean OS baseline guaranteed with 0 legacy rootkits",
      "Fast 11.0 hours cloud cutover with scalable compute power"
    ],
    cons: [
      "Requires temporary DNS redirect and hybrid network tunnel re-routing",
      "Higher cloud surge compute operational costs"
    ],
    prerequisites: [
      "AWS Landing Zone with pre-warmed VPC and DirectConnect link",
      "Terraform golden image pipelines pre-approved"
    ],
    fallbackTrigger: "If cloud bandwidth saturates on-prem VPN, fallback to on-prem S3 restore."
  }
];

export default function RecoveryMatrixPage() {
  // Ranking Criteria Weights (0 - 100)
  const [weights, setWeights] = useState({
    successWeight: 40,
    speedWeight: 25,
    costWeight: 15,
    integrityWeight: 20,
  });

  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("strat-1");
  const [authorizedStrategyId, setAuthorizedStrategyId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Compute Ranking Scores dynamically
  const rankedStrategies = useMemo(() => {
    const totalWeight = weights.successWeight + weights.speedWeight + weights.costWeight + weights.integrityWeight || 1;

    return STRATEGIES.map((strat) => {
      const normSuccess = strat.successProbabilityPct / 100;
      const normSpeed = Math.max(0, 1 - (strat.timeHours / 24)); // faster = higher score
      const normCost = Math.max(0, 1 - (strat.costUSD / 2000000)); // cheaper = higher score
      const normIntegrity = strat.dataIntegrityScorePct / 100;

      const score = (
        (normSuccess * weights.successWeight) +
        (normSpeed * weights.speedWeight) +
        (normCost * weights.costWeight) +
        (normIntegrity * weights.integrityWeight)
      ) / totalWeight * 100;

      return {
        ...strat,
        score: Math.round(score * 10) / 10
      };
    }).sort((a, b) => b.score - a.score);
  }, [weights]);

  const activeStrategy = STRATEGIES.find((s) => s.id === selectedStrategyId) || STRATEGIES[0];

  const handleAuthorize = () => {
    setAuthorizedStrategyId(selectedStrategyId);
    setShowAuthModal(false);
  };

  const resetWeights = () => {
    setWeights({
      successWeight: 40,
      speedWeight: 25,
      costWeight: 15,
      integrityWeight: 20,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Banner Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.05) 50%, rgba(14,21,38,0.95) 100%)",
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
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.4)",
              borderRadius: 8,
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <ListOrdered size={18} color="var(--primary)" />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--primary)", letterSpacing: "0.08em" }}>
                STAGE 6: RECOVERY STRATEGY ENGINE
              </span>
            </div>
            <span className="badge-sev badge-success">MULTI-CRITERIA DECISION MATRIX</span>
            <span className="badge-sev badge-medium">4 STRATEGY PATHWAYS</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", marginBottom: 6 }}>
            Recovery Strategy Decision Matrix & Multi-Path Optimization Engine
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 840, lineHeight: 1.5 }}>
            Mathematical multi-criteria ranking model evaluating Success Probability, Recovery Time (RTO), Operational Financial Cost, and Data Integrity. Dynamically adjust weights to identify the optimal incident remediation path.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setShowAuthModal(true)}
            className="btn-primary"
            style={{ padding: "10px 18px", fontSize: 13 }}
          >
            <ShieldCheck size={16} />
            Authorize & Execute Active Strategy
          </button>
        </div>
      </div>

      {/* Authorized Strategy Confirmation Banner (if set) */}
      {authorizedStrategyId && (
        <div style={{
          background: "rgba(16,185,129,0.15)",
          border: "1.5px solid var(--primary)",
          borderRadius: 8,
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={20} color="var(--primary)" />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--fg)" }}>
                Active Authorized Strategy: {STRATEGIES.find((s) => s.id === authorizedStrategyId)?.name}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--fg-2)" }}>
                Cryptographic dual-custody authorization signed. Dispatching orchestrator tasks to isolated staging enclave.
              </div>
            </div>
          </div>
          <Link href="/recovery-planner" className="btn-secondary" style={{ fontSize: 12, textDecoration: "none" }}>
            View Live Orchestration Plan ➔
          </Link>
        </div>
      )}

      {/* Weight Customization Sliders Bar */}
      <div className="card-tactical" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sliders size={17} color="var(--primary)" />
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>
              Multi-Criteria Ranking Formula Weight Configuration
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
              SCORE = (P_success × w₁) + (Speed × w₂) + (Cost × w₃) + (Integrity × w₄)
            </span>
            <button
              onClick={resetWeights}
              style={{ background: "transparent", border: "none", color: "var(--cyan)", fontSize: 11, cursor: "pointer", fontWeight: 700 }}
            >
              Reset Defaults
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "var(--fg-2)", fontWeight: 600 }}>Success Probability Weight</span>
              <span style={{ fontWeight: 800, color: "var(--primary)" }}>{weights.successWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.successWeight}
              onChange={(e) => setWeights((prev) => ({ ...prev, successWeight: Number(e.target.value) }))}
              style={{ width: "100%", accentColor: "var(--primary)", cursor: "pointer" }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "var(--fg-2)", fontWeight: 600 }}>Time / RTO Urgency Weight</span>
              <span style={{ fontWeight: 800, color: "var(--cyan)" }}>{weights.speedWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.speedWeight}
              onChange={(e) => setWeights((prev) => ({ ...prev, speedWeight: Number(e.target.value) }))}
              style={{ width: "100%", accentColor: "var(--cyan)", cursor: "pointer" }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "var(--fg-2)", fontWeight: 600 }}>Cost Limit & Budget Weight</span>
              <span style={{ fontWeight: 800, color: "var(--amber)" }}>{weights.costWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.costWeight}
              onChange={(e) => setWeights((prev) => ({ ...prev, costWeight: Number(e.target.value) }))}
              style={{ width: "100%", accentColor: "var(--amber)", cursor: "pointer" }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "var(--fg-2)", fontWeight: 600 }}>Data Integrity & Compliance Weight</span>
              <span style={{ fontWeight: 800, color: "var(--purple)" }}>{weights.integrityWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.integrityWeight}
              onChange={(e) => setWeights((prev) => ({ ...prev, integrityWeight: Number(e.target.value) }))}
              style={{ width: "100%", accentColor: "var(--purple)", cursor: "pointer" }}
            />
          </div>
        </div>
      </div>

      {/* Strategies Ranked Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {rankedStrategies.map((strat, rankIdx) => {
          const isSelected = selectedStrategyId === strat.id;
          const isRankOne = rankIdx === 0;

          return (
            <div
              key={strat.id}
              onClick={() => setSelectedStrategyId(strat.id)}
              className="card-tactical"
              style={{
                padding: 18,
                cursor: "pointer",
                border: isSelected
                  ? "2px solid var(--primary)"
                  : isRankOne
                  ? "1.5px solid rgba(16,185,129,0.5)"
                  : "1px solid var(--border)",
                background: isSelected ? "rgba(16,185,129,0.08)" : "var(--surface)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                boxShadow: isSelected ? "0 0 20px rgba(16,185,129,0.15)" : "none"
              }}
            >
              {/* Header Badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: isRankOne ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)",
                  color: isRankOne ? "var(--primary)" : "var(--fg-2)",
                  border: isRankOne ? "1px solid var(--primary)" : "1px solid var(--border)",
                  fontFamily: "monospace"
                }}>
                  RANK #{rankIdx + 1} • {isRankOne ? "TOP RECOMMENDATION" : "ALTERNATIVE"}
                </div>

                <div style={{ fontSize: 18, fontWeight: 900, color: isRankOne ? "var(--primary)" : "var(--cyan)" }}>
                  {strat.score} <span style={{ fontSize: 10, color: "var(--muted)" }}>PTS</span>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 800, color: "var(--fg)", lineHeight: 1.3, marginBottom: 4 }}>
                  {strat.name}
                </h3>
                <p style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.4 }}>
                  {strat.tagline}
                </p>
              </div>

              {/* Key Metrics Grid */}
              <div style={{
                background: "var(--surface-2)",
                padding: "10px 12px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                fontSize: 11.5
              }}>
                <div>
                  <div style={{ color: "var(--muted)", fontSize: 10 }}>Success Probability</div>
                  <div style={{ fontWeight: 800, color: strat.successProbabilityPct > 80 ? "var(--primary)" : "var(--rose)", fontSize: 13 }}>
                    {strat.successProbabilityPct}%
                  </div>
                </div>

                <div>
                  <div style={{ color: "var(--muted)", fontSize: 10 }}>Estimated Time (RTO)</div>
                  <div style={{ fontWeight: 800, color: "var(--fg)", fontSize: 13 }}>
                    {strat.timeHours} Hours
                  </div>
                </div>

                <div>
                  <div style={{ color: "var(--muted)", fontSize: 10 }}>Financial Cost</div>
                  <div style={{ fontWeight: 800, color: "var(--amber)", fontSize: 13 }}>
                    ${(strat.costUSD / 1000).toFixed(0)}k
                  </div>
                </div>

                <div>
                  <div style={{ color: "var(--muted)", fontSize: 10 }}>Data Integrity</div>
                  <div style={{ fontWeight: 800, color: "var(--purple)", fontSize: 13 }}>
                    {strat.dataIntegrityScorePct}%
                  </div>
                </div>
              </div>

              {/* Re-infection & Legal Risk Badges */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10.5, paddingTop: 6, borderTop: "1px solid var(--border-subtle)" }}>
                <div>
                  Re-infection: <strong style={{ color: strat.reinfectionRisk === "LOW" ? "var(--primary)" : "var(--rose)" }}>{strat.reinfectionRisk}</strong>
                </div>
                <div>
                  Legal Risk: <strong style={{ color: strat.legalRisk === "MINIMAL" ? "var(--primary)" : "var(--amber)" }}>{strat.legalRisk}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Strategy Deep-Dive Panel */}
      <div className="card-tactical" style={{ padding: 22, borderTop: "3px solid var(--primary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--primary)", letterSpacing: "0.06em", marginBottom: 4 }}>
              DETAILED FEASIBILITY & EXECUTION PREREQUISITES
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--fg)" }}>
              {activeStrategy.name}
            </h2>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-primary"
            >
              Select & Execute This Pathway
            </button>
          </div>
        </div>

        {/* 3-Column Breakdown: Pros/Cons, Prerequisites, Fallback Rules */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
          
          {/* Column 1: Pros & Cons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={14} /> Strategic Advantages
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activeStrategy.pros.map((pro, idx) => (
                  <div key={idx} style={{ fontSize: 12, color: "var(--fg-2)", display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--primary)" }}>✓</span>
                    <span>{pro}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--rose)", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <XCircle size={14} /> Operational Trade-offs & Risks
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activeStrategy.cons.map((con, idx) => (
                  <div key={idx} style={{ fontSize: 12, color: "var(--fg-2)", display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--rose)" }}>✗</span>
                    <span>{con}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Prerequisites Checklist */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <FileCheck size={14} /> Mandatory Verification Prerequisites
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeStrategy.prerequisites.map((prereq, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "10px 12px",
                    fontSize: 12,
                    color: "var(--fg-2)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10
                  }}
                >
                  <input type="checkbox" defaultChecked style={{ accentColor: "var(--primary)" }} />
                  <span>{prereq}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Automated Fallback Rule */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--amber)", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={14} /> Automated Fallback & Circuit Breaker
            </div>
            <div style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 8,
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--amber)" }}>
                TRIGGER CONDITION:
              </div>
              <p style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>
                {activeStrategy.fallbackTrigger}
              </p>
              <div style={{ fontSize: 11, color: "var(--muted)", paddingTop: 6, borderTop: "1px solid rgba(245,158,11,0.2)" }}>
                Continuous telemetry watchdog monitoring restore rate every 60 seconds.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Authorization Modal */}
      {showAuthModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 20
        }}>
          <div className="card-tactical" style={{ maxWidth: 520, width: "100%", padding: 24, border: "1px solid var(--primary)", background: "var(--surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <ShieldCheck size={24} color="var(--primary)" />
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--fg)" }}>
                Authorize Strategy Execution
              </h3>
            </div>

            <p style={{ fontSize: 12.5, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 16 }}>
              You are about to cryptographically sign and execute <strong>{activeStrategy.name}</strong> for incident <strong>INC-2026-8841</strong>.
            </p>

            <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: 6, border: "1px solid var(--border)", fontSize: 11.5, display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Signer:</span>
                <span style={{ fontWeight: 700, color: "var(--fg)" }}>Elena Rostova, CISSP (Incident Commander)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Target SLA RTO:</span>
                <span style={{ fontWeight: 700, color: "var(--primary)" }}>{activeStrategy.timeHours} Hours</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Budget Allocation:</span>
                <span style={{ fontWeight: 700, color: "var(--amber)" }}>${activeStrategy.costUSD.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setShowAuthModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAuthorize}
                className="btn-primary"
              >
                Confirm & Dispatch Orchestration
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
