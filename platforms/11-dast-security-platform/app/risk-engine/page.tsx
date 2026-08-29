"use client";

import { useState } from "react";

/* ─── Data ─────────────────────────────────────────── */

const cvssFindings = [
  { name: "SQL Injection", score: 9.8, av: "Network", pr: "None", ui: "None", scope: "Unchanged", cia: "H/H/H", vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" },
  { name: "SSRF → AWS", score: 9.6, av: "Network", pr: "None", ui: "None", scope: "Changed", cia: "H/H/H", vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H" },
  { name: "Stored XSS", score: 8.7, av: "Network", pr: "Low", ui: "Required", scope: "Changed", cia: "H/H/N", vector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:H/I:H/A:N" },
  { name: "IDOR", score: 8.1, av: "Network", pr: "Low", ui: "None", scope: "Unchanged", cia: "H/N/N", vector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N" },
  { name: "CORS Misconfig", score: 7.5, av: "Network", pr: "None", ui: "Required", scope: "Unchanged", cia: "H/H/N", vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N" },
];

const epssFindings = [
  { name: "SQL Injection", cve: "CVE-2024-1234", epss: 67.3, percentile: "94th", trend: "↑ Rising", priority: "P1", trendDir: "up" },
  { name: "SSRF → AWS", cve: "CVE-2024-5678", epss: 54.1, percentile: "89th", trend: "→ Stable", priority: "P1", trendDir: "stable" },
  { name: "Stored XSS", cve: "CVE-2024-9012", epss: 23.8, percentile: "71st", trend: "↓ Falling", priority: "P2", trendDir: "down" },
  { name: "IDOR", cve: "CVE-2024-3456", epss: 18.2, percentile: "65th", trend: "→ Stable", priority: "P2", trendDir: "stable" },
  { name: "CORS", cve: "CVE-2024-7890", epss: 8.9, percentile: "42nd", trend: "↓ Falling", priority: "P3", trendDir: "down" },
];

const assetRisk = [
  { asset: "Payment API", bizValue: "Critical", dataSens: "PCI DSS", exposure: "External", criticality: 95, cvss: 9.8, weighted: 931 },
  { asset: "Customer Portal", bizValue: "High", dataSens: "PII", exposure: "External", criticality: 88, cvss: 8.7, weighted: 765 },
  { asset: "Auth Service", bizValue: "Critical", dataSens: "Auth Tokens", exposure: "Internal", criticality: 92, cvss: 8.1, weighted: 745 },
  { asset: "User API", bizValue: "High", dataSens: "PII", exposure: "External", criticality: 82, cvss: 7.5, weighted: 615 },
  { asset: "Admin Panel", bizValue: "High", dataSens: "Admin Access", exposure: "Internal", criticality: 80, cvss: 5.2, weighted: 416 },
];

/* ─── Helpers ─────────────────────────────────────── */

function scoreColor(s: number) {
  if (s >= 9) return "#ef4444";
  if (s >= 7) return "var(--primary)";
  if (s >= 4) return "var(--yellow)";
  return "var(--green)";
}

function priorityColor(p: string) {
  if (p === "P1") return "#ef4444";
  if (p === "P2") return "var(--primary)";
  return "var(--yellow)";
}

function trendColor(dir: string) {
  if (dir === "up") return "#ef4444";
  if (dir === "down") return "var(--green)";
  return "var(--muted)";
}

function heatColor(weighted: number) {
  if (weighted >= 800) return "#ef4444";
  if (weighted >= 600) return "var(--primary)";
  if (weighted >= 400) return "var(--yellow)";
  return "var(--green)";
}

/* ─── CVSS Tab ─────────────────────────────────────── */

function CvssTab() {
  const [selected, setSelected] = useState(cvssFindings[0]);

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
      {/* Table */}
      <div className="tool-panel" style={{ padding: 0, overflow: "hidden" }}>
        <table className="data-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              {["Finding", "CVSS Score", "Attack Vector", "Privileges", "User Interaction", "Scope", "C/I/A"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cvssFindings.map((f) => (
              <tr
                key={f.name}
                onClick={() => setSelected(f)}
                style={{ cursor: "pointer", background: selected.name === f.name ? "var(--primary)0a" : "transparent", borderBottom: "1px solid var(--border)" }}
              >
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{f.name}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: scoreColor(f.score) }}>{f.score}</span>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--fg)" }}>{f.av}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--fg)" }}>{f.pr}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--fg)" }}>{f.ui}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--fg)" }}>{f.scope}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: scoreColor(f.score) }}>{f.cia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CVSS Calculator */}
      <div className="tool-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div className="tool-panel-header" style={{ padding: "10px 16px" }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>CVSS 3.1 Calculator — {selected.name}</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: scoreColor(selected.score) }}>{selected.score}</span>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
            {[
              { metric: "Attack Vector", value: selected.av },
              { metric: "Attack Complexity", value: "Low" },
              { metric: "Privileges Required", value: selected.pr },
              { metric: "User Interaction", value: selected.ui },
              { metric: "Scope", value: selected.scope },
              { metric: "Confidentiality", value: selected.cia.split("/")[0] === "H" ? "High" : "Low" },
              { metric: "Integrity", value: selected.cia.split("/")[1] === "H" ? "High" : "Low" },
              { metric: "Availability", value: selected.cia.split("/")[2] === "H" ? "High" : "Low" },
            ].map((m) => (
              <div key={m.metric} style={{ background: "var(--bg)", borderRadius: 6, padding: "8px 10px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.05em", fontWeight: 600, marginBottom: 4 }}>{m.metric}</div>
                <select
                  defaultValue={m.value}
                  style={{ background: "transparent", border: "none", color: "var(--fg)", fontSize: 12, fontWeight: 700, cursor: "pointer", width: "100%" }}
                >
                  <option>{m.value}</option>
                </select>
              </div>
            ))}
          </div>

          {/* Vector string */}
          <div style={{ background: "var(--bg)", borderRadius: 6, padding: "10px 14px", border: "1px solid var(--border)", marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 4 }}>CVSS Vector String</div>
            <code style={{ fontSize: 12, fontFamily: "monospace", color: "var(--primary)", fontWeight: 700 }}>{selected.vector}</code>
          </div>

          {/* Temporal + Environmental */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "var(--bg)", borderRadius: 6, padding: "10px 14px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 4 }}>Temporal Score</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: scoreColor(selected.score - 0.3) }}>{(selected.score - 0.3).toFixed(1)}</span>
              <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 6 }}>E:F/RL:U/RC:C</span>
            </div>
            <div style={{ background: "var(--bg)", borderRadius: 6, padding: "10px 14px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 4 }}>Environmental Score</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: scoreColor(selected.score) }}>{selected.score}</span>
              <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 6 }}>Env-adjusted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── EPSS Tab ─────────────────────────────────────── */

