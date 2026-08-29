"use client";
import { useState } from "react";
import {
  Cpu,
  Activity,
  Layers,
  Zap,
  Radio,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  Server,
  Sliders,
  Play,
  RotateCcw
} from "lucide-react";
import { MESH_SERVICE_NODES } from "@/data/integrationData";
import { MeshServiceNode } from "@/types/integration";

export default function MeshHealthPage() {
  const [nodes, setNodes] = useState<MeshServiceNode[]>(MESH_SERVICE_NODES);
  const [selectedNode, setSelectedNode] = useState<MeshServiceNode>(MESH_SERVICE_NODES[0]);
  const [simulatedSpanActive, setSimulatedSpanActive] = useState<boolean>(false);

  const handleToggleCircuitBreaker = (nodeId: string) => {
    setNodes(nodes.map((n) => {
      if (n.id === nodeId) {
        const nextState = n.circuitBreakerStatus === "CLOSED" ? "OPEN" : "CLOSED";
        return { ...n, circuitBreakerStatus: nextState };
      }
      return n;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px 20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Cpu size={20} color="#10b981" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
              Distributed Microservices Mesh & Service Health Telemetry
            </h1>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0 0" }}>
              OpenTelemetry distributed trace waterfalls, gRPC connection pool health, and automated circuit-breaker monitors.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => {
              setSimulatedSpanActive(true);
              setTimeout(() => setSimulatedSpanActive(false), 2000);
            }}
            className="btn-primary"
          >
            <Play size={14} />
            <span>{simulatedSpanActive ? "Emitting OTel Trace..." : "Emit OTel Trace Span"}</span>
          </button>
        </div>
      </div>

      {/* Cluster Overview Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Mesh Service Health", val: "100.0%", sub: "6/6 Nodes Operational", color: "#10b981" },
          { label: "Active gRPC Streams", val: "564 Active", sub: "HTTP/2 Multiplexed", color: "#06b6d4" },
          { label: "Avg Cluster Latency", val: "4.8ms", sub: "Envoy sidecar proxies", color: "#a855f7" },
          { label: "OTel Traces Processed", val: "20.1M Spans", sub: "Jaeger / OTLP Collector", color: "#f59e0b" }
        ].map((m, i) => (
          <div key={i} className="card-tactical" style={{ padding: "12px 16px" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{m.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc", margin: "4px 0" }}>{m.val}</div>
            <div style={{ fontSize: 10.5, color: m.color, fontWeight: 600 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Microservices Nodes Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {nodes.map((node) => {
          const isSelected = selectedNode.id === node.id;
          const isClosed = node.circuitBreakerStatus === "CLOSED";

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              style={{
                background: isSelected ? "rgba(16,185,129,0.12)" : "var(--surface-2)",
                border: `1px solid ${isSelected ? "#10b981" : "var(--border)"}`,
                borderRadius: 8,
                padding: 14,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 10
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: "#f8fafc" }}>
                  {node.serviceName}
                </div>
                <span style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  background: isClosed ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)",
                  color: isClosed ? "#10b981" : "#f43f5e",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontFamily: "monospace"
                }}>
                  {node.circuitBreakerStatus}
                </span>
              </div>

              <div style={{ background: "var(--surface-3)", padding: 8, borderRadius: 6, fontSize: 11, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>CPU / RAM:</span>
                  <span style={{ color: "var(--fg-2)" }}>{node.cpuPercent}% / {node.memoryPercent}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>gRPC Pool:</span>
                  <span style={{ color: "#06b6d4" }}>{node.grpcPoolActive} / {node.grpcPoolMax} conns</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>P99 Latency:</span>
                  <strong style={{ color: "#10b981" }}>{node.p99LatencyMs}ms</strong>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                  {node.cluster}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleCircuitBreaker(node.id);
                  }}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid var(--border)",
                    color: "var(--fg-2)",
                    fontSize: 10,
                    padding: "3px 8px",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  {isClosed ? "Trip Breaker" : "Reset Breaker"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* OpenTelemetry Distributed Tracing Waterfall Visualizer */}
      <div className="card-tactical" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={16} color="#06b6d4" />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
              OpenTelemetry (OTel) Distributed Trace Waterfall (Trace ID: 4bf92f3577b34da6a3ce929d0e0e4736)
            </h2>
          </div>
          <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>
            Total Span: 18.2ms
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "var(--surface-2)", padding: 14, borderRadius: 8, border: "1px solid var(--border)" }}>
          {[
            { span: "POST /v1/telemetry/events/ingest", service: "federated-graphql-gateway", duration: "18.2ms", width: "100%", offset: "0%", color: "#a855f7" },
            { span: "Auth JWT Signature Verification", service: "identity-oauth2-pki-vault", duration: "2.1ms", width: "18%", offset: "5%", color: "#10b981" },
            { span: "gRPC Proto Buffer Parse & Dispatch", service: "telemetry-bus-kafka-broker-01", duration: "3.4ms", width: "24%", offset: "24%", color: "#06b6d4" },
            { span: "STIX 2.1 Threat Intel IOC Matching", service: "stix-ioc-sync-engine", duration: "4.2ms", width: "32%", offset: "48%", color: "#f59e0b" },
            { span: "OpenSearch Bulk Index Ingestion", service: "data-lake-opensearch-bridge", duration: "5.1ms", width: "38%", offset: "62%", color: "#f43f5e" }
          ].map((item, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11 }}>
              <div style={{ width: 220, fontFamily: "monospace", color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.span}
              </div>
              <div style={{ width: 180, color: "var(--muted)" }}>
                {item.service}
              </div>
              <div style={{ flex: 1, position: "relative", height: 18, background: "rgba(255,255,255,0.04)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  position: "absolute",
                  left: item.offset,
                  width: item.width,
                  height: "100%",
                  background: item.color,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 6,
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#050811"
                }}>
                  {item.duration}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
