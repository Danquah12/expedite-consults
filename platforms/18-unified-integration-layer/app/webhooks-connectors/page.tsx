"use client";
import { useState } from "react";
import {
  Share2,
  Send,
  CheckCircle,
  AlertTriangle,
  Flame,
  Shield,
  Radio,
  Cloud,
  Building2,
  CheckSquare,
  MessageSquare,
  Bell,
  RefreshCw,
  Copy,
  Plus,
  Zap,
  Sliders
} from "lucide-react";
import { WEBHOOK_CONNECTORS } from "@/data/integrationData";
import { WebhookConnector } from "@/types/integration";

export default function WebhooksConnectorsPage() {
  const [connectors, setConnectors] = useState<WebhookConnector[]>(WEBHOOK_CONNECTORS);
  const [selectedConnector, setSelectedConnector] = useState<WebhookConnector>(WEBHOOK_CONNECTORS[0]);
  const [testPayloadType, setTestPayloadType] = useState<string>("MALWARE_IOC");
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>({
    status: 200,
    statusText: "OK",
    latency: "14ms",
    responseBody: {
      success: true,
      delivered_to: "Splunk HEC Input 8088",
      event_id: "SPLUNK-EVT-481920",
      timestamp: "2026-08-24T01:14:00Z"
    }
  });
  const [isNewConnectorModalOpen, setIsNewConnectorModalOpen] = useState<boolean>(false);

  const handleSendTestWebhook = () => {
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      setTestResult({
        status: 200,
        statusText: "OK",
        latency: `${Math.floor(Math.random() * 20 + 8)}ms`,
        responseBody: {
          success: true,
          connector: selectedConnector.name,
          endpoint: selectedConnector.endpointUrl,
          delivered_payload: testPayloadType,
          hsm_signature: "0x89f41b...validated",
          dispatched_at: new Date().toISOString()
        }
      });
    }, 700);
  };

  const getConnectorIcon = (iconName: string) => {
    switch (iconName) {
      case "Flame": return Flame;
      case "Shield": return Shield;
      case "Radio": return Radio;
      case "Cloud": return Cloud;
      case "Building2": return Building2;
      case "CheckSquare": return CheckSquare;
      case "MessageSquare": return MessageSquare;
      case "Bell": return Bell;
      default: return Share2;
    }
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
            <Share2 size={20} color="#10b981" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
              Enterprise Integrations & SIEM/EDR Connectors
            </h1>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0 0" }}>
              Pre-configured webhooks and stream bridges for Splunk, Microsoft Sentinel, CrowdStrike, AWS Security Hub, ServiceNow, and Slack.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewConnectorModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={14} />
          <span>Add Enterprise Connector</span>
        </button>
      </div>

      {/* 4 Summary Gauges */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Active Connectors", val: "8 Connected", sub: "0 Degraded / 0 Failing", color: "#10b981" },
          { label: "24h Delivered Events", val: "2,645,892", sub: "100% Delivery SLA", color: "#06b6d4" },
          { label: "Average Dispatch Latency", val: "18.4ms", sub: "Async non-blocking queue", color: "#a855f7" },
          { label: "Retry Backoff Queue", val: "0 Pending", sub: "Zero deadlock state", color: "#f59e0b" }
        ].map((g, i) => (
          <div key={i} className="card-tactical" style={{ padding: "12px 16px" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{g.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc", margin: "4px 0" }}>{g.val}</div>
            <div style={{ fontSize: 10.5, color: g.color, fontWeight: 600 }}>{g.sub}</div>
          </div>
        ))}
      </div>

      {/* Connectors Grid (Top) + Interactive Test Console (Bottom) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {connectors.map((conn) => {
          const Icon = getConnectorIcon(conn.iconName);
          const isSelected = selectedConnector.id === conn.id;

          return (
            <div
              key={conn.id}
              onClick={() => setSelectedConnector(conn)}
              style={{
                background: isSelected ? "rgba(16,185,129,0.12)" : "var(--surface-2)",
                border: `1px solid ${isSelected ? "#10b981" : "var(--border)"}`,
                borderRadius: 8,
                padding: 14,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                transition: "all 0.12s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: isSelected ? "rgba(16,185,129,0.2)" : "var(--surface-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Icon size={16} color={isSelected ? "#10b981" : "var(--muted)"} />
                </div>
                <span style={{
                  fontSize: 9,
                  fontWeight: 800,
                  background: "rgba(16,185,129,0.15)",
                  color: "#10b981",
                  padding: "1px 5px",
                  borderRadius: 3
                }}>
                  {conn.status}
                </span>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>{conn.name}</div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>Category: {conn.category}</div>
              </div>

              <div style={{ background: "var(--surface-3)", padding: "6px 8px", borderRadius: 4, fontSize: 10.5, display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>24h Events:</span>
                <strong style={{ color: "#06b6d4" }}>{conn.eventsForwarded24h.toLocaleString()}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Webhook Test Console */}
      <div className="card-tactical" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={16} color="#10b981" />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
              Live Webhook Test Console ({selectedConnector.name})
            </h2>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
            Endpoint: {selectedConnector.endpointUrl.substring(0, 48)}...
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16 }}>
          {/* Left: Dispatch Settings */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                SIMULATED PAYLOAD TYPE
              </label>
              <select
                value={testPayloadType}
                onChange={(e) => setTestPayloadType(e.target.value)}
                className="tool-select"
                style={{ width: "100%" }}
              >
                <option value="MALWARE_IOC">LockBit 3.0 C2 & Hash IOC Notification</option>
                <option value="WORM_LOCKDOWN">Aegis Recovery WORM S3 Snapshot Lockdown Event</option>
                <option value="DAST_SSRF">AXIOM DAST High-Severity Blind SSRF Finding</option>
                <option value="EXPLOIT_POC">Exploitability AI Spring Core RCE Verification</option>
              </select>
            </div>

            <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, fontSize: 11, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Authentication:</span>
                <strong style={{ color: "#a855f7" }}>{selectedConnector.authType}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Average Latency:</span>
                <strong style={{ color: "#10b981" }}>{selectedConnector.avgLatencyMs}ms</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Last Ping:</span>
                <span style={{ color: "var(--fg-2)" }}>{selectedConnector.lastPing}</span>
              </div>
            </div>

            <button
              onClick={handleSendTestWebhook}
              disabled={isSendingTest}
              className="btn-primary"
              style={{ justifyContent: "center" }}
            >
              <Send size={14} className={isSendingTest ? "animate-spin" : ""} />
              <span>{isSendingTest ? "DISPATCHING WEBHOOK..." : "Dispatch Test Webhook"}</span>
            </button>
          </div>

          {/* Right: Response Output */}
          <div style={{ background: "#050811", border: "1px solid var(--border)", borderRadius: 6, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>HTTP RESPONSE</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981" }}>
                {testResult.status} {testResult.statusText} ({testResult.latency})
              </span>
            </div>
            <pre style={{ flex: 1, fontFamily: "monospace", fontSize: 11, color: "#34d399", margin: 0, overflowY: "auto" }}>
              {JSON.stringify(testResult.responseBody, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
