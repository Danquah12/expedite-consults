"use client";

import { useState, useRef, useEffect } from "react";
import { FINDINGS } from "@/data/findings";

// ─── Types ──────────────────────────────────────────────────────────────────

type Role = "Security Analyst" | "Developer" | "Executive" | "Platform Admin";

type OrchestrationStep = {
  id: number;
  label: string;
  detail: string;
  badge?: string;
  badgeColor?: string;
  visible: boolean;
};

type Message = {
  id: string;
  role: "user" | "copilot";
  content: string | React.ReactNode;
  timestamp: string;
  denied?: boolean;
};

// ─── RBAC Config ────────────────────────────────────────────────────────────

const RBAC: Record<Role, string[]> = {
  "Platform Admin": [
    "findings.read",
    "evidence.read",
    "tickets.create",
    "tickets.read",
    "verification.execute",
    "reports.generate",
  ],
  "Security Analyst": [
    "findings.read",
    "evidence.read",
    "tickets.create",
    "verification.execute",
    "reports.generate",
  ],
  Developer: ["findings.read", "tickets.read"],
  Executive: ["reports.generate", "findings.read"],
};

// ─── Example Queries ────────────────────────────────────────────────────────

const EXAMPLE_QUERIES = [
  "Show critical findings for the payment API",
  "Create a Jira ticket for finding F-001",
  "Which team has the highest risk score?",
  "Show all assets connected to Customer Portal",
  "Generate executive risk report",
  "Which findings failed verification more than twice?",
  "Download evidence package for F-003",
];

// ─── Conversation History ───────────────────────────────────────────────────

const HISTORY = [
  { id: "h1", title: "Payment API Analysis", time: "2h ago" },
  { id: "h2", title: "Jira Ticket Creation", time: "Yesterday" },
  { id: "h3", title: "Team Risk Report", time: "Aug 19" },
  { id: "h4", title: "Evidence Download", time: "Aug 18" },
];

// ─── Intent Detection ───────────────────────────────────────────────────────

function detectIntent(q: string): {
  intent: string;
  color: string;
  permission: string;
  tool: string;
  plugin: string;
  service: string;
} {
  const lower = q.toLowerCase();
  if (lower.includes("jira") || lower.includes("ticket")) {
    return {
      intent: "Ticket Action",
      color: "var(--yellow)",
      permission: "tickets.create",
      tool: "TicketCreator",
      plugin: "jira-plugin@2.1",
      service: "Jira Cloud API",
    };
  }
  if (lower.includes("evidence") || lower.includes("download")) {
    return {
      intent: "Evidence Download",
      color: "var(--green)",
      permission: "evidence.read",
      tool: "EvidenceExporter",
      plugin: "vault-plugin@1.4",
      service: "Evidence Vault",
    };
  }
  if (lower.includes("report") || lower.includes("executive")) {
    return {
      intent: "Report",
      color: "var(--purple)",
      permission: "reports.generate",
      tool: "ReportGenerator",
      plugin: "report-plugin@3.0",
      service: "Report Engine",
    };
  }
  if (
    lower.includes("asset") ||
    lower.includes("connected") ||
    lower.includes("graph")
  ) {
    return {
      intent: "Graph Query",
      color: "var(--blue)",
      permission: "findings.read",
      tool: "GraphTraversal",
      plugin: "kg-plugin@1.2",
      service: "Knowledge Graph",
    };
  }
  if (
    lower.includes("team") ||
    lower.includes("risk score") ||
    lower.includes("highest")
  ) {
    return {
      intent: "Graph Query",
      color: "var(--blue)",
      permission: "findings.read",
      tool: "GraphTraversal",
      plugin: "kg-plugin@1.2",
      service: "Knowledge Graph",
    };
  }
  return {
    intent: "Finding Search",
    color: "#ef5350",
    permission: "findings.read",
    tool: "FindingSearch",
    plugin: "core-plugin@4.0",
    service: "Finding Index",
  };
}

// ─── Response Generator ─────────────────────────────────────────────────────

