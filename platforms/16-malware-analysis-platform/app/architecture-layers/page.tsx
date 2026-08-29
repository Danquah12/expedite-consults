"use client";

import { useState } from "react";
import Link from "next/link";
import { MALWARE_SAMPLES } from "@/data/samples";
import { downloadBlob } from "@/lib/utils";
import {
  Layers3,
  Layers,
  Activity,
  Cpu,
  Brain,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Server,
  Zap,
  Play,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Network,
  Database,
  Radio,
  Sliders,
  UserCheck,
  Percent,
  GitBranch,
  HardDrive,
  Clock,
  ChevronRight,
  Info
} from "lucide-react";

interface ArchitectureLayer {
  tierNumber: number;
  tierId: string;
  name: string;
  subtitle: string;
  category: string;
  color: string;
  icon: any;
  summary: string;
  microservices: {
    name: string;
    runtime: string;
    replicas: number;
    latency: string;
    status: "Healthy" | "Degraded" | "Scaling";
  }[];
  telemetry: {
    throughput: string;
    errorRate: string;
    p99Latency: string;
    queueDepth: number;
  };
  connectedStudios: {
    name: string;
    href: string;
    badge: string;
  }[];
}

const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  {
    tierNumber: 1,
    tierId: "L1-INPUT",
    name: "INPUT & INTAKE LAYER",
    subtitle: "Multi-Modal Sensor Ingestion & Vault",
    category: "Ingress",
    color: "#06b6d4",
    icon: HardDrive,
    summary: "High-throughput parallel ingestion gateway for PE executables, Office maldocs, ELF binaries, PCAPs, EVTX event logs, and memory dumps with WebCrypto SHA-256 validation.",
    microservices: [
      { name: "cerberus-ingest-gateway", runtime: "Go 1.22 / gRPC", replicas: 6, latency: "4.2 ms", status: "Healthy" },
      { name: "quarantine-vault-storage", runtime: "Rust / MinIO S3", replicas: 4, latency: "8.1 ms", status: "Healthy" },
      { name: "webcrypto-parser-worker", runtime: "Wasm / V8", replicas: 8, latency: "2.8 ms", status: "Healthy" }
    ],
    telemetry: {
      throughput: "1,840 files/min",
      errorRate: "0.001%",
      p99Latency: "14.2 ms",
      queueDepth: 12
    },
    connectedStudios: [
      { name: "Sample Intake & Vault", href: "/intake", badge: "Vault" },
      { name: "Live Client-Side Parser", href: "/live-parser", badge: "WebCrypto" },
      { name: "Digital Forensics Artifacts", href: "/forensics-vault", badge: "Pillar 14" }
    ]
  },
  {
    tierNumber: 2,
    tierId: "L2-ANALYSIS",
    name: "DEEP ANALYSIS LAYER",
    subtitle: "Static, Dynamic & Memory Detonation",
    category: "Inspection",
    color: "#3b82f6",
    icon: Activity,
    summary: "Multi-stage automated execution sandbox, Ghidra/Cutter disassembly decompiler, Volatility 3 memory inspection, and 25+ anti-evasion instrumentation bypasses.",
    microservices: [
      { name: "qemu-detonation-cluster", runtime: "KVM / QEMU 8.2", replicas: 16, latency: "1,240 ms", status: "Healthy" },
      { name: "ghidra-decompiler-bridge", runtime: "Java 21 / Ghidra Headless", replicas: 8, latency: "480 ms", status: "Healthy" },
      { name: "volatility-memory-daemon", runtime: "Python 3.12 / Vol3", replicas: 6, latency: "620 ms", status: "Healthy" },
      { name: "anti-evasion-hook-guard", runtime: "C++20 / Frida", replicas: 12, latency: "18.4 ms", status: "Healthy" }
    ],
    telemetry: {
      throughput: "420 detonations/min",
      errorRate: "0.02%",
      p99Latency: "1,850 ms",
      queueDepth: 6
    },
    connectedStudios: [
      { name: "Static Analysis (PE/IAT)", href: "/static-analysis", badge: "MalAPI" },
      { name: "Dynamic Detonation Sandbox", href: "/dynamic-analysis", badge: "Procmon" },
      { name: "Disassembly Studio (x86/CFG)", href: "/disassembly", badge: "Ghidra" },
      { name: "Memory & Volatility Analysis", href: "/memory-analysis", badge: "Hollowing" }
    ]
  },
  {
    tierNumber: 3,
    tierId: "L3-DETECTION",
    name: "DETECTION & SIGNATURE LAYER",
    subtitle: "Multi-Model ML & YARA Forge",
    category: "Classification",
    color: "#a855f7",
    icon: Cpu,
    summary: "Deterministic YARA pattern evaluation, Sigma rule translation, and GPU-accelerated Triton ML inference cluster running XGBoost, Random Forest, and Transformer models.",
    microservices: [
      { name: "triton-inference-server", runtime: "NVIDIA Triton / TensorRT", replicas: 4, latency: "12.8 ms", status: "Healthy" },
      { name: "yara-x-parallel-matcher", runtime: "Rust / yara-x", replicas: 8, latency: "6.4 ms", status: "Healthy" },
      { name: "sigma-telemetry-evaluator", runtime: "Python / PySigma", replicas: 6, latency: "9.2 ms", status: "Healthy" }
    ],
    telemetry: {
      throughput: "3,200 inferences/min",
      errorRate: "0.00%",
      p99Latency: "24.5 ms",
      queueDepth: 2
    },
    connectedStudios: [
      { name: "Multi-Layer Detection Matrix", href: "/detection-engine", badge: "ML/Heuristic" },
      { name: "YARA Rule Forge", href: "/yara", badge: "Live Test" },
      { name: "Detection Content Generator", href: "/detection-rules", badge: "Sigma" }
    ]
  },
  {
    tierNumber: 4,
    tierId: "L4-INTELLIGENCE",
    name: "INTELLIGENCE & REASONING LAYER",
    subtitle: "Knowledge Graph & AI Copilot",
    category: "Cognitive",
    color: "#f59e0b",
    icon: Sparkles,
    summary: "Neo4j graph representation of binary IOC relationships, autonomous LLM code understanding, automated MITRE ATT&CK 14-tactic attribution, and family clustering.",
    microservices: [
      { name: "neo4j-knowledge-graph", runtime: "Neo4j Enterprise 5.x", replicas: 3, latency: "18.2 ms", status: "Healthy" },
      { name: "autonomous-llm-copilot", runtime: "vLLM / Llama-3-70B", replicas: 4, latency: "380 ms", status: "Healthy" },
      { name: "mitre-navigator-indexer", runtime: "Go 1.22", replicas: 4, latency: "14.1 ms", status: "Healthy" }
    ],
    telemetry: {
      throughput: "920 graph queries/min",
      errorRate: "0.01%",
      p99Latency: "450 ms",
      queueDepth: 4
    },
    connectedStudios: [
      { name: "Autonomous AI Copilot", href: "/ai-copilot", badge: "LLM" },
      { name: "MITRE ATT&CK Matrix", href: "/mitre-matrix", badge: "14 Tactics" },
      { name: "Malware Family Classifier", href: "/classification", badge: "Clustering" }
    ]
  },
  {
    tierNumber: 5,
    tierId: "L5-DECISION",
    name: "DECISION & FUSION ENGINE",
    subtitle: "Dempster-Shafer & Bayesian Triage",
    category: "Synthesis",
    color: "#ef4444",
    icon: Percent,
    summary: "Multi-source evidence fusion engine using Dempster-Shafer orthogonal mass combinations, Bayesian belief networks, and AI P1-P4 priority triage queueing.",
    microservices: [
      { name: "dempster-shafer-fusion-node", runtime: "Rust / rayon", replicas: 6, latency: "3.4 ms", status: "Healthy" },
      { name: "bayesian-risk-calculator", runtime: "C++20 / Eigen", replicas: 4, latency: "2.1 ms", status: "Healthy" },
      { name: "p1-p4-triage-prioritizer", runtime: "Go 1.22", replicas: 4, latency: "5.8 ms", status: "Healthy" }
    ],
    telemetry: {
      throughput: "4,500 fusions/min",
      errorRate: "0.00%",
      p99Latency: "8.2 ms",
      queueDepth: 1
    },
    connectedStudios: [
      { name: "Confidence Fusion Engine", href: "/confidence-fusion", badge: "Pillar 12" },
      { name: "Enterprise Attack Path Estimator", href: "/enterprise-impact", badge: "Pillar 13" },
      { name: "AI Triage Prioritizer", href: "/triage-prioritization", badge: "Pillar 4" }
    ]
  },
  {
    tierNumber: 6,
    tierId: "L6-RESPONSE",
    name: "RESPONSE & CONTAINMENT LAYER",
    subtitle: "SOAR Closed-Loop Orchestration",
    category: "Execution",
    color: "#10b981",
    icon: ShieldAlert,
    summary: "Closed-loop automated orchestration dispatching 1-Click host isolations, EDR firewall null-routes, C2 DNS sinkholing, and ServiceNow P1 incident ticketing.",
    microservices: [
      { name: "soar-playbook-executor", runtime: "Temporal.io / TypeScript", replicas: 8, latency: "42 ms", status: "Healthy" },
      { name: "edr-gateway-connector", runtime: "Go / CrowdStrike & SentinelOne", replicas: 6, latency: "85 ms", status: "Healthy" },
      { name: "pan-os-firewall-syncer", runtime: "Python 3.12", replicas: 4, latency: "120 ms", status: "Healthy" }
    ],
    telemetry: {
      throughput: "140 playbooks/min",
      errorRate: "0.00%",
      p99Latency: "180 ms",
      queueDepth: 0
    },
    connectedStudios: [
      { name: "SOAR Automated Response", href: "/soar-response", badge: "Closed-Loop" },
      { name: "Cross-Platform Threat Bridge", href: "/threat-bridge", badge: "Federation" },
      { name: "Multi-Tier Report Center", href: "/reports", badge: "PDF/HTML" }
    ]
  },
  {
    tierNumber: 7,
    tierId: "L7-LEARNING",
    name: "ACTIVE LEARNING & RETRAIN LAYER",
    subtitle: "Human-in-the-Loop & Drift Feedback",
    category: "Evolution",
    color: "#ec4899",
    icon: UserCheck,
    summary: "Human-in-the-loop analyst feedback store, uncertainty sampling active learning queue, statistical PSI feature drift monitoring, and continuous GPU model fine-tuning pipeline.",
    microservices: [
      { name: "active-learning-sampler", runtime: "Python 3.12 / scikit-learn", replicas: 4, latency: "14.2 ms", status: "Healthy" },
      { name: "model-retrain-orchestrator", runtime: "Kubeflow / Ray Cluster", replicas: 2, latency: "GPU Batch", status: "Healthy" },
      { name: "psi-drift-detector", runtime: "Go 1.22", replicas: 4, latency: "9.8 ms", status: "Healthy" }
    ],
    telemetry: {
      throughput: "65 annotations/hr",
      errorRate: "0.00%",
      p99Latency: "35 ms",
      queueDepth: 4
    },
    connectedStudios: [
      { name: "Analyst Feedback & Retraining", href: "/analyst-feedback", badge: "Pillar 11" },
      { name: "Detection Validation (F1)", href: "/detection-validator", badge: "Pillar 7" },
      { name: "Explainable AI (SHAP)", href: "/explainable-ai", badge: "Pillar 5" }
    ]
  }
];

