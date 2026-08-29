"use client";

import { useState } from "react";

type ValidationStatus = "VERIFIED" | "FAILED" | "PENDING";

interface ValidationJob {
  id: string;
  title: string;
  findingId: string;
  status: ValidationStatus;
  confidence: number | null;
  severity: string;
  method: string;
  attempts: number;
  duration: string;
  validator: string;
  jiraTicket?: string;
}

const jobs: ValidationJob[] = [
  { id: "VAL-001", title: "SQL Injection", findingId: "F-001", status: "VERIFIED", confidence: 97, severity: "Critical", method: "Baseline→Test→Control", attempts: 3, duration: "4.2s", validator: "AXIOM Verification Engine v2.1", jiraTicket: "JRA-2847" },
  { id: "VAL-002", title: "Stored XSS", findingId: "F-002", status: "VERIFIED", confidence: 94, severity: "High", method: "Baseline→Test→Control", attempts: 2, duration: "3.1s", validator: "AXIOM Verification Engine v2.1", jiraTicket: "JRA-2848" },
  { id: "VAL-003", title: "SSRF", findingId: "F-003", status: "VERIFIED", confidence: 99, severity: "Critical", method: "Baseline→Test→Control", attempts: 3, duration: "5.8s", validator: "AXIOM Verification Engine v2.1", jiraTicket: "JRA-2849" },
  { id: "VAL-004", title: "IDOR", findingId: "F-004", status: "VERIFIED", confidence: 88, severity: "High", method: "Baseline→Test→Control", attempts: 2, duration: "2.7s", validator: "AXIOM Verification Engine v2.1", jiraTicket: "JRA-2850" },
  { id: "VAL-005", title: "CORS Misconfig", findingId: "F-005", status: "VERIFIED", confidence: 91, severity: "High", method: "Baseline→Test→Control", attempts: 3, duration: "3.9s", validator: "AXIOM Verification Engine v2.1", jiraTicket: "JRA-2851" },
  { id: "VAL-006", title: "Auth Bypass", findingId: "F-006", status: "FAILED", confidence: 34, severity: "High", method: "Baseline→Test→Control", attempts: 3, duration: "6.1s", validator: "AXIOM Verification Engine v2.1" },
  { id: "VAL-007", title: "Path Traversal", findingId: "F-007", status: "PENDING", confidence: null, severity: "Medium", method: "Baseline→Test→Control", attempts: 0, duration: "—", validator: "AXIOM Verification Engine v2.1" },
  { id: "VAL-008", title: "Open Redirect", findingId: "F-008", status: "PENDING", confidence: null, severity: "Medium", method: "Baseline→Test→Control", attempts: 0, duration: "—", validator: "AXIOM Verification Engine v2.1" },
];

const workflowSteps = [
  { label: "Finding Received (from Scanner Service)", done: true, time: "2026-08-21 19:05:00", detail: "Source: AXIOM Scanner Engine" },
  { label: "Baseline Captured", done: true, time: "2026-08-21 19:05:01", detail: "200 OK baseline captured" },
  { label: "Test Payload Sent", done: true, time: "2026-08-21 19:05:02", detail: "SQLi payload injected" },
  { label: "Response Analyzed", done: true, time: "2026-08-21 19:05:03", detail: "Anomalous response detected" },
  { label: "Control Request Sent", done: true, time: "2026-08-21 19:05:04", detail: "Control request sent (benign input)" },
  { label: "False-Positive Check", done: true, time: "2026-08-21 19:05:05", detail: "FP rate: 0% (control behaved normally)" },
  { label: "Confidence Scored", done: true, time: "2026-08-21 19:05:06", detail: "Confidence: 97% (threshold: 70%)" },
  { label: "Verdict: VERIFIED", done: true, time: "2026-08-21 19:05:06", detail: "Threshold exceeded → VERIFIED" },
  { label: "Ticket Created (Jira JRA-2847)", done: true, time: "2026-08-21 19:05:07", detail: "Priority: P1" },
  { label: "Team Notified", done: true, time: "2026-08-21 19:05:08", detail: "Slack #security-alerts + email sent" },
];

