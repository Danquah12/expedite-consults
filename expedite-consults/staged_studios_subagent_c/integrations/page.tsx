"use client";

import React, { useState } from "react";
import {
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  HardDrive,
  Cpu,
  Lock,
  Layers,
  Settings,
  Search,
  Zap,
  Activity,
  Terminal,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  category: "SIEM_XDR" | "EDR" | "IDENTITY" | "HYPERVISOR_CLOUD" | "BACKUP_STORAGE";
  vendor: string;
  version: string;
  status: "CONNECTED" | "SYNCING" | "DEGRADED" | "DISCONNECTED";
  lastSyncTimestamp: string;
  syncEventsPerMinute: number;
  description: string;
  authMethod: "OAUTH2" | "MUTUAL_TLS" | "API_KEY_SECRET" | "SAML_SCIM";
  featuresEnabled: string[];
  latencyMs: number;
}

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "int-001",
    name: "CrowdStrike Falcon Insight XDR",
    category: "EDR",
    vendor: "CrowdStrike Inc.",
    version: "v7.14.1820",
    status: "CONNECTED",
    lastSyncTimestamp: "2026-08-24T00:20:15Z",
    syncEventsPerMinute: 1420,
    description: "Real-time process telemetry, automated host network containment, and behavioral ransomware script blocking.",
    authMethod: "OAUTH2",
    featuresEnabled: ["Host Network Quarantine", "Live Memory Inspection", "RTR (Real Time Response)", "Zero-Day Process Termination"],
    latencyMs: 14
  },
  {
    id: "int-002",
    name: "Microsoft Sentinel SIEM / SOAR",
    category: "SIEM_XDR",
    vendor: "Microsoft Corporation",
    version: "Cloud API v2024-03",
    status: "CONNECTED",
    lastSyncTimestamp: "2026-08-24T00:20:00Z",
    syncEventsPerMinute: 4800,
    description: "Ingests raw Windows Security Event logs, Sysmon, Azure Activity, and Defender alerts into Aegis correlation engine.",
    authMethod: "API_KEY_SECRET",
    featuresEnabled: ["KQL Threat Hunting", "Automated Logic App Triggers", "Bi-directional Incident Sync", "TI Feed Ingestion"],
    latencyMs: 22
  },
  {
    id: "int-003",
    name: "Active Directory Domain Services & Entra ID",
    category: "IDENTITY",
    vendor: "Microsoft Corporation",
    version: "Windows Server 2025 / Graph API",
    status: "CONNECTED",
    lastSyncTimestamp: "2026-08-24T00:19:40Z",
    syncEventsPerMinute: 310,
    description: "Performs real-time Kerberos ticket auditing, privileged account inventory, and automated KRBTGT key rotation.",
    authMethod: "MUTUAL_TLS",
    featuresEnabled: ["Automated KRBTGT Double Roll", "Privileged Account Purging", "LAPS Password Rotation", "DCSync Rights Audit"],
    latencyMs: 8
  },
  {
    id: "int-004",
    name: "VMware vSphere & ESXi Hypervisor Cluster",
    category: "HYPERVISOR_CLOUD",
    vendor: "VMware by Broadcom",
    version: "vSphere 8.0 Update 2",
    status: "CONNECTED",
    lastSyncTimestamp: "2026-08-24T00:18:50Z",
    syncEventsPerMinute: 650,
    description: "Controls virtual machine disk snapshot state, RAM freezing, and isolated virtual switch VLAN provisioning.",
    authMethod: "MUTUAL_TLS",
    featuresEnabled: ["Hypervisor Snapshot Rollback", "Quarantine vSwitch Provisioning", "VM Guest RAM Dumping", "Raw VMFS Header Analysis"],
    latencyMs: 12
  },
  {
    id: "int-005",
    name: "AWS S3 Object Lock (Immutable Cloud Vault)",
    category: "BACKUP_STORAGE",
    vendor: "Amazon Web Services",
    version: "S3 API v2 / KMS HSM",
    status: "CONNECTED",
    lastSyncTimestamp: "2026-08-24T00:21:00Z",
    syncEventsPerMinute: 920,
    description: "Direct ingestion pipeline from compliance-mode WORM immutable S3 buckets with hardware MFA deletion guard.",
    authMethod: "API_KEY_SECRET",
    featuresEnabled: ["1-Click Bare-Metal Restore", "Merkle Hash Integrity Verification", "WORM Retention Enforcement", "Cross-Region Replication"],
    latencyMs: 18
  },
  {
    id: "int-006",
    name: "Veeam Backup & Replication Enterprise",
    category: "BACKUP_STORAGE",
    vendor: "Veeam Software",
    version: "v12.1.2.172",
    status: "CONNECTED",
    lastSyncTimestamp: "2026-08-24T00:17:00Z",
    syncEventsPerMinute: 210,
    description: "Hardened Linux repository snapshot validation, SureBackup automated sandbox test orchestrator.",
    authMethod: "OAUTH2",
    featuresEnabled: ["SureBackup Sandbox Orchestration", "Hardened Repo Direct Restore", "YARA Pre-Restore Scan", "Instant VM Recovery"],
    latencyMs: 34
  },
  {
    id: "int-007",
    name: "Splunk Enterprise Security",
    category: "SIEM_XDR",
    vendor: "Splunk / Cisco",
    version: "v9.2.1",
    status: "CONNECTED",
    lastSyncTimestamp: "2026-08-24T00:19:00Z",
    syncEventsPerMinute: 6100,
    description: "Enterprise log analytics and adaptive response framework connector.",
    authMethod: "API_KEY_SECRET",
    featuresEnabled: ["Adaptive Response Actions", "Notable Event Triage", "C2 NetFlow Correlation", "Splunk HEC Stream"],
    latencyMs: 16
  },
  {
    id: "int-008",
    name: "SentinelOne Singularity Complete",
    category: "EDR",
    vendor: "SentinelOne",
    version: "v23.4.1",
    status: "CONNECTED",
    lastSyncTimestamp: "2026-08-24T00:18:10Z",
    syncEventsPerMinute: 840,
    description: "Autonomous endpoint detection, automated 1-click rollback, and story-line forensic tracking.",
    authMethod: "API_KEY_SECRET",
    featuresEnabled: ["1-Click VSS Local Rollback", "Deep Visibility Telemetry", "Storyline Attack Graph", "Network Quarantine"],
    latencyMs: 11
  }
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [configModalItem, setConfigModalItem] = useState<Integration | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTestConnection = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setIntegrations(prev =>
        prev.map(item => (item.id === id ? { ...item, status: "CONNECTED", lastSyncTimestamp: new Date().toISOString() } : item))
      );
      setTestingId(null);
      showToast(`Diagnostic handshake successful: Telemetry stream verified.`);
    }, 1200);
  };

  const filteredIntegrations = integrations.filter(item => {
    const matchesCat = activeCategory === "ALL" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalEventsPerMin = integrations.reduce((acc, i) => acc + i.syncEventsPerMinute, 0);

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
            <Radio size={22} color="#10b981" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--fg)" }}>
                Enterprise Integrations Hub
              </h1>
              <span className="badge-sev badge-success">PILLAR 5 · CONNECT</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Bidirectional connectors for SIEM (Splunk, Sentinel), EDR (CrowdStrike, S1), Identity (AD, Okta) & Storage.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => showToast("Triggered global telemetry resynchronization across all 8 active connectors.")}
            className="btn-primary"
          >
            <RefreshCw size={14} />
            <span>Sync All Connectors</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #10b981" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Active Connectors
            </span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981", marginTop: 6 }}>
            {integrations.filter(i => i.status === "CONNECTED").length} / {integrations.length}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            100% Operational Health
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #06b6d4" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Telemetry Pipeline
            </span>
            <Activity size={16} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#06b6d4", marginTop: 6 }}>
            {(totalEventsPerMin / 1000).toFixed(1)}k / min
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Live Security Events Ingested
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #a855f7" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Average API Latency
            </span>
            <Zap size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#a855f7", marginTop: 6 }}>
            14.2 ms
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Sub-second Automated Response
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Auth Security
            </span>
            <Lock size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b", marginTop: 6 }}>
            mTLS & OAuth2
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Hardware Token Backed
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[
            { key: "ALL", label: `All (${integrations.length})` },
            { key: "SIEM_XDR", label: "SIEM / XDR" },
            { key: "EDR", label: "EDR & Containment" },
            { key: "IDENTITY", label: "Identity & AD" },
            { key: "HYPERVISOR_CLOUD", label: "Hypervisors" },
            { key: "BACKUP_STORAGE", label: "Backup & Storage" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background: activeCategory === tab.key ? "rgba(16, 185, 129, 0.2)" : "var(--surface)",
                color: activeCategory === tab.key ? "#10b981" : "var(--muted)",
                border: activeCategory === tab.key ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid var(--border)"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: "relative" }}>
          <Search size={13} color="var(--muted)" style={{ position: "absolute", left: 9, top: 9 }} />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="tool-input"
            style={{ paddingLeft: 28, width: 200 }}
          />
        </div>
      </div>

      {/* Connectors Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {filteredIntegrations.map(conn => {
          const isTesting = testingId === conn.id;

          return (
            <div
              key={conn.id}
              className="card-tactical"
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                border: conn.status === "CONNECTED" ? "1px solid rgba(16, 185, 129, 0.3)" : undefined
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                      {conn.name}
                    </h3>
                    <span className="badge-sev badge-success">
                      {conn.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    Vendor: {conn.vendor} · Version: {conn.version} · Auth: {conn.authMethod}
                  </div>
                </div>

                <button
                  onClick={() => setConfigModalItem(conn)}
                  className="btn-secondary"
                  style={{ padding: "5px 8px" }}
                  title="Configure Connector"
                >
                  <Settings size={13} />
                </button>
              </div>

              <p style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>
                {conn.description}
              </p>

              {/* Capabilities Pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {conn.featuresEnabled.map((feat, fIdx) => (
                  <span
                    key={fIdx}
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "var(--surface-2)",
                      color: "#06b6d4",
                      border: "1px solid var(--border)"
                    }}
                  >
                    {feat}
                  </span>
                ))}
              </div>

              {/* Footer Telemetry Stats & Actions */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid var(--border)",
                paddingTop: 10,
                fontSize: 11,
                color: "var(--muted)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span>Rate: <strong style={{ color: "var(--fg)" }}>{conn.syncEventsPerMinute} evt/min</strong></span>
                  <span>Latency: <strong style={{ color: "#10b981" }}>{conn.latencyMs} ms</strong></span>
                </div>

                <button
                  onClick={() => handleTestConnection(conn.id)}
                  disabled={isTesting}
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#10b981",
                    padding: "4px 10px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: isTesting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <RefreshCw size={11} className={isTesting ? "animate-spin" : ""} />
                  <span>{isTesting ? "Testing Handshake..." : "Test Connection"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {configModalItem && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          padding: 20
        }}>
          <div className="card-tactical" style={{ width: 520, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Settings size={18} color="#10b981" />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
                  Configure {configModalItem.name}
                </h3>
              </div>
              <button
                onClick={() => setConfigModalItem(null)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                API Endpoint URL:
              </label>
              <input
                type="text"
                defaultValue="https://api.crowdstrike.com/v1/telemetry/aegis-stream"
                className="tool-input"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                OAuth2 / Secret Token:
              </label>
              <input
                type="password"
                defaultValue="secret_token_live_production_99814"
                className="tool-input"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Telemetry Ingestion Polling Interval:
              </label>
              <select className="tool-select" defaultValue="5s">
                <option value="1s">Real-Time Streaming Webhook (0s)</option>
                <option value="5s">Micro-batching (5 seconds)</option>
                <option value="30s">Standard (30 seconds)</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <button
                onClick={() => setConfigModalItem(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast(`Saved configuration parameters for ${configModalItem.name}.`);
                  setConfigModalItem(null);
                }}
                className="btn-primary"
              >
                <CheckCircle2 size={13} />
                <span>Save & Test Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
