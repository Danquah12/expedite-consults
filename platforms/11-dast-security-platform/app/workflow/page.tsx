"use client";

import { useState } from "react";

/* ─── Data ─────────────────────────────────────────── */

const workflowRules = [
  {
    id: "RULE-001",
    name: "Auto-ticket for Critical findings",
    trigger: 'finding.severity == "Critical" AND finding.status == "VERIFIED"',
    action: 'create_jira_ticket(priority=P1, assignee="security-team")',
    status: "Active",
    triggered: "3 times today",
  },
  {
    id: "RULE-002",
    name: "Notify Slack on High+ findings",
    trigger: 'finding.severity IN ["Critical", "High"] AND finding.status == "VERIFIED"',
    action: 'slack.notify(channel="#security-alerts", include_cvss=true)',
    status: "Active",
    triggered: "8 times today",
  },
  {
    id: "RULE-003",
    name: "Escalate if unacknowledged for 24h",
    trigger: 'finding.status == "OPEN" AND finding.age > 24h AND finding.severity == "Critical"',
    action: 'escalate(to="security-admin"), slack.notify(channel="#escalations")',
    status: "Active",
    triggered: "0 times today",
  },
  {
    id: "RULE-004",
    name: "Auto-close Low findings after verification",
    trigger: 'finding.severity == "Low" AND validation.confidence > 95',
    action: 'finding.status = "VERIFIED", ticket.create(priority=P4, auto_assign=true)',
    status: "Active",
    triggered: "2 times today",
  },
  {
    id: "RULE-005",
    name: "Block scan if out-of-scope URL detected",
    trigger: "scan.url NOT IN scope.included_urls",
    action: "scan.stop(), audit.log(reason=out_of_scope)",
    status: "Active",
    triggered: "0 times today",
  },
  {
    id: "RULE-006",
    name: "Auto-reopen if verification fails",
    trigger: 'verification.result == "FAILED" AND finding.status == "CLOSED"',
    action: "finding.reopen(), ticket.reopen(), notify(assignee)",
    status: "Active",
    triggered: "1 time today",
  },
];

const approvals = [
  { finding: "Auth Bypass", severity: "High", requires: "Security Admin", submittedBy: "Engine Brain", submittedAt: "19:05", status: "Pending" },
  { finding: "Path Traversal", severity: "Medium", requires: "Security Analyst", submittedBy: "Engine Brain", submittedAt: "19:02", status: "Pending" },
  { finding: "SQL Injection", severity: "Critical", requires: "Auto-approved", submittedBy: "Engine Brain", submittedAt: "19:00", status: "Approved" },
];

const approvalConditions = [
  { severity: "Critical", condition: "Auto-approved", icon: "⚡" },
  { severity: "High", condition: "Security Admin review required", icon: "👤" },
  { severity: "Medium", condition: "Security Analyst review required", icon: "👤" },
  { severity: "Low", condition: "Auto-approved", icon: "⚡" },
];

interface NotificationChannel {
  name: string;
  icon: string;
  connected: boolean;
  detail: string;
  lastUsed: string;
}

const notificationChannels: NotificationChannel[] = [
  { name: "Jira Enterprise", icon: "🔷", connected: true, detail: "Workspace: abc-corp", lastUsed: "2m ago" },
  { name: "Slack #security-alerts", icon: "💬", connected: true, detail: "Webhook active", lastUsed: "5m ago" },
  { name: "Microsoft Teams", icon: "🟦", connected: true, detail: "Channel: Security", lastUsed: "8m ago" },
  { name: "Email (SMTP)", icon: "📧", connected: true, detail: "smtp.abc.com:587", lastUsed: "10m ago" },
  { name: "PagerDuty", icon: "🔔", connected: false, detail: "Not configured", lastUsed: "" },
  { name: "GitHub Issues", icon: "🐙", connected: true, detail: "repo: abc-corp/security", lastUsed: "15m ago" },
];

const notificationLog = [
  { time: "19:08", channel: "Jira", message: "JRA-2849 created for Stored XSS", icon: "🔷" },
  { time: "19:07", channel: "Slack", message: "Critical finding alert sent", icon: "💬" },
  { time: "19:06", channel: "Teams", message: "Security digest sent", icon: "🟦" },
  { time: "19:05", channel: "Email", message: "Critical alert to security-team@abc.com", icon: "📧" },
];