function generateResponse(
  q: string,
  role: Role
): {
  content: string | React.ReactNode;
  denied: boolean;
  contextData: string;
  resultSummary: string;
} {
  const lower = q.toLowerCase();
  const perms = RBAC[role];

  // ── Load real scan data from localStorage ──────────────────────────────────
  let realFindings: any[] = [];
  let realTargets = "";
  let realCount = 0;
  let realCritical = 0;
  let realHigh = 0;
  let realMedium = 0;
  let realLow = 0;
  try {
    const stored = localStorage.getItem("axiom_last_findings");
    realTargets  = localStorage.getItem("axiom_last_targets") || "";
    if (stored) {
      realFindings = JSON.parse(stored);
      realCount    = realFindings.length;
      realCritical = realFindings.filter((f:any) => f.severity === "Critical").length;
      realHigh     = realFindings.filter((f:any) => f.severity === "High").length;
      realMedium   = realFindings.filter((f:any) => f.severity === "Medium").length;
      realLow      = realFindings.filter((f:any) => f.severity === "Low").length;
    }
  } catch { /* ignore */ }

  const hasRealData   = realFindings.length > 0;
  const findings      = hasRealData ? realFindings : (FINDINGS as any[]);
  const targets       = realTargets || "192.168.195.139, 192.168.195.140";
  const firstTarget   = targets.split(",")[0]?.trim() || targets;
  const totalCount    = hasRealData ? realCount   : findings.length;
  const critCount     = hasRealData ? realCritical : findings.filter((f:any) => f.severity==="Critical").length;
  const highCount     = hasRealData ? realHigh     : findings.filter((f:any) => f.severity==="High").length;
  const medCount      = hasRealData ? realMedium   : findings.filter((f:any) => f.severity==="Medium").length;
  const lowCount      = hasRealData ? realLow      : findings.filter((f:any) => f.severity==="Low").length;
  const duration      = localStorage.getItem("axiom_last_duration") || "—";

  // Top critical/high findings from real data
  const topCrit = findings
    .filter((f:any) => ["Critical","High"].includes(f.severity))
    .slice(0, 3);

  const firstFinding  = topCrit[0];
  const firstId       = firstFinding?.id   || (hasRealData ? "LIVE-001" : "F-001");
  const firstName     = firstFinding?.title ?? firstFinding?.name ?? "Critical Finding";
  const firstTarget2  = firstFinding?.target || firstFinding?.url || firstTarget;

  // Evidence download
  if (lower.includes("evidence") || lower.includes("download")) {
    if (!perms.includes("evidence.read")) {
      return { content: `🚫 Access Denied — Evidence download requires evidence.read permission. Your role (${role}) does not have this permission. Contact your Security Admin.`, denied: true, contextData: "RBAC policy enforced", resultSummary: "DENIED: insufficient permissions" };
    }
    return {
      content: `📦 Evidence package for ${firstId} ready for download.\n\n• request.http (2.4 KB)\n• response.http (18.7 KB)\n• screenshot-001.png (340 KB)\n• sha256-manifest.json\n\nAll artifacts signed with AXIOM key. SHA-256 integrity verified.\nFinding: ${firstName}\nTarget: ${firstTarget2}`,
      denied: false, contextData: "findings, evidence vault", resultSummary: `Evidence package ${firstId} — 4 artifacts exported`,
    };
  }

  // Jira ticket
  if (lower.includes("jira") || lower.includes("ticket")) {
    if (!perms.includes("tickets.create")) {
      return { content: `🚫 Access Denied — Your role (${role}) does not have tickets.create permission.`, denied: true, contextData: "RBAC policy enforced", resultSummary: "DENIED: insufficient permissions" };
    }
    return {
      content: `✅ Ticket JRA-${Math.floor(Math.random()*9000+1000)} created for ${firstId} — ${firstName}.\n\n• Target: ${firstTarget2}\n• Priority: ${firstFinding?.severity || "Critical"}\n• Status: Open\n• Due Date: ${new Date(Date.now()+7*86400000).toLocaleDateString()}\n\nTicket linked to finding ${firstId} in AXIOM. Notifications sent to security team.`,
      denied: false, contextData: "findings, jira config", resultSummary: `Ticket created for ${firstId}`,
    };
  }

  // Executive report
  if (lower.includes("report") || lower.includes("executive")) {
    if (!perms.includes("reports.generate")) {
      return { content: `🚫 Access Denied — Your role (${role}) does not have reports.generate permission.`, denied: true, contextData: "RBAC policy enforced", resultSummary: "DENIED: insufficient permissions" };
    }
    return {
      content: `📊 Executive Risk Report Generated\n\n• Targets Scanned: ${targets}\n• Total Findings: ${totalCount}\n• Critical: ${critCount}  |  High: ${highCount}  |  Medium: ${medCount}  |  Low: ${lowCount}\n• Overall Risk: ${critCount > 0 ? "CRITICAL" : highCount > 0 ? "HIGH" : "MEDIUM"}\n• Scan Duration: ${duration}\n• ${hasRealData ? "🟢 LIVE DATA from your VMware lab" : "⚪ Demo data — run a scan for real results"}\n\nReport available in Evidence Vault. HTML + PDF + JSON formats ready.`,
      denied: false, contextData: "all findings, risk scores", resultSummary: `Executive report — ${totalCount} findings across ${targets.split(",").length} targets`,
    };
  }

  // Assets / graph
  if (lower.includes("asset") || lower.includes("connected") || lower.includes("customer portal")) {
    return {
      content: `🕸️ Attack Surface Analysis — ${firstTarget}\n\n${topCrit.slice(0,3).map((f:any,i:number) => `• ${f.target||f.url||firstTarget} — ${f.title??f.name} (${f.severity})`).join("\n")}\n\nTotal exposed services: ${totalCount} findings across ${targets.split(",").length} targets.\n${hasRealData ? "Data from your live VMware lab scan." : "Run a scan to see real asset data."}`,
      denied: false, contextData: "knowledge graph, findings", resultSummary: `${totalCount} findings across scanned assets`,
    };
  }

  // Team risk
  if (lower.includes("team") || lower.includes("highest risk")) {
    return {
      content: `📈 Risk Score Analysis — Scanned Targets\n\n${targets.split(",").map((t:string, i:number) => `Target ${i+1}: ${t.trim()} | Findings: ${Math.ceil(totalCount/(targets.split(",").length))} | Risk Score: ${Math.ceil((critCount*100+highCount*50)/Math.max(targets.split(",").length,1)*(i===0?1:0.7))}`).join("\n")}\n\nHighest risk: ${firstTarget} with ${critCount} critical findings.\n${hasRealData ? "🟢 Based on your real scan data." : "⚪ Run a scan for real risk scores."}`,
      denied: false, contextData: "knowledge graph, scan results", resultSummary: `${firstTarget} — highest risk target`,
    };
  }

  // Failed verification
  if (lower.includes("failed") || lower.includes("verification")) {
    const failedF = findings.find((f: any) => f.severity === "Critical") || firstFinding;
    return {
      content: `🔁 Verification Analysis\n\n${failedF ? `${failedF.id || firstId} — ${failedF.title || failedF.name || firstName}\n• Target: ${failedF.target || failedF.url || firstTarget}\n• Severity: ${failedF.severity}\n• Status: Requires Manual Verification` : "No failed verification records found."}\n\n${critCount} critical findings require immediate verification.`,
      denied: false,
      contextData: "verification history, findings",
      resultSummary: `${critCount} critical findings pending verification`,
    };
  }

  // Default — show real critical findings
  const displayFindings = topCrit.length > 0 ? topCrit : [
    { id: firstId, title: firstName, target: firstTarget, severity: "Critical" },
  ];

  return {
    content: (
      <div>
        <div style={{ marginBottom: 10, color: "var(--fg)", fontWeight: 600, fontSize: 13 }}>
          🔴 {hasRealData ? `Critical Findings — ${firstTarget}` : "Critical Findings — Payment API"}
        </div>
        {displayFindings.map((f: any, i: number) => (
          <div key={f.id || i} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderLeft: "3px solid #ef5350", borderRadius: 6, padding: "8px 12px", marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--fg)", fontWeight: 600, fontSize: 12 }}>
                {f.id || f.findingId} — {f.name || f.title}
              </span>
              <span style={{ fontSize: 10, color: "#ef5350", fontWeight: 700 }}>
                {(f.severity || "CRITICAL").toUpperCase()}
                {f.cvss ? ` · CVSS ${f.cvss}` : ""}
              </span>
            </div>
            <div style={{ color: "var(--fg-2)", fontSize: 11, marginTop: 3 }}>
              {f.endpoint || f.url || f.target || firstTarget}
            </div>
          </div>
        ))}
        <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 6 }}>
          {displayFindings.length} critical findings found{hasRealData ? ` on ${firstTarget}` : ""}. Immediate remediation required.
        </div>
      </div>
    ),
    denied: false,
    contextData: hasRealData ? "real scan findings" : "finding index",
    resultSummary: `${displayFindings.length} critical findings returned`,
  };
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "copilot",
      content:
        "👋 Hello! I'm AXIOM Copilot — your AI-powered security assistant. I can search findings, create tickets, analyze risk across your knowledge graph, generate reports, and more.\n\nSelect a role in the left panel to simulate RBAC permissions, then ask me anything.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("Security Analyst");
  const [orchestrationSteps, setOrchestrationSteps] = useState<
    OrchestrationStep[]
  >([]);
  const [showOrchestration, setShowOrchestration] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, processing]);

  const runOrchestration = async (
    q: string,
    role: Role,
    denied: boolean,
    contextData: string,
    resultSummary: string
  ) => {
    const { intent, color, permission, tool, plugin, service } =
      detectIntent(q);
    const hasPermission = RBAC[role].includes(permission);

    const steps: OrchestrationStep[] = [
      {
        id: 1,
        label: "Intent Engine",
        detail: "Parsed query and detected intent",
        badge: intent,
        badgeColor: color,
        visible: false,
      },
      {
        id: 2,
        label: "RBAC Check",
        detail: `Role: ${role}  ·  Requires: ${permission}`,
        badge: hasPermission ? "PASS" : "DENY",
        badgeColor: hasPermission ? "var(--green)" : "#ef5350",
        visible: false,
      },
      {
        id: 3,
        label: "Context Builder",
        detail: `Pulled: ${contextData}`,
        visible: false,
      },
      {
        id: 4,
        label: "Tool Resolver",
        detail: `${tool}  ·  ${plugin}`,
        visible: false,
      },
      {
        id: 5,
        label: "Plugin Execution",
        detail: `${service}  →  ${resultSummary}`,
        badge: denied ? "DENIED" : "OK",
        badgeColor: denied ? "#ef5350" : "var(--green)",
        visible: false,
      },
    ];

    setOrchestrationSteps(steps);
    setShowOrchestration(true);

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      setOrchestrationSteps((prev) =>
        prev.map((s) => (s.id === steps[i].id ? { ...s, visible: true } : s))
      );
    }
  };

  const handleSend = async (query?: string) => {
    const q = (query ?? input).trim();
    if (!q || processing) return;
    setInput("");

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setProcessing(true);
    setOrchestrationSteps([]);
    setShowOrchestration(false);

    const { content, denied, contextData, resultSummary } = generateResponse(
      q,
      selectedRole
    );

    runOrchestration(q, selectedRole, denied, contextData, resultSummary);
    await new Promise((r) => setTimeout(r, 1800));

    const copilotMsg: Message = {
      id: `c-${Date.now()}`,
      role: "copilot",
      content,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      denied,
    };
    setMessages((prev) => [...prev, copilotMsg]);
    setProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderContent = (content: string | React.ReactNode) => {
    if (typeof content !== "string") return content;
    return (
      <span style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
        {content}
      </span>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      {/* ── Left Panel ──────────────────────────────────────────────── */}
      <div
        style={{
          width: 220,
          flexShrink: 0,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 14px 12px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: "#fff",
                fontWeight: 700,
              }}
            >
              ◈
            </div>
            <span
              style={{
                color: "var(--fg)",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.05em",
              }}
            >
              AXIOM Copilot
            </span>
          </div>

          {/* Role Selector */}
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                color: "var(--muted)",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 4,
              }}
            >
              Simulate Role
            </div>
            <select
              className="tool-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              style={{ width: "100%", fontSize: 12 }}
            >
              <option>Security Analyst</option>
              <option>Developer</option>
              <option>Executive</option>
              <option>Platform Admin</option>
            </select>
          </div>

          {/* Permission badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
            {RBAC[selectedRole].map((p) => (
              <span
                key={p}
                style={{
                  fontSize: 9,
                  padding: "1px 5px",
                  borderRadius: 3,
                  background: "rgba(232,145,45,0.15)",
                  color: "var(--primary)",
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* New Chat */}
        <div style={{ padding: "10px 14px" }}>
          <button
            className="btn-secondary"
            style={{ width: "100%", fontSize: 12 }}
            onClick={() => {
              setMessages([
                {
                  id: "welcome-new",
                  role: "copilot",
                  content: "👋 New conversation started. How can I help?",
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              ]);
              setOrchestrationSteps([]);
              setShowOrchestration(false);
            }}
          >
            + New Chat
          </button>
        </div>

        {/* History */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 14px 10px" }}>
          <div
            style={{
              color: "var(--muted)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            History
          </div>
          {HISTORY.map((h) => (
            <div
              key={h.id}
              style={{
                padding: "7px 8px",
                borderRadius: 5,
                cursor: "pointer",
                marginBottom: 2,
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  "rgba(255,255,255,0.05)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  "transparent")
              }
            >
              <div
                style={{
                  color: "var(--fg)",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {h.title}
              </div>
              <div style={{ color: "var(--muted)", fontSize: 10, marginTop: 2 }}>
                {h.time}
              </div>
            </div>
          ))}
        </div>

        {/* Example Queries */}
        <div
          style={{
            padding: "10px 14px 14px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              color: "var(--muted)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            Try asking
          </div>
          {EXAMPLE_QUERIES.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              disabled={processing}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: "transparent",
                border: "none",
                cursor: processing ? "not-allowed" : "pointer",
                color: "var(--fg-2)",
                fontSize: 11,
                padding: "4px 0",
                opacity: processing ? 0.5 : 1,
                lineHeight: "1.4",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color =
                  "var(--primary)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color =
                  "var(--fg-2)")
              }
            >
              › {q}
            </button>
          ))}
        </div>
      </div>

      {/* ── Center Panel ─────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Chat header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ color: "var(--fg)", fontWeight: 700, fontSize: 15 }}>
              AXIOM Copilot
            </div>
            <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 1 }}>
              AI-Powered Security Assistant · Role:{" "}
              <span style={{ color: "var(--primary)" }}>{selectedRole}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--green)",
                boxShadow: "0 0 6px var(--green)",
              }}
            />
            <span style={{ color: "var(--muted)", fontSize: 11 }}>Online</span>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  background:
                    msg.role === "user"
                      ? "rgba(232,145,45,0.2)"
                      : msg.denied
                      ? "rgba(239,83,80,0.2)"
                      : "rgba(96,165,250,0.2)",
                  color:
                    msg.role === "user"
                      ? "var(--primary)"
                      : msg.denied
                      ? "#ef5350"
                      : "var(--blue)",
                  border: `1px solid ${
                    msg.role === "user"
                      ? "rgba(232,145,45,0.3)"
                      : msg.denied
                      ? "rgba(239,83,80,0.3)"
                      : "rgba(96,165,250,0.3)"
                  }`,
                }}
              >
                {msg.role === "user" ? "U" : "◈"}
              </div>

              {/* Bubble */}
              <div style={{ maxWidth: "74%", minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                    flexDirection:
                      msg.role === "user" ? "row-reverse" : "row",
                  }}
                >
                  <span
                    style={{
                      color: "var(--fg)",
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {msg.role === "user" ? selectedRole : "AXIOM Copilot"}
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: 10 }}>
                    {msg.timestamp}
                  </span>
                </div>
                <div
                  style={{
                    background:
                      msg.role === "user"
                        ? "rgba(232,145,45,0.1)"
                        : msg.denied
                        ? "rgba(239,83,80,0.07)"
                        : "var(--surface)",
                    border: `1px solid ${
                      msg.role === "user"
                        ? "rgba(232,145,45,0.25)"
                        : msg.denied
                        ? "rgba(239,83,80,0.25)"
                        : "var(--border)"
                    }`,
                    borderRadius:
                      msg.role === "user"
                        ? "12px 4px 12px 12px"
                        : "4px 12px 12px 12px",
                    padding: "10px 14px",
                    color: "var(--fg)",
                    fontSize: 13,
                    lineHeight: "1.65",
                  }}
                >
                  {renderContent(msg.content)}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {processing && (
            <div
              style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(96,165,250,0.2)",
                  border: "1px solid rgba(96,165,250,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--blue)",
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                ◈
              </div>
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px 12px 12px 12px",
                  padding: "12px 16px",
                  display: "flex",
                  gap: 5,
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--muted)",
                      display: "inline-block",
                      animation: `axbounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-end",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "8px 12px",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AXIOM Copilot anything about your security posture..."
              disabled={processing}
              rows={1}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--fg)",
                fontSize: 13,
                resize: "none",
                lineHeight: "1.5",
                maxHeight: 100,
                overflow: "auto",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={processing || !input.trim()}
              className="btn-primary"
              style={{
                padding: "6px 16px",
                fontSize: 12,
                flexShrink: 0,
                opacity: processing || !input.trim() ? 0.5 : 1,
                cursor:
                  processing || !input.trim() ? "not-allowed" : "pointer",
              }}
            >
              {processing ? "…" : "Send"}
            </button>
          </div>
          <div
            style={{
              color: "var(--muted)",
              fontSize: 10,
              marginTop: 6,
              paddingLeft: 2,
            }}
          >
            Enter to send · Shift+Enter for new line · RBAC enforced by selected role
          </div>
        </div>
      </div>

      {/* ── Right Panel — Live Orchestration ─────────────────────────── */}
      <div
        style={{
          width: 320,
          flexShrink: 0,
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 16px 12px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              color: "var(--fg)",
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 2,
            }}
          >
            Live Orchestration
          </div>
          <div style={{ color: "var(--muted)", fontSize: 11 }}>
            Step-by-step execution trace
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
          {!showOrchestration && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 200,
                color: "var(--muted)",
                fontSize: 12,
                textAlign: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 32, opacity: 0.25 }}>⚙</span>
              <span>Send a message to see the orchestration pipeline</span>
            </div>
          )}

          {showOrchestration && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {orchestrationSteps.map((step, idx) => (
                <div
                  key={step.id}
                  style={{
                    opacity: step.visible ? 1 : 0,
                    transform: step.visible
                      ? "translateY(0)"
                      : "translateY(8px)",
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: step.visible
                            ? "var(--primary)"
                            : "var(--border)",
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "background 0.3s",
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span
                        style={{
                          color: "var(--fg)",
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {step.label}
                      </span>
                    </div>
                    {step.badge && step.visible && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 3,
                          background: step.badgeColor
                            ? `${step.badgeColor}22`
                            : "rgba(255,255,255,0.08)",
                          color: step.badgeColor || "var(--fg)",
                          border: `1px solid ${
                            step.badgeColor
                              ? `${step.badgeColor}55`
                              : "var(--border)"
                          }`,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {step.badge}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      color: "var(--fg-2)",
                      fontSize: 11,
                      paddingLeft: 28,
                      lineHeight: 1.5,
                    }}
                  >
                    {step.detail}
                  </div>
                  {idx < orchestrationSteps.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        left: 21,
                        bottom: -10,
                        width: 1,
                        height: 10,
                        background: "var(--border)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Role permissions summary */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              color: "var(--muted)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            Active Role Permissions
          </div>
          <div
            style={{
              color: "var(--fg)",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 7,
            }}
          >
            {selectedRole}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { perm: "findings.read", label: "Read Findings" },
              { perm: "evidence.read", label: "Read Evidence" },
              { perm: "tickets.create", label: "Create Tickets" },
              { perm: "reports.generate", label: "Generate Reports" },
              { perm: "verification.execute", label: "Execute Verification" },
            ].map(({ perm, label }) => {
              const has = RBAC[selectedRole].includes(perm);
              return (
                <div
                  key={perm}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "var(--fg-2)", fontSize: 11 }}>
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "1px 5px",
                      borderRadius: 3,
                      background: has
                        ? "rgba(104,211,145,0.12)"
                        : "rgba(239,83,80,0.1)",
                      color: has ? "var(--green)" : "#ef5350",
                    }}
                  >
                    {has ? "ALLOW" : "DENY"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Global animation keyframes */}
      <style>{`
        @keyframes axbounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
