"use client";

import { useState, useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuditEvent {
  id: string;
  time: string;
  user: string;
  role: string;
  action: string;
  plugin: string;
  status: "SUCCESS" | "DENIED" | "ERROR";
  message: string;
  tenant: string;
  ip: string;
  resource: string;
  capability: string;
  payload: Record<string, unknown>;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "EVT-2847", time: "19:08:41", user: "Security Analyst", role: "security_analyst",
    action: "search_findings", plugin: "Findings Plugin", status: "SUCCESS",
    message: "Found 8 critical findings",
    tenant: "ABC Corp", ip: "192.168.1.42", resource: "findings/critical",
    capability: "findings.read",
    payload: { query: { severity: "critical", tenant: "abc_corp" }, results: 8, filtered: false, duration_ms: 124 },
  },
  {
    id: "EVT-2846", time: "19:07:22", user: "Developer", role: "developer",
    action: "download_evidence", plugin: "Evidence Plugin", status: "DENIED",
    message: "Insufficient permission: evidence.read",
    tenant: "XYZ Inc", ip: "10.0.0.88", resource: "evidence/PKG-441",
    capability: "evidence.read",
    payload: { required_permission: "evidence.read", user_permissions: ["findings.read","tickets.create"], decision: "DENIED" },
  },
  {
    id: "EVT-2845", time: "19:06:55", user: "Platform Admin", role: "platform_admin",
    action: "create_ticket", plugin: "Jira Plugin", status: "SUCCESS",
    message: "Ticket JRA-2847 created",
    tenant: "ABC Corp", ip: "172.16.0.5", resource: "jira/JRA-2847",
    capability: "tickets.create",
    payload: { ticket_id: "JRA-2847", finding_id: "F-019", priority: "High", assignee: "dev-team" },
  },
  {
    id: "EVT-2844", time: "19:05:12", user: "Security Analyst", role: "security_analyst",
    action: "launch_verification", plugin: "Verification Plugin", status: "SUCCESS",
    message: "Job VER-441 started",
    tenant: "ABC Corp", ip: "192.168.1.42", resource: "verification/VER-441",
    capability: "verification.execute",
    payload: { job_id: "VER-441", finding_id: "F-012", mode: "passive", timeout_s: 300 },
  },
  {
    id: "EVT-2843", time: "19:03:44", user: "Executive", role: "executive",
    action: "generate_report", plugin: "Reporting Plugin", status: "SUCCESS",
    message: "Executive report generated",
    tenant: "XYZ Inc", ip: "10.0.0.67", resource: "reports/RPT-2843",
    capability: "reports.generate",
    payload: { report_id: "RPT-2843", format: "PDF", period: "2026-Q3", findings_included: 42 },
  },
  {
    id: "EVT-2842", time: "19:02:31", user: "Developer", role: "developer",
    action: "generate_report", plugin: "Reporting Plugin", status: "DENIED",
    message: "Insufficient permission: reports.generate",
    tenant: "XYZ Inc", ip: "10.0.0.88", resource: "reports/generate",
    capability: "reports.generate",
    payload: { required_permission: "reports.generate", user_permissions: ["findings.read","tickets.create"], decision: "DENIED" },
  },
  {
    id: "EVT-2841", time: "19:01:05", user: "Security Analyst", role: "security_analyst",
    action: "search_graph", plugin: "Knowledge Graph Plugin", status: "SUCCESS",
    message: "13 relationships found",
    tenant: "ABC Corp", ip: "192.168.1.42", resource: "graph/query",
    capability: "findings.read",
    payload: { query: "MATCH (f:Finding)-[:RELATED_TO]->() RETURN f LIMIT 50", results: 13, depth: 2 },
  },
  {
    id: "EVT-2840", time: "18:58:22", user: "Developer", role: "developer",
    action: "view_findings", plugin: "Findings Plugin", status: "SUCCESS",
    message: "3 assigned findings returned (filtered)",
    tenant: "XYZ Inc", ip: "10.0.0.88", resource: "findings",
    capability: "findings.read",
    payload: { query: { assigned_user: "mike@xyz.com" }, results: 3, rls_applied: true, filter: "WHERE assigned_user = current_user" },
  },
  {
    id: "EVT-2839", time: "18:55:11", user: "Unknown User", role: "unauthenticated",
    action: "search_findings", plugin: "—", status: "DENIED",
    message: "Authentication failed",
    tenant: "—", ip: "203.0.113.99", resource: "findings",
    capability: "findings.read",
    payload: { error: "JWT_INVALID", token: "[REDACTED]", attempt_ip: "203.0.113.99", suspicious: true },
  },
  {
    id: "EVT-2838", time: "18:52:44", user: "Security Analyst", role: "security_analyst",
    action: "create_ticket", plugin: "Jira Plugin", status: "SUCCESS",
    message: "Ticket JRA-2846 created",
    tenant: "ABC Corp", ip: "192.168.1.42", resource: "jira/JRA-2846",
    capability: "tickets.create",
    payload: { ticket_id: "JRA-2846", finding_id: "F-018", priority: "Critical", assignee: "remediation-team" },
  },
  {
    id: "EVT-2837", time: "18:49:33", user: "Executive", role: "executive",
    action: "download_evidence", plugin: "Evidence Plugin", status: "DENIED",
    message: "Insufficient permission: evidence.read",
    tenant: "XYZ Inc", ip: "10.0.0.67", resource: "evidence/PKG-440",
    capability: "evidence.read",
    payload: { required_permission: "evidence.read", user_permissions: ["findings.read","reports.generate"], decision: "DENIED" },
  },
  {
    id: "EVT-2836", time: "18:47:11", user: "Security Analyst", role: "security_analyst",
    action: "verify_finding", plugin: "Verification Plugin", status: "SUCCESS",
    message: "F-002 verification FAILED — reopened",
    tenant: "ABC Corp", ip: "192.168.1.42", resource: "findings/F-002",
    capability: "verification.execute",
    payload: { job_id: "VER-440", finding_id: "F-002", result: "FAILED", action: "REOPEN", new_status: "open" },
  },
  {
    id: "EVT-2835", time: "18:44:55", user: "Developer", role: "developer",
    action: "access_tenant_b", plugin: "—", status: "DENIED",
    message: "Cross-tenant access violation",
    tenant: "ABC Corp", ip: "10.0.0.88", resource: "tenant/abc_corp/findings",
    capability: "tenant.cross_access",
    payload: { requesting_tenant: "xyz_inc", target_tenant: "abc_corp", violation: "CROSS_TENANT_ACCESS", suspicious: true },
  },
  {
    id: "EVT-2834", time: "18:42:30", user: "Security Admin", role: "security_admin",
    action: "update_role", plugin: "RBAC Plugin", status: "SUCCESS",
    message: "Developer role permissions updated",
    tenant: "ABC Corp", ip: "172.16.0.8", resource: "rbac/roles/developer",
    capability: "plugins.manage",
    payload: { role: "developer", changes: { added: [], removed: ["evidence.read"] }, updated_by: "ana@abc.com" },
  },
  {
    id: "EVT-2833", time: "18:40:18", user: "Security Analyst", role: "security_analyst",
    action: "search_findings", plugin: "Findings Plugin", status: "SUCCESS",
    message: "Found 3 high findings",
    tenant: "ABC Corp", ip: "192.168.1.42", resource: "findings/high",
    capability: "findings.read",
    payload: { query: { severity: "high", tenant: "abc_corp" }, results: 3, filtered: false, duration_ms: 89 },
  },
];