const historyEvents = [
  { time: "19:08", rule: "RULE-001", finding: "Stored XSS", action: "create_jira_ticket", result: "Success" },
  { time: "19:08", rule: "RULE-002", finding: "Stored XSS", action: "slack.notify", result: "Success" },
  { time: "19:07", rule: "RULE-001", finding: "SSRF → AWS", action: "create_jira_ticket", result: "Success" },
  { time: "19:07", rule: "RULE-002", finding: "SSRF → AWS", action: "slack.notify", result: "Success" },
  { time: "19:06", rule: "RULE-004", finding: "Open Redirect", action: "ticket.create (P4)", result: "Success" },
  { time: "19:05", rule: "RULE-001", finding: "SQL Injection", action: "create_jira_ticket", result: "Success" },
  { time: "19:05", rule: "RULE-002", finding: "SQL Injection", action: "slack.notify", result: "Success" },
  { time: "19:04", rule: "RULE-004", finding: "Info Disclosure", action: "auto-close", result: "Skipped" },
  { time: "19:03", rule: "RULE-005", finding: "Scan #47", action: "scan.stop()", result: "Skipped" },
  { time: "19:02", rule: "RULE-006", finding: "XSS (stale)", action: "finding.reopen()", result: "Success" },
  { time: "18:58", rule: "RULE-003", finding: "RCE (24h old)", action: "escalate()", result: "Failed" },
  { time: "18:55", rule: "RULE-002", finding: "IDOR", action: "slack.notify", result: "Success" },
];

/* ─── Helpers ─────────────────────────────────────── */

function resultBadge(result: string) {
  const c = result === "Success" ? "var(--green)" : result === "Failed" ? "#ef4444" : "var(--muted)";
  return (
    <span style={{ background: `${c}22`, color: c, border: `1px solid ${c}44`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>
      {result}
    </span>
  );
}

function severityColor(sev: string) {
  if (sev === "Critical") return "#ef4444";
  if (sev === "High") return "var(--primary)";
  if (sev === "Medium") return "var(--yellow)";
  return "var(--muted)";
}

/* ─── Rules Tab ────────────────────────────────────── */

function RulesTab() {
  const [showModal, setShowModal] = useState(false);
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(workflowRules.map((r) => [r.id, true]))
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)", marginBottom: 2 }}>Workflow Rules</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Automated actions triggered by finding events</div>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowModal(true)}
          style={{ fontSize: 13 }}
        >
          + Add Rule
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
        {workflowRules.map((rule) => (
          <div key={rule.id} className="tool-panel" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "var(--primary)", background: "var(--primary)10", padding: "2px 8px", borderRadius: 3 }}>
                  {rule.id}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)" }}>{rule.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{rule.triggered}</span>
                {/* Toggle */}
                <div
                  onClick={() => setToggles((prev) => ({ ...prev, [rule.id]: !prev[rule.id] }))}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    background: toggles[rule.id] ? "var(--green)" : "var(--border)",
                    cursor: "pointer",
                    position: "relative" as const,
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      position: "absolute" as const,
                      top: 2,
                      left: toggles[rule.id] ? 18 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "white",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: toggles[rule.id] ? "var(--green)" : "var(--muted)" }}>
                  {toggles[rule.id] ? "Active" : "Disabled"}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 4 }}>Trigger Condition</div>
                <code style={{
                  display: "block",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderLeft: "3px solid var(--yellow)",
                  borderRadius: 4,
                  padding: "8px 10px",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "var(--fg)",
                  lineHeight: 1.5,
                }}>
                  {rule.trigger}
                </code>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 4 }}>Action</div>
                <code style={{
                  display: "block",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderLeft: "3px solid var(--primary)",
                  borderRadius: 4,
                  padding: "8px 10px",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "var(--primary)",
                  lineHeight: 1.5,
                }}>
                  {rule.action}
                </code>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Rule Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed" as const,
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="tool-panel"
            style={{ width: 500, padding: 24, borderRadius: 8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Add Workflow Rule</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 18, cursor: "pointer" }}>×</button>
            </div>

            {[
              { label: "Rule Name", placeholder: "e.g. Notify on Critical findings" },
              { label: "Trigger Condition", placeholder: 'e.g. finding.severity == "Critical"' },
              { label: "Action", placeholder: "e.g. create_jira_ticket(priority=P1)" },
            ].map((field) => (
              <div key={field.label} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 }}>
                  {field.label}
                </label>
                <input
                  className="tool-input"
                  placeholder={field.placeholder}
                  style={{ width: "100%", padding: "8px 12px", boxSizing: "border-box" as const }}
                />
              </div>
            ))}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowModal(false)}>Save Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Approvals Tab ─────────────────────────────────── */

