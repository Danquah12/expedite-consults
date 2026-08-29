"use client";
import { useState, useEffect } from "react";
import {
  Radio,
  Play,
  Pause,
  Filter,
  Search,
  Maximize2,
  Download,
  Terminal,
  Activity,
  Zap,
  CheckCircle,
  AlertOctagon,
  Copy,
  Plus,
  RefreshCw,
  Code
} from "lucide-react";
import { MOCK_TELEMETRY_EVENTS, CONNECTED_PLATFORMS } from "@/data/integrationData";
import { TelemetryEvent, Severity, PlatformId } from "@/types/integration";

export default function FederatedTelemetryPage() {
  const [events, setEvents] = useState<TelemetryEvent[]>(MOCK_TELEMETRY_EVENTS);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(1);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeEvent, setActiveEvent] = useState<TelemetryEvent | null>(MOCK_TELEMETRY_EVENTS[0]);
  const [isInjectModalOpen, setIsInjectModalOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Event Injection State
  const [injectPlatform, setInjectPlatform] = useState<PlatformId>("cerberus-re");
  const [injectSeverity, setInjectSeverity] = useState<Severity>("CRITICAL");
  const [injectEventType, setInjectEventType] = useState<string>("HEURISTIC_ZERO_DAY_BEHAVIOR");
  const [injectDetails, setInjectDetails] = useState<string>("In-memory reflection code execution detected bypassing AMSI.");

  // Dynamic Stream Simulation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const randomPlatform = CONNECTED_PLATFORMS[Math.floor(Math.random() * CONNECTED_PLATFORMS.length)];
      const severities: Severity[] = ["INFO", "MEDIUM", "HIGH", "CRITICAL"];
      const randSev = severities[Math.floor(Math.random() * severities.length)];
      
      const newEvent: TelemetryEvent = {
        id: `EVT-${Math.floor(90450 + Math.random() * 1000)}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 23),
        sourcePlatform: randomPlatform.id,
        eventType: `${randomPlatform.id.toUpperCase()}_STREAM_${Math.floor(Math.random() * 900 + 100)}`,
        severity: randSev,
        targetHost: `node-${randomPlatform.id}-${Math.floor(Math.random() * 20 + 1)}`,
        correlationId: `CORR-${Math.floor(10000 + Math.random() * 90000)}`,
        details: `Streaming telemetry telemetry frame verified via gRPC proto channel from ${randomPlatform.name}`,
        payload: {
          metrics: { cpu: (Math.random() * 40 + 20).toFixed(1), rps: Math.floor(Math.random() * 5000 + 1000) },
          origin: randomPlatform.id,
          grpc_seq: Math.floor(Math.random() * 999999)
        },
        actionTaken: "Streamed to Kafka partition 03",
        latencyMs: Math.floor(Math.random() * 15 + 2)
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 49)]);
    }, 2200 / streamSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, streamSpeed]);

  const filteredEvents = events.filter((e) => {
    if (selectedPlatform !== "ALL" && e.sourcePlatform !== selectedPlatform) return false;
    if (selectedSeverity !== "ALL" && e.severity !== selectedSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.id.toLowerCase().includes(q) ||
        e.eventType.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q) ||
        e.targetHost.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleInjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customEvent: TelemetryEvent = {
      id: `EVT-${Math.floor(99000 + Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 23),
      sourcePlatform: injectPlatform,
      eventType: injectEventType,
      severity: injectSeverity,
      targetHost: "manual-injection-probe-01",
      correlationId: `CORR-MANUAL-${Math.floor(1000 + Math.random() * 9000)}`,
      details: injectDetails,
      payload: {
        injected_by: "Security_Engineer_Admin",
        source: "Telemetry_Control_Console",
        stix_propagated: true
      },
      actionTaken: "Injected to Kafka Bus & Correlated",
      latencyMs: 3
    };

    setEvents([customEvent, ...events]);
    setActiveEvent(customEvent);
    setIsInjectModalOpen(false);
  };

  const handleCopyPayload = () => {
    if (!activeEvent) return;
    navigator.clipboard.writeText(JSON.stringify(activeEvent.payload, null, 2));
    setCopiedId(activeEvent.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Header */}
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
            background: "rgba(6,182,212,0.15)",
            border: "1px solid rgba(6,182,212,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Radio size={20} color="#06b6d4" className="animate-pulse" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
              Real-Time Cross-Product Telemetry Stream & gRPC/Kafka Bus
            </h1>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0 0" }}>
              High-throughput streaming telemetry hub processing 24,500 events/sec from CERBERUS-RE, Aegis Recovery, and AXIOM DAST.
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: isPlaying ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
              border: `1px solid ${isPlaying ? "#10b981" : "#f59e0b"}`,
              color: isPlaying ? "#10b981" : "#f59e0b",
              fontWeight: 700,
              fontSize: 12,
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? "STREAM ACTIVE" : "STREAM PAUSED"}</span>
          </button>

          <select
            value={streamSpeed}
            onChange={(e) => setStreamSpeed(Number(e.target.value))}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              fontSize: 11.5,
              fontWeight: 600,
              padding: "6px 10px",
              borderRadius: 6,
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value={1}>Speed: 1x</option>
            <option value={2}>Speed: 2x</option>
            <option value={5}>Speed: 5x</option>
            <option value={10}>Speed: 10x (Burst)</option>
          </select>

          <button
            onClick={() => setIsInjectModalOpen(true)}
            style={{
              background: "var(--primary)",
              color: "#050811",
              fontWeight: 800,
              fontSize: 12,
              padding: "6px 14px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Plus size={14} />
            <span>Inject Synthetic Event</span>
          </button>
        </div>
      </div>

      {/* 4 Performance Gauges */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Kafka Bus Ingestion", val: "24,580 evt/s", sub: "12 Partitions balanced", color: "#06b6d4" },
          { label: "Buffer Drop Rate", val: "0.000%", sub: "Zero packet loss", color: "#10b981" },
          { label: "gRPC Channel Latency", val: "1.8ms (P99)", sub: "HTTP/2 multiplexed", color: "#a855f7" },
          { label: "Correlated Incidents", val: "3 Active", sub: "Auto-linked by hash/IP", color: "#f43f5e" },
        ].map((g, i) => (
          <div key={i} className="card-tactical" style={{ padding: "12px 16px" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{g.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc", margin: "4px 0" }}>{g.val}</div>
            <div style={{ fontSize: 10.5, color: g.color, fontWeight: 600 }}>{g.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "10px 14px",
        gap: 12
      }}>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, background: "var(--surface-2)", padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)" }}>
          <Search size={14} color="var(--muted)" />
          <input
            placeholder="Filter event ID, correlation ID, target host, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#f8fafc",
              fontSize: 12.5,
              width: "100%"
            }}
          />
        </div>

        {/* Platform Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>PLATFORM:</span>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="tool-select"
          >
            <option value="ALL">All Platforms (6)</option>
            {CONNECTED_PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Severity Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>SEVERITY:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="tool-select"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>

      {/* Main Stream Area: Live Table (Left) + Payload Inspector (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        {/* Stream Table */}
        <div className="card-tactical" style={{ padding: 14, height: 600, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>
              Live Telemetry Frames ({filteredEvents.length})
            </span>
            <span style={{ fontSize: 10, color: "#10b981", fontFamily: "monospace" }}>
              ● LIVE STREAMING
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredEvents.map((evt) => {
              const isSelected = activeEvent?.id === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => setActiveEvent(evt)}
                  style={{
                    background: isSelected ? "rgba(6,182,212,0.12)" : "var(--surface-2)",
                    border: `1px solid ${isSelected ? "#06b6d4" : "var(--border)"}`,
                    borderRadius: 6,
                    padding: "8px 12px",
                    cursor: "pointer",
                    transition: "all 0.12s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className={`badge-sev badge-${evt.severity.toLowerCase()}`}>
                        {evt.severity}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: 12, color: "#f8fafc" }}>
                        {evt.eventType}
                      </span>
                    </div>
                    <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                      {evt.timestamp.split(" ")[1]}
                    </span>
                  </div>

                  <div style={{ fontSize: 11, color: "var(--fg-2)", marginBottom: 4 }}>
                    {evt.details}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, color: "var(--muted)" }}>
                    <div>
                      <span>Source: </span>
                      <strong style={{ color: "#06b6d4" }}>{evt.sourcePlatform.toUpperCase()}</strong>
                      <span> · Latency: </span>
                      <strong style={{ color: "#10b981" }}>{evt.latencyMs}ms</strong>
                    </div>
                    <span style={{ fontFamily: "monospace", color: "var(--fg-2)" }}>{evt.targetHost}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payload Inspector */}
        <div className="card-tactical" style={{ padding: 16, height: 600, display: "flex", flexDirection: "column" }}>
          {activeEvent ? (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Code size={16} color="#06b6d4" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                    Telemetry Frame Inspector ({activeEvent.id})
                  </span>
                </div>
                <button
                  onClick={handleCopyPayload}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--fg-2)",
                    fontSize: 11,
                    padding: "4px 8px",
                    borderRadius: 4,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <Copy size={11} />
                  <span>{copiedId === activeEvent.id ? "Copied!" : "Copy JSON"}</span>
                </button>
              </div>

              {/* Event Metadata Breakdown */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                background: "var(--surface-2)",
                padding: 10,
                borderRadius: 6,
                fontSize: 11,
                marginBottom: 12
              }}>
                <div>
                  <span style={{ color: "var(--muted)" }}>Correlation ID: </span>
                  <strong style={{ color: "#a855f7" }}>{activeEvent.correlationId}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)" }}>Target Node: </span>
                  <strong style={{ color: "#f8fafc" }}>{activeEvent.targetHost}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)" }}>Source Platform: </span>
                  <strong style={{ color: "#06b6d4" }}>{activeEvent.sourcePlatform}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)" }}>Action Enforced: </span>
                  <strong style={{ color: "#10b981" }}>{activeEvent.actionTaken || "Forwarded"}</strong>
                </div>
              </div>

              {/* Raw JSON Code Block */}
              <div style={{ flex: 1, overflowY: "auto", background: "#050811", border: "1px solid var(--border)", borderRadius: 6, padding: 12 }}>
                <pre style={{
                  fontFamily: "Consolas, Monaco, monospace",
                  fontSize: 11,
                  color: "#34d399",
                  margin: 0,
                  whiteSpace: "pre-wrap"
                }}>
                  {JSON.stringify(activeEvent.payload, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)", fontSize: 13 }}>
              Select an event to inspect its Protobuf payload
            </div>
          )}
        </div>
      </div>

      {/* Synthetic Event Injector Modal */}
      {isInjectModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(6px)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            width: "100%",
            maxWidth: 520,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 20,
            boxShadow: "0 10px 40px rgba(0,0,0,0.6)"
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "#f8fafc", marginBottom: 14 }}>
              Inject Synthetic Telemetry Event
            </h3>

            <form onSubmit={handleInjectSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  SOURCE PLATFORM
                </label>
                <select
                  value={injectPlatform}
                  onChange={(e) => setInjectPlatform(e.target.value as PlatformId)}
                  className="tool-select"
                  style={{ width: "100%" }}
                >
                  {CONNECTED_PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.codeName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  SEVERITY
                </label>
                <select
                  value={injectSeverity}
                  onChange={(e) => setInjectSeverity(e.target.value as Severity)}
                  className="tool-select"
                  style={{ width: "100%" }}
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                  <option value="INFO">INFO</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  EVENT TYPE NAME
                </label>
                <input
                  value={injectEventType}
                  onChange={(e) => setInjectEventType(e.target.value)}
                  className="tool-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  DETAILS & CONTEXT
                </label>
                <textarea
                  value={injectDetails}
                  onChange={(e) => setInjectDetails(e.target.value)}
                  className="tool-input"
                  style={{ width: "100%", height: 80 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsInjectModalOpen(false)}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--fg)",
                    padding: "8px 14px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Inject into Kafka Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
