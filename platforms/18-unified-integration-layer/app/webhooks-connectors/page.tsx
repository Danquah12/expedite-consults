"use client";
import { useState, useEffect } from "react";
import {
  Share2, Send, CheckCircle, AlertTriangle, Flame, Shield, Radio,
  Cloud, Building2, CheckSquare, MessageSquare, Bell, RefreshCw,
  Copy, Plus, Zap, Sliders, Search, Filter, Trash2, Edit3, Check,
  ExternalLink, ArrowRight, Play, Eye, Code, Terminal, Clock,
  ToggleLeft, ToggleRight, X, Sparkles, CheckCircle2, RotateCcw
} from "lucide-react";
import { WEBHOOK_CONNECTORS } from "@/data/integrationData";
import { WebhookConnector } from "@/types/integration";

interface DeliveryLog {
  id: string;
  timestamp: string;
  connectorName: string;
  eventType: string;
  status: number;
  statusText: string;
  latencyMs: number;
  payloadPreview: string;
}

export default function WebhooksConnectorsPage() {
  const [connectors, setConnectors] = useState<WebhookConnector[]>(WEBHOOK_CONNECTORS);
  const [selectedConnector, setSelectedConnector] = useState<WebhookConnector>(WEBHOOK_CONNECTORS[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Preset Payloads
  const PRESETS: Record<string, any> = {
    MALWARE_IOC: {
      event_type: "MALWARE_IOC_EXTRACTED",
      source_platform: "CERBERUS-RE (Platform 16)",
      severity: "CRITICAL",
      correlation_id: "CORR-88219-LOCKBIT",
      sample: "lockbit_v3_stage2.dll",
      sha256: "8e9b42cf431a0e4d7701a2c3b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3",
      c2_socket: "185.220.101.44:8443",
      mitre_ttp: "T1486 - Data Encrypted for Impact",
      quarantine_status: "ENFORCED"
    },
    WORM_LOCKDOWN: {
      event_type: "BACKUP_LOCKDOWN_ENFORCED",
      source_platform: "Aegis Recovery (Platform 17)",
      severity: "HIGH",
      correlation_id: "CORR-88219-LOCKBIT",
      target_vault: "arn:aws:s3:::aegis-immutable-snapshots-prod",
      locked_pool_size_tb: 44.2,
      worm_retention_days: 90,
      compliance_status: "SEC_17a4_COMPLIANT"
    },
    DAST_SSRF: {
      event_type: "BLIND_SSRF_DETECTED",
      source_platform: "SAST-2 / DAST AXIOM (Platform 11)",
      severity: "CRITICAL",
      correlation_id: "CORR-44102-AXIOM",
      target_endpoint: "POST https://api.customer-portal.corp/v1/fetch-avatar",
      callback_imds: "169.254.169.254",
      cwe_id: "CWE-918",
      waf_rule_generated: "SIGMA_SSRF_IMDS_BLOCK_04"
    },
    EXPLOIT_POC: {
      event_type: "RCE_WEAPONIZATION_CONFIRMED",
      source_platform: "Exploitability AI (Platform 14)",
      severity: "CRITICAL",
      cve_id: "CVE-2026-3829",
      cvss_score: 9.8,
      epss_percentile: 0.994,
      target_service: "auth-gateway-svc:8080",
      patch_status: "VIRTUAL_PATCH_INJECTED"
    },
    SECRETS_LEAK: {
      event_type: "PRODUCTION_TOKEN_LEAK",
      source_platform: "Secrets Detection (Platform 07)",
      severity: "HIGH",
      file_path: "apps/mobile/ios/Config.plist",
      secret_type: "STRIPE_LIVE_API_KEY",
      key_preview: "rk_live_99214******************",
      remediation: "AUTOMATED_TOKEN_REVOKED"
    }
  };

  const [selectedPreset, setSelectedPreset] = useState<string>("MALWARE_IOC");
  const [customPayloadText, setCustomPayloadText] = useState<string>(JSON.stringify(PRESETS.MALWARE_IOC, null, 2));
  const [activeConsoleTab, setActiveConsoleTab] = useState<"BODY" | "HEADERS">("BODY");
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>({
    status: 200,
    statusText: "OK",
    latency: "14ms",
    responseHeaders: {
      "content-type": "application/json; charset=utf-8",
      "x-connector-id": "splunk-hec-01",
      "x-delivery-sla": "100%",
      "x-signature-status": "VALID_HMAC_SHA256"
    },
    responseBody: {
      success: true,
      delivered_to: "Splunk HEC Input 8088",
      event_id: "SPLUNK-EVT-481920",
      timestamp: "2026-08-28T22:15:00Z"
    }
  });

  // Recent delivery logs
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([
    {
      id: "LOG-9921",
      timestamp: "Just now",
      connectorName: "Splunk Enterprise / Cloud HEC",
      eventType: "MALWARE_IOC_EXTRACTED",
      status: 200,
      statusText: "OK",
      latencyMs: 14,
      payloadPreview: "LockBit 3.0 C2 (185.220.101.44)"
    },
    {
      id: "LOG-9920",
      timestamp: "12s ago",
      connectorName: "Microsoft Sentinel Log Analytics",
      eventType: "BACKUP_LOCKDOWN_ENFORCED",
      status: 200,
      statusText: "OK",
      latencyMs: 19,
      payloadPreview: "WORM S3 Snapshot Lock (44.2 TB)"
    },
    {
      id: "LOG-9919",
      timestamp: "45s ago",
      connectorName: "CrowdStrike Falcon Real-Time IOC Sync",
      eventType: "BLIND_SSRF_DETECTED",
      status: 202,
      statusText: "ACCEPTED",
      latencyMs: 22,
      payloadPreview: "IMDSv2 Callback from api.portal"
    },
    {
      id: "LOG-9918",
      timestamp: "2m ago",
      connectorName: "Slack SOC War Room Alert Bot",
      eventType: "PRODUCTION_TOKEN_LEAK",
      status: 200,
      statusText: "OK",
      latencyMs: 12,
      payloadPreview: "Stripe Live Key Revocation"
    }
  ]);

  // Modal State for Adding / Editing Connector
  const [isNewConnectorModalOpen, setIsNewConnectorModalOpen] = useState<boolean>(false);
  const [newConnName, setNewConnName] = useState("");
  const [newConnCategory, setNewConnCategory] = useState("SIEM");
  const [newConnUrl, setNewConnUrl] = useState("https://");
  const [newConnAuth, setNewConnAuth] = useState("HEC_TOKEN");

  // Update editor text when preset changes
  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    if (PRESETS[key]) {
      setCustomPayloadText(JSON.stringify(PRESETS[key], null, 2));
    }
  };

  // Dispatch Test Webhook
  const handleSendTestWebhook = () => {
    setIsSendingTest(true);
    let parsedBody = {};
    try {
      parsedBody = JSON.parse(customPayloadText);
    } catch {
      parsedBody = { raw_payload: customPayloadText };
    }

    setTimeout(() => {
      setIsSendingTest(false);
      const latency = Math.floor(Math.random() * 15 + 8);
      const newResult = {
        status: 200,
        statusText: "OK",
        latency: `${latency}ms`,
        responseHeaders: {
          "content-type": "application/json; charset=utf-8",
          "x-connector-id": selectedConnector.id,
          "x-delivery-latency": `${latency}ms`,
          "x-hmac-sha256-verified": "true",
          "server": "Expedite-Federated-Mesh/4.2.0"
        },
        responseBody: {
          success: true,
          connector: selectedConnector.name,
          endpoint: selectedConnector.endpointUrl,
          delivered_event: selectedPreset,
          payload_digest: "sha256:4a8b...9f12",
          dispatched_at: new Date().toISOString(),
          ack_id: `ACK-${Math.floor(Math.random() * 900000 + 100000)}`
        }
      };
      setTestResult(newResult);

      // Add to delivery log
      const newLog: DeliveryLog = {
        id: `LOG-${Math.floor(Math.random() * 9000 + 1000)}`,
        timestamp: "Just now",
        connectorName: selectedConnector.name,
        eventType: selectedPreset,
        status: 200,
        statusText: "OK",
        latencyMs: latency,
        payloadPreview: JSON.stringify(parsedBody).substring(0, 45) + "..."
      };
      setDeliveryLogs(prev => [newLog, ...prev.slice(0, 7)]);
    }, 600);
  };

  // Toggle Connector Enabled/Disabled
  const toggleConnectorStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnectors(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === "CONNECTED" ? "PAUSED" : "CONNECTED";
        return { ...c, status: nextStatus as any };
      }
      return c;
    }));
  };

  // Add new connector
  const handleSaveNewConnector = () => {
    if (!newConnName.trim()) return;
    const newConn: WebhookConnector = {
      id: `conn-${Date.now()}`,
      name: newConnName,
      category: newConnCategory as any,
      endpointUrl: newConnUrl,
      authType: newConnAuth as any,
      status: "CONNECTED",
      avgLatencyMs: 16,
      eventsForwarded24h: 0,
      lastPing: "Just now",
      iconName: newConnCategory === "SIEM" ? "Flame" : newConnCategory === "EDR" ? "Shield" : "Share2"
    };
    setConnectors(prev => [newConn, ...prev]);
    setSelectedConnector(newConn);
    setIsNewConnectorModalOpen(false);
    setNewConnName("");
    setNewConnUrl("https://");
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

  // Filter Connectors
  const filteredConnectors = connectors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.endpointUrl.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (categoryFilter === "ALL") return true;
    return c.category === categoryFilter;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1600, margin: "0 auto" }}>
      
      {/* ── Top Executive Header Banner ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.08) 50%, rgba(139,92,246,0.1) 100%)",
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
            <Share2 size={24} color="#050811" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>
                Enterprise Integrations & SIEM/EDR Connectors
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
                {connectors.filter(c => c.status === "CONNECTED").length} ACTIVE BRIDGES
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "3px 0 0 0" }}>
              High-throughput asynchronous stream bridges and webhook relays for Splunk, Microsoft Sentinel, CrowdStrike Falcon, AWS Security Hub, ServiceNow, and Slack.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setIsNewConnectorModalOpen(true)}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "8px 16px" }}
          >
            <Plus size={14} />
            <span>Add Enterprise Connector</span>
          </button>
        </div>
      </div>

      {/* ── 4 High-Impact Metric Gauges ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {[
          { label: "Active Connectors", val: `${connectors.length} Registered`, sub: `${connectors.filter(c => c.status === "CONNECTED").length} Online · 0 Failing`, color: "#10b981" },
          { label: "24h Delivered Events", val: "2,645,892", sub: "100% Delivery SLA (0 dropped)", color: "#06b6d4" },
          { label: "Average Dispatch Latency", val: "18.4ms", sub: "Async non-blocking queue", color: "#a855f7" },
          { label: "Retry Backoff Queue", val: "0 Pending", sub: "Zero deadlock state", color: "#f59e0b" }
        ].map((g, i) => (
          <div key={i} className="card-tactical" style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{g.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc", margin: "4px 0" }}>{g.val}</div>
            <div style={{ fontSize: 11, color: g.color, fontWeight: 600 }}>{g.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Search & Category Filter Tabs ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "ALL", label: `All Connectors (${connectors.length})` },
            { id: "SIEM", label: "SIEM Log Analytics" },
            { id: "EDR", label: "EDR & Falcon" },
            { id: "CLOUD_SECURITY", label: "Cloud Security Hub" },
            { id: "ITSM", label: "ITSM & Tickets" },
            { id: "COLLABORATION", label: "ChatOps & PagerDuty" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "6px 12px",
                borderRadius: 6,
                border: categoryFilter === tab.id ? "1px solid #10b981" : "1px solid var(--border)",
                background: categoryFilter === tab.id ? "rgba(16,185,129,0.15)" : "var(--surface-2)",
                color: categoryFilter === tab.id ? "#10b981" : "var(--muted)",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", width: 260 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: 10, color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Search connector name, URL, or type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 10px 7px 30px",
              fontSize: 11.5,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "#f8fafc",
              outline: "none"
            }}
          />
        </div>
      </div>

      {/* ── Connectors Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
        {filteredConnectors.map((conn) => {
          const Icon = getConnectorIcon(conn.iconName);
          const isSelected = selectedConnector.id === conn.id;
          const isConnected = conn.status === "CONNECTED";

          return (
            <div
              key={conn.id}
              onClick={() => setSelectedConnector(conn)}
              style={{
                background: isSelected ? "rgba(16,185,129,0.12)" : "var(--surface-2)",
                border: `1px solid ${isSelected ? "#10b981" : "var(--border)"}`,
                borderRadius: 10,
                padding: 16,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                transition: "all 0.15s ease",
                position: "relative"
              }}
              className="hover:border-emerald-500"
            >
              {/* Card Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: isSelected ? "rgba(16,185,129,0.25)" : "var(--surface-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: isSelected ? "1px solid #10b981" : "1px solid transparent"
                }}>
                  <Icon size={18} color={isSelected ? "#10b981" : "var(--foreground)"} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    onClick={(e) => toggleConnectorStatus(conn.id, e)}
                    style={{
                      background: isConnected ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                      border: `1px solid ${isConnected ? "#10b981" : "#f59e0b"}`,
                      color: isConnected ? "#10b981" : "#f59e0b",
                      fontSize: 9.5,
                      fontWeight: 800,
                      padding: "2px 7px",
                      borderRadius: 4,
                      cursor: "pointer"
                    }}
                    title="Click to Toggle Enabled / Paused"
                  >
                    {conn.status}
                  </button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "#f8fafc" }}>{conn.name}</div>
                <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
                  Category: <span style={{ color: "#38bdf8", fontWeight: 700 }}>{conn.category}</span>
                </div>
              </div>

              <div style={{
                background: "var(--surface-3)",
                padding: "6px 10px",
                borderRadius: 6,
                fontSize: 10.5,
                display: "flex",
                justifyContent: "space-between"
              }}>
                <span style={{ color: "var(--muted)" }}>24h Forwarded:</span>
                <strong style={{ color: "#06b6d4" }}>{conn.eventsForwarded24h.toLocaleString()} events</strong>
              </div>

              {/* Endpoint URL Snippet */}
              <div style={{
                fontSize: 10,
                fontFamily: "monospace",
                color: "var(--muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                background: "rgba(0,0,0,0.25)",
                padding: "4px 8px",
                borderRadius: 4
              }}>
                {conn.endpointUrl}
              </div>

              {/* Bottom Card Action */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10.5, borderTop: "1px solid var(--border)", paddingTop: 6, marginTop: 2 }}>
                <span style={{ color: "var(--muted)" }}>Latency: <strong style={{ color: "#10b981" }}>{conn.avgLatencyMs}ms</strong></span>
                <span style={{ color: isSelected ? "#10b981" : "var(--primary)", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                  <span>{isSelected ? "Active in Console" : "Select to Test"}</span>
                  <ArrowRight size={10} />
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* ── Interactive Webhook Test Console & JSON Payload Editor ── */}
      <div className="card-tactical" style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={16} color="#10b981" />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
                Interactive Live Webhook Dispatch Console
              </h2>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                Target: <strong style={{ color: "#10b981" }}>{selectedConnector.name}</strong> · Endpoint: <span style={{ fontFamily: "monospace", color: "#38bdf8" }}>{selectedConnector.endpointUrl}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <span style={{
              fontSize: 10.5,
              fontWeight: 800,
              background: "rgba(168,85,247,0.15)",
              color: "#c084fc",
              border: "1px solid rgba(168,85,247,0.3)",
              padding: "3px 8px",
              borderRadius: 4,
              fontFamily: "monospace"
            }}>
              AUTH: {selectedConnector.authType}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr", gap: 18 }}>
          
          {/* Left Column: Preset Selector & Editable JSON Payload Editor */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            
            {/* Preset Selector */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Select Event Template or Edit Custom JSON:
              </label>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {[
                  { key: "MALWARE_IOC", label: "LockBit C2 IOC" },
                  { key: "WORM_LOCKDOWN", label: "WORM S3 Lock" },
                  { key: "DAST_SSRF", label: "DAST Blind SSRF" },
                  { key: "EXPLOIT_POC", label: "Spring RCE PoC" },
                  { key: "SECRETS_LEAK", label: "Live API Key Leak" }
                ].map(p => (
                  <button
                    key={p.key}
                    onClick={() => handleSelectPreset(p.key)}
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: 4,
                      border: selectedPreset === p.key ? "1px solid #10b981" : "1px solid var(--border)",
                      background: selectedPreset === p.key ? "rgba(16,185,129,0.2)" : "var(--surface-3)",
                      color: selectedPreset === p.key ? "#10b981" : "var(--muted)",
                      cursor: "pointer"
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-tabs: Body vs Headers */}
            <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
              <button
                onClick={() => setActiveConsoleTab("BODY")}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: "none",
                  border: "none",
                  color: activeConsoleTab === "BODY" ? "#10b981" : "var(--muted)",
                  borderBottom: activeConsoleTab === "BODY" ? "2px solid #10b981" : "none",
                  cursor: "pointer",
                  paddingBottom: 2
                }}
              >
                Payload Body (JSON)
              </button>
              <button
                onClick={() => setActiveConsoleTab("HEADERS")}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: "none",
                  border: "none",
                  color: activeConsoleTab === "HEADERS" ? "#10b981" : "var(--muted)",
                  borderBottom: activeConsoleTab === "HEADERS" ? "2px solid #10b981" : "none",
                  cursor: "pointer",
                  paddingBottom: 2
                }}
              >
                HTTP Headers (4)
              </button>
            </div>

            {/* Code Editor */}
            {activeConsoleTab === "BODY" ? (
              <textarea
                value={customPayloadText}
                onChange={e => setCustomPayloadText(e.target.value)}
                rows={10}
                style={{
                  width: "100%",
                  background: "#050811",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: "#38bdf8",
                  fontFamily: "monospace",
                  fontSize: 11,
                  padding: 10,
                  lineHeight: 1.5,
                  outline: "none",
                  resize: "vertical"
                }}
              />
            ) : (
              <div style={{
                background: "#050811",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: 10,
                fontFamily: "monospace",
                fontSize: 11,
                display: "flex",
                flexDirection: "column",
                gap: 6
              }}>
                <div style={{ color: "#c084fc" }}>Content-Type: application/json</div>
                <div style={{ color: "#c084fc" }}>Authorization: Bearer sec_tok_live_99281a8f9024</div>
                <div style={{ color: "#c084fc" }}>X-Expedite-HMAC-SHA256: 0x89f41b9e281...</div>
                <div style={{ color: "#c084fc" }}>X-Correlation-ID: CORR-88219-LOCKBIT</div>
              </div>
            )}

            {/* Dispatch Action Button */}
            <button
              onClick={handleSendTestWebhook}
              disabled={isSendingTest}
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 800,
                padding: "10px 16px"
              }}
            >
              <Send size={14} className={isSendingTest ? "animate-spin" : ""} />
              <span>{isSendingTest ? "DISPATCHING ENCRYPTED WEBHOOK..." : `Dispatch Webhook to ${selectedConnector.name}`}</span>
            </button>

          </div>

          {/* Right Column: Live HTTP Response Preview */}
          <div style={{
            background: "#050811",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                  HTTP RESPONSE
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#10b981",
                  background: "rgba(16,185,129,0.15)",
                  padding: "2px 8px",
                  borderRadius: 4
                }}>
                  {testResult.status} {testResult.statusText}
                </span>
              </div>
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "#06b6d4" }}>
                Round-trip: {testResult.latency}
              </span>
            </div>

            {/* Response Headers */}
            <div style={{ background: "rgba(255,255,255,0.03)", padding: 8, borderRadius: 4, fontSize: 10.5, fontFamily: "monospace", color: "var(--muted)", display: "flex", flexDirection: "column", gap: 2 }}>
              {Object.entries(testResult.responseHeaders || {}).map(([k, v]) => (
                <div key={k}>
                  <strong style={{ color: "var(--foreground)" }}>{k}:</strong> {String(v)}
                </div>
              ))}
            </div>

            {/* Response JSON */}
            <pre style={{
              flex: 1,
              fontFamily: "monospace",
              fontSize: 11,
              color: "#34d399",
              margin: 0,
              overflowY: "auto",
              background: "rgba(0,0,0,0.4)",
              padding: 12,
              borderRadius: 6,
              lineHeight: 1.5,
              maxHeight: 240
            }}>
              {JSON.stringify(testResult.responseBody, null, 2)}
            </pre>
          </div>

        </div>
      </div>

      {/* ── Historical Delivery Log Table with Replay Functionality ── */}
      <div className="card-tactical" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={16} color="#06b6d4" />
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
              Recent Webhook Delivery Stream & Replay Ledger
            </h3>
          </div>
          <span style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "monospace" }}>
            AUTO-LOGGED TO FEDERATED DATA LAKE
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5, textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
                <th style={{ padding: "8px 12px" }}>TIMESTAMP</th>
                <th style={{ padding: "8px 12px" }}>CONNECTOR</th>
                <th style={{ padding: "8px 12px" }}>EVENT TYPE</th>
                <th style={{ padding: "8px 12px" }}>STATUS</th>
                <th style={{ padding: "8px 12px" }}>LATENCY</th>
                <th style={{ padding: "8px 12px" }}>PAYLOAD PREVIEW</th>
                <th style={{ padding: "8px 12px", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {deliveryLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "var(--muted)" }}>{log.timestamp}</td>
                  <td style={{ padding: "8px 12px", fontWeight: 700, color: "#f8fafc" }}>{log.connectorName}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(6,182,212,0.12)", color: "#06b6d4", padding: "1px 5px", borderRadius: 3 }}>
                      {log.eventType}
                    </span>
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#10b981" }}>
                      ✓ {log.status} {log.statusText}
                    </span>
                  </td>
                  <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#10b981" }}>{log.latencyMs}ms</td>
                  <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "var(--muted)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.payloadPreview}
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "right" }}>
                    <button
                      onClick={handleSendTestWebhook}
                      style={{
                        background: "var(--surface-3)",
                        border: "1px solid var(--border)",
                        color: "#38bdf8",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 4,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3
                      }}
                      title="Replay this webhook dispatch"
                    >
                      <RotateCcw size={10} />
                      <span>Replay</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Enterprise Connector Modal ── */}
      {isNewConnectorModalOpen && (
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
            maxWidth: 540,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            boxShadow: "0 10px 40px rgba(0,0,0,0.6)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Plus size={18} color="#10b981" />
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#fff", margin: 0 }}>
                  Add New Enterprise Connector
                </h3>
              </div>
              <button
                onClick={() => setIsNewConnectorModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  CONNECTOR NAME
                </label>
                <input
                  type="text"
                  placeholder="e.g. Datadog Security Signals HEC"
                  value={newConnName}
                  onChange={e => setNewConnName(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", fontSize: 12, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, color: "#fff", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    CATEGORY
                  </label>
                  <select
                    value={newConnCategory}
                    onChange={e => setNewConnCategory(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", fontSize: 12, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, color: "#fff", outline: "none" }}
                  >
                    <option value="SIEM">SIEM Log Analytics</option>
                    <option value="EDR">EDR Endpoint</option>
                    <option value="CLOUD_SECURITY">Cloud Security Hub</option>
                    <option value="ITSM">ITSM & Tickets</option>
                    <option value="COLLABORATION">Collaboration / ChatOps</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    AUTH TYPE
                  </label>
                  <select
                    value={newConnAuth}
                    onChange={e => setNewConnAuth(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", fontSize: 12, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, color: "#fff", outline: "none" }}
                  >
                    <option value="HEC_TOKEN">Splunk / Datadog HEC Token</option>
                    <option value="BEARER_TOKEN">OAuth2 / Bearer Token</option>
                    <option value="HMAC_SHA256">HMAC-SHA256 Signature</option>
                    <option value="WEBHOOK_SECRET">Shared Webhook Secret</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  TARGET WEBHOOK / HEC URL
                </label>
                <input
                  type="text"
                  placeholder="https://http-inputs.splunk.corp:8088/services/collector"
                  value={newConnUrl}
                  onChange={e => setNewConnUrl(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", fontSize: 12, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, color: "#fff", outline: "none", fontFamily: "monospace" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button
                onClick={() => setIsNewConnectorModalOpen(false)}
                className="btn-secondary"
                style={{ fontSize: 12, padding: "7px 14px" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewConnector}
                className="btn-primary"
                style={{ fontSize: 12, padding: "7px 16px" }}
              >
                Save & Connect Bridge
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
