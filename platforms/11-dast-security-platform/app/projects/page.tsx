"use client";

import { useState } from "react";
import { FINDINGS } from "@/data/findings";

// ── Types ──────────────────────────────────────────────────────────────────────
type Tab = "overview" | "assets" | "scans" | "findings";

interface Asset {
  id: string; name: string; type: string; url: string;
  status: string; lastScanned: string; findings: number;
}
interface Scan {
  id: string; scanner: string; status: string; started: string;
  duration: string; findings: string | number;
}
interface Project {
  id: string; name: string; findings: number; assets: number; children?: string[];
}
interface Org {
  id: string; name: string; expanded: boolean; projects: Project[];
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const INIT_ORGS: Org[] = [
  {
    id: "abc", name: "ABC Corporation", expanded: true,
    projects: [
      { id: "customer-portal", name: "Customer Portal", findings: 3, assets: 4,
        children: ["/login API", "/api/users", "/api/payment"] },
      { id: "payment-api",    name: "Payment API",     findings: 2, assets: 3 },
      { id: "mobile-backend", name: "Mobile Backend",  findings: 1, assets: 2 },
    ],
  },
  {
    id: "xyz", name: "XYZ Inc", expanded: false,
    projects: [
      { id: "ecommerce",      name: "E-Commerce Platform", findings: 0, assets: 0 },
      { id: "internal-tools", name: "Internal Tools",      findings: 0, assets: 0 },
    ],
  },
];

const PROJECT_ASSETS: Asset[] = [
  { id: "a1", name: "Customer Portal", type: "Application", url: "https://portal.abc.com",             status: "Active",   lastScanned: "Today",  findings: 3 },
  { id: "a2", name: "Login API",       type: "API",         url: "https://portal.abc.com/api/auth",    status: "Active",   lastScanned: "Today",  findings: 1 },
  { id: "a3", name: "Payment API",     type: "API",         url: "https://portal.abc.com/api/payment", status: "Active",   lastScanned: "Today",  findings: 2 },
  { id: "a4", name: "User API",        type: "API",         url: "https://portal.abc.com/api/users",   status: "Active",   lastScanned: "Today",  findings: 1 },
  { id: "a5", name: "Admin Panel",     type: "Application", url: "https://admin.abc.com",              status: "Inactive", lastScanned: "Aug 15", findings: 0 },
];

const PROJECT_SCANS: Scan[] = [
  { id: "SCN-001", scanner: "ZAP+Burp", status: "Completed", started: "Today 19:00",    duration: "27s", findings: 8   },
  { id: "SCN-002", scanner: "Nmap",     status: "Completed", started: "Today 18:55",    duration: "12s", findings: 0   },
  { id: "SCN-003", scanner: "OpenVAS",  status: "Running",   started: "Today 19:10",    duration: "—",   findings: 2   },
  { id: "SCN-004", scanner: "ZAP",      status: "Scheduled", started: "Tomorrow 02:00", duration: "—",   findings: "—" },
];

const TEAM = [
  { name: "Alice Chen",   role: "Project Owner", avatar: "AC" },
  { name: "Bob Martinez", role: "Security Lead",  avatar: "BM" },
  { name: "Carol Wright", role: "Developer",      avatar: "CW" },
];

const SCAN_HIST = [
  { date: "Aug 17", count: 12 },
  { date: "Aug 18", count: 7  },
  { date: "Aug 19", count: 9  },
  { date: "Aug 20", count: 4  },
  { date: "Aug 21", count: 8  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const SEV_CLR: Record<string, string> = {
  Critical: "#ff4d4d", High: "#e8912d", Medium: "#f0c040", Low: "#4fc3f7", Info: "#9e9e9e",
};

function SevBadge({ sev }: { sev: string }) {
  return (
    <span style={{
      background: SEV_CLR[sev] ?? "#9e9e9e", color: "#fff", borderRadius: 4,
      padding: "2px 8px", fontSize: 11, fontWeight: 600,
      textTransform: "uppercase" as const, letterSpacing: 0.4,
    }}>
      {sev}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const m: Record<string, { bg: string; color: string }> = {
    Completed: { bg: "rgba(76,175,80,0.15)",   color: "var(--green)"   },
    Running:   { bg: "rgba(232,145,45,0.15)",  color: "var(--primary)" },
    Scheduled: { bg: "rgba(79,195,247,0.15)",  color: "#4fc3f7"        },
    Active:    { bg: "rgba(76,175,80,0.15)",   color: "var(--green)"   },
    Inactive:  { bg: "rgba(158,158,158,0.15)", color: "var(--muted)"   },
    Open:      { bg: "rgba(255,77,77,0.15)",   color: "#ff4d4d"        },
  };
  const s = m[status] ?? { bg: "rgba(158,158,158,0.15)", color: "var(--muted)" };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
      {status}
    </span>
  );
}

function ScanHistoryChart() {
  const max = Math.max(...SCAN_HIST.map(s => s.count));
  const rowH = 26; const labelW = 56; const maxBarW = 300;
  return (
    <svg width="100%" height={SCAN_HIST.length * rowH + 8} style={{ display: "block" }}>
      {SCAN_HIST.map((s, i) => {
        const y = i * rowH + 4;
        const bw = (s.count / max) * maxBarW;
        return (
          <g key={s.date}>
            <text x={labelW - 6} y={y + 14} textAnchor="end" fontSize={11} fill="var(--muted)">{s.date}</text>
            <rect x={labelW} y={y + 3} width={bw} height={17} rx={3} fill="var(--primary)" opacity={0.8} />
            <text x={labelW + bw + 7} y={y + 14} fontSize={11} fill="var(--fg)">{s.count}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const [orgs, setOrgs] = useState<Org[]>(INIT_ORGS);
  const [selOrg, setSelOrg]   = useState("abc");
  const [selProj, setSelProj] = useState("customer-portal");
  const [tab, setTab]         = useState<Tab>("overview");

  const org  = orgs.find(o => o.id === selOrg);
  const proj = org?.projects.find(p => p.id === selProj);

  // Use real findings data from @/data/findings
  const pageFindings = (FINDINGS as any[]).slice(0, 8);

  function toggleOrg(id: string) {
    setOrgs(prev => prev.map(o => o.id === id ? { ...o, expanded: !o.expanded } : o));
  }

  const tabs: Tab[] = ["overview", "assets", "scans", "findings"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)", color: "var(--fg)", overflow: "hidden" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>Projects</span>
          <select className="tool-select" style={{ fontSize: 13 }} value={selOrg} onChange={e => setSelOrg(e.target.value)}>
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
        <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px" }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Project
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left Tree (240px) ── */}
        <div style={{ width: 240, flexShrink: 0, borderRight: "1px solid var(--border)", background: "var(--surface)", overflowY: "auto", padding: "10px 0" }}>
          {orgs.map(o => (
            <div key={o.id}>
              {/* Org row */}
              <div
                onClick={() => toggleOrg(o.id)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", cursor: "pointer", fontWeight: 600, fontSize: 13, userSelect: "none" as const }}
              >
                <span style={{ color: "#ce93d8", fontSize: 14 }}>📁</span>
                <span style={{ flex: 1 }}>{o.name}</span>
                <span style={{ color: "var(--muted)", fontSize: 11 }}>{o.expanded ? "▾" : "▸"}</span>
              </div>

              {/* Projects */}
              {o.expanded && o.projects.map(p => {
                const active = selProj === p.id && selOrg === o.id;
                return (
                  <div key={p.id}>
                    <div
                      onClick={() => { setSelOrg(o.id); setSelProj(p.id); setTab("overview"); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "6px 14px 6px 26px", cursor: "pointer", fontSize: 13,
                        background: active ? "rgba(232,145,45,0.1)" : "transparent",
                        borderLeft: active ? "2px solid var(--primary)" : "2px solid transparent",
                      }}
                    >
                      <span style={{ color: "#4fc3f7", fontSize: 12 }}>🛡</span>
                      <span style={{ flex: 1 }}>{p.name}</span>
                      <span style={{ background: "rgba(232,145,45,0.15)", color: "var(--primary)", borderRadius: 3, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
                        {p.findings}
                      </span>
                    </div>
                    {/* Child routes */}
                    {active && p.children?.map(c => (
                      <div key={c} style={{ padding: "3px 14px 3px 42px", fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <span>↳</span> {c}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Right Detail Panel ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {proj ? (
            <>
              {/* Project title bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 20, fontWeight: 700 }}>{proj.name}</span>
                <span style={{ background: "rgba(206,147,216,0.15)", color: "#ce93d8", borderRadius: 4, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                  {org?.name}
                </span>
                <span style={{ color: "var(--muted)", fontSize: 12, marginLeft: "auto" }}>
                  Created: Aug 1, 2026
                </span>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
                {tabs.map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    padding: "8px 20px", background: "transparent", border: "none",
                    borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent",
                    color: tab === t ? "var(--primary)" : "var(--muted)",
                    fontWeight: tab === t ? 700 : 400, fontSize: 13, cursor: "pointer",
                    textTransform: "capitalize" as const,
                  }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {/* ── OVERVIEW ── */}
              {tab === "overview" && (
                <div>
                  {/* Stat cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                    {[
                      { label: "Total Assets",  value: proj.assets,   color: "#4fc3f7"        },
                      { label: "Active Scans",  value: 1,             color: "var(--primary)" },
                      { label: "Open Findings", value: proj.findings, color: "#ff4d4d"        },
                      { label: "Risk Score",    value: "7.2",         color: "var(--yellow)"  },
                    ].map(c => (
                      <div key={c.label} className="tool-panel" style={{ padding: "16px 18px" }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{c.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Scan history */}
                  <div className="tool-panel" style={{ marginBottom: 18 }}>
                    <div className="tool-panel-header">Scan History (Last 5 Runs)</div>
                    <div style={{ padding: "14px 18px" }}>
                      <ScanHistoryChart />
                    </div>
                  </div>

                  {/* Team + Scanners */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div className="tool-panel">
                      <div className="tool-panel-header">Team</div>
                      {TEAM.map(m => (
                        <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderBottom: "1px solid var(--border)" }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(232,145,45,0.2)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {m.avatar}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)" }}>{m.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="tool-panel">
                      <div className="tool-panel-header">Scanner Configuration</div>
                      <div style={{ padding: "4px 16px" }}>
                        {[
                          { name: "OWASP ZAP",       enabled: true  },
                          { name: "Burp Enterprise",  enabled: true  },
                          { name: "Nmap",             enabled: true  },
                          { name: "OpenVAS",          enabled: false },
                        ].map(sc => (
                          <div key={sc.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                            <span style={{ fontSize: 13 }}>{sc.name}</span>
                            <span style={{ color: sc.enabled ? "var(--green)" : "var(--muted)", fontSize: 17, fontWeight: 700 }}>
                              {sc.enabled ? "✓" : "✗"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ASSETS ── */}
              {tab === "assets" && (
                <div className="tool-panel">
                  <div className="tool-panel-header">Assets ({PROJECT_ASSETS.length})</div>
                  <table className="data-table" style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <th>Asset</th><th>Type</th><th>URL / IP</th>
                        <th>Status</th><th>Last Scanned</th><th>Findings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PROJECT_ASSETS.map(a => (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 600 }}>{a.name}</td>
                          <td>
                            <span style={{
                              background: a.type === "Application" ? "rgba(206,147,216,0.15)" : "rgba(79,195,247,0.15)",
                              color:      a.type === "Application" ? "#ce93d8" : "#4fc3f7",
                              borderRadius: 3, padding: "2px 7px", fontSize: 11, fontWeight: 600,
                            }}>{a.type}</span>
                          </td>
                          <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--muted)" }}>{a.url}</td>
                          <td><StatusBadge status={a.status} /></td>
                          <td style={{ color: "var(--muted)", fontSize: 12 }}>{a.lastScanned}</td>
                          <td style={{ color: a.findings > 0 ? "#ff4d4d" : "var(--muted)", fontWeight: a.findings > 0 ? 700 : 400 }}>
                            {a.findings}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── SCANS ── */}
              {tab === "scans" && (
                <div className="tool-panel">
                  <div className="tool-panel-header">Scans ({PROJECT_SCANS.length})</div>
                  <table className="data-table" style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <th>Scan ID</th><th>Scanner</th><th>Status</th>
                        <th>Started</th><th>Duration</th><th>Findings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PROJECT_SCANS.map(s => (
                        <tr key={s.id}>
                          <td style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--primary)" }}>{s.id}</td>
                          <td style={{ fontWeight: 500 }}>{s.scanner}</td>
                          <td><StatusBadge status={s.status} /></td>
                          <td style={{ color: "var(--muted)", fontSize: 12 }}>{s.started}</td>
                          <td style={{ fontFamily: "monospace", fontSize: 12 }}>{s.duration}</td>
                          <td style={{
                            color: typeof s.findings === "number" && s.findings > 0 ? "#ff4d4d" : "var(--muted)",
                            fontWeight: typeof s.findings === "number" && s.findings > 0 ? 700 : 400,
                          }}>
                            {s.findings}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── FINDINGS ── */}
              {tab === "findings" && (
                <div className="tool-panel">
                  <div className="tool-panel-header">Findings ({pageFindings.length})</div>
                  <table className="data-table" style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <th>ID</th><th>Title</th><th>Severity</th>
                        <th>Plugin / Scanner</th><th>Path</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageFindings.map((f: any, i: number) => (
                        <tr key={f.id ?? i}>
                          <td style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)" }}>
                            {f.id ?? `F-${String(i + 1).padStart(3, "0")}`}
                          </td>
                          <td style={{ fontWeight: 600 }}>{f.title ?? f.name ?? "—"}</td>
                          <td><SevBadge sev={f.severity ?? "Info"} /></td>
                          <td style={{ color: "var(--muted)", fontSize: 12 }}>{f.plugin ?? f.scanner ?? f.source ?? "—"}</td>
                          <td style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)" }}>{f.path ?? f.url ?? "—"}</td>
                          <td><StatusBadge status={f.status ?? "Open"} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)", fontSize: 14 }}>
              Select a project from the left panel
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
