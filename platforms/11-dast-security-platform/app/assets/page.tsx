"use client";

import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface AssetRow {
  id: string;
  name: string;
  type: "Application" | "API" | "Domain";
  ip: string;
  port: number;
  service: string;
  source: string;
  lastSeen: string;
  risk: "Critical" | "High" | "Medium" | "Low";
  findings: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const ALL_ASSETS: AssetRow[] = [
  { id:"a01", name:"Customer Portal",     type:"Application", ip:"52.14.x.x",   port:443,  service:"HTTPS/nginx",  source:"Nmap+Crawler", lastSeen:"Today",  risk:"Critical", findings:5 },
  { id:"a02", name:"Payment API",         type:"API",         ip:"52.14.x.x",   port:443,  service:"HTTPS/Node",   source:"OpenAPI",      lastSeen:"Today",  risk:"Critical", findings:3 },
  { id:"a03", name:"Login API",           type:"API",         ip:"52.14.x.x",   port:443,  service:"HTTPS/Node",   source:"Crawler",      lastSeen:"Today",  risk:"High",     findings:2 },
  { id:"a04", name:"User Management API", type:"API",         ip:"10.0.0.12",   port:8080, service:"HTTP/Node",    source:"Nmap",         lastSeen:"Today",  risk:"High",     findings:2 },
  { id:"a05", name:"Admin Panel",         type:"Application", ip:"52.14.x.x",   port:443,  service:"HTTPS/nginx",  source:"Crawler",      lastSeen:"Aug 20", risk:"Medium",   findings:1 },
  { id:"a06", name:"MySql Database",      type:"Domain",      ip:"10.0.0.5",    port:3306, service:"MySQL 8.0",    source:"Nmap",         lastSeen:"Today",  risk:"Critical", findings:0 },
  { id:"a07", name:"Redis Cache",         type:"Domain",      ip:"10.0.0.8",    port:6379, service:"Redis 7.0",    source:"Nmap",         lastSeen:"Today",  risk:"High",     findings:0 },
  { id:"a08", name:"Webhook Service",     type:"API",         ip:"52.14.x.x",   port:443,  service:"HTTPS/Node",   source:"Crawler",      lastSeen:"Today",  risk:"Critical", findings:3 },
  { id:"a09", name:"Profile API",         type:"API",         ip:"52.14.x.x",   port:443,  service:"HTTPS/Node",   source:"OpenAPI",      lastSeen:"Today",  risk:"High",     findings:1 },
  { id:"a10", name:"Static CDN",          type:"Domain",      ip:"cdn.abc.com", port:443,  service:"CloudFront",   source:"DNS",          lastSeen:"Aug 19", risk:"Low",      findings:0 },
  { id:"a11", name:"Auth Service",        type:"API",         ip:"10.0.0.20",   port:8443, service:"HTTPS/Node",   source:"Nmap",         lastSeen:"Today",  risk:"Medium",   findings:1 },
  { id:"a12", name:"Internal API GW",     type:"Application", ip:"10.0.0.1",    port:80,   service:"nginx",        source:"Nmap",         lastSeen:"Today",  risk:"High",     findings:1 },
];

// ── Colors ────────────────────────────────────────────────────────────────────
const RISK_CLR: Record<string, string> = {
  Critical: "#ff4d4d", High: "#e8912d", Medium: "#f0c040", Low: "#4fc3f7",
};
const RISK_BG: Record<string, string> = {
  Critical: "rgba(255,77,77,0.15)", High: "rgba(232,145,45,0.15)",
  Medium:   "rgba(240,192,64,0.15)", Low: "rgba(79,195,247,0.15)",
};
const SOURCE_CLR: Record<string, string> = {
  Nmap:          "#4fc3f7",
  "Nmap+Crawler":"#4fc3f7",
  Crawler:       "#ffb74d",
  OpenAPI:       "var(--green)",
  DNS:           "#ce93d8",
  Manual:        "var(--muted)",
};

// ── Components ─────────────────────────────────────────────────────────────────
function RiskBadge({ risk }: { risk: string }) {
  return (
    <span style={{ background: RISK_BG[risk] ?? "rgba(158,158,158,0.15)", color: RISK_CLR[risk] ?? "var(--muted)", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
      {risk}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  const key = source.includes("Nmap") && source.includes("Crawler") ? "Nmap+Crawler" : source;
  const clr = SOURCE_CLR[key] ?? "var(--muted)";
  return (
    <span style={{ background: `color-mix(in srgb, ${clr} 18%, transparent)`, color: clr, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600, border: `1px solid color-mix(in srgb, ${clr} 35%, transparent)` }}>
      {source}
    </span>
  );
}

const NMAP_SNIPPET = `PORT      STATE SERVICE  VERSION
443/tcp   open  ssl/http nginx 1.21.6
3306/tcp  open  mysql    MySQL 8.0.33
8080/tcp  open  http     Node.js Express`;

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AssetsPage() {
  const [typeFilter,   setTypeFilter]   = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [riskFilter,   setRiskFilter]   = useState("All");
  const [selected,     setSelected]     = useState<AssetRow | null>(null);

  // Apply filters
  const filtered = ALL_ASSETS.filter(a => {
    if (typeFilter   !== "All" && a.type   !== typeFilter)   return false;
    if (riskFilter   !== "All" && a.risk   !== riskFilter)   return false;
    if (statusFilter !== "All") {
      const isToday = a.lastSeen === "Today";
      if (statusFilter === "Active"   && !isToday) return false;
      if (statusFilter === "Inactive" && isToday)  return false;
    }
    if (sourceFilter !== "All") {
      if (!a.source.toLowerCase().includes(sourceFilter.toLowerCase())) return false;
    }
    return true;
  });

  // Stats
  const stats = [
    { label: "Total Assets",  value: ALL_ASSETS.length,                             color: "var(--primary)" },
    { label: "Applications",  value: ALL_ASSETS.filter(a => a.type==="Application").length, color: "#ce93d8" },
    { label: "APIs",          value: ALL_ASSETS.filter(a => a.type==="API").length,          color: "#4fc3f7" },
    { label: "Domains",       value: ALL_ASSETS.filter(a => a.type==="Domain").length,       color: "var(--green)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)", color: "var(--fg)", overflow: "hidden" }}>

      {/* ── Stats Bar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 }}>
        {stats.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Filter Row ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0, flexWrap: "wrap" as const }}>
        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>FILTER:</span>
        {[
          { label: "Type",   val: typeFilter,   set: setTypeFilter,   opts: ["All","Application","API","Domain"] },
          { label: "Status", val: statusFilter, set: setStatusFilter, opts: ["All","Active","Inactive","Discovered"] },
          { label: "Source", val: sourceFilter, set: setSourceFilter, opts: ["All","Nmap","Manual","Crawler","OpenAPI","DNS"] },
          { label: "Risk",   val: riskFilter,   set: setRiskFilter,   opts: ["All","Critical","High","Medium","Low"] },
        ].map(f => (
          <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{f.label}:</span>
            <select className="tool-select" style={{ fontSize: 12, padding: "3px 8px" }} value={f.val} onChange={e => f.set(e.target.value)}>
              {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: "auto" }}>
          {filtered.length} of {ALL_ASSETS.length} assets
        </span>
      </div>

      {/* ── Main Content ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left Filter Panel (180px) ── */}
        <div style={{ width: 180, flexShrink: 0, borderRight: "1px solid var(--border)", background: "var(--surface)", overflowY: "auto", padding: "14px 12px" }}>
          {[
            { title: "Asset Type", val: typeFilter,   set: setTypeFilter,   opts: ["All","Application","API","Domain"] },
            { title: "Status",     val: statusFilter, set: setStatusFilter, opts: ["All","Active","Inactive","Discovered"] },
            { title: "Source",     val: sourceFilter, set: setSourceFilter, opts: ["All","Nmap","Manual","Crawler","OpenAPI","DNS"] },
            { title: "Risk Level", val: riskFilter,   set: setRiskFilter,   opts: ["All","Critical","High","Medium","Low"] },
          ].map(f => (
            <div key={f.title} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 8 }}>
                {f.title}
              </div>
              {f.opts.map(o => (
                <div
                  key={o}
                  onClick={() => f.set(o)}
                  style={{
                    padding: "5px 8px", borderRadius: 4, fontSize: 12, cursor: "pointer",
                    background: f.val === o ? "rgba(232,145,45,0.12)" : "transparent",
                    color: f.val === o ? "var(--primary)" : "var(--fg)",
                    fontWeight: f.val === o ? 700 : 400,
                    borderLeft: f.val === o ? "2px solid var(--primary)" : "2px solid transparent",
                    marginBottom: 2,
                  }}
                >
                  {o}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ── Asset Table ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          <div className="tool-panel">
            <div className="tool-panel-header">
              Asset Inventory
              <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 12, marginLeft: 8 }}>
                ({filtered.length} results)
              </span>
            </div>
            <table className="data-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Type</th>
                  <th>IP / URL</th>
                  <th>Port</th>
                  <th>Service</th>
                  <th>Discovered Via</th>
                  <th>Last Seen</th>
                  <th>Risk</th>
                  <th>Findings</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr
                    key={a.id}
                    onClick={() => setSelected(selected?.id === a.id ? null : a)}
                    style={{
                      cursor: "pointer",
                      background: selected?.id === a.id ? "rgba(232,145,45,0.08)" : undefined,
                    }}
                  >
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td>
                      <span style={{
                        background: a.type === "Application" ? "rgba(206,147,216,0.15)" : a.type === "API" ? "rgba(79,195,247,0.15)" : "rgba(76,175,80,0.1)",
                        color:      a.type === "Application" ? "#ce93d8"                : a.type === "API" ? "#4fc3f7"                : "var(--green)",
                        borderRadius: 3, padding: "2px 7px", fontSize: 11, fontWeight: 600,
                      }}>{a.type}</span>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--muted)" }}>{a.ip}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{a.port}</td>
                    <td style={{ fontSize: 12, color: "var(--muted)" }}>{a.service}</td>
                    <td><SourceBadge source={a.source} /></td>
                    <td style={{ fontSize: 12, color: "var(--muted)" }}>{a.lastSeen}</td>
                    <td><RiskBadge risk={a.risk} /></td>
                    <td style={{ color: a.findings > 0 ? "#ff4d4d" : "var(--muted)", fontWeight: a.findings > 0 ? 700 : 400 }}>
                      {a.findings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Detail Slide-in Panel ── */}
        {selected && (
          <div style={{
            width: 340, flexShrink: 0, borderLeft: "1px solid var(--border)", background: "var(--surface)",
            overflowY: "auto", padding: "16px", transition: "transform 0.2s",
          }}>
            {/* Close + Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{selected.name}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                  <span style={{ background: "rgba(206,147,216,0.15)", color: "#ce93d8", borderRadius: 3, padding: "1px 7px", fontSize: 11, fontWeight: 600 }}>{selected.type}</span>
                  <RiskBadge risk={selected.risk} />
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>
            </div>

            {/* IP + Port */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 6 }}>Network</div>
              <div style={{ fontSize: 12, marginBottom: 3 }}><span style={{ color: "var(--muted)" }}>IP:</span> <code>{selected.ip}</code></div>
              <div style={{ fontSize: 12, marginBottom: 3 }}><span style={{ color: "var(--muted)" }}>Port:</span> <code>{selected.port}</code></div>
              <div style={{ fontSize: 12 }}><span style={{ color: "var(--muted)" }}>Service:</span> {selected.service}</div>
            </div>

            {/* Technology fingerprint */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 6 }}>Technology Fingerprint</div>
              {[
                { label: "Server",    val: selected.service.includes("nginx") ? "nginx 1.21.6" : "Node.js" },
                { label: "Framework", val: selected.type === "API" ? "Express 4.x" : "Next.js 14" },
                { label: "OS",        val: "Ubuntu 22.04 LTS" },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--border)", fontSize: 12 }}>
                  <span style={{ color: "var(--muted)" }}>{r.label}</span>
                  <span style={{ fontFamily: "monospace" }}>{r.val}</span>
                </div>
              ))}
            </div>

            {/* Findings by severity */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 8 }}>
                Findings by Severity
                <span style={{ color: "var(--fg)", marginLeft: 6, fontWeight: 700, fontSize: 12 }}>{selected.findings} total</span>
              </div>
              {[
                { sev: "Critical", n: selected.risk === "Critical" ? Math.max(1, Math.floor(selected.findings * 0.5)) : 0 },
                { sev: "High",     n: selected.risk !== "Low" ? Math.floor(selected.findings * 0.3) : 0 },
                { sev: "Medium",   n: Math.floor(selected.findings * 0.2) },
                { sev: "Low",      n: 0 },
              ].map(r => (
                <div key={r.sev} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ width: 60, fontSize: 11, color: RISK_CLR[r.sev] ?? "var(--muted)", fontWeight: 600 }}>{r.sev}</span>
                  <div style={{ flex: 1, height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: selected.findings > 0 ? `${(r.n / selected.findings) * 100}%` : "0%", height: "100%", background: RISK_CLR[r.sev] ?? "var(--muted)", borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--muted)", width: 16, textAlign: "right" as const }}>{r.n}</span>
                </div>
              ))}
            </div>

            {/* Last 3 scans */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 6 }}>Last 3 Scans</div>
              {[
                { id: "SCN-001", scanner: "ZAP+Burp", status: "Completed", date: "Today 19:00" },
                { id: "SCN-002", scanner: "Nmap",     status: "Completed", date: "Today 18:55" },
                { id: "SCN-003", scanner: "OpenVAS",  status: "Running",   date: "Today 19:10" },
              ].map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid var(--border)", fontSize: 12 }}>
                  <span style={{ color: "var(--muted)", fontFamily: "monospace" }}>{s.id}</span>
                  <span style={{ flex: 1 }}>{s.scanner}</span>
                  <span style={{
                    color: s.status === "Completed" ? "var(--green)" : "var(--primary)",
                    fontSize: 11, fontWeight: 600,
                  }}>{s.status}</span>
                </div>
              ))}
            </div>

            {/* Nmap snippet */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 6 }}>Nmap Output</div>
              <pre style={{
                background: "rgba(0,0,0,0.3)", borderRadius: 6, padding: "10px 12px",
                fontSize: 11, fontFamily: "monospace", color: "var(--green)",
                whiteSpace: "pre" as const, overflowX: "auto", margin: 0,
                border: "1px solid var(--border)",
              }}>
                {NMAP_SNIPPET}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
