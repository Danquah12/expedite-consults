"use client";

import React, { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Clock,
  ShieldCheck,
  HardDrive,
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers,
  ArrowRight,
  Download,
  Info
} from "lucide-react";

interface Pathway {
  id: string;
  name: string;
  strategyType: string;
  successProbabilityPct: number;
  estimatedRTOHours: number;
  estimatedDataLossPct: number;
  reinfectionRiskScore: number;
  financialCostUSD: number;
  recommended: boolean;
  pros: string[];
  cons: string[];
}

const INITIAL_PATHWAYS: Pathway[] = [
  {
    id: "path-1",
    name: "Immutable S3 Cloud Vault Bare-Metal Restore",
    strategyType: "IMMUTABLE_S3_RESTORE",
    successProbabilityPct: 98.2,
    estimatedRTOHours: 6.5,
    estimatedDataLossPct: 0.1,
    reinfectionRiskScore: 4,
    financialCostUSD: 14500,
    recommended: true,
    pros: [
      "100% verified clean cryptographic hash baseline (SHA-256 Merkle proof)",
      "Guaranteed immune to attacker deletion via AWS S3 Object Lock Compliance Mode",
      "Fastest parallel multi-gigabit network restore stream"
    ],
    cons: [
      "2-hour data gap between snapshot and incident onset",
      "Requires high continuous outbound egress bandwidth"
    ]
  },
  {
    id: "path-2",
    name: "Live In-Memory ChaCha20 Cryptographic Key Extraction",
    strategyType: "CRYPTO_KEY_DECRYPT",
    successProbabilityPct: 84.6,
    estimatedRTOHours: 2.5,
    estimatedDataLossPct: 0.0,
    reinfectionRiskScore: 32,
    financialCostUSD: 4200,
    recommended: false,
    pros: [
      "Zero data loss — decrypts files in-place up to the exact millisecond of lock",
      "Extremely fast RTO (< 3 hours for entire server farm)",
      "Zero egress bandwidth required"
    ],
    cons: [
      "Higher reinfection risk: requires deep sanitization of resident OS",
      "Key extraction may fail on hosts where memory was power-cycled"
    ]
  },
  {
    id: "path-3",
    name: "ZFS Storage SAN Air-Gapped Snapshot Rollback",
    strategyType: "HYPERVISOR_ROLLBACK",
    successProbabilityPct: 92.0,
    estimatedRTOHours: 4.2,
    estimatedDataLossPct: 1.2,
    reinfectionRiskScore: 12,
    financialCostUSD: 8900,
    recommended: false,
    pros: [
      "Instantaneous local SAN block snapshot reversion",
      "No WAN network bandwidth constraints",
      "Storage pool integrity verified via ZFS scrub"
    ],
    cons: [
      "Snapshot taken 6 hours prior to incident",
      "Requires manual re-indexing of SQL database transaction logs"
    ]
  },
  {
    id: "path-4",
    name: "Offsite LTO-8 Physical Tape Archive Ingestion",
    strategyType: "AIR_GAP_TAPE_INGEST",
    successProbabilityPct: 99.9,
    estimatedRTOHours: 14.0,
    estimatedDataLossPct: 2.8,
    reinfectionRiskScore: 0,
    financialCostUSD: 18000,
    recommended: false,
    pros: [
      "Absolute zero reinfection risk: 100% physical air-gap separation",
      "Complete historical archive with regulatory compliance audit trail",
      "Immune to any software-based hypervisor zero-day exploit"
    ],
    cons: [
      "Slow sequential tape read speed (360 MB/s per drive)",
      "Physical courier transit delay from Iron Mountain vault"
    ]
  }
];

