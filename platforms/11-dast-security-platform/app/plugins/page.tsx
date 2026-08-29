"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "overview" | "capabilities" | "verification" | "activity";

interface InstalledPlugin {
  id: string;
  name: string;
  author: string;
  version: string;
  category: string;
  status: "healthy" | "warning" | "error";
  installedDate: string;
  lastUpdated: string;
  description: string;
  permissions: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INSTALLED: InstalledPlugin[] = [
  {
    id: "jira-enterprise",
    name: "Jira Enterprise Connector",
    author: "AXIOM",
    version: "2.1.0",
    category: "Ticketing",
    status: "healthy",
    installedDate: "2026-05-14",
    lastUpdated: "2026-07-12",
    description:
      "Full Jira Cloud & Server integration with auto-ticket creation on findings. Supports OAuth2, bulk sync, and custom field mapping.",
    permissions: ["tickets.create", "tickets.update", "tickets.close"],
  },
  {
    id: "sqli-validator",
    name: "Advanced SQL Injection Validator",
    author: "AXIOM Labs",
    version: "1.4.2",
    category: "Validation",
    status: "healthy",
    installedDate: "2026-06-01",
    lastUpdated: "2026-07-25",
    description:
      "Deep SQLi validation with time-based blind and UNION detection. Reduces false positives by 85% with contextual payload analysis.",
    permissions: ["findings.read", "findings.write"],
  },
  {
    id: "teams-notify",
    name: "Microsoft Teams Notifications",
    author: "AXIOM",
    version: "1.5.2",
    category: "Notification",
    status: "healthy",
    installedDate: "2026-05-20",
    lastUpdated: "2026-08-01",
    description:
      "Real-time alerts to Teams channels on Critical/High findings. Supports adaptive cards, channel routing, and @mentions.",
    permissions: ["notifications.send"],
  },
  {
    id: "evidence-validator",
    name: "Evidence Integrity Validator",
    author: "AXIOM",
    version: "1.0.1",
    category: "Evidence",
    status: "healthy",
    installedDate: "2026-07-02",
    lastUpdated: "2026-07-30",
    description:
      "SHA256 hashing, digital signatures, chain of custody verification. Ensures tamper-proof evidence for compliance audits.",
    permissions: ["evidence.read", "evidence.write"],
  },
  {
    id: "github-issues",
    name: "GitHub Issues Connector",
    author: "AXIOM",
    version: "1.1.0",
    category: "Ticketing",
    status: "warning",
    installedDate: "2026-06-15",
    lastUpdated: "2026-07-01",
    description:
      "Auto-create GitHub Issues from findings with labels and assignees. Supports milestone tracking and project board integration.",
    permissions: ["tickets.create"],
  },
];

const CAPABILITIES = [
  {
    capability: "create_ticket",
    plugin: "Jira Enterprise Connector",
    pluginId: "jira-enterprise",
    version: "2.1.0",
    status: "active",
    tools: ["create_ticket", "update_ticket", "close_ticket", "search_tickets"],
  },
  {
    capability: "validate_sqli",
    plugin: "Advanced SQL Injection Validator",
    pluginId: "sqli-validator",
    version: "1.4.2",
    status: "active",
    tools: ["validate_sqli", "detect_injection"],
  },
  {
    capability: "send_notification",
    plugin: "Microsoft Teams Notifications",
    pluginId: "teams-notify",
    version: "1.5.2",
    status: "active",
    tools: ["send_alert", "send_report"],
  },
  {
    capability: "verify_integrity",
    plugin: "Evidence Integrity Validator",
    pluginId: "evidence-validator",
    version: "1.0.1",
    status: "active",
    tools: ["verify_hash", "sign_artifact"],
  },
  {
    capability: "create_issue",
    plugin: "GitHub Issues Connector",
    pluginId: "github-issues",
    version: "1.1.0",
    status: "update",
    tools: ["create_issue", "close_issue"],
  },
];

const VERIFICATION_ITEMS = [
  { key: "signature", label: "Signature Verified (AXIOM CA signed)", ok: true },
  { key: "deps", label: "Dependencies Valid", ok: true },
  { key: "perms", label: "Permissions Approved by Admin", ok: true },
  { key: "sandbox", label: "Sandbox Healthy", ok: true },
  { key: "audit", label: "Audit Logging Enabled", ok: true },
  { key: "version", label: "Version Compatible (SDK ≥ 1.0)", ok: true },
];

const AUDIT_ACTIONS = [
  { time: "19:12:04", user: "scanner-agent", action: "validate_sqli", result: "success" },
  { time: "19:08:41", user: "copilot", action: "create_ticket", result: "success" },
  { time: "19:03:17", user: "scanner-agent", action: "validate_sqli", result: "success" },
  { time: "18:55:29", user: "system", action: "send_alert", result: "success" },
  { time: "18:50:11", user: "copilot", action: "create_ticket", result: "success" },
  { time: "18:44:03", user: "scanner-agent", action: "validate_sqli", result: "success" },
  { time: "18:39:57", user: "system", action: "verify_hash", result: "success" },
  { time: "18:33:22", user: "copilot", action: "create_issue", result: "success" },
  { time: "18:27:46", user: "scanner-agent", action: "validate_sqli", result: "success" },
  { time: "18:21:05", user: "system", action: "send_alert", result: "success" },
];

const BAR_DATA = [8, 14, 11, 17, 13, 20, 16, 22, 18, 25, 21, 19];
const BAR_LABELS = ["09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Scanner: "#3b82f6",
  Validation: "#8b5cf6",
  Verification: "#06b6d4",
  Ticketing: "#f97316",
  Reporting: "#ec4899",
  Evidence: "#10b981",
  AI: "#e8912d",
  Notification: "#6366f1",
};

function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? "#6b7280";
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 7px",
        borderRadius: 4,
        background: color + "22",
        color,
        border: `1px solid ${color}44`,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {category}
    </span>
  );
}

