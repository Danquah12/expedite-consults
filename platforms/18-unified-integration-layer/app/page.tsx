"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert, Activity, Layers, Zap, Radio, Crosshair, GitGraph,
  ExternalLink, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw,
  Cpu, Database, Lock, Flame, Globe, Sliders, Play, Search, Filter,
  Eye, CheckCircle, Terminal, X, Server, Gauge, Code2, AlertOctagon,
  ArrowUpRight, Sparkles, ShieldCheck, Shield, ChevronRight, Pause, RotateCcw
} from "lucide-react";
import {
  CONNECTED_PLATFORMS,
  MOCK_TELEMETRY_EVENTS,
  UNIFIED_IOCS,
  CROSS_PLATFORM_PLAYBOOKS
} from "@/data/integrationData";
import { ConnectedPlatform, TelemetryEvent } from "@/types/integration";

export default function UnifiedCommandCenter() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<string | null>("CORR-88219-LOCKBIT");
  const [simulatedAttackTriggered, setSimulatedAttackTriggered] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<ConnectedPlatform | null>(null);
  const [metricModal, setMetricModal] = useState<string | null>(null);
  
  // Interactive SOAR DAG state
  const [activeDagStep, setActiveDagStep] = useState<number>(1);
  const [isDagAutoPlaying, setIsDagAutoPlaying] = useState<boolean>(false);
  
  // Platform interactive test state (Ping test & on-demand scan)
  const [platformPingState, setPlatformPingState] = useState<Record<string, "idle" | "pinging" | "success">>({});
  const [platformScanState, setPlatformScanState] = useState<Record<string, "idle" | "scanning" | "done">>({});

  // Breach simulation live event streaming log
  const [simStep, setSimStep] = useState(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 700);
  };

  // Automated breach simulation runner
  const handleTriggerSimulatedAttack = async () => {
    if (simulatedAttackTriggered) return;
    setSimulatedAttackTriggered(true);
    setSimLogs([]);
    setSimStep(1);

    const steps = [
      { step: 1, log: "[T+0.0s] [MALWARE INTAKE] CERBERUS-RE (Platform 16) ingests novel polymorphic sample 'lockbit_v3_loader.dll'" },
      { step: 2, log: "[T+0.8s] [SYMBOLIC DISSECTION] Extracted active C2 host '185.220.101.44:8443' and SHA-256 integrity seal" },
      { step: 3, log: "[T+1.6s] [STIX 2.1 SYNC] Shared Threat Intel Hub dispatches IOC broadcast to CrowdStrike EDR & Sentinel SIEM" },
      { step: 4, log: "[T+2.4s] [AUTONOMOUS SOAR] Aegis Recovery (Platform 17) enforces immutable WORM S3 snapshot lock across 44 TB" },
      { step: 5, log: "[T+3.2s] [PERIMETER PROBE] SAST-2 / DAST AXIOM Engine dispatches live AST fuzzer to verify API perimeter" },
      { step: 6, log: "[T+4.0s] [CONTAINMENT VERIFIED] ✅ Cross-Platform Closed-Loop Containment achieved with ZERO enterprise data loss" }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      setSimStep(steps[i].step);
      setSimLogs(prev => [...prev, steps[i].log]);
    }

    setTimeout(() => {
      setSimulatedAttackTriggered(false);
      setSimStep(0);
    }, 6000);
  };

  // Interactive Ping Test for specific platform
  const testPlatformPing = (id: string) => {
    setPlatformPingState(prev => ({ ...prev, [id]: "pinging" }));
    setTimeout(() => {
      setPlatformPingState(prev => ({ ...prev, [id]: "success" }));
      setTimeout(() => {
        setPlatformPingState(prev => ({ ...prev, [id]: "idle" }));
      }, 3000);
    }, 600);
  };

  // Interactive On-Demand Scan trigger
  const triggerPlatformScan = (id: string) => {
    setPlatformScanState(prev => ({ ...prev, [id]: "scanning" }));
    setTimeout(() => {
      setPlatformScanState(prev => ({ ...prev, [id]: "done" }));
      setTimeout(() => {
        setPlatformScanState(prev => ({ ...prev, [id]: "idle" }));
      }, 3500);
    }, 1200);
  };

  // Filter platforms by category & search query
  const filteredPlatforms = CONNECTED_PLATFORMS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          String(p.port).includes(searchQuery);

    if (!matchesSearch) return false;
    if (activeTab === "ALL") return true;
    if (activeTab === "SAST_DAST") return p.id.includes("sast") || p.id.includes("dast") || p.id.includes("axiom");
    if (activeTab === "MALWARE_RECOVERY") return p.id.includes("cerberus") || p.id.includes("aegis") || p.id.includes("recovery");
    if (activeTab === "CLOUD_INFRA") return p.id.includes("cloud") || p.id.includes("threat") || p.id.includes("iac") || p.id.includes("k8s") || p.id.includes("container");
    if (activeTab === "MOBILE_API") return p.id.includes("mobile") || p.id.includes("api") || p.id.includes("sca") || p.id.includes("secret");
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1600, margin: "0 auto" }}>
      
      {/* ── Executive Header Banner ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(6,182,212,0.1) 40%, rgba(139,92,246,0.12) 100%)",
        border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: 12,
        padding: "18px 24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: 12,
            background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 24px rgba(16,185,129,0.4)"
          }}>
            <Layers size={26} color="#050811" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 21, fontWeight: 900, color: "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>
                Unified Executive Cyber Command Center
              </h1>
              <span style={{
                fontSize: 10.5,
                fontWeight: 800,
                background: "rgba(16,185,129,0.15)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.4)",
                padding: "2px 8px",
                borderRadius: 5,
                fontFamily: "monospace",
                display: "flex",
                alignItems: "center",
                gap: 5
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} className="animate-ping" />
                16 PLATFORMS FEDERATED
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "4px 0 0 0" }}>
              Autonomous security orchestration and bi-directional gRPC event correlation across SAST, DAST, Cloud, Malware Analysis, and Ransomware Recovery.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={handleTriggerSimulatedAttack}
            style={{
              background: simulatedAttackTriggered ? "linear-gradient(135deg, #f43f5e, #be123c)" : "rgba(245,158,11,0.15)",
              border: `1px solid ${simulatedAttackTriggered ? "#f43f5e" : "#f59e0b"}`,
              color: simulatedAttackTriggered ? "#fff" : "#f59e0b",
              fontWeight: 800,
              fontSize: 12,
              padding: "8px 16px",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              boxShadow: simulatedAttackTriggered ? "0 0 20px rgba(244,63,94,0.5)" : "none",
              transition: "all 0.2s"
            }}
          >
            <Play size={13} fill={simulatedAttackTriggered ? "#fff" : "#f59e0b"} />
            <span>{simulatedAttackTriggered ? "SIMULATION ACTIVE..." : "Simulate Cross-Platform Breach"}</span>
          </button>

          <button
            onClick={handleRefresh}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              fontWeight: 600,
              fontSize: 12,
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
            title="Refresh Real-Time Mesh Telemetry"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            <span>Sync Posture</span>
          </button>

          <Link
            href="/unified-reporting"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 12,
              padding: "8px 16px",
              borderRadius: 8,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 0 16px rgba(139,92,246,0.35)"
            }}
          >
            <span>CISO Briefing</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── Real-Time Breach Simulation Drawer Banner (When Triggered) ── */}
      {simulatedAttackTriggered && (
        <div style={{
          background: "rgba(244,63,94,0.06)",
          border: "1px solid rgba(244,63,94,0.35)",
          borderRadius: 10,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          animation: "fadeIn 0.3s"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertOctagon size={16} color="#f43f5e" />
              <strong style={{ fontSize: 13, color: "#f43f5e", textTransform: "uppercase" }}>
                Active Multi-Platform Rehearsal: Stage {simStep}/6 Executing
              </strong>
            </div>
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "#f43f5e" }}>
              Target: Simulated Enterprise VPC Enclave
            </span>
          </div>

          <div style={{
            background: "#080514",
            border: "1px solid rgba(244,63,94,0.2)",
            borderRadius: 6,
            padding: "10px 14px",
            fontFamily: "monospace",
            fontSize: 11,
            lineHeight: 1.6,
            maxHeight: 130,
            overflowY: "auto"
          }}>
            {simLogs.map((log, lIdx) => (
              <div key={lIdx} style={{ color: log.includes("✅") ? "#10b981" : log.includes("AUTONOMOUS") ? "#c084fc" : "#f8fafc" }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Top 5 Interactive High-Impact Metric Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {[
          {
            id: "resilience",
            title: "Global Resilience Index",
            value: "96.4%",
            sub: "+2.1% vs last week",
            status: "OPTIMAL",
            color: "#10b981",
            icon: ShieldAlert,
            detail: "Calculated across 16 platforms based on mean time to detect (1.2s), mean time to contain (3.4s), and WORM backup immutability."
          },
          {
            id: "incidents",
            title: "Correlated Incidents",
            value: "3 Critical",
            sub: "All quarantined by SOAR",
            status: "CONTAINED",
            color: "#f43f5e",
            icon: Flame,
            detail: "Zero breach propagation. LockBit stage-2, Blind SSRF, and RCE weaponization candidates auto-isolated by Playbook #104."
          },
          {
            id: "threat_iocs",
            title: "Synchronized IOCs",
            value: "14,890",
            sub: "STIX 2.1 auto-propagated",
            status: "SYNCED",
            color: "#06b6d4",
            icon: Crosshair,
            detail: "High-confidence C2 IPs, fuzzy hashes, and ASN blocks continuously synchronized to CrowdStrike, Defender, and Suricata."
          },
          {
            id: "soar_actions",
            title: "Autonomous SOAR Actions",
            value: "1,248 / 24h",
            sub: "99.8% automated success",
            status: "AUTONOMOUS",
            color: "#a855f7",
            icon: GitGraph,
            detail: "Playbooks fired: Automated WORM Snapshot Lock, Envoy Virtual Patching, Okta Key Rotation, and Endpoint Quarantines."
          },
          {
            id: "bus_throughput",
            title: "Federated Bus Ingestion",
            value: "24.8k evt/s",
            sub: "gRPC P99 latency: 1.8ms",
            status: "HEALTHY",
            color: "#3b82f6",
            icon: Radio,
            detail: "Ultra-low-latency event bus with zero backpressure. 16 platform microservices streaming unified telemetry."
          }
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              onClick={() => setMetricModal(metric.id)}
              className="card-tactical"
              style={{
                padding: "16px 18px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: metricModal === metric.id ? `1px solid ${metric.color}` : "1px solid var(--border)",
                background: metricModal === metric.id ? "var(--surface-3)" : "var(--surface)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {metric.title}
                </span>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: `${metric.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${metric.color}40`
                }}>
                  <Icon size={14} color={metric.color} />
                </div>
              </div>
              <div style={{ fontSize: 23, fontWeight: 900, color: "#f8fafc", marginBottom: 4 }}>
                {metric.value}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: "var(--foreground-muted)" }}>{metric.sub}</span>
                <span style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: metric.color,
                  background: `${metric.color}15`,
                  padding: "2px 6px",
                  borderRadius: 4
                }}>
                  {metric.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Metric Details Modal (When Clicked) ── */}
      {metricModal && (
        <div style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Activity size={20} color="#06b6d4" />
            <div>
              <strong style={{ fontSize: 13, color: "#f8fafc" }}>Metric Inspector</strong>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0 0" }}>
                Detailed telemetry breakdown for metric: <strong>{metricModal.toUpperCase()}</strong>. Live aggregation active.
              </p>
            </div>
          </div>
          <button
            onClick={() => setMetricModal(null)}
            className="btn-secondary"
            style={{ fontSize: 11, padding: "4px 10px" }}
          >
            Close Inspector
          </button>
        </div>
      )}

      {/* ── Main Interactive Section: Connected Platform Fleet & SOAR DAG ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.9fr 1.1fr", gap: 20 }}>
        
        {/* Left Column: Connected Platform Fleet with Search & Category Filters */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Header & Filter Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Globe size={18} color="#10b981" />
                <h2 style={{ fontSize: 16, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
                  Expedite Security Ecosystem Fleet
                </h2>
                <span style={{ fontSize: 10.5, fontWeight: 800, background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "1px 6px", borderRadius: 4 }}>
                  {filteredPlatforms.length} Online
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: "var(--muted)", margin: "2px 0 0 0" }}>
                Click any platform to inspect telemetry, run automated scans, or launch workspaces.
              </p>
            </div>

            {/* Search Input */}
            <div style={{ position: "relative", width: 230 }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: 10, color: "var(--muted)" }} />
              <input
                type="text"
                placeholder="Search platforms, ports, tools..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 10px 6px 30px",
                  fontSize: 11.5,
                  background: "var(--surface-3)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: "#f8fafc",
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { id: "ALL", label: "All Platforms (10)" },
              { id: "SAST_DAST", label: "Dual SAST & DAST (2)" },
              { id: "MALWARE_RECOVERY", label: "Malware & Recovery (2)" },
              { id: "CLOUD_INFRA", label: "Cloud & Threat Modeling (2)" },
              { id: "MOBILE_API", label: "Mobile, API & Dependencies (4)" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: activeTab === tab.id ? "1px solid #10b981" : "1px solid var(--border)",
                  background: activeTab === tab.id ? "rgba(16,185,129,0.15)" : "var(--surface-2)",
                  color: activeTab === tab.id ? "#10b981" : "var(--muted)",
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Platform Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14, maxHeight: 720, overflowY: "auto", paddingRight: 4 }}>
            {filteredPlatforms.map((platform) => {
              const isPing = platformPingState[platform.id] === "pinging";
              const isPingOk = platformPingState[platform.id] === "success";
              const isScan = platformScanState[platform.id] === "scanning";
              const isScanDone = platformScanState[platform.id] === "done";

              return (
                <div
                  key={platform.id}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    transition: "all 0.2s ease",
                    position: "relative"
                  }}
                  className="hover:border-slate-500"
                >
                  {/* Card Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#10b981"
                        }} className="animate-pulse" />
                        <strong style={{ fontWeight: 800, fontSize: 13.5, color: "#f8fafc" }}>
                          {platform.name}
                        </strong>
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 3 }}>
                        {platform.category} · <span style={{ color: "#a855f7", fontWeight: 700 }}>{platform.codeName}</span>
                      </div>
                    </div>

                    {/* Launch Buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <a
                        href={`http://localhost:${platform.port}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: "linear-gradient(135deg, #0284c7, #38bdf8)",
                          color: "#fff",
                          padding: "4px 10px",
                          borderRadius: 5,
                          fontSize: 11,
                          fontWeight: 800,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          boxShadow: "0 0 10px rgba(56,189,248,0.3)"
                        }}
                        title={`Open Localhost :${platform.port}`}
                      >
                        <Play size={10} fill="#fff" />
                        <span>:{platform.port} Local</span>
                      </a>

                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid var(--border)",
                          color: "var(--muted)",
                          padding: "4px 8px",
                          borderRadius: 5,
                          fontSize: 11,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 3
                        }}
                        title="Open Vercel Cloud Deployment"
                      >
                        <span>Cloud</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>

                  <p style={{ fontSize: 11.5, color: "var(--foreground-muted)", margin: 0, lineHeight: 1.4 }}>
                    {platform.description}
                  </p>

                  {/* Telemetry Row */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--surface-3)",
                    padding: "7px 10px",
                    borderRadius: 6,
                    fontSize: 10.5
                  }}>
                    <div>
                      <span style={{ color: "var(--muted)" }}>Throughput: </span>
                      <strong style={{ color: "#06b6d4" }}>{platform.eventsPerSec.toLocaleString()} evt/s</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--muted)" }}>Latency: </span>
                      <strong style={{ color: "#10b981" }}>{platform.latencyMs}ms</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--muted)" }}>Health: </span>
                      <strong style={{ color: "#10b981" }}>{platform.healthScore}%</strong>
                    </div>
                  </div>

                  {/* Feature Badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {platform.features.map((feat, fIdx) => (
                      <span
                        key={fIdx}
                        style={{
                          fontSize: 9.5,
                          fontWeight: 600,
                          background: "rgba(139,92,246,0.1)",
                          color: "#c084fc",
                          border: "1px solid rgba(139,92,246,0.25)",
                          padding: "2px 6px",
                          borderRadius: 4
                        }}
                      >
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Interactive Platform Action Bar */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "1px solid var(--border)",
                    paddingTop: 8,
                    marginTop: 2
                  }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => testPlatformPing(platform.id)}
                        disabled={isPing}
                        style={{
                          background: isPingOk ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${isPingOk ? "#10b981" : "var(--border)"}`,
                          color: isPingOk ? "#10b981" : "var(--muted)",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 4,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <Radio size={10} className={isPing ? "animate-pulse" : ""} />
                        <span>{isPing ? "Pinging..." : isPingOk ? "Ping OK (12ms)" : "Test gRPC Ping"}</span>
                      </button>

                      <button
                        onClick={() => triggerPlatformScan(platform.id)}
                        disabled={isScan}
                        style={{
                          background: isScanDone ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${isScanDone ? "#06b6d4" : "var(--border)"}`,
                          color: isScanDone ? "#06b6d4" : "var(--muted)",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 4,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <Zap size={10} className={isScan ? "animate-spin" : ""} />
                        <span>{isScan ? "Dispatched..." : isScanDone ? "Scan Queued" : "Trigger Scan"}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedPlatform(platform)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#38bdf8",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 3
                      }}
                    >
                      <span>Inspect</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Closed-Loop SOAR DAG & Playbook Runner */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          
          {/* Closed-Loop Automation Nexus DAG */}
          <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <GitGraph size={17} color="#a855f7" />
                <h2 style={{ fontSize: 15, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
                  Closed-Loop Automation Nexus
                </h2>
              </div>
              <span style={{ fontSize: 10, color: "#a855f7", fontWeight: 800, fontFamily: "monospace", background: "rgba(168,85,247,0.15)", padding: "2px 6px", borderRadius: 4 }}>
                INTERACTIVE DAG
              </span>
            </div>

            <p style={{ fontSize: 11.5, color: "var(--muted)", margin: 0 }}>
              Click any stage below to inspect live payload propagation across the defense mesh:
            </p>

            {/* Interactive Step 1 */}
            <div
              onClick={() => setActiveDagStep(1)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                background: activeDagStep === 1 ? "rgba(168,85,247,0.15)" : "var(--surface-2)",
                border: `1px solid ${activeDagStep === 1 ? "#a855f7" : "var(--border)"}`,
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#a855f7", color: "#050811", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>
                1
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>CERBERUS-RE Ingestion & Detonation</div>
                <div style={{ fontSize: 10.5, color: "var(--muted)" }}>Extracts C2 IP (185.220.101.44) & AES-256 rounds</div>
              </div>
              <ChevronRight size={14} color="#a855f7" />
            </div>

            <div style={{ textAlign: "center", color: "#a855f7", fontSize: 10, fontFamily: "monospace" }}>
              ▼ gRPC Telemetry Stream (8ms latency)
            </div>

            {/* Interactive Step 2 */}
            <div
              onClick={() => setActiveDagStep(2)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                background: activeDagStep === 2 ? "rgba(6,182,212,0.15)" : "var(--surface-2)",
                border: `1px solid ${activeDagStep === 2 ? "#06b6d4" : "var(--border)"}`,
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#06b6d4", color: "#050811", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>
                2
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>STIX 2.1 Threat Intel Sync</div>
                <div style={{ fontSize: 10.5, color: "var(--muted)" }}>Pushed to CrowdStrike EDR, Sentinel & Suricata</div>
              </div>
              <ChevronRight size={14} color="#06b6d4" />
            </div>

            <div style={{ textAlign: "center", color: "#06b6d4", fontSize: 10, fontFamily: "monospace" }}>
              ▼ SOAR Auto-Dispatch (12ms latency)
            </div>

            {/* Interactive Step 3 */}
            <div
              onClick={() => setActiveDagStep(3)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                background: activeDagStep === 3 ? "rgba(16,185,129,0.15)" : "var(--surface-2)",
                border: `1px solid ${activeDagStep === 3 ? "#10b981" : "var(--border)"}`,
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#10b981", color: "#050811", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>
                3
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>Aegis WORM Lock & AXIOM Scan</div>
                <div style={{ fontSize: 10.5, color: "var(--muted)" }}>WORM S3 immutable lock engaged; AST fuzzer active</div>
              </div>
              <ChevronRight size={14} color="#10b981" />
            </div>

            {/* Selected Step Payload Preview */}
            <div style={{
              background: "var(--surface-3)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 11,
              fontFamily: "monospace"
            }}>
              <div style={{ color: "var(--muted)", marginBottom: 4, fontWeight: 700, textTransform: "uppercase" }}>
                Step {activeDagStep} Active Telemetry Packet:
              </div>
              {activeDagStep === 1 && (
                <div style={{ color: "#a855f7" }}>
                  {`{ event: "MALWARE_C2_EXTRACTED", c2_ip: "185.220.101.44:8443", sha256: "8e9b42cf...d2e3", action: "BROADCAST_IOC" }`}
                </div>
              )}
              {activeDagStep === 2 && (
                <div style={{ color: "#06b6d4" }}>
                  {`{ stix_bundle: "bundle--90412", target: "ALL_EDR_NODES", rule: "BLOCK_IP_185.220.101.44", latency: "8ms" }`}
                </div>
              )}
              {activeDagStep === 3 && (
                <div style={{ color: "#10b981" }}>
                  {`{ vault: "s3:::aegis-immutable-prod", worm_lock: "ENGAGED_90_DAYS", perimeter_scan: "AXIOM_DISPATCHED" }`}
                </div>
              )}
            </div>

            <Link
              href="/cross-platform-playbooks"
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: 12,
                textDecoration: "none"
              }}
            >
              <span>Open Visual SOAR Playbook Studio</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Quick Studio Directory Card */}
          <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <Terminal size={16} color="#38bdf8" />
              <strong style={{ fontSize: 13, color: "#f8fafc" }}>Quick Studio Directory</strong>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { href: "/cross-platform-playbooks", label: "SOAR Engine", icon: "⚡" },
                { href: "/federated-telemetry", label: "Telemetry Bus", icon: "📡" },
                { href: "/shared-threat-intel", label: "Threat Intel", icon: "🎯" },
                { href: "/unified-reporting", label: "CISO Reporting", icon: "📊" },
                { href: "/api-gateway", label: "API Gateway", icon: "🔌" },
                { href: "/mesh-health", label: "Mesh Health", icon: "🧬" }
              ].map(st => (
                <Link
                  key={st.href}
                  href={st.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    padding: "6px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    color: "var(--foreground)",
                    textDecoration: "none",
                    fontWeight: 600
                  }}
                  className="hover:border-cyan-500"
                >
                  <span>{st.icon}</span>
                  <span>{st.label}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ── Platform Deep-Dive Drawer Modal (When Inspect is Clicked) ── */}
      {selectedPlatform && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          padding: 20
        }}>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            width: "100%",
            maxWidth: 620,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            boxShadow: "0 10px 40px rgba(0,0,0,0.6)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
                <h3 style={{ fontSize: 17, fontWeight: 900, color: "#fff", margin: 0 }}>
                  {selectedPlatform.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlatform(null)}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
              {selectedPlatform.description}
            </div>

            {/* Live Metrics Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: 10, borderRadius: 6, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Localhost Port</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#38bdf8" }}>:{selectedPlatform.port}</div>
              </div>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: 10, borderRadius: 6, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Events / Sec</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#10b981" }}>{selectedPlatform.eventsPerSec.toLocaleString()}</div>
              </div>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: 10, borderRadius: 6, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Health Score</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#c084fc" }}>{selectedPlatform.healthScore}%</div>
              </div>
            </div>

            {/* Capabilities */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                Active Platform Capabilities & Plugins
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {selectedPlatform.features.map((feat, idx) => (
                  <span key={idx} style={{ fontSize: 11, background: "var(--surface-2)", border: "1px solid var(--border)", padding: "3px 8px", borderRadius: 4, color: "#f8fafc" }}>
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Launch Buttons in Modal */}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <a
                href={`http://localhost:${selectedPlatform.port}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ flex: 1, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textDecoration: "none" }}
              >
                <Play size={13} fill="#fff" />
                <span>Launch Localhost :{selectedPlatform.port}</span>
              </a>

              <a
                href={selectedPlatform.url}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ flex: 1, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textDecoration: "none" }}
              >
                <Globe size={13} />
                <span>Open Vercel Deployment</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
