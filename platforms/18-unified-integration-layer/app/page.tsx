"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Activity,
  Layers,
  Zap,
  Radio,
  Crosshair,
  GitGraph,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Cpu,
  Database,
  Lock,
  Flame,
  Globe,
  Sliders,
  Play
} from "lucide-react";
import {
  CONNECTED_PLATFORMS,
  MOCK_TELEMETRY_EVENTS,
  UNIFIED_IOCS,
  CROSS_PLATFORM_PLAYBOOKS
} from "@/data/integrationData";

export default function UnifiedCommandCenter() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<string | null>("CORR-88219-LOCKBIT");
  const [simulatedAttackTriggered, setSimulatedAttackTriggered] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleTriggerSimulatedAttack = () => {
    setSimulatedAttackTriggered(true);
    setTimeout(() => setSimulatedAttackTriggered(false), 4000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Banner / Executive Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.08) 50%, rgba(168,85,247,0.08) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "18px 24px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(16,185,129,0.4)"
          }}>
            <Layers size={24} color="#050811" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
                Unified Executive Cyber Command Center
              </h1>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                background: "rgba(16,185,129,0.15)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.4)",
                padding: "2px 8px",
                borderRadius: 4,
                fontFamily: "monospace"
              }}>
                ALL 6 PLATFORMS CONNECTED
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "4px 0 0 0" }}>
              Real-time aggregated security posture across Malware Analysis, Ransomware Recovery, DAST Scanners, and Endpoint EDRs.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={handleTriggerSimulatedAttack}
            style={{
              background: simulatedAttackTriggered ? "rgba(244,63,94,0.3)" : "rgba(245,158,11,0.15)",
              border: `1px solid ${simulatedAttackTriggered ? "#f43f5e" : "#f59e0b"}`,
              color: simulatedAttackTriggered ? "#f43f5e" : "#f59e0b",
              fontWeight: 700,
              fontSize: 12,
              padding: "7px 14px",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Play size={13} />
            <span>{simulatedAttackTriggered ? "SIMULATION RUNNING..." : "Simulate Cross-Platform Breach"}</span>
          </button>

          <button
            onClick={handleRefresh}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              fontWeight: 600,
              fontSize: 12,
              padding: "7px 12px",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            <span>Sync Posture</span>
          </button>

          <Link
            href="/unified-reporting"
            style={{
              background: "var(--primary)",
              color: "#050811",
              fontWeight: 800,
              fontSize: 12,
              padding: "7px 14px",
              borderRadius: 6,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <span>Generate CISO Briefing</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Top 5 High-Impact Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        {[
          {
            title: "Global Resilience Index",
            value: "96.4%",
            sub: "+2.1% vs last week",
            status: "OPTIMAL",
            color: "#10b981",
            icon: ShieldAlert
          },
          {
            title: "Active Correlated Incidents",
            value: "3 Critical",
            sub: "All quarantined by SOAR",
            status: "CONTAINED",
            color: "#f43f5e",
            icon: Flame
          },
          {
            title: "Synchronized Threat IOCs",
            value: "14,890",
            sub: "STIX 2.1 auto-propagated",
            status: "SYNCED",
            color: "#06b6d4",
            icon: Crosshair
          },
          {
            title: "Autonomous SOAR Actions",
            value: "1,248 / 24h",
            sub: "99.8% automated success",
            status: "AUTONOMOUS",
            color: "#a855f7",
            icon: GitGraph
          },
          {
            title: "Federated Bus Ingestion",
            value: "24.8k evt/s",
            sub: "gRPC P99 latency: 1.8ms",
            status: "HEALTHY",
            color: "#3b82f6",
            icon: Radio
          }
        ].map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="card-tactical" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
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
              <div style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc", marginBottom: 4 }}>
                {metric.value}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: "var(--fg-2)" }}>{metric.sub}</span>
                <span style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: metric.color,
                  background: `${metric.color}15`,
                  padding: "1px 5px",
                  borderRadius: 3
                }}>
                  {metric.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Ecosystem Topology Nexus & Live Platform Fleet */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
        {/* Connected Platform Fleet Cards */}
        <div className="card-tactical" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Globe size={16} color="#10b981" />
              <h2 style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
                Connected Expedite Security Ecosystem Fleet
              </h2>
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              Bi-directional gRPC Streaming & Event Correlator
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {CONNECTED_PLATFORMS.map((platform) => (
              <div
                key={platform.id}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: platform.status === "ONLINE" ? "#10b981" : "#f59e0b"
                      }} className={platform.status === "ONLINE" ? "animate-pulse" : ""} />
                      <span style={{ fontWeight: 800, fontSize: 13, color: "#f8fafc" }}>
                        {platform.name}
                      </span>
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        background: "rgba(255,255,255,0.06)",
                        padding: "1px 5px",
                        borderRadius: 4,
                        color: "var(--muted)"
                      }}>
                        {platform.codeName}
                      </span>
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
                      {platform.category}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <a
                      href={`http://localhost:${platform.port}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: "rgba(56,189,248,0.12)",
                        border: "1px solid rgba(56,189,248,0.3)",
                        color: "#38bdf8",
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontSize: 10.5,
                        fontWeight: 700,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 3
                      }}
                      title={`Open Localhost :${platform.port}`}
                    >
                      <span>:{platform.port} Local</span>
                      <ExternalLink size={10} />
                    </a>
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid var(--border)",
                        color: "var(--fg-2)",
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontSize: 10.5,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 3
                      }}
                      title="Open Vercel Live Deployment"
                    >
                      <span>Vercel</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                <p style={{ fontSize: 11, color: "var(--fg-2)", margin: 0, lineHeight: 1.4 }}>
                  {platform.description}
                </p>

                {/* Live Stats Row */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "var(--surface-3)",
                  padding: "6px 10px",
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
                    <strong style={{ color: platform.healthScore > 98 ? "#10b981" : "#f59e0b" }}>{platform.healthScore}%</strong>
                  </div>
                </div>

                {/* Feature Badges */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {platform.features.map((feat, fIdx) => (
                    <span
                      key={fIdx}
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        background: "rgba(6,182,212,0.08)",
                        color: "#06b6d4",
                        border: "1px solid rgba(6,182,212,0.2)",
                        padding: "1px 5px",
                        borderRadius: 3
                      }}
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Ecosystem Closed-Loop DAG Visualizer */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <GitGraph size={16} color="#a855f7" />
              <h2 style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
                Closed-Loop Automation Nexus
              </h2>
            </div>
            <span style={{ fontSize: 10, color: "#a855f7", fontWeight: 700, fontFamily: "monospace" }}>
              ACTIVE DAG
            </span>
          </div>

          <div style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}>
            {/* Step 1: Ingestion / Detection */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              background: "rgba(168,85,247,0.1)",
              border: "1px solid rgba(168,85,247,0.3)",
              borderRadius: 6
            }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#a855f7", color: "#050811", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>
                1
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#f8fafc" }}>CERBERUS-RE Detects Malware</div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>Extracts C2 IP (185.220.101.44) & ChaCha20 Loop</div>
              </div>
            </div>

            {/* Connecting Arrow */}
            <div style={{ display: "flex", justifyContent: "center", margin: "-6px 0" }}>
              <span style={{ color: "#a855f7", fontSize: 11 }}>▼ gRPC Broadcast (8ms)</span>
            </div>

            {/* Step 2: Intel Hub & EDR */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              background: "rgba(6,182,212,0.1)",
              border: "1px solid rgba(6,182,212,0.3)",
              borderRadius: 6
            }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#06b6d4", color: "#050811", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>
                2
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#f8fafc" }}>STIX 2.1 Threat Intel Sync</div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>Injected to CrowdStrike EDR & Sentinel SIEM</div>
              </div>
            </div>

            {/* Connecting Arrow */}
            <div style={{ display: "flex", justifyContent: "center", margin: "-6px 0" }}>
              <span style={{ color: "#06b6d4", fontSize: 11 }}>▼ SOAR Dispatch (12ms)</span>
            </div>

            {/* Step 3: Aegis Recovery & DAST */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 6
            }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#10b981", color: "#050811", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>
                3
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#f8fafc" }}>Aegis S3 Lockdown & AXIOM Scan</div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>WORM Object Lock engaged; perimeter audited</div>
              </div>
            </div>
          </div>

          {/* Quick Playbook CTA */}
          <Link
            href="/cross-platform-playbooks"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              padding: "8px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              color: "#a855f7",
              textDecoration: "none"
            }}
          >
            <span>Open SOAR Playbook Canvas</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Cross-Platform Correlated Incidents & Real-Time Telemetry Feed */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
        {/* Correlated Incidents Table */}
        <div className="card-tactical" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldAlert size={16} color="#f43f5e" />
              <h2 style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
                Active Cross-Platform Correlated Incidents
              </h2>
            </div>
            <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
              CORRELATION ENGINE ACTIVE
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MOCK_TELEMETRY_EVENTS.slice(0, 3).map((event) => (
              <div
                key={event.id}
                onClick={() => setSelectedIncident(event.correlationId)}
                style={{
                  background: selectedIncident === event.correlationId ? "rgba(244,63,94,0.08)" : "var(--surface-2)",
                  border: `1px solid ${selectedIncident === event.correlationId ? "rgba(244,63,94,0.4)" : "var(--border)"}`,
                  borderRadius: 8,
                  padding: 12,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className={`badge-sev badge-${event.severity.toLowerCase()}`}>
                      {event.severity}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: 12.5, color: "#f8fafc" }}>
                      {event.eventType.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                    {event.timestamp.split(" ")[1]}
                  </span>
                </div>

                <p style={{ fontSize: 11.5, color: "var(--fg-2)", margin: "0 0 8px 0" }}>
                  {event.details}
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10.5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "var(--muted)" }}>Origin:</span>
                    <strong style={{ color: "#06b6d4" }}>{event.sourcePlatform.toUpperCase()}</strong>
                    <span style={{ color: "var(--muted)" }}>→ Host:</span>
                    <strong style={{ color: "var(--fg-2)" }}>{event.targetHost}</strong>
                  </div>
                  <span style={{ color: "#10b981", fontWeight: 600 }}>
                    ✓ {event.actionTaken}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Synchronized IOC Threat Intel Stream */}
        <div className="card-tactical" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Crosshair size={16} color="#06b6d4" />
              <h2 style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
                Synchronized IOC Threat Feed
              </h2>
            </div>
            <Link href="/shared-threat-intel" style={{ fontSize: 11, color: "#06b6d4", textDecoration: "none", fontWeight: 700 }}>
              View All (STIX 2.1) →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {UNIFIED_IOCS.slice(0, 4).map((ioc) => (
              <div
                key={ioc.id}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      background: "rgba(6,182,212,0.15)",
                      color: "#06b6d4",
                      padding: "1px 5px",
                      borderRadius: 3,
                      fontFamily: "monospace"
                    }}>
                      {ioc.type}
                    </span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#f8fafc" }}>
                      {ioc.threatActor}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>
                    {ioc.syncStatus} ({ioc.confidenceScore}% Conf)
                  </span>
                </div>
                <div style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#a855f7",
                  background: "var(--surface-3)",
                  padding: "4px 8px",
                  borderRadius: 4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {ioc.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