function ApprovalsTab() {
  const [rows, setRows] = useState(approvals.map((a, i) => ({ ...a, id: i })));

  const approve = (id: number) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)));
  const reject = (id: number) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r)));

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
      {/* Approval Queue */}
      <div className="tool-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div className="tool-panel-header" style={{ padding: "10px 16px" }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>Approval Queue</span>
          <span style={{ fontSize: 12, color: "var(--yellow)", fontWeight: 600 }}>
            {rows.filter((r) => r.status === "Pending").length} pending
          </span>
        </div>
        <table className="data-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              {["Finding", "Severity", "Requires Approval", "Submitted By", "Submitted At", "Status", "Actions"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{r.finding}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ background: `${severityColor(r.severity)}22`, color: severityColor(r.severity), border: `1px solid ${severityColor(r.severity)}44`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{r.severity}</span>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--muted)" }}>{r.requires}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--muted)" }}>{r.submittedBy}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, fontFamily: "monospace", color: "var(--muted)" }}>{r.submittedAt}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span
                    style={{
                      background: r.status === "Approved" ? "rgba(34,197,94,0.12)" : r.status === "Rejected" ? "rgba(239,68,68,0.12)" : "rgba(234,179,8,0.12)",
                      color: r.status === "Approved" ? "var(--green)" : r.status === "Rejected" ? "#ef4444" : "var(--yellow)",
                      border: `1px solid ${r.status === "Approved" ? "var(--green)" : r.status === "Rejected" ? "#ef4444" : "var(--yellow)"}40`,
                      borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, fontFamily: "monospace",
                    }}
                  >
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  {r.status === "Pending" ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => approve(r.id)}
                        style={{ background: "rgba(34,197,94,0.15)", color: "var(--green)", border: "1px solid var(--green)40", borderRadius: 4, padding: "3px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reject(r.id)}
                        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid #ef444440", borderRadius: 4, padding: "3px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Approval Conditions */}
      <div className="tool-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div className="tool-panel-header" style={{ padding: "10px 16px" }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>Approval Conditions</span>
        </div>
        <div style={{ padding: 14, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {approvalConditions.map((c) => (
            <div key={c.severity} style={{ background: "var(--bg)", borderRadius: 6, padding: "12px 14px", border: `1px solid ${severityColor(c.severity)}30`, borderTop: `3px solid ${severityColor(c.severity)}` }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: severityColor(c.severity), marginBottom: 4 }}>{c.severity}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{c.condition}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Notifications Tab ─────────────────────────────── */

function NotificationsTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
      {/* Channel Cards */}
      <div>
        <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 12 }}>Notification Channels</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {notificationChannels.map((ch) => (
            <div
              key={ch.name}
              className="tool-panel"
              style={{ padding: "14px 16px", borderLeft: `3px solid ${ch.connected ? "var(--green)" : "var(--yellow)"}` }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{ch.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>{ch.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: ch.connected ? "var(--green)" : "var(--yellow)" }}>
                  {ch.connected ? "✓ Connected" : "⚠ Not configured"}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: ch.lastUsed ? 4 : 0 }}>{ch.detail}</div>
              {ch.lastUsed && (
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Last: {ch.lastUsed}</div>
              )}
              <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                {ch.connected ? (
                  <>
                    <button className="btn-secondary" style={{ fontSize: 11, padding: "3px 10px" }}>Test</button>
                    <button className="btn-secondary" style={{ fontSize: 11, padding: "3px 10px" }}>Configure</button>
                  </>
                ) : (
                  <button className="btn-primary" style={{ fontSize: 11, padding: "3px 10px" }}>Connect</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Log */}
      <div className="tool-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div className="tool-panel-header" style={{ padding: "10px 16px" }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>Notification Log</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Last 10 events</span>
        </div>
        <div style={{ padding: "8px 0" }}>
          {notificationLog.map((log, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 16px",
                borderBottom: i < notificationLog.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--muted)", minWidth: 40 }}>{log.time}</span>
              <span style={{ fontSize: 14 }}>{log.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)", minWidth: 60 }}>{log.channel}</span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{log.message}</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--green)", fontWeight: 600 }}>✓ Sent</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── History Tab ────────────────────────────────────── */

function HistoryTab() {
  return (
    <div className="tool-panel" style={{ padding: 0, overflow: "hidden" }}>
      <div className="tool-panel-header" style={{ padding: "10px 16px" }}>
        <span style={{ fontSize: 12, fontWeight: 700 }}>Workflow Execution History</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>Last 20 events</span>
      </div>
      <table className="data-table" style={{ width: "100%" }}>
        <thead>
          <tr>
            {["Time", "Rule", "Finding", "Action", "Result"].map((h) => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {historyEvents.map((e, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "9px 14px", fontSize: 12, fontFamily: "monospace", color: "var(--muted)" }}>{e.time}</td>
              <td style={{ padding: "9px 14px" }}>
                <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "var(--primary)", background: "var(--primary)10", padding: "2px 6px", borderRadius: 3 }}>{e.rule}</span>
              </td>
              <td style={{ padding: "9px 14px", fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{e.finding}</td>
              <td style={{ padding: "9px 14px" }}>
                <code style={{ fontSize: 11, fontFamily: "monospace", color: "var(--muted)", background: "var(--bg)", padding: "2px 6px", borderRadius: 3 }}>{e.action}</code>
              </td>
              <td style={{ padding: "9px 14px" }}>{resultBadge(e.result)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────── */

const navItems = [
  { key: "rules", label: "Rules", icon: "⚙️", count: 6 },
  { key: "approvals", label: "Approvals", icon: "✅", count: 2 },
  { key: "notifications", label: "Notifications", icon: "🔔", count: 6 },
  { key: "history", label: "History", icon: "📋", count: 12 },
] as const;

export default function WorkflowPage() {
  const [activeNav, setActiveNav] = useState<"rules" | "approvals" | "notifications" | "history">("rules");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column" as const }}>
      {/* Header */}
      <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--yellow)", boxShadow: "0 0 6px var(--yellow)" }} />
          <span style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" as const, fontWeight: 600 }}>Phase 2 · Automation</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 2px", letterSpacing: "-0.02em" }}>Workflow Engine</h1>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>Rules · Approvals · Notifications · History</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
              <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>6 rules active</span>
            </div>
            <button className="btn-secondary" style={{ fontSize: 12 }}>Export Rules</button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Left Nav */}
        <div style={{ width: 200, flexShrink: 0, borderRight: "1px solid var(--border)", padding: "16px 0" }}>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 20px",
                border: "none",
                background: activeNav === item.key ? "var(--primary)10" : "transparent",
                color: activeNav === item.key ? "var(--primary)" : "var(--muted)",
                fontWeight: activeNav === item.key ? 700 : 500,
                fontSize: 13,
                cursor: "pointer",
                borderLeft: activeNav === item.key ? "3px solid var(--primary)" : "3px solid transparent",
                textAlign: "left" as const,
                transition: "all 0.15s",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  background: activeNav === item.key ? "var(--primary)22" : "var(--surface)",
                  color: activeNav === item.key ? "var(--primary)" : "var(--muted)",
                  padding: "1px 6px",
                  borderRadius: 8,
                  fontFamily: "monospace",
                }}
              >
                {item.count}
              </span>
            </button>
          ))}

          {/* Status summary */}
          <div style={{ margin: "20px 16px 0", padding: "12px", background: "var(--surface)", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }}>Today&apos;s Activity</div>
            {[
              { label: "Rules Triggered", value: "14", color: "var(--primary)" },
              { label: "Tickets Created", value: "3", color: "var(--green)" },
              { label: "Alerts Sent", value: "11", color: "var(--yellow)" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{s.label}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" as const }}>
          {activeNav === "rules" && <RulesTab />}
          {activeNav === "approvals" && <ApprovalsTab />}
          {activeNav === "notifications" && <NotificationsTab />}
          {activeNav === "history" && <HistoryTab />}
        </div>
      </div>
    </div>
  );
}