function StatusDot({
  status,
}: {
  status: "healthy" | "warning" | "error";
}) {
  const color =
    status === "healthy"
      ? "#10b981"
      : status === "warning"
      ? "#f59e0b"
      : "#ef4444";
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        boxShadow: `0 0 6px ${color}88`,
      }}
    />
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ plugin }: { plugin: InstalledPlugin }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 4,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--fg, #f9fafb)",
                }}
              >
                {plugin.name}
              </h2>
              <CategoryBadge category={plugin.category} />
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                by {plugin.author}
              </span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                v{plugin.version}
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 13,
                  color:
                    plugin.status === "healthy"
                      ? "#10b981"
                      : plugin.status === "warning"
                      ? "#f59e0b"
                      : "#ef4444",
                  fontWeight: 600,
                }}
              >
                <StatusDot status={plugin.status} />
                {plugin.status === "healthy"
                  ? "Healthy"
                  : plugin.status === "warning"
                  ? "Update Required"
                  : "Error"}
              </span>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div style={{ display: "flex", gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>
              Installed
            </div>
            <div style={{ fontSize: 13, color: "var(--fg)" }}>
              {plugin.installedDate}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>
              Last Updated
            </div>
            <div style={{ fontSize: 13, color: "var(--fg)" }}>
              {plugin.lastUpdated}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          padding: "16px",
          background: "var(--bg, #0a0f1e)",
          borderRadius: 10,
          border: "1px solid var(--border, #1f2937)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--muted)",
            marginBottom: 12,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Plugin Controls
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "Enable", color: "#10b981", bg: "#10b98122", border: "#10b98133" },
            { label: "Disable", color: "var(--fg)", bg: "none", border: "var(--border)" },
            {
              label: plugin.status === "warning" ? "Update" : "Update",
              color: plugin.status === "warning" ? "#000" : "var(--fg)",
              bg: plugin.status === "warning" ? "#f59e0b" : "none",
              border: plugin.status === "warning" ? "#f59e0b" : "var(--border)",
            },
            { label: "Rollback", color: "var(--fg)", bg: "none", border: "var(--border)" },
            { label: "Uninstall", color: "#ef4444", bg: "none", border: "#ef444433" },
          ].map((btn) => (
            <button
              key={btn.label}
              style={{
                padding: "8px 18px",
                borderRadius: 7,
                background: btn.bg,
                color: btn.color,
                border: `1px solid ${btn.border}`,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--muted)",
            marginBottom: 8,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Description
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "var(--fg, #d1d5db)",
            lineHeight: 1.7,
          }}
        >
          {plugin.description}
        </p>
      </div>

      {/* Permissions */}
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--muted)",
            marginBottom: 10,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Permissions Granted
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {plugin.permissions.map((perm) => (
            <div
              key={perm}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 12px",
                background: "var(--bg, #0a0f1e)",
                borderRadius: 7,
                border: "1px solid var(--border, #1f2937)",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  color: "#10b981",
                }}
              >
                ✓
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "monospace",
                  color: "#e8912d",
                  fontWeight: 600,
                }}
              >
                {perm}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Capabilities ────────────────────────────────────────────────────────

