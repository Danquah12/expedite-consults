"use client";
import { useState } from "react";
import {
  Cpu, Activity, Layers, Zap, Radio, CheckCircle, AlertTriangle,
  RefreshCw, ShieldAlert, Server, Sliders, Play, RotateCcw, HelpCircle,
  Info, CheckCircle2, ShieldCheck, Share2, Database, Key, Globe, ArrowRight,
  ChevronRight, Network
} from "lucide-react";
import { MESH_SERVICE_NODES } from "@/data/integrationData";
import { MeshServiceNode } from "@/types/integration";

// Connected systems mapping for each microservice node
const SYSTEM_CONNECTIONS: Record<string, { role: string; connectedSystems: string[]; downstreamTargets: string[] }> = {
  "telemetry-bus-kafka-broker-01": {
    role: "High-speed streaming event bus broadcasting real-time detections across all platforms.",
    connectedSystems: ["CERBERUS-RE (Plat 16)", "Aegis Recovery (Plat 17)", "AXIOM DAST (Plat 11)", "Apache Kafka Cluster", "Envoy Sidecars"],
    downstreamTargets: ["stix-ioc-sync-engine", "data-lake-opensearch-bridge"]
  },
  "stix-ioc-sync-engine": {
    role: "Automated threat intelligence disseminator translating IOCs into STIX 2.1 format.",
    connectedSystems: ["Shared Threat Intel Hub", "CrowdStrike Falcon EDR", "Microsoft Sentinel SIEM", "Suricata IDS", "MISP Taxii"],
    downstreamTargets: ["All Enterprise EDR Endpoints", "Firewall Perimeter"]
  },
  "soar-orchestrator-core": {
    role: "Autonomous incident response engine executing microsecond quarantine and containment playbooks.",
    connectedSystems: ["Aegis WORM S3 Locker", "Envoy WAF Proxy Rules", "Okta Key Rotation", "ServiceNow SIR", "PagerDuty API"],
    downstreamTargets: ["Kubernetes Cluster Nodes", "AWS IAM Roles"]
  },
  "federated-graphql-gateway": {
    role: "Unified API gateway proxy and entry point connecting frontend dashboards to backend microservices.",
    connectedSystems: ["Expedite Launchpad (Port 3018)", "All 16 Platform Frontends", "OpenAPI 3.1 Proxy", "gRPC Clients"],
    downstreamTargets: ["All 6 Internal Microservices"]
  },
  "data-lake-opensearch-bridge": {
    role: "Bulk indexing pipeline feeding decompiled binaries, PCAP streams, and audit logs into OpenSearch.",
    connectedSystems: ["OpenSearch v2.14 Cluster (44.2 TB)", "AWS S3 Glacier Vault", "Zeek PCAP Sniffer", "AST Parser"],
    downstreamTargets: ["Forensic Data Lake Shards (24/24)"]
  },
  "identity-oauth2-pki-vault": {
    role: "Zero-Trust authentication and HSM token-signing authority securing all inter-service communications.",
    connectedSystems: ["Okta SSO", "Microsoft Entra ID", "PingFederate", "AWS KMS Hardware HSM", "mTLS Vault"],
    downstreamTargets: ["All API Tokens & User Sessions"]
  }
};