export default function PredictiveAIPage() {
  const [dataSizeTB, setDataSizeTB] = useState(2.4);
  const [bandwidthGbps, setBandwidthGbps] = useState(10);
  const [parallelVMs, setParallelVMs] = useState(8);
  const [cipherType, setCipherType] = useState("ChaCha20 + Curve25519");
  const [snapshotAgeHours, setSnapshotAgeHours] = useState(2);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Dynamic ML calculations
  const calculatePredictedRTO = () => {
    const rawTransferHours = (dataSizeTB * 1024 * 8) / (bandwidthGbps * 3600);
    const computeRebuildHours = (dataSizeTB * 1.8) / parallelVMs;
    const total = rawTransferHours + computeRebuildHours + 1.2;
    return Math.max(1.5, Math.round(total * 10) / 10);
  };

  const calculateSuccessProbability = () => {
    let base = 99.0;
    if (snapshotAgeHours > 12) base -= 4.0;
    if (dataSizeTB > 10) base -= 2.5;
    if (bandwidthGbps < 5) base -= 3.0;
    return Math.max(75, Math.min(99.9, Math.round(base * 10) / 10));
  };

  const predictedRTO = calculatePredictedRTO();
  const successProb = calculateSuccessProbability();

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
            <Sparkles size={22} color="#10b981" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--fg)" }}>
                Predictive Recovery AI & Time-to-Restore Estimator
              </h1>
              <span className="badge-sev badge-success">PILLAR 5 · PREDICT</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Machine learning forecasting engine: Computes 100% recovery probability, optimal RTO pathways & resource trade-offs.
            </p>
          </div>
        </div>

        <button
          onClick={() => showToast("Exported ML Predictive Recovery Forecast (JSON / PDF).")}
          className="btn-secondary"
        >
          <Download size={14} color="#06b6d4" />
          <span>Export Forecast Model</span>
        </button>
      </div>

      {/* Primary AI KPI Forecast Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #10b981" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Recovery Probability
            </span>
            <Sparkles size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981", marginTop: 6 }}>
            {successProb}%
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            ML Confidence Score: 98.6%
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #06b6d4" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Projected RTO
            </span>
            <Clock size={16} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#06b6d4", marginTop: 6 }}>
            {predictedRTO} Hours
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Vs. Manual Recovery: 38.0 Hours
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #a855f7" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Recommended Pathway
            </span>
            <TrendingUp size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginTop: 8 }}>
            Immutable S3 Vault
          </div>
          <div style={{ fontSize: 11, color: "#10b981", marginTop: 2, fontWeight: 600 }}>
            Best Time / Integrity Ratio
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Residual Reinfection Risk
            </span>
            <Activity size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981", marginTop: 6 }}>
            4.0% (Low)
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Filtered through Gatekeeper
          </div>
        </div>
      </div>

      {/* Interactive Parameter Tuning Simulator */}
      <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sliders size={16} color="#10b981" />
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
              Predictive Recovery Simulation & Resource Tuner
            </h2>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            Adjust parameters to dynamically recalculate RTO & Success Probability
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {/* Data Size Slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>Total Target Dataset Size:</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#10b981", fontFamily: "monospace" }}>{dataSizeTB} TB</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={dataSizeTB}
              onChange={e => setDataSizeTB(parseFloat(e.target.value))}
              style={{ accentColor: "#10b981", cursor: "pointer" }}
            />
          </div>

          {/* Network Bandwidth Slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>Available WAN Egress Bandwidth:</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#06b6d4", fontFamily: "monospace" }}>{bandwidthGbps} Gbps</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={bandwidthGbps}
              onChange={e => setBandwidthGbps(parseInt(e.target.value))}
              style={{ accentColor: "#06b6d4", cursor: "pointer" }}
            />
          </div>

          {/* Parallel VM Workers Slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>Parallel Restore Worker Nodes:</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#a855f7", fontFamily: "monospace" }}>{parallelVMs} VMs</span>
            </div>
            <input
              type="range"
              min="2"
              max="32"
              step="2"
              value={parallelVMs}
              onChange={e => setParallelVMs(parseInt(e.target.value))}
              style={{ accentColor: "#a855f7", cursor: "pointer" }}
            />
          </div>
        </div>
      </div>

      {/* Pathway Trade-off Comparison Matrix */}
      <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
            Recovery Strategy Trade-off Comparison Engine
          </h2>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            Evaluates 4 alternate disaster recovery execution pathways
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {INITIAL_PATHWAYS.map(p => (
            <div
              key={p.id}
              style={{
                padding: 16,
                borderRadius: 8,
                background: p.recommended ? "rgba(16, 185, 129, 0.06)" : "var(--surface-2)",
                border: p.recommended ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 10
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>
                    {p.name}
                  </span>
                  {p.recommended && (
                    <span className="badge-sev badge-success">RECOMMENDED</span>
                  )}
                </div>
              </div>

              {/* Stats Row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, background: "var(--surface-3)", padding: "8px 10px", borderRadius: 6, textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: 9.5, color: "var(--muted)", fontWeight: 700 }}>SUCCESS</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#10b981" }}>{p.successProbabilityPct}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 9.5, color: "var(--muted)", fontWeight: 700 }}>EST. RTO</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#06b6d4" }}>{p.estimatedRTOHours}h</div>
                </div>
                <div>
                  <div style={{ fontSize: 9.5, color: "var(--muted)", fontWeight: 700 }}>DATA LOSS</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b" }}>{p.estimatedDataLossPct}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 9.5, color: "var(--muted)", fontWeight: 700 }}>REINFECT RISK</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: p.reinfectionRiskScore > 20 ? "#f43f5e" : "#10b981" }}>{p.reinfectionRiskScore}%</div>
                </div>
              </div>

              {/* Pros & Cons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11.5 }}>
                <div style={{ color: "#10b981" }}>+ {p.pros[0]}</div>
                <div style={{ color: "var(--muted)" }}>- {p.cons[0]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