function CapabilitiesTab({ selectedId }: { selectedId: string }) {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            margin: "0 0 4px",
            fontSize: 15,
            fontWeight: 700,
            color: "var(--fg, #f9fafb)",
          }}
        >
          Capability Registry
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
          All capabilities registered across installed plugins. Used by the
          Copilot Orchestrator for tool resolution.
        </p>
      </div>

      <div
        style={{
          border: "1px solid var(--border, #1f2937)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 200px 80px 100px 1fr",
            gap: 0,
            padding: "10px 16px",
            background: "var(--bg, #0a0f1e)",
            borderBottom: "1px solid var(--border, #1f2937)",
          }}
        >
          {["Capability", "Plugin", "Version", "Status", "Tools Exposed"].map(
            (h) => (
              <div
                key={h}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </div>
            )
          )}
        </div>

        {/* Rows */}
        {CAPABILITIES.map((cap, i) => (
          <div
            key={cap.capability}
            style={{
              display: "grid",
              gridTemplateColumns: "160px 200px 80px 100px 1fr",
              gap: 0,
              padding: "12px 16px",
              borderBottom:
                i < CAPABILITIES.length - 1
                  ? "1px solid var(--border, #1f2937)"
                  : "none",
              background:
                cap.pluginId === selectedId ? "#e8912d08" : "transparent",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontFamily: "monospace",
                fontWeight: 600,
                color: "#e8912d",
              }}
            >
              {cap.capability}
            </span>
            <span style={{ fontSize: 13, color: "var(--fg)" }}>
              {cap.plugin}
            </span>
            <span
              style={{
                fontSize: 12,
                fontFamily: "monospace",
                color: "var(--muted)",
              }}
            >
              {cap.version}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: cap.status === "active" ? "#10b981" : "#f59e0b",
              }}
            >
              {cap.status === "active" ? "✓ Active" : "⚠ Update"}
            </span>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {cap.tools.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 10,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: "var(--bg, #0a0f1e)",
                    border: "1px solid var(--border, #1f2937)",
                    color: "var(--muted)",
                    fontFamily: "monospace",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Verification ────────────────────────────────────────────────────────

function VerificationTab({ plugin }: { plugin: InstalledPlugin }) {
  const isGitHub = plugin.id === "github-issues";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h3
          style={{
            margin: "0 0 4px",
            fontSize: 15,
            fontWeight: 700,
            color: "var(--fg, #f9fafb)",
          }}
        >
          Plugin Verification Checklist
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
          Security and compatibility status for {plugin.name}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {VERIFICATION_ITEMS.map((item) => (
          <div
            key={item.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid var(--border, #1f2937)",
              background: "var(--bg, #0a0f1e)",
            }}
          >
            <span
              style={{
                fontSize: 16,
                color: item.ok ? "#10b981" : "#ef4444",
                flexShrink: 0,
              }}
            >
              {item.ok ? "✓" : "✗"}
            </span>
            <span
              style={{ fontSize: 14, color: "var(--fg)", flex: 1 }}
            >
              {item.label}
            </span>
          </div>
        ))}

        {/* GitHub-specific warning */}
        {isGitHub && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid #f59e0b44",
              background: "#f59e0b0a",
            }}
          >
            <span style={{ fontSize: 16, color: "#f59e0b", flexShrink: 0 }}>
              ⚠
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: "#f59e0b", fontWeight: 600 }}>
                Update Available
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                v1.1.0 → v1.2.0 — Patch includes security fixes for token
                handling
              </div>
            </div>
            <button
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: "#f59e0b",
                color: "#000",
                border: "none",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Update Now
            </button>
          </div>
        )}
      </div>

      {/* Signature block */}
      <div
        style={{
          padding: "16px",
          background: "#10b98108",
          border: "1px solid #10b98133",
          borderRadius: 10,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--muted)",
            marginBottom: 10,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Cryptographic Signature
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            ["Signed By", "AXIOM Certificate Authority"],
            ["Algorithm", "SHA-256 with RSA-2048"],
            ["Fingerprint", "a1:b2:c3:d4:e5:f6:a7:b8:c9:d0:e1:f2:a3:b4:c5:d6"],
            ["Valid Until", "2027-12-31"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 16 }}>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  width: 100,
                  flexShrink: 0,
                }}
              >
                {k}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#10b981",
                  fontFamily: "monospace",
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Activity ────────────────────────────────────────────────────────────