const confidenceBreakdown = [
  { label: "Pattern Match", score: 100 },
  { label: "Behavior Confirmed", score: 95 },
  { label: "Repeatability", score: 98 },
  { label: "Control Tested", score: 92 },
];

function statusColor(status: ValidationStatus): string {
  if (status === "VERIFIED") return "var(--green)";
  if (status === "FAILED") return "#ef4444";
  return "var(--yellow)";
}

function confidenceColor(score: number): string {
  if (score >= 80) return "var(--green)";
  if (score >= 50) return "var(--yellow)";
  return "#ef4444";
}

function StatusBadge({ status }: { status: ValidationStatus }) {
  return (
    <span
      style={{
        background:
          status === "VERIFIED" ? "rgba(34,197,94,0.12)" :
          status === "FAILED" ? "rgba(239,68,68,0.12)" :
          "rgba(234,179,8,0.12)",
        color: statusColor(status),
        border: `1px solid ${statusColor(status)}40`,
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        fontFamily: "monospace",
      }}
    >
      {status}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const color =
    severity === "Critical" ? "#ef4444" :
    severity === "High" ? "var(--primary)" :
    severity === "Medium" ? "var(--yellow)" :
    "var(--muted)";
  return (
    <span
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {severity}
    </span>
  );
}

export default function ValidationPage() {
  const [selectedId, setSelectedId] = useState("VAL-001");
  const [activeTab, setActiveTab] = useState<"overview" | "evidence" | "workflow">("overview");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const selected = jobs.find((j) => j.id === selectedId)!;
  const filtered = filterStatus === "all" ? jobs : jobs.filter((j) => j.status === filterStatus);

  const stats = [
    { label: "Validation Jobs", value: "24", sub: "today", color: "var(--primary)" },
    { label: "Verified", value: "19", sub: "79%", color: "var(--green)" },
    { label: "Failed", value: "3", sub: "12%", color: "#ef4444" },
    { label: "Pending", value: "2", sub: "8%", color: "var(--yellow)" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "24px 28px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
          <span style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" as const, fontWeight: 600 }}>
            Phase 2 · Finding Intelligence
          </span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 2px", letterSpacing: "-0.02em" }}>Validation Service</h1>
        <p style={{ margin: "0 0 20px", color: "var(--muted)", fontSize: 13 }}>
          Turns scanner results into verified findings with confidence scores
        </p>
      </div>

      <div style={{ padding: "20px 28px" }}>
        {/* Stats Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
          {stats.map((s) => (
            <div key={s.label} className="tool-panel" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 6 }}>
                {s.label}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</span>
                <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>{s.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--muted)", marginRight: 4 }}>Filter:</span>
          {(["all", "VERIFIED", "FAILED", "PENDING"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              style={{
                padding: "4px 12px",
                borderRadius: 4,
                border: `1px solid ${filterStatus === f ? "var(--primary)" : "var(--border)"}`,
                background: filterStatus === f ? "var(--primary)22" : "var(--surface)",
                color: filterStatus === f ? "var(--primary)" : "var(--muted)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
            <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>Live Validation Engine Active</span>
          </div>
        </div>

        {/* Main Layout */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          {/* Left Panel */}
          <div className="tool-panel" style={{ width: 260, flexShrink: 0, padding: 0, overflow: "hidden" }}>
            <div className="tool-panel-header" style={{ padding: "10px 14px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Validation Jobs</span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{filtered.length} jobs</span>
            </div>
            <div style={{ overflowY: "auto" as const }}>
              {filtered.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedId(job.id)}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border)",
                    background: selectedId === job.id ? "var(--primary)10" : "transparent",
                    borderLeft: selectedId === job.id ? "2px solid var(--primary)" : "2px solid transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace", fontWeight: 700 }}>{job.id}</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, color: "var(--fg)" }}>{job.title}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>{job.findingId}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: job.confidence !== null ? confidenceColor(job.confidence) : "var(--muted)" }}>
                      {job.confidence !== null ? `${job.confidence}%` : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="tool-panel" style={{ flex: 1, padding: 0, overflow: "hidden" }}>
            {/* Job Header */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--muted)", fontWeight: 700 }}>{selected.id}</span>
                    <span style={{ color: "var(--border)" }}>·</span>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--muted)" }}>{selected.findingId}</span>
                    <SeverityBadge severity={selected.severity} />
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{selected.title}</h2>
                </div>
                <StatusBadge status={selected.status} />
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
              {(["overview", "evidence", "workflow"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "transparent",
                    color: activeTab === tab ? "var(--primary)" : "var(--muted)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
                    textTransform: "capitalize" as const,
                    transition: "all 0.15s",
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: 20 }}>

              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                      {[
                        { label: "Job ID", value: selected.id },
                        { label: "Finding ID", value: selected.findingId },
                        { label: "Title", value: selected.title },
                        { label: "Severity", value: <SeverityBadge severity={selected.severity} /> },
                        { label: "Method", value: selected.method },
                        { label: "Attempts", value: selected.status === "VERIFIED" ? `${selected.attempts} (all successful)` : selected.attempts.toString() },
                        { label: "Duration", value: selected.duration },
                        { label: "Validator", value: selected.validator },
                      ].map((item, i) => (
                        <div key={i} style={{ background: "var(--bg)", borderRadius: 6, padding: "10px 12px", border: "1px solid var(--border)" }}>
                          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Final Verdict */}
                    <div
                      style={{
                        background:
                          selected.status === "VERIFIED" ? "rgba(34,197,94,0.08)" :
                          selected.status === "FAILED" ? "rgba(239,68,68,0.08)" :
                          "rgba(234,179,8,0.08)",
                        border: `1px solid ${statusColor(selected.status)}40`,
                        borderRadius: 8,
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>Final Verdict</span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: statusColor(selected.status), letterSpacing: "0.06em", fontFamily: "monospace" }}>
                        {selected.status}
                      </span>
                    </div>
                    {selected.jiraTicket && (
                      <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
                        Ticket: <span style={{ color: "var(--primary)", fontFamily: "monospace", fontWeight: 700 }}>{selected.jiraTicket}</span> created
                      </div>
                    )}
                  </div>

                  <div>
                    {/* Confidence Score */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 10 }}>
                        Confidence Score
                      </div>
                      <div style={{ textAlign: "center" as const, marginBottom: 12 }}>
                        <span style={{ fontSize: 56, fontWeight: 900, color: selected.confidence !== null ? confidenceColor(selected.confidence) : "var(--muted)", letterSpacing: "-0.04em", lineHeight: 1 }}>
                          {selected.confidence !== null ? `${selected.confidence}%` : "—"}
                        </span>
                      </div>
                      {selected.confidence !== null && (
                        <div style={{ height: 10, borderRadius: 5, background: "var(--border)", overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${selected.confidence}%`,
                              background: confidenceColor(selected.confidence),
                              borderRadius: 5,
                              transition: "width 0.5s ease",
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Breakdown */}
                    <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 10 }}>
                      Confidence Breakdown
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                      {confidenceBreakdown.map((item) => (
                        <div key={item.label}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ color: "var(--green)", fontWeight: 700 }}>✓</span>
                              <span style={{ fontSize: 13, color: "var(--fg)" }}>{item.label}</span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: confidenceColor(item.score), fontFamily: "monospace" }}>{item.score}%</span>
                          </div>
                          <div style={{ height: 4, borderRadius: 2, background: "var(--border)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${item.score}%`, background: confidenceColor(item.score), borderRadius: 2 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* EVIDENCE TAB */}
              {activeTab === "evidence" && (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    {[
                      { label: "Original Request", color: "var(--muted)", content: `GET /api/users?id=1 HTTP/1.1\nHost: api.target.com\nAuthorization: Bearer eyJ...` },
                      { label: "Test Request", color: "var(--primary)", content: `GET /api/users?id=1' OR '1'='1 HTTP/1.1\nHost: api.target.com\nAuthorization: Bearer eyJ...` },
                      { label: "Control Request", color: "var(--green)", content: `GET /api/users?id=2 HTTP/1.1\nHost: api.target.com\nAuthorization: Bearer eyJ...` },
                    ].map((req) => (
                      <div key={req.label} style={{ background: "var(--bg)", border: `1px solid ${req.color}40`, borderRadius: 6, overflow: "hidden" }}>
                        <div style={{ padding: "6px 12px", background: `${req.color}15`, borderBottom: `1px solid ${req.color}30` }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: req.color, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{req.label}</span>
                        </div>
                        <pre style={{ margin: 0, padding: "10px 12px", fontSize: 11, fontFamily: "monospace", color: "var(--fg)", whiteSpace: "pre-wrap" as const, lineHeight: 1.6 }}>
                          {req.content}
                        </pre>
                      </div>
                    ))}
                  </div>

                  {/* Response Diff */}
                  <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ padding: "6px 12px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Response Diff</span>
                    </div>
                    <pre style={{ margin: 0, padding: "10px 12px", fontSize: 11, fontFamily: "monospace", whiteSpace: "pre-wrap" as const, lineHeight: 1.7 }}>
                      <span style={{ color: "var(--muted)" }}>  HTTP/1.1 200 OK{"\n"}</span>
                      <span style={{ color: "var(--muted)" }}>  Content-Type: application/json{"\n\n"}</span>
                      <span style={{ color: "#ef4444" }}>- {"{"}"id":1,"name":"Alice"{"}"} // Original (1 record){"\n"}</span>
                      <span style={{ color: "var(--green)" }}>+ {"{"}"id":1,...{"}"} // Test payload: ALL records returned (SQLi confirmed)</span>
                    </pre>
                  </div>

                  {/* OOB */}
                  <div style={{ background: "var(--bg)", border: "1px solid var(--primary)30", borderRadius: 6, padding: "12px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 }}>
                      OOB Callback
                    </div>
                    <div style={{ fontSize: 13, color: "var(--fg)" }}>
                      DNS callback received from{" "}
                      <span style={{ fontFamily: "monospace", color: "var(--green)" }}>api.target.com</span>{" "}
                      to AXIOM OOB server at{" "}
                      <span style={{ fontFamily: "monospace", color: "var(--primary)" }}>oob.axiom-verify.io</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                      Timestamp: 2026-08-21T19:07:42Z · Confirms out-of-band interaction
                    </div>
                  </div>
                </div>
              )}

              {/* WORKFLOW TAB */}
              {activeTab === "workflow" && (
                <div>
                  <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 16 }}>
                    Validation Workflow Timeline
                  </div>
                  <div style={{ position: "relative" as const, paddingLeft: 32 }}>
                    <div style={{ position: "absolute" as const, left: 10, top: 0, bottom: 0, width: 2, background: "var(--border)" }} />
                    {workflowSteps.map((step, idx) => (
                      <div key={idx} style={{ position: "relative" as const, marginBottom: idx === workflowSteps.length - 1 ? 0 : 22 }}>
                        <div
                          style={{
                            position: "absolute" as const,
                            left: -22,
                            top: 2,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: step.done ? "var(--green)" : "var(--border)",
                            border: "2px solid var(--bg)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {step.done && <span style={{ fontSize: 8, color: "var(--bg)", fontWeight: 900 }}>✓</span>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{step.label}</span>
                          {step.done && (
                            <span style={{ fontSize: 10, color: "var(--green)", fontWeight: 700, background: "rgba(34,197,94,0.1)", padding: "1px 6px", borderRadius: 3 }}>✓</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                          {step.time} · {step.detail}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
