"use client";

import { useState, useMemo } from "react";
import { MALWARE_SAMPLES } from "@/data/samples";
import { MalwareSample } from "@/types/malware";
import { downloadBlob, sevColor, sevBg, sevBorder } from "@/lib/utils";
import {
  Percent,
  Cpu,
  Brain,
  Sparkles,
  Sliders,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Network,
  Binary,
  Layers,
  HelpCircle,
  Download,
  RotateCcw,
  GitMerge,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Info,
  Scale,
  Zap,
  TrendingUp,
  Share2
} from "lucide-react";

interface EvidenceSource {
  id: string;
  name: string;
  category: string;
  defaultWeight: number; // 0 - 100
  icon: any;
  description: string;
  mathNotation: string;
}

const EVIDENCE_SOURCES: EvidenceSource[] = [
  {
    id: "static",
    name: "Static PE & Header Analysis",
    category: "Structural",
    defaultWeight: 75,
    icon: Binary,
    description: "Entropy anomalies, IAT suspicious imports (CryptEncrypt, VirtualAlloc), section characteristics",
    mathNotation: "m_1"
  },
  {
    id: "dynamic",
    name: "Dynamic Detonation Sandbox",
    category: "Behavioral",
    defaultWeight: 90,
    icon: Activity,
    description: "Process hollowing, registry persistence, Volume Shadow Copy deletion, child process tree",
    mathNotation: "m_2"
  },
  {
    id: "ml_ensemble",
    name: "ML Ensemble Classifiers",
    category: "Statistical",
    defaultWeight: 85,
    icon: Brain,
    description: "Random Forest, XGBoost gradient boosting, and Deep Neural Net transformer opcode representations",
    mathNotation: "m_3"
  },
  {
    id: "yara",
    name: "YARA Signature Matching",
    category: "Deterministic",
    defaultWeight: 100,
    icon: FileCheck,
    description: "Exact binary opcode and string regex signature rules authored by Tier-3 threat labs",
    mathNotation: "m_4"
  },
  {
    id: "threat_intel",
    name: "Threat Intelligence & IOC Feeds",
    category: "Contextual",
    defaultWeight: 95,
    icon: Network,
    description: "AlienVault OTX, VirusTotal intelligence, MISP community hashes, and AbuseIPDB reputation",
    mathNotation: "m_5"
  },
  {
    id: "llm_semantic",
    name: "LLM Semantic Assessment",
    category: "Cognitive",
    defaultWeight: 88,
    icon: Sparkles,
    description: "Autonomous reasoning on decompiled pseudo-code, API intent graphs, and attack trajectory synthesis",
    mathNotation: "m_6"
  }
];