const MANIFEST_DATA = {
  pluginId: "jira-enterprise",
  name: "Jira Enterprise Connector",
  version: "2.1.0",
  type: "ticketing",
  sdkVersion: "1.0",
  author: "AXIOM",
  permissions: ["tickets.create", "tickets.update"],
  capabilities: [
    "create_ticket",
    "update_ticket",
    "close_ticket",
    "search_ticket",
  ],
  signature: "SHA256:a1b2c3d4e5f6...",
  signedBy: "AXIOM Certificate Authority",
};

function ActivityTab({ plugin }: { plugin: InstalledPlugin }) {
  const maxBar = Math.max(...BAR_DATA);
  const barHeight = 60;

  const manifest = { ...MANIFEST_DATA, pluginId: plugin.id, name: plugin.name, version: plugin.version };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Stats row */}
      <div style={{ display: "flex", gap: 12 }}>
        {[
          { label: "Total Calls Today", value: "204", color: "#e8912d" },
          { label: "Success Rate", value: "100%", color: "#10b981" },
          { label: "Avg Latency", value: "42ms", color: "#6366f1" },
          { label: "Last Invoked", value: "2m ago", color: "var(--fg)" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              flex: 1,
              background: "var(--bg, #0a0f1e)",
              border: "1px solid var(--border, #1f2937)",
              borderRadius: 8,
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{ fontSize: 11, color: "var(--muted)", marginTop: 5 }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* SVG bar chart */}
      <div
        style={{
          background: "var(--bg, #0a0f1e)",
          border: "1px solid var(--border, #1f2937)",
          borderRadius: 10,
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--muted)",
            marginBottom: 14,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Invocations by Hour
        </div>
        <svg
          width="100%"
          height={barHeight + 24}
          viewBox={`0 0 ${BAR_DATA.length * 40} ${barHeight + 24}`}
          preserveAspectRatio="none"
        >
          {BAR_DATA.map((val, i) => {
            const h = (val / maxBar) * barHeight;
            const x = i * 40 + 4;
            const y = barHeight - h;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={30}
                  height={h}
                  rx={4}
                  fill="#e8912d"
                  opacity={0.75}
                />
                <text
                  x={x + 15}
                  y={barHeight + 16}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#6b7280"
                >
                  {BAR_LABELS[i]}h
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Audit trail */}
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--muted)",
            marginBottom: 10,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Recent Invocations
        </div>
        <div
          style={{
            border: "1px solid var(--border, #1f2937)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "70px 140px 1fr 80px",
              gap: 0,
              padding: "8px 14px",
              background: "var(--bg, #0a0f1e)",
              borderBottom: "1px solid var(--border, #1f2937)",
            }}
          >
            {["Time", "User", "Action", "Result"].map((h) => (
              <div
                key={h}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </div>
            ))}
          </div>
          {AUDIT_ACTIONS.map((row, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "70px 140px 1fr 80px",
                gap: 0,
                padding: "9px 14px",
                borderBottom:
                  i < AUDIT_ACTIONS.length - 1
                    ? "1px solid var(--border, #1f2937)"
                    : "none",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "var(--muted)",
                }}
              >
                {row.time}
              </span>
              <span style={{ fontSize: 12, color: "var(--fg)" }}>
                {row.user}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "monospace",
                  color: "#e8912d",
                }}
              >
                {row.action}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: row.result === "success" ? "#10b981" : "#ef4444",
                }}
              >
                {row.result === "success" ? "✓ ok" : "✗ fail"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Plugin Manifest */}
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--muted)",
            marginBottom: 10,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Plugin Manifest
        </div>
        <div
          style={{
            background: "var(--bg, #0a0f1e)",
            border: "1px solid var(--border, #1f2937)",
            borderRadius: 10,
            padding: "16px 20px",
            overflowX: "auto",
          }}
        >
          <pre
            style={{
              margin: 0,
              fontSize: 12,
              fontFamily: "monospace",
              color: "var(--fg, #d1d5db)",
              lineHeight: 1.7,
              whiteSpace: "pre",
            }}
          >
            {JSON.stringify(manifest, null, 2)
              .replace(/"([^"]+)":/g, '"<span style="color:#e8912d">$1</span>":')
              .split("\n")
              .map((line, i) => (
                <span key={i}>
                  {line
                    .split(/("([^"]+)")/g)
                    .map((chunk, j) => {
                      return chunk;
                    })
                    .join("")}
                  {"\n"}
                </span>
              ))}
          </pre>
          {/* Plain pre with colored keys via dangerouslySetInnerHTML */}
          <div
            style={{ display: "none" }}
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(manifest, null, 2),
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PluginsPage() {
  const [selectedId, setSelectedId] = useState<string>(INSTALLED[0].id);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const selected = INSTALLED.find((p) => p.id === selectedId) ?? INSTALLED[0];

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "capabilities", label: "Capabilities" },
    { id: "verification", label: "Verification" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg, #0a0f1e)",
        color: "var(--fg, #f9fafb)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Top Bar ── */}
      <div
        style={{
          borderBottom: "1px solid var(--border, #1f2937)",
          background: "var(--surface, #111827)",
          padding: "0 32px",
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "#e8912d",
          }}
        >
          AXIOM
        </span>
        <span style={{ color: "var(--border)", margin: "0 4px" }}>·</span>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>
          Plugin Manager
        </span>
      </div>

      {/* ── Main Layout ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── Left Sidebar ── */}
        <div
          style={{
            width: 240,
            flexShrink: 0,
            borderRight: "1px solid var(--border, #1f2937)",
            background: "var(--surface, #111827)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {/* Sidebar header */}
          <div
            style={{
              padding: "16px 16px 10px",
              borderBottom: "1px solid var(--border, #1f2937)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--muted)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Installed Plugins
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--muted)",
                marginTop: 2,
              }}
            >
              {INSTALLED.length} plugins active
            </div>
          </div>

          {/* Plugin list */}
          <div style={{ flex: 1, padding: "8px 0" }}>
            {INSTALLED.map((plugin) => {
              const isActive = plugin.id === selectedId;
              return (
                <button
                  key={plugin.id}
                  onClick={() => setSelectedId(plugin.id)}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    background: isActive ? "#e8912d12" : "none",
                    border: "none",
                    borderLeft: isActive
                      ? "3px solid #e8912d"
                      : "3px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ marginTop: 5 }}>
                    <StatusDot status={plugin.status} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: isActive ? "#e8912d" : "var(--fg, #f9fafb)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        lineHeight: 1.3,
                        marginBottom: 4,
                      }}
                    >
                      {plugin.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--muted)",
                          fontFamily: "monospace",
                        }}
                      >
                        v{plugin.version}
                      </span>
                      <CategoryBadge category={plugin.category} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sidebar footer */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid var(--border, #1f2937)",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span>Healthy</span>
              <span style={{ color: "#10b981", fontWeight: 700 }}>
                {INSTALLED.filter((p) => p.status === "healthy").length}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span>Needs Update</span>
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>
                {INSTALLED.filter((p) => p.status === "warning").length}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Error</span>
              <span style={{ color: "#ef4444", fontWeight: 700 }}>
                {INSTALLED.filter((p) => p.status === "error").length}
              </span>
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Tab bar */}
          <div
            style={{
              borderBottom: "1px solid var(--border, #1f2937)",
              padding: "0 32px",
              display: "flex",
              gap: 0,
              flexShrink: 0,
              background: "var(--surface, #111827)",
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "14px 20px",
                  background: "none",
                  border: "none",
                  borderBottom:
                    activeTab === tab.id
                      ? "2px solid #e8912d"
                      : "2px solid transparent",
                  color:
                    activeTab === tab.id ? "#e8912d" : "var(--muted)",
                  fontSize: 13,
                  fontWeight: activeTab === tab.id ? 700 : 400,
                  cursor: "pointer",
                  marginBottom: -1,
                  transition: "color 0.15s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "28px 32px",
            }}
          >
            {activeTab === "overview" && <OverviewTab plugin={selected} />}
            {activeTab === "capabilities" && (
              <CapabilitiesTab selectedId={selectedId} />
            )}
            {activeTab === "verification" && (
              <VerificationTab plugin={selected} />
            )}
            {activeTab === "activity" && <ActivityTab plugin={selected} />}
          </div>
        </div>
      </div>
    </div>
  );
}
