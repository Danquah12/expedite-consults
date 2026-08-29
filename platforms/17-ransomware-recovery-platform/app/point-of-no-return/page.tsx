"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  ShieldAlert,
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertTriangle,
  Flame,
  Radio,
  Lock,
  DollarSign,
  Terminal,
  Server,
  Layers,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Crosshair,
  FileSpreadsheet
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";
import { RansomwareCase } from "@/types/recovery";

interface ThresholdFactor {
  id: string;
  name: string;
  compromised: boolean;
  weight: number;
  description: string;
  remediationStep: string;
}

const INITIAL_FACTORS: ThresholdFactor[] = [
  {
    id: "fac-1",
    name: "Tier-0 Active Directory / Identity Compromised",
    compromised: true,
    weight: 25,
    description: "Domain Admin account svc_backup_mgmt breached; Kerberos KRBTGT password roll required.",
    remediationStep: "Execute Kerberos double-roll and isolate domain controller DC01."
  },
  {
    id: "fac-2",
    name: "Backup Infrastructure & Immutability Breached",
    compromised: false,
    weight: 35,
    description: "AWS S3 Object Lock and ZFS snapshot air-gaps are 100% clean and uncompromised.",
    remediationStep: "Maintain immutable WORM lockdown to prevent catastrophic threshold breach."
  },
  {
    id: "fac-3",
    name: "Tier-0 Mission-Critical Systems Encrypted",
    compromised: false,
    weight: 25,
    description: "Only 3 staging hosts encrypted; Core Epic EHR SQL databases and PACS imaging online.",
    remediationStep: "Sever inter-VLAN routing (Port 445/3389) immediately."
  },
  {
    id: "fac-4",
    name: "Active Encryption In Progress across Endpoints",
    compromised: false,
    weight: 15,
    description: "Pre-encryption stagers intercepted; mass payload encryption halted before execution.",
    remediationStep: "Kill rogue stager PIDs via EDR micro-isolation."
  }
];