export default function MeshHealthPage() {
  const [nodes, setNodes] = useState<MeshServiceNode[]>(MESH_SERVICE_NODES);
  const [selectedNode, setSelectedNode] = useState<MeshServiceNode | null>(null);
  const [simulatedSpanActive, setSimulatedSpanActive] = useState<boolean>(false);
  const [activeWaterfallSpan, setActiveWaterfallSpan] = useState<string | null>("gateway");

  const handleToggleCircuitBreaker = (nodeId: string) => {
    setNodes(nodes.map((n) => {
      if (n.id === nodeId) {
        const nextState = n.circuitBreakerStatus === "CLOSED" ? "OPEN" : "CLOSED";
        return { ...n, circuitBreakerStatus: nextState };
      }
      return n;
    }));
  };

  const handleEmitTrace = () => {
    setSimulatedSpanActive(true);
    setTimeout(() => setSimulatedSpanActive(false), 2200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1600, margin: "0 auto" }}>
      
      {/* ── Top Executive Header Banner ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.08) 100%)",
        border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: 12,
        padding: "18px 24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(16,185,129,0.35)"
          }}>
            <Cpu size={24} color="#050811" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>
                Distributed Microservices Mesh & Service Health Telemetry
              </h1>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                background: "rgba(16,185,129,0.15)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.3)",
                padding: "2px 8px",
                borderRadius: 4,
                fontFamily: "monospace"
              }}>
                ALL 6 NODES ONLINE
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "3px 0 0 0" }}>
              OpenTelemetry distributed trace waterfalls, gRPC connection pool health, and automated circuit-breaker monitors.
            </p>
          </div>
        </div>

        <button
          onClick={handleEmitTrace}
          disabled={simulatedSpanActive}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "8px 16px" }}
        >
          <Play size={13} fill="#fff" />
          <span>{simulatedSpanActive ? "Emitting OTel Span..." : "Emit OTel Trace Span"}</span>
        </button>
      </div>

      {/* ── Plain-English Helper Banner ── */}
      <div style={{
        background: "rgba(16,185,129,0.06)",
        border: "1px solid rgba(16,185,129,0.25)",
        borderRadius: 10,
        padding: "14px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12
      }}>
        <HelpCircle size={20} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--foreground-muted)" }}>
          <strong style={{ color: "#10b981" }}>Which Systems Does This Connect To? </strong>
          The 6 background nodes below act as the nervous system connecting all <strong>16 cybersecurity platforms</strong> (SAST, DAST, CERBERUS-RE, Aegis Recovery, Cloud Security) to your enterprise infrastructure: <strong>CrowdStrike Falcon EDR</strong>, <strong>Microsoft Sentinel SIEM</strong>, <strong>Splunk</strong>, <strong>AWS S3 Vaults</strong>, <strong>OpenSearch</strong>, and <strong>Okta SSO</strong>.
        </div>
      </div>

      {/* ── 4 Cluster Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {[
          { label: "Mesh Service Health", val: "100.0%", sub: "6/6 Nodes Operational", color: "#10b981" },
          { label: "Active gRPC Streams", val: "564 Active", sub: "HTTP/2 Multiplexed", color: "#06b6d4" },
          { label: "Avg Cluster Latency", val: "4.8ms", sub: "Envoy sidecar proxies", color: "#a855f7" },
          { label: "OTel Traces Processed", val: "20.1M Spans", sub: "Jaeger / OTLP Collector", color: "#f59e0b" }
        ].map((m, i) => (
          <div key={i} className="card-tactical" style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc", margin: "4px 0" }}>{m.val}</div>
            <div style={{ fontSize: 11, color: m.color, fontWeight: 600 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── 6 Microservice Nodes with Explicit "Connected Systems" & Controls ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14 }}>
        {nodes.map((node) => {
          const isClosed = node.circuitBreakerStatus === "CLOSED";
          const connInfo = SYSTEM_CONNECTIONS[node.serviceName] || {
            role: "Enterprise service bridge.",
            connectedSystems: ["Expedite Ecosystem Platforms", "Envoy Proxy"],
            downstreamTargets: ["Internal Event Bus"]
          };

          return (
            <div
              key={node.id}
              style={{
                background: isClosed ? "var(--surface-2)" : "rgba(244,63,94,0.08)",
                border: `1px solid ${isClosed ? "var(--border)" : "rgba(244,63,94,0.4)"}`,
                borderRadius: 10,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                transition: "all 0.15s"
              }}
              className="hover:border-emerald-500"
            >
              {/* Node Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <strong style={{ fontSize: 13.5, color: "#f8fafc" }}>{node.serviceName}</strong>
                <span style={{
                  fontSize: 9.5,
                  fontWeight: 900,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: isClosed ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.2)",
                  color: isClosed ? "#10b981" : "#f43f5e",
                  border: `1px solid ${isClosed ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.4)"}`
                }}>
                  {node.circuitBreakerStatus}
                </span>
              </div>

              <p style={{ fontSize: 11, color: "var(--muted)", margin: 0, lineHeight: 1.4 }}>
                {connInfo.role}
              </p>

              {/* Connected Systems Badges */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>
                  CONNECTED SYSTEMS & PLATFORMS:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {connInfo.connectedSystems.map((sys, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        background: "rgba(6,182,212,0.1)",
                        color: "#06b6d4",
                        border: "1px solid rgba(6,182,212,0.25)",
                        padding: "1px 6px",
                        borderRadius: 3
                      }}
                    >
                      {sys}
                    </span>
                  ))}
                </div>
              </div>

              {/* Performance Metrics Row */}
              <div style={{ background: "var(--surface-3)", padding: "8px 10px", borderRadius: 6, fontSize: 11, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>CPU / RAM Load:</span>
                  <strong style={{ color: "#06b6d4" }}>{node.cpuPercent}% / {node.memoryPercent}%</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>gRPC Connection Pool:</span>
                  <span style={{ color: "#f8fafc" }}>{node.grpcPoolActive} / {node.grpcPoolMax} conns</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>P99 Mesh Latency:</span>
                  <strong style={{ color: "#10b981" }}>{node.p99LatencyMs}ms</strong>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 6, marginTop: 2 }}>
                <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>{node.cluster}</span>
                <button
                  onClick={() => handleToggleCircuitBreaker(node.id)}
                  style={{
                    background: isClosed ? "rgba(244,63,94,0.15)" : "rgba(16,185,129,0.2)",
                    border: `1px solid ${isClosed ? "rgba(244,63,94,0.3)" : "#10b981"}`,
                    color: isClosed ? "#f43f5e" : "#10b981",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                  title="Test Automatic Service Isolation"
                >
                  {isClosed ? "Trip Breaker" : "Reset Breaker"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── OpenTelemetry (OTel) Distributed Trace Waterfall ── */}
      <div className="card-tactical" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={17} color="#06b6d4" />
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
              OpenTelemetry (OTel) Distributed Trace Waterfall (Trace ID: 4bf92f3577b34da6a3ce929d0e0e4736)
            </h3>
          </div>
          <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700, fontFamily: "monospace" }}>
            Total Span: 18.2ms
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { id: "gateway", service: "POST /v1/telemetry/events/ingest", node: "federated-graphql-gateway", time: "10.2ms", color: "#a855f7", width: "100%" },
            { id: "auth", service: "Auth JWT Signature Verification", node: "identity-oauth2-pki-vault", time: "2.1ms", color: "#10b981", width: "22%", offset: "12%" },
            { id: "kafka", service: "gRPC Proto Buffer Parse & Dispatch", node: "telemetry-bus-kafka-broker-01", time: "3.4ms", color: "#06b6d4", width: "35%", offset: "35%" },
            { id: "stix", service: "STIX 2.1 Threat Intel IOC Matching", node: "stix-ioc-sync-engine", time: "4.2ms", color: "#f59e0b", width: "42%", offset: "50%" },
            { id: "opensearch", service: "OpenSearch Bulk Index Ingestion", node: "data-lake-opensearch-bridge", time: "5.1ms", color: "#f43f5e", width: "52%", offset: "48%" }
          ].map(span => (
            <div
              key={span.id}
              onClick={() => setActiveWaterfallSpan(span.id)}
              style={{
                background: activeWaterfallSpan === span.id ? "var(--surface-3)" : "var(--surface-2)",
                border: `1px solid ${activeWaterfallSpan === span.id ? span.color : "var(--border)"}`,
                borderRadius: 6,
                padding: "8px 12px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 6
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 800, color: "#f8fafc" }}>{span.service}</span>
                  <span style={{ color: "var(--muted)", fontSize: 10 }}>({span.node})</span>
                </div>
                <strong style={{ color: span.color }}>{span.time}</strong>
              </div>

              {/* Progress Waterfall Bar */}
              <div style={{ width: "100%", height: 6, background: "rgba(0,0,0,0.3)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: span.width,
                  marginLeft: span.offset || "0%",
                  background: span.color,
                  borderRadius: 3
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