function EpssTab() {
  // SVG scatter plot
  const W = 500, H = 260;
  const padL = 50, padB = 40, padT = 20, padR = 20;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  function xPos(cvss: number) { return padL + (cvss / 10) * plotW; }
  function yPos(epss: number) { return padT + plotH - (epss / 100) * plotH; }

  const dots = [
    { name: "SQL Injection", cvss: 9.8, epss: 67.3, color: "#ef4444" },
    { name: "SSRF → AWS", cvss: 9.6, epss: 54.1, color: "#ef4444" },
    { name: "Stored XSS", cvss: 8.7, epss: 23.8, color: "var(--primary)" },
    { name: "IDOR", cvss: 8.1, epss: 18.2, color: "var(--primary)" },
    { name: "CORS", cvss: 7.5, epss: 8.9, color: "var(--yellow)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
      {/* Explanation */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 18 }}>📊</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)", marginBottom: 2 }}>Exploit Prediction Scoring System (EPSS)</div>
          <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
            EPSS estimates the probability a vulnerability will be exploited in the next 30 days based on threat intelligence, public exploit availability, and historical exploitation patterns.
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="tool-panel" style={{ padding: 0, overflow: "hidden" }}>
        <table className="data-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              {["Finding", "CVE", "EPSS Score", "Percentile", "Trend", "Priority"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {epssFindings.map((f) => (
              <tr key={f.name} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{f.name}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, fontFamily: "monospace", color: "var(--muted)" }}>{f.cve}</td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: f.epss > 40 ? "#ef4444" : f.epss > 20 ? "var(--primary)" : "var(--yellow)" }}>{f.epss}%</span>
                    <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2, minWidth: 60 }}>
                      <div style={{ height: "100%", width: `${f.epss}%`, background: f.epss > 40 ? "#ef4444" : f.epss > 20 ? "var(--primary)" : "var(--yellow)", borderRadius: 2 }} />
                    </div>
                  </div>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--muted)" }}>{f.percentile}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: trendColor(f.trendDir) }}>{f.trend}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ background: `${priorityColor(f.priority)}22`, color: priorityColor(f.priority), border: `1px solid ${priorityColor(f.priority)}44`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>{f.priority}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scatter Plot */}
      <div className="tool-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div className="tool-panel-header" style={{ padding: "10px 16px" }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>CVSS × EPSS Priority Matrix</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>High CVSS + High EPSS = Critical Action Required</span>
        </div>
        <div style={{ padding: 16 }}>
          <svg width={W} height={H} style={{ display: "block", maxWidth: "100%" }}>
            {/* Quadrant fills */}
            <rect x={padL + plotW / 2} y={padT} width={plotW / 2} height={plotH / 2} fill="rgba(239,68,68,0.07)" />
            <rect x={padL} y={padT} width={plotW / 2} height={plotH / 2} fill="rgba(234,179,8,0.05)" />
            <rect x={padL + plotW / 2} y={padT + plotH / 2} width={plotW / 2} height={plotH / 2} fill="rgba(234,179,8,0.05)" />
            <rect x={padL} y={padT + plotH / 2} width={plotW / 2} height={plotH / 2} fill="rgba(34,197,94,0.05)" />

            {/* Quadrant labels */}
            <text x={padL + plotW * 0.75} y={padT + 14} textAnchor="middle" fontSize={10} fill="#ef4444" opacity={0.7} fontWeight="700">CRITICAL ACTION</text>
            <text x={padL + plotW * 0.25} y={padT + 14} textAnchor="middle" fontSize={10} fill="rgb(234,179,8)" opacity={0.7}>MONITOR</text>
            <text x={padL + plotW * 0.75} y={padT + plotH - 6} textAnchor="middle" fontSize={10} fill="rgb(234,179,8)" opacity={0.7}>PATCH SOON</text>
            <text x={padL + plotW * 0.25} y={padT + plotH - 6} textAnchor="middle" fontSize={10} fill="rgb(34,197,94)" opacity={0.7}>LOW PRIORITY</text>

            {/* Grid lines */}
            {[0, 2, 4, 6, 8, 10].map((v) => (
              <g key={v}>
                <line x1={xPos(v)} y1={padT} x2={xPos(v)} y2={padT + plotH} stroke="var(--border)" strokeWidth={0.5} />
                <text x={xPos(v)} y={padT + plotH + 14} textAnchor="middle" fontSize={10} fill="var(--muted)">{v}</text>
              </g>
            ))}
            {[0, 25, 50, 75, 100].map((v) => (
              <g key={v}>
                <line x1={padL} y1={yPos(v)} x2={padL + plotW} y2={yPos(v)} stroke="var(--border)" strokeWidth={0.5} />
                <text x={padL - 6} y={yPos(v) + 4} textAnchor="end" fontSize={10} fill="var(--muted)">{v}%</text>
              </g>
            ))}

            {/* Midpoint lines */}
            <line x1={xPos(5)} y1={padT} x2={xPos(5)} y2={padT + plotH} stroke="var(--border)" strokeWidth={1.5} strokeDasharray="4,2" />
            <line x1={padL} y1={yPos(50)} x2={padL + plotW} y2={yPos(50)} stroke="var(--border)" strokeWidth={1.5} strokeDasharray="4,2" />

            {/* Axis labels */}
            <text x={padL + plotW / 2} y={H - 2} textAnchor="middle" fontSize={11} fill="var(--muted)" fontWeight="600">CVSS Score →</text>
            <text x={12} y={padT + plotH / 2} textAnchor="middle" fontSize={11} fill="var(--muted)" fontWeight="600" transform={`rotate(-90, 12, ${padT + plotH / 2})`}>EPSS Score →</text>

            {/* Dots */}
            {dots.map((d) => (
              <g key={d.name}>
                <circle cx={xPos(d.cvss)} cy={yPos(d.epss)} r={8} fill={d.color} opacity={0.85} />
                <text x={xPos(d.cvss)} y={yPos(d.epss) - 12} textAnchor="middle" fontSize={10} fill="var(--fg)" fontWeight="600">
                  {d.name.split(" ")[0]}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─── Asset Risk Tab ───────────────────────────────── */

function AssetRiskTab() {
  const severities = ["Critical (9-10)", "High (7-8.9)", "Medium (4-6.9)", "Low (0-3.9)"];
  const assets = assetRisk.map((a) => a.asset);

  // Weighted risk grid — just use actual weighted values
  const heatData: Record<string, Record<string, number>> = {
    "Payment API": { "Critical (9-10)": 931, "High (7-8.9)": 0, "Medium (4-6.9)": 0, "Low (0-3.9)": 0 },
    "Customer Portal": { "Critical (9-10)": 0, "High (7-8.9)": 765, "Medium (4-6.9)": 0, "Low (0-3.9)": 0 },
    "Auth Service": { "Critical (9-10)": 0, "High (7-8.9)": 745, "Medium (4-6.9)": 0, "Low (0-3.9)": 0 },
    "User API": { "Critical (9-10)": 0, "High (7-8.9)": 615, "Medium (4-6.9)": 0, "Low (0-3.9)": 0 },
    "Admin Panel": { "Critical (9-10)": 0, "High (7-8.9)": 0, "Medium (4-6.9)": 416, "Low (0-3.9)": 0 },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
      {/* Explanation */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 18 }}>🏗️</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)", marginBottom: 2 }}>Asset Criticality Scoring</div>
          <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
            Asset Criticality combines business value, data sensitivity, exposure level, and dependencies to weight findings. Weighted Risk = CVSS Score × Criticality Score.
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="tool-panel" style={{ padding: 0, overflow: "hidden" }}>
        <table className="data-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              {["Asset", "Business Value", "Data Sensitivity", "Exposure", "Criticality", "CVSS", "Weighted Risk"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assetRisk.map((a) => (
              <tr key={a.asset} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>{a.asset}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ background: a.bizValue === "Critical" ? "rgba(239,68,68,0.12)" : "rgba(232,145,45,0.12)", color: a.bizValue === "Critical" ? "#ef4444" : "var(--primary)", border: `1px solid ${a.bizValue === "Critical" ? "#ef444444" : "var(--primary)44"}`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{a.bizValue}</span>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--muted)" }}>{a.dataSens}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ background: a.exposure === "External" ? "rgba(239,68,68,0.1)" : "rgba(234,179,8,0.1)", color: a.exposure === "External" ? "#ef4444" : "var(--yellow)", border: `1px solid ${a.exposure === "External" ? "#ef444430" : "var(--yellow)30"}`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{a.exposure}</span>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: a.criticality >= 90 ? "#ef4444" : "var(--primary)" }}>{a.criticality}</span>
                    <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2, minWidth: 40 }}>
                      <div style={{ height: "100%", width: `${a.criticality}%`, background: a.criticality >= 90 ? "#ef4444" : "var(--primary)", borderRadius: 2 }} />
                    </div>
                  </div>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 14, fontWeight: 800, color: scoreColor(a.cvss) }}>
                  {a.cvss}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: heatColor(a.weighted) }}>{a.weighted}</span>
                    <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: 4 }}>= {a.cvss} × {a.criticality}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Heatmap */}
      <div className="tool-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div className="tool-panel-header" style={{ padding: "10px 16px" }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>Risk Heatmap — Weighted Score by Asset × Severity</span>
        </div>
        <div style={{ padding: 16, overflowX: "auto" as const }}>
          <table style={{ borderCollapse: "collapse" as const, width: "100%" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px 12px", textAlign: "left" as const, fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Asset</th>
                {severities.map((s) => (
                  <th key={s} style={{ padding: "8px 12px", textAlign: "center" as const, fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset}>
                  <td style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, color: "var(--fg)", whiteSpace: "nowrap" as const }}>{asset}</td>
                  {severities.map((sev) => {
                    const val = heatData[asset]?.[sev] ?? 0;
                    const bg =
                      val >= 800 ? "rgba(239,68,68,0.6)" :
                      val >= 600 ? "rgba(232,145,45,0.6)" :
                      val >= 300 ? "rgba(234,179,8,0.5)" :
                      val > 0 ? "rgba(34,197,94,0.35)" :
                      "var(--surface)";
                    return (
                      <td
                        key={sev}
                        style={{
                          padding: "10px 16px",
                          textAlign: "center" as const,
                          background: bg,
                          border: "1px solid var(--border)",
                          fontSize: 13,
                          fontWeight: val > 0 ? 800 : 400,
                          color: val > 0 ? "var(--fg)" : "var(--border)",
                          borderRadius: 2,
                        }}
                      >
                        {val > 0 ? val : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 12, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Legend:</span>
            {[
              { label: "≥800 Critical", bg: "rgba(239,68,68,0.6)" },
              { label: "600–799 High", bg: "rgba(232,145,45,0.6)" },
              { label: "300–599 Medium", bg: "rgba(234,179,8,0.5)" },
              { label: "<300 Low", bg: "rgba(34,197,94,0.35)" },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: 2, background: l.bg }} />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



/* ─── XAI & SHAP Tab ───────────────────────────────── */

function XaiTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
      <div className="tool-panel" style={{ padding: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#00d4ff" }}>
              Step 6: Explainable AI (XAI) & Trustworthy ML Attribution
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginTop: 2 }}>
              SHAP (Shapley Additive Explanations) Risk Attribution Waterfall
            </h3>
          </div>
          <span style={{ fontSize: 11, background: "rgba(0, 212, 255, 0.12)", color: "#00d4ff", border: "1px solid rgba(0, 212, 255, 0.3)", padding: "4px 10px", borderRadius: 6, fontWeight: 700 }}>
            Model: XGBoost Risk Classifier (AUC 0.982)
          </span>
        </div>

        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>
          Mathematically decomposes the target risk prediction into individual additive feature contributions (Shapley values). Proves why an asset is classified as Critical without black-box ambiguity.
        </p>

        {/* SHAP Waterfall Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "var(--bg)", borderRadius: 8, padding: 16, border: "1px solid var(--border)" }}>
          {[
            { feature: "Base Expected Value E[f(x)]", val: "+0.20", pct: 20, color: "var(--muted)", desc: "Baseline organization average risk" },
            { feature: "Remote Attack Vector (AV:Network)", val: "+0.35", pct: 35, color: "#ef4444", desc: "No local network barrier or VPN required" },
            { feature: "EPSS 30-Day Exploit Velocity (67.3%)", val: "+0.25", pct: 25, color: "#ef4444", desc: "Active in-the-wild threat intelligence campaigns" },
            { feature: "Privileges Required None (PR:None)", val: "+0.12", pct: 12, color: "var(--primary)", desc: "Accessible prior to authentication" },
            { feature: "PCI DSS Regulated Database Reachability", val: "+0.06", pct: 6, color: "var(--yellow)", desc: "Direct connectivity to cardholder PAN repository" },
          ].map((s, idx) => (
            <div key={idx}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: "#fff" }}>{s.feature}</span>
                <span style={{ fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.val}</span>
              </div>
              <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${s.pct * 2}%`, height: "100%", background: s.color, borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>{s.desc}</span>
            </div>
          ))}

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>Total SHAP Model Output f(x):</span>
            <span style={{ fontSize: 16, fontWeight: 900, color: "#ef4444", fontFamily: "monospace" }}>0.98 (CRITICAL RISK CONFIRMED)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────── */

export default function RiskEnginePage() {
  const [activeTab, setActiveTab] = useState<"cvss" | "epss" | "asset" | "xai">("cvss");

  const stats = [
    { label: "Overall Risk", value: "HIGH", color: "#ef4444", sub: "Risk Level" },
    { label: "Critical Findings", value: "3", color: "#ef4444", sub: "findings" },
    { label: "Avg CVSS Score", value: "8.7", color: "var(--primary)", sub: "out of 10" },
    { label: "Exploitability (EPSS)", value: "34.2%", color: "var(--yellow)", sub: "avg probability" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", boxShadow: "0 0 6px var(--primary)" }} />
          <span style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" as const, fontWeight: 600 }}>Phase 2 · Risk Intelligence</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 2px", letterSpacing: "-0.02em" }}>Risk Intelligence Engine</h1>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>CVSS 3.1 · EPSS · Asset Criticality · Business Impact</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" style={{ fontSize: 12 }}>Export Report</button>
            <button className="btn-primary" style={{ fontSize: 12 }}>Recalculate Scores</button>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 28px" }}>
        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {stats.map((s) => (
            <div key={s.label} className="tool-panel" style={{ padding: "16px 20px", borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color, letterSpacing: "-0.03em", marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
          {([
            { key: "cvss", label: "CVSS Scoring" },
            { key: "epss", label: "EPSS Exploit Probability" },
            { key: "asset", label: "Asset Risk" },
            { key: "xai", label: "Explainable AI (XAI / SHAP)" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 20px",
                border: "none",
                background: "transparent",
                color: activeTab === tab.key ? "var(--primary)" : "var(--muted)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                borderBottom: activeTab === tab.key ? "2px solid var(--primary)" : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "cvss" && <CvssTab />}
        {activeTab === "epss" && <EpssTab />}
        {activeTab === "asset" && <AssetRiskTab />}
        {activeTab === "xai" && <XaiTab />}
      </div>
    </div>
  );
}