export default function ArchitectureLayersPage() {
  const [selectedLayer, setSelectedLayer] = useState<ArchitectureLayer>(ARCHITECTURE_LAYERS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStage, setSimulationStage] = useState(0);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [selectedSample, setSelectedSample] = useState(MALWARE_SAMPLES[0]);

  // Run End-to-End Simulation
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationStage(1);
    setSimulationLogs([`[INGRESS] Ingesting sample '${selectedSample.name}' (${selectedSample.id}) into Layer 1...`]);

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    await sleep(700);
    setSimulationStage(2);
    setSimulationLogs(prev => [
      `[L2 ANALYSIS] Detonated in QEMU VM. Extracted ${selectedSample.dynamicAnalysis.processTree.length} processes, ${selectedSample.staticAnalysis.malApiMatches.length} suspicious APIs.`,
      ...prev
    ]);

    await sleep(700);
    setSimulationStage(3);
    setSimulationLogs(prev => [
      `[L3 DETECTION] YARA Matched: ${selectedSample.yaraMatches[0]?.ruleName || "Ransomware_Core"}. ML XGBoost score: ${selectedSample.mlConfidence.xgboostScore}%.`,
      ...prev
    ]);

    await sleep(700);
    setSimulationStage(4);
    setSimulationLogs(prev => [
      `[L4 INTELLIGENCE] AI Copilot synthesized attack narrative. Mapped ${selectedSample.mitreTechniques.length} MITRE ATT&CK techniques.`,
      ...prev
    ]);

    await sleep(700);
    setSimulationStage(5);
    setSimulationLogs(prev => [
      `[L5 DECISION] Dempster-Shafer orthogonal combination produced 99.4% Malicious mass (k=0.042). P1 Critical Triage assigned.`,
      ...prev
    ]);

    await sleep(700);
    setSimulationStage(6);
    setSimulationLogs(prev => [
      `[L6 RESPONSE] SOAR Playbook executed: Host VICTIM-WIN10 isolated, C2 IP ${selectedSample.soarActions.c2BlacklistIps[0] || "192.168.195.140"} blacklisted.`,
      ...prev
    ]);

    await sleep(700);
    setSimulationStage(7);
    setSimulationLogs(prev => [
      `[L7 LEARNING] Analyst feedback registered. Ground truth labels queued for active learning fine-tuning cycle.`,
      `[PIPELINE COMPLETE] Sample processed across all 7 layers in 420 ms.`,
      ...prev
    ]);

    setIsSimulating(false);
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
            <Layers3 size={24} color="var(--primary)" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--fg)" }}>
                7-Tier Autonomous Intelligence Architecture Master View
              </h1>
              <span className="badge-critical" style={{ background: "rgba(6,182,212,0.15)", color: "#22d3ee", borderColor: "rgba(6,182,212,0.3)" }}>
                Pillar 15 • Master Blueprint
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Master architectural blueprint detailing all 7 vertical intelligence tiers: Input, Analysis, Detection, Intelligence, Decision, Response, and Continuous Learning.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="btn-primary"
            style={{ fontSize: 11.5 }}
          >
            {isSimulating ? (
              <>
                <RotateCcw size={13} className="animate-spin" /> Simulating Flow...
              </>
            ) : (
              <>
                <Play size={13} /> Simulate End-to-End Sample Processing Flow
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global System Telemetry Bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginBottom: 20
      }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Microservices Health</span>
            <Server size={16} color="var(--green)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#10b981", marginTop: 4 }}>
            28 / 28 <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>Healthy</span>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--green)", marginTop: 2 }}>
            All 7 vertical tiers operational
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>End-to-End Latency (P99)</span>
            <Clock size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#22d3ee", marginTop: 4 }}>
            420 ms
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
            Intake to automated containment
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Daily Pipeline Volume</span>
            <Activity size={16} color="var(--purple)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#c084fc", marginTop: 4 }}>
            34,890 <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>Samples</span>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
            Zero queue backlog
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Overall Platform Uptime</span>
            <ShieldCheck size={16} color="var(--green)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#10b981", marginTop: 4 }}>
            99.99%
          </div>
          <div style={{ fontSize: 10.5, color: "var(--green)", marginTop: 2 }}>
            Zero-downtime canary deployments
          </div>
        </div>
      </div>

      {/* Live Simulation Banner */}
      {(isSimulating || simulationLogs.length > 0) && (
        <div style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(16,185,129,0.1))",
          border: "1px solid rgba(6,182,212,0.4)",
          borderRadius: 8,
          padding: 16,
          marginBottom: 20
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Zap size={18} color="var(--primary)" className={isSimulating ? "animate-pulse" : ""} />
              <span style={{ fontWeight: 800, fontSize: 13, color: "var(--fg)" }}>
                {isSimulating ? `Live End-to-End Simulation: Processing Stage ${simulationStage} of 7...` : "Sample Pipeline Simulation Completed!"}
              </span>
            </div>
            <span className="badge-low" style={{ fontSize: 10 }}>Target: {selectedSample.name}</span>
          </div>

          <div style={{ width: "100%", height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
            <div style={{
              width: `${(simulationStage / 7) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #06b6d4, #10b981)",
              transition: "width 0.3s ease"
            }} />
          </div>

          <div className="terminal-box" style={{ maxHeight: 100, fontSize: 10.5 }}>
            {simulationLogs.map((log, idx) => (
              <div key={idx} style={{ color: log.includes("COMPLETE") ? "#34d399" : "#cbd5e1" }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main 7-Layer Interactive Architectural View */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 20 }}>
        {/* Left: 7 Vertical Layers Stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ARCHITECTURE_LAYERS.map((layer) => {
            const Icon = layer.icon;
            const isSelected = selectedLayer.tierNumber === layer.tierNumber;

            return (
              <div
                key={layer.tierNumber}
                onClick={() => setSelectedLayer(layer)}
                style={{
                  background: isSelected ? "rgba(6, 182, 212, 0.08)" : "var(--surface)",
                  border: isSelected ? `2px solid ${layer.color}` : "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "14px 18px",
                  cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 180px 30px",
                  gap: 16,
                  alignItems: "center",
                  transition: "all 0.15s ease"
                }}
              >
                {/* Tier Number Badge */}
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    background: `${layer.color}18`,
                    border: `1px solid ${layer.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto"
                  }}>
                    <Icon size={22} color={layer.color} />
                  </div>
                  <div style={{ fontSize: 9.5, fontWeight: 800, color: layer.color, marginTop: 4, fontFamily: "monospace" }}>
                    TIER {layer.tierNumber}
                  </div>
                </div>

                {/* Layer Description */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>{layer.name}</span>
                    <span className="badge-critical" style={{
                      background: `${layer.color}15`,
                      color: layer.color,
                      borderColor: `${layer.color}35`,
                      fontSize: 9.5
                    }}>
                      {layer.category}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    {layer.subtitle}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 4, lineHeight: 1.3 }}>
                    {layer.summary}
                  </div>
                </div>

                {/* Quick Telemetry */}
                <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 14, fontSize: 10.5 }}>
                  <div style={{ color: "var(--muted)" }}>Throughput:</div>
                  <div style={{ fontWeight: 800, color: "var(--fg)", fontFamily: "monospace" }}>{layer.telemetry.throughput}</div>
                  <div style={{ color: "var(--muted)", marginTop: 4 }}>P99 Latency:</div>
                  <div style={{ fontWeight: 800, color: layer.color, fontFamily: "monospace" }}>{layer.telemetry.p99Latency}</div>
                </div>

                {/* Chevron */}
                <div>
                  <ChevronRight size={18} color={isSelected ? layer.color : "var(--muted)"} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Layer Deep-Dive Drawer */}
        <div style={{
          background: "var(--surface)",
          border: `1px solid ${selectedLayer.color}40`,
          borderRadius: 8,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: selectedLayer.color, textTransform: "uppercase", fontFamily: "monospace" }}>
                  {selectedLayer.tierId} • TIER {selectedLayer.tierNumber} DEEP INSPECTION
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--fg)", marginTop: 2 }}>
                  {selectedLayer.name}
                </h3>
              </div>
              <selectedLayer.icon size={24} color={selectedLayer.color} />
            </div>
            <p style={{ fontSize: 11.5, color: "var(--fg-2)", marginTop: 6, lineHeight: 1.4 }}>
              {selectedLayer.summary}
            </p>
          </div>

          {/* Active Microservices List */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
              Active Microservices ({selectedLayer.microservices.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {selectedLayer.microservices.map((svc, idx) => (
                <div key={idx} style={{ padding: "8px 10px", background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--fg)", fontFamily: "monospace" }}>{svc.name}</span>
                    <span className="badge-low" style={{ fontSize: 9 }}>{svc.status}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "var(--muted)" }}>
                    <span>Runtime: {svc.runtime}</span>
                    <span>Replicas: {svc.replicas} • Latency: {svc.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Telemetry Grid */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
              Real-Time Tier Telemetry
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ padding: 8, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 9.5, color: "var(--muted)" }}>Throughput</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", fontFamily: "monospace" }}>{selectedLayer.telemetry.throughput}</div>
              </div>
              <div style={{ padding: 8, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 9.5, color: "var(--muted)" }}>P99 Latency</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: selectedLayer.color, fontFamily: "monospace" }}>{selectedLayer.telemetry.p99Latency}</div>
              </div>
              <div style={{ padding: 8, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 9.5, color: "var(--muted)" }}>Error Rate</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#10b981", fontFamily: "monospace" }}>{selectedLayer.telemetry.errorRate}</div>
              </div>
              <div style={{ padding: 8, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 9.5, color: "var(--muted)" }}>Queue Backlog</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", fontFamily: "monospace" }}>{selectedLayer.telemetry.queueDepth}</div>
              </div>
            </div>
          </div>

          {/* Connected Studio Modules Direct Links */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
              Connected Platform Studios
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {selectedLayer.connectedStudios.map((studio, idx) => (
                <Link
                  key={idx}
                  href={studio.href}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: "rgba(6, 182, 212, 0.1)",
                    border: "1px solid rgba(6, 182, 212, 0.25)",
                    textDecoration: "none",
                    color: "var(--fg)",
                    fontSize: 11.5,
                    fontWeight: 600,
                    transition: "all 0.12s ease"
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ArrowRight size={12} color="var(--primary)" />
                    {studio.name}
                  </span>
                  <span className="badge-critical" style={{ fontSize: 9, background: "rgba(6,182,212,0.2)", color: "#22d3ee" }}>
                    {studio.badge}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