export default function PointOfNoReturnPage() {
  const [selectedCase, setSelectedCase] = useState<RansomwareCase>(MOCK_CASES[0]);
  const [factors, setFactors] = useState<ThresholdFactor[]>(INITIAL_FACTORS);
  const [windowMinutesRemaining, setWindowMinutesRemaining] = useState<number>(38);

  const toggleFactor = (id: string) => {
    setFactors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, compromised: !f.compromised } : f))
    );
  };

  const ponrScore = useMemo(() => {
    return factors.reduce((acc, f) => acc + (f.compromised ? f.weight : 0), 0);
  }, [factors]);

  const ponrStatus = useMemo(() => {
    if (ponrScore <= 30) return { label: "SAFE POSTURE (PRE-PONR)", color: "var(--primary)", desc: "Incident fully manageable with standard containment." };
    if (ponrScore <= 60) return { label: "WINDOW OF OPPORTUNITY", color: "var(--cyan)", desc: "Actionable window open: Immediate intervention prevents catastrophic spike." };
    if (ponrScore <= 80) return { label: "IMPENDING POINT OF NO RETURN", color: "var(--amber)", desc: "High danger: Recovery complexity and downtime scaling exponentially." };
    return { label: "POST-PONR CATASTROPHIC RECOVERY", color: "var(--rose)", desc: "Critical thresholds crossed: Total recovery rebuild required (21+ days)." };
  }, [ponrScore]);

  const resetFactors = () => {
    setFactors(INITIAL_FACTORS);
    setWindowMinutesRemaining(38);
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          gap: 16,
          flexWrap: "wrap"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(6, 182, 212, 0.15)",
                border: "1px solid var(--cyan)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Clock size={18} color="var(--cyan)" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.02em" }}>
              Recovery "Point of No Return" (PONR) Estimator
            </h1>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: 4,
                background: "rgba(6, 182, 212, 0.2)",
                color: "var(--cyan)",
                border: "1px solid var(--cyan)",
                letterSpacing: "0.06em",
                textTransform: "uppercase"
              }}
            >
              Executive Threshold & Urgency Gauge
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 750 }}>
            Estimates whether an active ransomware incident has crossed the irreversible threshold where recovery difficulty, direct cost, and downtime spike exponentially from hours to weeks.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={resetFactors} className="btn-secondary">
            <RotateCcw size={14} />
            Reset Baseline
          </button>

          <Link href="/killchain-interrupter" className="btn-primary" style={{ background: "var(--primary)" }}>
            <Zap size={14} />
            Intervene to Maintain Window
          </Link>
        </div>
      </div>

      {/* Hero PONR Gauge & Window Status Banner */}
      <div
        style={{
          background: `linear-gradient(90deg, ${ponrScore > 60 ? "rgba(244, 63, 94, 0.18)" : "rgba(6, 182, 212, 0.15)"} 0%, rgba(14, 21, 38, 0.95) 60%, rgba(16, 185, 129, 0.1) 100%)`,
          border: `1px solid ${ponrStatus.color}`,
          borderRadius: 10,
          padding: "18px 22px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(0, 0, 0, 0.5)",
              border: `3px solid ${ponrStatus.color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 900,
              color: ponrStatus.color
            }}
          >
            {ponrScore}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: "var(--fg)" }}>
                STATUS: {ponrStatus.label}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: ponrStatus.color,
                  color: "#000"
                }}
              >
                SCORE {ponrScore}/100
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--fg-2)", marginTop: 4 }}>
              {ponrStatus.desc}
            </div>
          </div>
        </div>

        {/* Actionable Window Countdown Clock */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "10px 18px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
            Actionable Window Remaining
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "var(--cyan)", fontFamily: "monospace" }}>
            {ponrScore > 80 ? "EXPIRED (POST-PONR)" : `${windowMinutesRemaining} Minutes`}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--primary)", marginTop: 2 }}>
            S3 Backups intact • Recovery feasible
          </div>
        </div>
      </div>

      {/* Financial & Downtime Divergence Comparison Matrix */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 24
        }}
      >
        {/* Left: Contained Now (Window of Opportunity) */}
        <div className="card-tactical" style={{ padding: 18, border: "1px solid rgba(16, 185, 129, 0.4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--primary)", textTransform: "uppercase" }}>
              🟢 Path A: Contained in Window (Pre-PONR)
            </span>
            <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>Actionable Now</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>ESTIMATED DOWNTIME</span>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)", marginTop: 2 }}>4.5 Hours</div>
            </div>
            <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>DIRECT FINANCIAL LOSS</span>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)", marginTop: 2 }}>$140,000</div>
            </div>
            <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>DATA LOSS PERCENTAGE</span>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--cyan)", marginTop: 2 }}>&lt; 0.1%</div>
            </div>
            <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>RANSOM EXTORTION PRESSURE</span>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)", marginTop: 2 }}>0% (Ignored)</div>
            </div>
          </div>
        </div>

        {/* Right: Crossed PONR (Catastrophic Spike) */}
        <div className="card-tactical" style={{ padding: 18, border: "1px solid rgba(244, 63, 94, 0.4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--rose)", textTransform: "uppercase" }}>
              🔴 Path B: Uncontained (Crossed PONR Threshold)
            </span>
            <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>Catastrophic Outcome</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>PROJECTED DOWNTIME</span>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--rose)", marginTop: 2 }}>21+ Days</div>
            </div>
            <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>TOTAL ESTIMATED COST</span>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--rose)", marginTop: 2 }}>$4,800,000+</div>
            </div>
            <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>DATA LOSS RISK</span>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--amber)", marginTop: 2 }}>65%+ Irrecoverable</div>
            </div>
            <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>RANSOM EXTORTION LEVERAGE</span>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--rose)", marginTop: 2 }}>95% Critical</div>
            </div>
          </div>
        </div>
      </div>

      {/* What-If Threshold Simulator & Core Recovery Conditions */}
      <div className="card-tactical" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
              🧠 What-If PONR Threshold Simulation Matrix
            </h3>
            <p style={{ fontSize: 12, color: "var(--muted)" }}>
              Toggle incident variables below to simulate how cascading compromises push the incident over the Point of No Return.
            </p>
          </div>
          <span style={{ fontSize: 11, color: "var(--cyan)", fontFamily: "monospace" }}>
            Real-time Weight Recalculation
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {factors.map((f) => (
            <div
              key={f.id}
              style={{
                background: "var(--surface-2)",
                border: `1px solid ${f.compromised ? "rgba(244, 63, 94, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                borderRadius: 8,
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 14
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: f.compromised ? "rgba(244, 63, 94, 0.2)" : "rgba(16, 185, 129, 0.2)",
                      color: f.compromised ? "var(--rose)" : "var(--primary)"
                    }}
                  >
                    {f.compromised ? "COMPROMISED" : "CLEAN / PROTECTED"}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--fg)" }}>{f.name}</span>
                  <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>(Weight: {f.weight} pts)</span>
                </div>

                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>{f.description}</p>
                <div style={{ fontSize: 11, color: "var(--cyan)" }}>Recommended: {f.remediationStep}</div>
              </div>

              <button
                onClick={() => toggleFactor(f.id)}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "6px 12px",
                  borderRadius: 5,
                  background: f.compromised ? "rgba(244, 63, 94, 0.2)" : "rgba(16, 185, 129, 0.2)",
                  color: f.compromised ? "var(--rose)" : "var(--primary)",
                  border: `1px solid ${f.compromised ? "var(--rose)" : "var(--primary)"}`,
                  cursor: "pointer"
                }}
              >
                {f.compromised ? "Simulate Clean State" : "Simulate Compromise"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