const PLUGIN_STATS = [
  { plugin: "Findings Plugin",       calls: 423, failures: 2,  rate: "99.5%" },
  { plugin: "Evidence Plugin",       calls: 891, failures: 0,  rate: "100%" },
  { plugin: "Jira Plugin",           calls: 240, failures: 3,  rate: "98.7%" },
  { plugin: "Verification Plugin",   calls: 167, failures: 1,  rate: "99.4%" },
  { plugin: "Reporting Plugin",      calls: 89,  failures: 0,  rate: "100%" },
  { plugin: "Knowledge Graph Plugin",calls: 134, failures: 5,  rate: "96.3%" },
];

const ROLE_COLORS: Record<string, string> = {
  platform_admin:      "#ef5350",
  security_admin:      "#ff8a65",
  security_analyst:    "#e8912d",
  remediation_manager: "#ffcc80",
  developer:           "#4fc3f7",
  executive:           "#ce93d8",
  unauthenticated:     "#9e9e9e",
};

const STATUS_COLORS = {
  SUCCESS: { bg: "#4caf5022", color: "#4caf50", border: "#4caf5044" },
  DENIED:  { bg: "#ef535022", color: "#ef5350", border: "#ef535044" },
  ERROR:   { bg: "#ff980022", color: "#ff9800", border: "#ff980044" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function exportCSV(events: AuditEvent[]) {
  const headers = ["ID","Time","User","Role","Action","Plugin","Status","Message","Tenant","IP","Resource"];
  const rows = events.map(e =>
    [e.id,e.time,e.user,e.role,e.action,e.plugin,e.status,`"${e.message}"`,e.tenant,e.ip,e.resource].join(",")
  );
  const csv = [headers.join(","),...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "axiom_audit_log.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "16px 18px", flex: 1, minWidth: 160,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || "var(--fg)", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function EventRow({ event, selected, onClick }: {
  event: AuditEvent; selected: boolean; onClick: () => void;
}) {
  const sc = STATUS_COLORS[event.status];
  const roleColor = ROLE_COLORS[event.role] || "#9e9e9e";
  return (
    <div onClick={onClick} style={{
      padding: "12px 16px",
      background: selected ? "var(--primary)11" : "transparent",
      borderLeft: selected ? "3px solid var(--primary)" : "3px solid transparent",
      borderBottom: "1px solid var(--border)",
      cursor: "pointer",
      transition: "background 0.1s",
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
    }}>
      {/* Status dot */}
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc.color, flexShrink: 0, marginTop: 4 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>{event.time}</span>
          <span style={{
            background: roleColor + "22", color: roleColor, border: `1px solid ${roleColor}44`,
            borderRadius: 12, padding: "1px 8px", fontSize: 10, fontWeight: 600, flexShrink: 0,
          }}>{event.user}</span>
          <span style={{ fontSize: 12, color: "var(--fg)", fontFamily: "monospace" }}>{event.action}</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>via {event.plugin}</span>
          <span style={{
            background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
            borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700, marginLeft: "auto", flexShrink: 0,
          }}>{event.status}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {event.message}
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ event }: { event: AuditEvent }) {
  const sc = STATUS_COLORS[event.status];
  const roleColor = ROLE_COLORS[event.role] || "#9e9e9e";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--fg)", fontFamily: "monospace" }}>{event.id}</span>
        <span style={{
          background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
          borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700,
        }}>{event.status}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { label: "Timestamp",   value: `Aug 21, 2026 — ${event.time}` },
          { label: "IP Address",  value: event.ip },
          { label: "User",        value: <span style={{ color: roleColor, fontWeight: 600 }}>{event.user}</span> },
          { label: "Tenant",      value: event.tenant },
          { label: "Plugin",      value: event.plugin },
          { label: "Capability",  value: <code style={{ fontFamily: "monospace", fontSize: 12, color: "var(--primary)" }}>{event.capability}</code> },
          { label: "Resource",    value: <code style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)" }}>{event.resource}</code> },
          { label: "Action",      value: <code style={{ fontFamily: "monospace", fontSize: 12 }}>{event.action}</code> },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
            <span style={{ fontSize: 13, color: "var(--fg)" }}>{value}</span>
          </div>
        ))}
      </div>

      <div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Result</div>
        <div style={{ fontSize: 13, color: sc.color }}>{event.message}</div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase" }}>Full Payload</div>
        <pre style={{
          background: "var(--bg)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "12px 14px", margin: 0,
          fontSize: 11, color: "var(--fg)", fontFamily: "monospace",
          overflow: "auto", maxHeight: 260, lineHeight: 1.6,
        }}>
          {JSON.stringify(event.payload, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(AUDIT_EVENTS[0]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "SUCCESS" | "DENIED" | "ERROR">("All");
  const [pluginFilter, setPluginFilter] = useState("All");

  const plugins = ["All", ...Array.from(new Set(AUDIT_EVENTS.map(e => e.plugin).filter(p => p !== "—")))];

  const filtered = useMemo(() => AUDIT_EVENTS.filter(e => {
    if (statusFilter !== "All" && e.status !== statusFilter) return false;
    if (pluginFilter !== "All" && e.plugin !== pluginFilter) return false;
    if (search && ![e.user, e.action, e.message, e.plugin, e.id].some(f => f.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  }), [search, statusFilter, pluginFilter]);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--fg)" }}>📋 Audit Log</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>
            Complete audit trail of all AXIOM platform events — Aug 21, 2026
          </p>
        </div>
        <span style={{
          background: "#ef535022", color: "#ef5350", border: "1px solid #ef535044",
          borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600,
        }}>⚠ 2 Suspicious Events</span>
      </div>

      {/* Stats Bar */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard icon="📊" label="Total Events"      value="2,847" sub="today" />
        <StatCard icon="🚫" label="RBAC Denials"      value="12"    sub="today" color="#ef5350" />
        <StatCard icon="🔌" label="Plugin Invocations" value="891"  sub="last 24h" color="var(--primary)" />
        <StatCard icon="⚠️" label="Suspicious"         value="2"    sub="alerts" color="#ff9800" />
      </div>

      {/* Filter Bar */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "12px 16px",
        display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
      }}>
        <input
          placeholder="🔍 Search events…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200, background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: 7, padding: "7px 12px", fontSize: 13, color: "var(--fg)",
          }}
        />

        {/* Status filter */}
        <div style={{ display: "flex", gap: 4 }}>
          {(["All","SUCCESS","DENIED","ERROR"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              background: statusFilter === s
                ? (s === "SUCCESS" ? "#4caf50" : s === "DENIED" ? "#ef5350" : s === "ERROR" ? "#ff9800" : "var(--primary)")
                : "var(--bg)",
              color: statusFilter === s ? "#fff" : "var(--muted)",
              border: "1px solid var(--border)", borderRadius: 6,
              padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}>{s}</button>
          ))}
        </div>

        {/* Plugin filter */}
        <select value={pluginFilter} onChange={e => setPluginFilter(e.target.value)} style={{
          background: "var(--bg)", border: "1px solid var(--border)",
          borderRadius: 7, padding: "7px 10px", fontSize: 12, color: "var(--fg)", cursor: "pointer",
        }}>
          {plugins.map(p => <option key={p} value={p}>{p === "All" ? "All Plugins" : p}</option>)}
        </select>

        <button onClick={() => exportCSV(filtered)} style={{
          background: "var(--primary)", color: "#fff", border: "none",
          borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 600,
          cursor: "pointer", whiteSpace: "nowrap",
        }}>⬇ Export CSV</button>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Timeline */}
        <div style={{
          flex: "0 0 480px", background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, overflow: "hidden",
        }}>
          <div style={{
            padding: "12px 16px", borderBottom: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>Events</span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{filtered.length} of {AUDIT_EVENTS.length}</span>
          </div>
          <div style={{ overflowY: "auto", maxHeight: 540 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                No events match your filters
              </div>
            ) : filtered.map(e => (
              <EventRow
                key={e.id} event={e}
                selected={selectedEvent?.id === e.id}
                onClick={() => setSelectedEvent(e)}
              />
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div style={{
          flex: 1, background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, overflow: "hidden", minWidth: 0,
        }}>
          {selectedEvent ? (
            <>
              <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>Event Detail</span>
              </div>
              <DetailPanel event={selectedEvent} />
            </>
          ) : (
            <div style={{ padding: 48, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
              Click an event to view details
            </div>
          )}
        </div>
      </div>

      {/* Suspicious Activity */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, padding: 20,
      }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>
          ⚠️ Suspicious Activity Alerts
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{
            background: "#ef535011", border: "1px solid #ef535044",
            borderRadius: 8, padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{
              background: "#ef535022", color: "#ef5350", border: "1px solid #ef535044",
              borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>CRITICAL</span>
            <span style={{ fontSize: 13, color: "var(--fg)" }}>
              Cross-tenant access attempt by <strong>Developer</strong> (mike@xyz.com) targeting ABC Corp tenant at <strong>18:44</strong>
            </span>
            <button
              onClick={() => setSelectedEvent(AUDIT_EVENTS.find(e => e.id === "EVT-2835") || null)}
              style={{
                marginLeft: "auto", background: "transparent", border: "1px solid #ef535044",
                borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#ef5350", cursor: "pointer", flexShrink: 0,
              }}
            >View Event →</button>
          </div>
          <div style={{
            background: "#ff980011", border: "1px solid #ff980044",
            borderRadius: 8, padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{
              background: "#ff980022", color: "#ff9800", border: "1px solid #ff980044",
              borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>WARNING</span>
            <span style={{ fontSize: 13, color: "var(--fg)" }}>
              Authentication failure from <strong>Unknown User</strong> at IP 203.0.113.99 at <strong>18:55</strong>
            </span>
            <button
              onClick={() => setSelectedEvent(AUDIT_EVENTS.find(e => e.id === "EVT-2839") || null)}
              style={{
                marginLeft: "auto", background: "transparent", border: "1px solid #ff980044",
                borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#ff9800", cursor: "pointer", flexShrink: 0,
              }}
            >View Event →</button>
          </div>
        </div>
      </div>

      {/* Plugin Activity Summary */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, overflow: "hidden",
      }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>🔌 Plugin Activity (24h)</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                {["Plugin","Calls (24h)","Failures","Success Rate"].map(h => (
                  <th key={h} style={{
                    padding: "10px 16px", textAlign: "left", fontSize: 11,
                    fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLUGIN_STATS.map((row, i) => (
                <tr key={row.plugin} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "var(--surface)" : "var(--bg)" }}>
                  <td style={{ padding: "11px 16px", fontWeight: 500, color: "var(--fg)", fontSize: 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>🔌</span>{row.plugin}
                    </div>
                  </td>
                  <td style={{ padding: "11px 16px", color: "var(--fg)", fontSize: 13, fontFamily: "monospace" }}>
                    {row.calls.toLocaleString()}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{
                      color: row.failures > 0 ? "#ef5350" : "#4caf50",
                      fontWeight: 600, fontSize: 13, fontFamily: "monospace",
                    }}>{row.failures}</span>
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        flex: 1, height: 6, background: "var(--bg)",
                        borderRadius: 3, overflow: "hidden", maxWidth: 100,
                      }}>
                        <div style={{
                          height: "100%",
                          width: row.rate,
                          background: parseFloat(row.rate) >= 99 ? "#4caf50" : parseFloat(row.rate) >= 97 ? "#ff9800" : "#ef5350",
                          borderRadius: 3,
                        }} />
                      </div>
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: parseFloat(row.rate) >= 99 ? "#4caf50" : parseFloat(row.rate) >= 97 ? "#ff9800" : "#ef5350",
                      }}>{row.rate}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