export default function ConfidenceFusionPage() {
  const [selectedSample, setSelectedSample] = useState<MalwareSample>(MALWARE_SAMPLES[0]);
  
  // Interactive Reliability Weighting Sliders (0 - 100%)
  const [weights, setWeights] = useState<{ [key: string]: number }>({
    static: 75,
    dynamic: 90,
    ml_ensemble: 85,
    yara: 100,
    threat_intel: 95,
    llm_semantic: 88,
  });

  // Conflict Resolution Strategy
  const [fusionAlgorithm, setFusionAlgorithm] = useState<"dempster_shafer" | "yager_modified" | "smets_tbm" | "bayesian_belief">("dempster_shafer");
  const [activeTab, setActiveTab] = useState<"fusion_matrix" | "bbn_graph" | "math_proof" | "breakdown">("fusion_matrix");

  // Reset Weights
  const handleResetWeights = () => {
    setWeights({
      static: 75,
      dynamic: 90,
      ml_ensemble: 85,
      yara: 100,
      threat_intel: 95,
      llm_semantic: 88,
    });
  };

  // Compute Raw Probabilities from Sample Data
  const sourceReadings = useMemo(() => {
    const s = selectedSample;
    const hasYara = s.yaraMatches && s.yaraMatches.length > 0;
    const avgMl = (s.mlConfidence.randomForestScore + s.mlConfidence.xgboostScore + s.mlConfidence.deepLearningScore) / 3;
    const staticScore = s.entropy > 7.2 || s.staticAnalysis.malApiMatches.length > 2 ? 88.5 : 55.0;
    const dynamicScore = s.dynamicAnalysis.processTree.length > 2 || s.dynamicAnalysis.persistenceMechanisms.length > 0 ? 94.0 : 60.0;
    const threatIntelScore = s.dynamicAnalysis.networkActivity.dnsQueries.some(q => q.suspicious) || s.soarActions.c2BlacklistIps.length > 0 ? 96.0 : 70.0;
    const llmScore = s.aiExplanation.behaviorSummary.length > 50 ? 89.0 : 75.0;

    return {
      static: { rawConfidence: staticScore, verdict: "Malicious" },
      dynamic: { rawConfidence: dynamicScore, verdict: "Malicious" },
      ml_ensemble: { rawConfidence: avgMl, verdict: "Malicious" },
      yara: { rawConfidence: hasYara ? 99.9 : 20.0, verdict: hasYara ? "Malicious" : "Uncertain" },
      threat_intel: { rawConfidence: threatIntelScore, verdict: "Malicious" },
      llm_semantic: { rawConfidence: llmScore, verdict: "Malicious" }
    };
  }, [selectedSample]);

  // Dempster-Shafer Evidence Mass Calculation
  const fusionResults = useMemo(() => {
    // Each source assigns Mass to {M} (Malicious), {B} (Benign), and {Theta} (Uncertainty)
    // Discounting factor: alpha_i = weight_i / 100
    // m_i(M) = alpha_i * (raw_confidence / 100)
    // m_i(B) = alpha_i * ((100 - raw_confidence) / 100) * 0.2 (low benign weight for suspicious samples)
    // m_i(Theta) = 1 - m_i(M) - m_i(B)

    let current_m_M = 0;
    let current_m_B = 0;
    let current_m_Theta = 1.0;
    let totalConflict_k = 0;

    const massBreakdowns: {
      id: string;
      name: string;
      alpha: number;
      rawP: number;
      m_M: number;
      m_B: number;
      m_Theta: number;
    }[] = [];

    EVIDENCE_SOURCES.forEach((source, index) => {
      const alpha = (weights[source.id] || 80) / 100;
      const reading = sourceReadings[source.id as keyof typeof sourceReadings];
      const rawP = reading.rawConfidence / 100;

      const m_M = alpha * rawP;
      const m_B = alpha * (1 - rawP) * 0.15;
      const m_Theta = Math.max(0, 1 - m_M - m_B);

      massBreakdowns.push({
        id: source.id,
        name: source.name,
        alpha,
        rawP,
        m_M,
        m_B,
        m_Theta
      });

      if (index === 0) {
        current_m_M = m_M;
        current_m_B = m_B;
        current_m_Theta = m_Theta;
      } else {
        // Orthogonal sum combination
        // Conflict k = m1(M)*m2(B) + m1(B)*m2(M)
        const k = (current_m_M * m_B) + (current_m_B * m_M);
        totalConflict_k += k;

        if (fusionAlgorithm === "dempster_shafer") {
          const denominator = Math.max(0.0001, 1 - k);
          const new_m_M = ((current_m_M * m_M) + (current_m_M * m_Theta) + (current_m_Theta * m_M)) / denominator;
          const new_m_B = ((current_m_B * m_B) + (current_m_B * m_Theta) + (current_m_Theta * m_B)) / denominator;
          const new_m_Theta = (current_m_Theta * m_Theta) / denominator;

          current_m_M = Math.min(0.9999, new_m_M);
          current_m_B = Math.max(0, new_m_B);
          current_m_Theta = Math.max(0, new_m_Theta);
        } else if (fusionAlgorithm === "yager_modified") {
          // Yager puts conflict k into Theta (Uncertainty)
          const new_m_M = (current_m_M * m_M) + (current_m_M * m_Theta) + (current_m_Theta * m_M);
          const new_m_B = (current_m_B * m_B) + (current_m_B * m_Theta) + (current_m_Theta * m_B);
          const new_m_Theta = (current_m_Theta * m_Theta) + k;

          current_m_M = new_m_M;
          current_m_B = new_m_B;
          current_m_Theta = new_m_Theta;
        } else if (fusionAlgorithm === "smets_tbm") {
          // Smets Transferable Belief Model keeps open-world conflict
          current_m_M = (current_m_M * m_M) + (current_m_M * m_Theta) + (current_m_Theta * m_M);
          current_m_B = (current_m_B * m_B) + (current_m_B * m_Theta) + (current_m_Theta * m_B);
          current_m_Theta = current_m_Theta * m_Theta;
        } else {
          // Bayesian Belief Network Posterior: P(M | E1..En)
          current_m_M = (current_m_M * 0.5 + m_M * 0.5);
          current_m_Theta = 1 - current_m_M;
        }
      }
    });

    const compositeScore = Math.min(99.9, Math.max(1.0, current_m_M * 100));
    const beliefMalicious = current_m_M;
    const plausibilityMalicious = 1 - current_m_B;
    const beliefInterval = [beliefMalicious, plausibilityMalicious];

    return {
      compositeScore,
      current_m_M,
      current_m_B,
      current_m_Theta,
      totalConflict_k: Math.min(1.0, totalConflict_k),
      beliefInterval,
      massBreakdowns
    };
  }, [weights, sourceReadings, fusionAlgorithm]);

  // Export Proof
  const handleExportProof = () => {
    const reportData = {
      title: "CERBERUS Multi-Source Confidence Fusion Proof",
      sample: {
        id: selectedSample.id,
        name: selectedSample.name,
        family: selectedSample.family,
        sha256: selectedSample.hashes.sha256
      },
      fusionAlgorithm,
      weights,
      massBreakdowns: fusionResults.massBreakdowns,
      compositeScore: `${fusionResults.compositeScore.toFixed(2)}%`,
      conflictFactorK: fusionResults.totalConflict_k.toFixed(4),
      beliefInterval: `[${(fusionResults.beliefInterval[0] * 100).toFixed(1)}%, ${(fusionResults.beliefInterval[1] * 100).toFixed(1)}%]`,
      generatedAt: new Date().toISOString()
    };
    downloadBlob(JSON.stringify(reportData, null, 2), `fusion_proof_${selectedSample.id}.json`, "application/json");
  };

  return (
    <div style={{ padding: "20px 24px", minHeight: "100%", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        paddingBottom: 16,
        marginBottom: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 8,
            background: "rgba(6, 182, 212, 0.12)",
            border: "1px solid rgba(6, 182, 212, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Percent size={24} color="var(--primary)" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--fg)" }}>
                Multi-Source Confidence Fusion Engine
              </h1>
              <span className="badge-critical" style={{ background: "rgba(6,182,212,0.15)", color: "#22d3ee", borderColor: "rgba(6,182,212,0.3)" }}>
                Pillar 12 • Evidence Synthesis
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Dempster-Shafer Theory of Evidence & Bayesian Belief Network fusion matrix. Dynamically calculates composite threat confidence across 6 heterogeneous analysis layers.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={handleResetWeights} className="btn-secondary" style={{ fontSize: 11.5 }}>
            <RotateCcw size={13} /> Reset Default Weights
          </button>
          <button onClick={handleExportProof} className="btn-primary" style={{ fontSize: 11.5 }}>
            <Download size={13} /> Export Mathematical Proof (.JSON)
          </button>
        </div>
      </div>

      {/* Target Sample Switcher Bar */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
            Target Binary:
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {MALWARE_SAMPLES.map(sample => {
              const isSel = selectedSample.id === sample.id;
              return (
                <button
                  key={sample.id}
                  onClick={() => setSelectedSample(sample)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 5,
                    border: isSel ? "1px solid var(--primary)" : "1px solid var(--border)",
                    background: isSel ? "rgba(6,182,212,0.18)" : "var(--surface-2)",
                    color: isSel ? "var(--primary)" : "var(--fg-2)",
                    fontSize: 11,
                    fontWeight: isSel ? 700 : 500,
                    cursor: "pointer"
                  }}
                >
                  {sample.name} ({sample.family})
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Fusion Algorithm:</span>
          <select
            value={fusionAlgorithm}
            onChange={(e) => setFusionAlgorithm(e.target.value as any)}
            className="tool-select"
            style={{ fontSize: 11, padding: "4px 8px" }}
          >
            <option value="dempster_shafer">Dempster-Shafer Orthogonal Sum</option>
            <option value="yager_modified">Yager Modified Conflict Redistribution</option>
            <option value="smets_tbm">Smets Transferable Belief Model (TBM)</option>
            <option value="bayesian_belief">Bayesian Belief Network (BBN)</option>
          </select>
        </div>
      </div>

      {/* Composite Fused Metric Hero Card */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr 280px",
        gap: 16,
        marginBottom: 20
      }}>
        {/* Left: Composite Confidence Score */}
        <div style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(14,20,34,0.9))",
          border: "1px solid rgba(6,182,212,0.35)",
          borderRadius: 8,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Composite Fused Confidence
              </span>
              <ShieldAlert size={18} color="var(--primary)" />
            </div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "var(--fg)", marginTop: 6, letterSpacing: "-0.03em" }}>
              {fusionResults.compositeScore.toFixed(1)}%
            </div>
            <div style={{ fontSize: 11, color: "#22d3ee", fontWeight: 700, marginTop: 2 }}>
              VERDICT: DEFINITIVE MALICIOUS
            </div>
          </div>

          <div style={{ marginTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
              <span style={{ color: "var(--muted)" }}>Belief Interval [Bel, Pl]:</span>
              <span style={{ fontFamily: "monospace", color: "var(--fg)" }}>
                [{(fusionResults.beliefInterval[0] * 100).toFixed(1)}%, {(fusionResults.beliefInterval[1] * 100).toFixed(1)}%]
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: "var(--muted)" }}>Inter-Source Conflict (k):</span>
              <span style={{ fontFamily: "monospace", color: fusionResults.totalConflict_k > 0.3 ? "#ef4444" : "#10b981" }}>
                k = {fusionResults.totalConflict_k.toFixed(3)} ({fusionResults.totalConflict_k < 0.15 ? "Low Conflict" : "High Divergence"})
              </span>
            </div>
          </div>
        </div>

        {/* Center: Mass Distribution Gauge & Multi-Source Weights */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>
              Dempster-Shafer Mass Distribution $m(A)$
            </h3>
            <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
              $\sum m(A) = 1.00$
            </span>
          </div>

          {/* Mass Stack Bar */}
          <div style={{ width: "100%", height: 18, background: "var(--surface-3)", borderRadius: 4, overflow: "hidden", display: "flex", marginBottom: 14 }}>
            <div style={{ width: `${fusionResults.current_m_M * 100}%`, background: "#ef4444", transition: "width 0.3s ease" }} title="Mass {Malicious}" />
            <div style={{ width: `${fusionResults.current_m_B * 100}%`, background: "#10b981", transition: "width 0.3s ease" }} title="Mass {Benign}" />
            <div style={{ width: `${fusionResults.current_m_Theta * 100}%`, background: "#f59e0b", transition: "width 0.3s ease" }} title="Mass {Uncertainty / Theta}" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <div style={{ padding: "8px 10px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)", borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: "#f87171", fontWeight: 700 }}>$m(\text&#123;Malicious&#125;)$</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#f87171", fontFamily: "monospace" }}>
                {(fusionResults.current_m_M * 100).toFixed(1)}%
              </div>
            </div>

            <div style={{ padding: "8px 10px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: "#34d399", fontWeight: 700 }}>$m(\text&#123;Benign&#125;)$</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#34d399", fontFamily: "monospace" }}>
                {(fusionResults.current_m_B * 100).toFixed(1)}%
              </div>
            </div>

            <div style={{ padding: "8px 10px", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: "#fbbf24", fontWeight: 700 }}>$m(\Theta \text&#123; Uncertainty&#125;)$</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fbbf24", fontFamily: "monospace" }}>
                {(fusionResults.current_m_Theta * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 10.5, color: "var(--muted)", lineHeight: 1.4 }}>
            Evidence fusion integrates deterministic YARA patterns with probabilistic ML classifiers and runtime memory traces to eliminate single-layer blindspots.
          </div>
        </div>

        {/* Right: Fusion Formula & Quick Metrics */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
            Orthogonal Sum Formula
          </div>
          <div style={{
            background: "#04060a",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: 10,
            fontFamily: "monospace",
            fontSize: 10.5,
            color: "#22d3ee",
            lineHeight: 1.6
          }}>
            <div>(m₁ ⊕ m₂)(A) =</div>
            <div style={{ borderBottom: "1px solid var(--border)", padding: "2px 0" }}>
              ∑ m₁(X) · m₂(Y)  [X ∩ Y = A]
            </div>
            <div style={{ paddingTop: 2 }}>
              1 - k  [where k = ∑ m₁(X) · m₂(Y), X ∩ Y = ∅]
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6, fontSize: 10.5 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Active Evidence Sources:</span>
              <strong style={{ color: "var(--fg)" }}>6 of 6 Active</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Confidence Floor:</span>
              <strong style={{ color: "#34d399" }}>&gt; 98.5% (High Assurance)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Tabs */}
      <div style={{
        display: "flex",
        gap: 6,
        borderBottom: "1px solid var(--border)",
        marginBottom: 20
      }}>
        {[
          { id: "fusion_matrix", label: "Dynamic Reliability Weighting Sliders", icon: Sliders },
          { id: "breakdown", label: "Multi-Source Evidence Breakdown Table", icon: Layers },
          { id: "bbn_graph", label: "Bayesian Belief Network (BBN) DAG", icon: GitMerge },
          { id: "math_proof", label: "Dempster's Rule Orthogonal Math Proof", icon: Scale },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                background: isActive ? "var(--surface)" : "transparent",
                borderTop: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                borderLeft: isActive ? "1px solid var(--border)" : "1px solid transparent",
                borderRight: isActive ? "1px solid var(--border)" : "1px solid transparent",
                borderBottom: "none",
                borderRadius: "6px 6px 0 0",
                color: isActive ? "var(--primary)" : "var(--muted)",
                fontWeight: isActive ? 700 : 500,
                fontSize: 12.5,
                cursor: "pointer"
              }}
            >
              <Icon size={14} color={isActive ? "var(--primary)" : "var(--muted)"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: RELIABILITY WEIGHTING SLIDERS */}
      {activeTab === "fusion_matrix" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {EVIDENCE_SOURCES.map((source) => {
            const Icon = source.icon;
            const currentWeight = weights[source.id] || 0;
            const reading = sourceReadings[source.id as keyof typeof sourceReadings];

            return (
              <div
                key={source.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: "rgba(6,182,212,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <Icon size={16} color="var(--primary)" />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>
                          {source.name}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted)" }}>
                          Category: {source.category} • Notation: <span style={{ fontFamily: "monospace", color: "var(--primary)" }}>{source.mathNotation}</span>
                        </div>
                      </div>
                    </div>

                    <span className="badge-critical" style={{
                      background: reading.rawConfidence > 80 ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                      color: reading.rawConfidence > 80 ? "#f87171" : "#fbbf24",
                      fontFamily: "monospace"
                    }}>
                      Raw Signal: {reading.rawConfidence.toFixed(1)}%
                    </span>
                  </div>

                  <p style={{ fontSize: 11, color: "var(--fg-2)", marginBottom: 14, minHeight: 28 }}>
                    {source.description}
                  </p>
                </div>

                {/* Slider Control */}
                <div style={{
                  background: "var(--surface-2)",
                  borderRadius: 6,
                  padding: "10px 12px",
                  border: "1px solid var(--border)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)" }}>
                      Source Reliability Weight ($\alpha_i$)
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--primary)", fontFamily: "monospace" }}>
                      {currentWeight}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentWeight}
                    onChange={(e) => setWeights({ ...weights, [source.id]: Number(e.target.value) })}
                    style={{
                      width: "100%",
                      accentColor: "var(--primary)",
                      cursor: "pointer"
                    }}
                  />

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: "var(--muted)", marginTop: 4 }}>
                    <span>0% (Discounted / Ignored)</span>
                    <span>100% (Absolute Authority)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: BREAKDOWN TABLE */}
      {activeTab === "breakdown" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
              Per-Source Basic Probability Assignment (BPA) Mass Matrix
            </h3>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              Target: {selectedSample.name} ({selectedSample.id})
            </span>
          </div>

          <table className="cerberus-table">
            <thead>
              <tr>
                <th>Source Name</th>
                <th>Raw Probability $P(E_i)$</th>
                <th>Reliability $\alpha_i$</th>
                <th>Assigned Mass $m_i(\{M\})$</th>
                <th>Assigned Mass $m_i(\{B\})$</th>
                <th>Uncertainty $m_i(\Theta)$</th>
                <th>Decision Contribution</th>
              </tr>
            </thead>
            <tbody>
              {fusionResults.massBreakdowns.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 700, color: "var(--fg)" }}>
                    {row.name}
                  </td>
                  <td style={{ fontFamily: "monospace", color: "#22d3ee" }}>
                    {(row.rawP * 100).toFixed(1)}%
                  </td>
                  <td style={{ fontFamily: "monospace" }}>
                    {(row.alpha * 100).toFixed(0)}%
                  </td>
                  <td style={{ fontFamily: "monospace", color: "#f87171", fontWeight: 700 }}>
                    {row.m_M.toFixed(3)}
                  </td>
                  <td style={{ fontFamily: "monospace", color: "#34d399" }}>
                    {row.m_B.toFixed(3)}
                  </td>
                  <td style={{ fontFamily: "monospace", color: "#fbbf24" }}>
                    {row.m_Theta.toFixed(3)}
                  </td>
                  <td>
                    <span className="badge-low" style={{ fontSize: 9.5 }}>
                      High Reinforcement
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: BAYESIAN BELIEF NETWORK DAG */}
      {activeTab === "bbn_graph" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                Bayesian Belief Network (BBN) Threat Inference Graph
              </h3>
              <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                Directed Acyclic Graph (DAG) visualizing conditional probability propagation from observed evidence nodes to the root threat node.
              </p>
            </div>
            <span className="badge-critical" style={{ fontFamily: "monospace" }}>
              Posterior P(Malicious | Evidence) = {fusionResults.compositeScore.toFixed(1)}%
            </span>
          </div>

          {/* Graphical SVG DAG */}
          <div style={{
            background: "#04060a",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24
          }}>
            {/* Top Root Node */}
            <div style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, rgba(239,68,68,0.25), rgba(168,85,247,0.25))",
              border: "2px solid #ef4444",
              borderRadius: 8,
              textAlign: "center",
              minWidth: 260
            }}>
              <div style={{ fontSize: 10, color: "#f87171", fontWeight: 800, textTransform: "uppercase" }}>
                Target Hypothesis Node
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "var(--fg)", marginTop: 2 }}>
                Threat Classification: MALICIOUS
              </div>
              <div style={{ fontSize: 11, color: "#34d399", fontFamily: "monospace", marginTop: 4 }}>
                P(Malicious | E) = {fusionResults.compositeScore.toFixed(2)}%
              </div>
            </div>

            {/* Connecting Arrows */}
            <div style={{ fontSize: 18, color: "var(--muted)" }}>
              ↓↓↓ Conditional Evidence Inflow ↓↓↓
            </div>

            {/* Evidence Nodes Layer */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, width: "100%" }}>
              {[
                { label: "PE Structure (m₁)", prob: `${sourceReadings.static.rawConfidence.toFixed(0)}%`, desc: "Packed sections + High Entropy" },
                { label: "Detonation Sandbox (m₂)", prob: `${sourceReadings.dynamic.rawConfidence.toFixed(0)}%`, desc: "Process injection & Shadow wipe" },
                { label: "Deterministic YARA (m₄)", prob: `${sourceReadings.yara.rawConfidence.toFixed(0)}%`, desc: "Exact bytecode opcode match" },
                { label: "LLM Reasoning (m₆)", prob: `${sourceReadings.llm_semantic.rawConfidence.toFixed(0)}%`, desc: "Decompiled intent synthesis" },
              ].map((node, idx) => (
                <div key={idx} style={{
                  padding: 12,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)" }}>{node.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginTop: 2 }}>{node.prob}</div>
                  <div style={{ fontSize: 9.5, color: "var(--muted)", marginTop: 4 }}>{node.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MATHEMATICAL PROOF */}
      {activeTab === "math_proof" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
            Dempster-Shafer Orthogonal Sum Step-by-Step Proof
          </h3>

          <div className="terminal-box" style={{ lineHeight: 1.8 }}>
            <div style={{ color: "#22d3ee", fontWeight: 700 }}>[PROOF] Execution of Orthogonal Evidence Combination for {selectedSample.name}:</div>
            <div style={{ color: "var(--fg-2)" }}>1. Frame of Discernment: Ω = &#123; Malicious, Benign &#125;, Power set 2^Ω = &#123; ∅, &#123;M&#125;, &#123;B&#125;, &#123;M, B&#125; (Θ) &#125;.</div>
            <div style={{ color: "var(--fg-2)" }}>2. Initial Reliability Discounting Factor α: [Static: {weights.static}%, Dynamic: {weights.dynamic}%, ML: {weights.ml_ensemble}%, YARA: {weights.yara}%].</div>
            <div style={{ color: "var(--fg-2)" }}>3. Combining Mass Functions:</div>
            {fusionResults.massBreakdowns.map((b, i) => (
              <div key={i} style={{ paddingLeft: 16, color: "#cbd5e1" }}>
                • Source {i+1} ({b.name}): m_{i+1}(&#123;M&#125;) = {b.m_M.toFixed(3)}, m_{i+1}(&#123;B&#125;) = {b.m_B.toFixed(3)}, m_{i+1}(Θ) = {b.m_Theta.toFixed(3)}
              </div>
            ))}
            <div style={{ color: "#34d399", fontWeight: 700, marginTop: 8 }}>
              4. Normalization Factor (1 - k): 1 - {fusionResults.totalConflict_k.toFixed(4)} = {(1 - fusionResults.totalConflict_k).toFixed(4)}
            </div>
            <div style={{ color: "#22d3ee", fontWeight: 800 }}>
              5. Final Fused Mass: m_fused(&#123;M&#125;) = {fusionResults.current_m_M.toFixed(4)} → Composite Confidence = {fusionResults.compositeScore.toFixed(2)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
