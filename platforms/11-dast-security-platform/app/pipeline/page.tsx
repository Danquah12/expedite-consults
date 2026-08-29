"use client";

import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
type ViewerTab = "burp" | "zap" | "openvas" | "canonical";

// ── Mock Data ──────────────────────────────────────────────────────────────────
const EVENT_BUS_TOPICS = [
  { source: "SCANNER", topic: "scan-events",     target: "Discovery Service",  msgs: 847,   flowing: true  },
  { source: "SCANNER", topic: "finding-events",  target: "Findings Pipeline",  msgs: 2341,  flowing: true  },
  { source: "ENGINE",  topic: "workflow-events", target: "Workflow Engine",     msgs: 156,   flowing: false },
];

const PIPELINE_STAGES = [
  { id:"raw",    label:"Raw Storage",        records:156, extra:"ZAP: 67  Burp: 54  OpenVAS: 35", color:"#4fc3f7",        status:"Complete" },
  { id:"norm",   label:"Normalization",      records:156, extra:"Burp / ZAP / OpenVAS Adapters",  color:"#ce93d8",        status:"Complete" },
  { id:"canon",  label:"Canonical Findings", records:148, extra:"8 failed schema validation",     color:"var(--primary)", status:"Complete" },
  { id:"corr",   label:"Correlation",        records:142, extra:"6 merged as duplicates",         color:"var(--yellow)",  status:"Processing"},
  { id:"dedup",  label:"Deduplication",      records:138, extra:"4 additional duplicates removed",color:"var(--green)",   status:"Complete" },
  { id:"axiom",  label:"AXIOM Finding",      records:138, extra:"138 verified findings",          color:"var(--primary)", status:"Complete" },
];

const ADAPTERS = [
  { name:"Burp Adapter",    scanner:"Burp Enterprise", input:"Burp JSON",    output:"Canonical Finding", rate:"98.1%", lastRun:"Today" },
  { name:"ZAP Adapter",     scanner:"OWASP ZAP",       input:"ZAP JSON",     output:"Canonical Finding", rate:"97.4%", lastRun:"Today" },
  { name:"OpenVAS Adapter", scanner:"OpenVAS/GVM",     input:"OpenVAS XML",  output:"Canonical Finding", rate:"95.2%", lastRun:"Today" },
  { name:"Nmap Adapter",    scanner:"Nmap",            input:"Nmap XML",     output:"Asset Object",      rate:"99.8%", lastRun:"Today" },
];

// ── Raw Viewer Content ─────────────────────────────────────────────────────────
const VIEWER_CONTENT: Record<ViewerTab, string> = {
  burp: `{
  "issues": [{
    "serialNumber": "4363648512",
    "type": 1049088,
    "name": "SQL injection",
    "host": "https://portal.abc.com",
    "path": "/api/products/search",
    "severity": "High",
    "confidence": "Certain",
    "issueBackground": "SQL injection vulnerabilities..."
  }]
}`,
  zap: `{
  "@version": "2.14.0",
  "site": [{
    "@name": "https://portal.abc.com",
    "alerts": [{
      "pluginid": "40018",
      "alertRef": "40018-1",
      "alert": "SQL Injection",
      "name": "SQL Injection",
      "riskcode": "3",
      "confidence": "2",
      "riskdesc": "High (Medium)",
      "url": "https://portal.abc.com/api/products/search",
      "method": "GET",
      "param": "q",
      "attack": "' OR 1=1--",
      "evidence": "mysql_fetch_array()"
    }]
  }]
}`,
  openvas: `<?xml version="1.0" encoding="UTF-8"?>
<report id="axm-rep-001">
  <results>
    <result id="r-001">
      <name>SQL Injection</name>
      <host>52.14.x.x</host>
      <port>443/tcp</port>
      <nvt oid="1.3.6.1.4.1.25623.1.0.108566">
        <name>SQL Injection</name>
        <cvss_base>9.8</cvss_base>
        <cve>CVE-2021-22893</cve>
      </nvt>
      <severity>9.8</severity>
      <threat>High</threat>
      <description>SQL injection found at /api/products/search</description>
    </result>
  </results>
</report>`,
  canonical: `{
  "findingId": "axm-f-001",
  "title": "SQL Injection",
  "severity": "Critical",
  "confidence": "HIGH",
  "source": "burp-enterprise",
  "asset": "portal.abc.com",
  "path": "/api/products/search",
  "parameter": "q",
  "cwe": 89,
  "owasp": "A03:2021",
  "cvss": 9.8,
  "normalizedAt": "2026-08-21T19:00:00Z"
}`,
};

const VIEWER_LABELS: { key: ViewerTab; label: string }[] = [
  { key: "burp",      label: "Burp JSON"       },
  { key: "zap",       label: "ZAP JSON"         },
  { key: "openvas",   label: "OpenVAS XML"      },
  { key: "canonical", label: "Canonical Finding" },
];

// ── Pulse dot component ────────────────────────────────────────────────────────
function PulseDot({ active }: { active: boolean }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setOn(v => !v), 700);
    return () => clearInterval(t);
  }, [active]);
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: active ? (on ? "var(--green)" : "rgba(76,175,80,0.3)") : "var(--muted)",
      transition: "background 0.3s", flexShrink: 0,
    }} />
  );
}

// ── Pipeline Flow SVG ──────────────────────────────────────────────────────────
function PipelineFlow() {
  const w = 130; const h = 64; const gap = 28; const total = PIPELINE_STAGES.length;
  const svgW = total * w + (total - 1) * gap;
  const svgH = h + 20;

  return (
    <div style={{ overflowX: "auto", padding: "8px 0" }}>
      <svg width={svgW} height={svgH} style={{ display: "block", minWidth: svgW }}>
        {PIPELINE_STAGES.map((s, i) => {
          const x = i * (w + gap);
          const mid = x + w / 2;
          return (
            <g key={s.id}>
              {/* Arrow */}
              {i < total - 1 && (
                <>
                  <line x1={x + w} y1={h / 2} x2={x + w + gap} y2={h / 2} stroke="var(--border)" strokeWidth={1.5} strokeDasharray="3,2" />
                  <polygon points={`${x+w+gap-1},${h/2-4} ${x+w+gap+6},${h/2} ${x+w+gap-1},${h/2+4}`} fill="var(--border)" />
                </>
              )}
              {/* Box */}
              <rect x={x} y={4} width={w} height={h} rx={6} fill="var(--surface)" stroke={s.color} strokeWidth={1.5} />
              {/* Stage name */}
              <text x={mid} y={24} textAnchor="middle" fontSize={11} fontWeight={700} fill={s.color}>{s.label}</text>
              {/* Record count */}
              <text x={mid} y={40} textAnchor="middle" fontSize={13} fontWeight={800} fill="var(--fg)">{s.records}</text>
              {/* Status */}
              <text x={mid} y={54} textAnchor="middle" fontSize={10} fill={s.status === "Processing" ? "var(--primary)" : "var(--muted)"}>
                {s.status}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PipelinePage() {
  const [viewerTab, setViewerTab] = useState<ViewerTab>("burp");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)", color: "var(--fg)", overflow: "hidden" }}>

      {/* ── Page Header ── */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>Findings Pipeline</span>
        <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>Event Bus + Normalization Stages</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Event Bus Panel ── */}
        <div className="tool-panel">
          <div className="tool-panel-header">
            RabbitMQ Event Bus
            <span style={{ marginLeft: 8, fontSize: 11, color: "var(--green)", fontWeight: 600 }}>● LIVE</span>
          </div>
          <div style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {EVENT_BUS_TOPICS.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
                  {/* Source */}
                  <span style={{ background: "rgba(79,195,247,0.12)", color: "#4fc3f7", borderRadius: 4, padding: "3px 10px", fontSize: 11, fontWeight: 700, width: 72, textAlign: "center" as const }}>
                    {t.source}
                  </span>
                  {/* Arrow */}
                  <span style={{ color: "var(--muted)" }}>→</span>
                  {/* Topic */}
                  <span style={{ background: "rgba(232,145,45,0.12)", color: "var(--primary)", borderRadius: 4, padding: "3px 12px", fontSize: 11, fontWeight: 700, minWidth: 130, textAlign: "center" as const }}>
                    {t.topic}
                  </span>
                  {/* Message count */}
                  <span style={{ fontSize: 11, color: "var(--muted)", minWidth: 80 }}>
                    {t.msgs.toLocaleString()} msgs
                  </span>
                  {/* Pulse */}
                  <PulseDot active={t.flowing} />
                  {/* Arrow */}
                  <span style={{ color: "var(--muted)" }}>→</span>
                  {/* Target */}
                  <span style={{ background: "rgba(206,147,216,0.12)", color: "#ce93d8", borderRadius: 4, padding: "3px 12px", fontSize: 11, fontWeight: 700 }}>
                    {t.target}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Pipeline Stages ── */}
        <div className="tool-panel">
          <div className="tool-panel-header">Pipeline Stages</div>
          <div style={{ padding: "14px 16px" }}>
            <PipelineFlow />
          </div>

          {/* Stage detail cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, padding: "8px 16px 14px" }}>
            {PIPELINE_STAGES.map(s => (
              <div key={s.id} style={{ borderRadius: 6, border: `1px solid ${s.color}30`, padding: "8px 10px", background: "var(--bg)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: s.color, textTransform: "uppercase" as const, letterSpacing: 0.6, marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--fg)", marginBottom: 2 }}>{s.records}</div>
                <div style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.4 }}>{s.extra}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Step 4: Real-Time Streaming Anomaly Engine (Apache Flink & VAE) ── */}
        <div className="tool-panel" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
          <div className="tool-panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              ⚡ Step 4: Big Data Streaming Anomaly Engine (Apache Flink + VAE Reconstruction)
            </span>
            <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 700 }}>
              ● Stream Engine Active (14,820 events/sec)
            </span>
          </div>

          <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: 12 }}>
              <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Stream Throughput</span>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#00d4ff", marginTop: 4 }}>14,820 /s</div>
              <span style={{ fontSize: 10.5, color: "var(--muted)" }}>Kafka partition lag: 2.1ms</span>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: 12 }}>
              <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>VAE Anomaly Score</span>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#ef5350", marginTop: 4 }}>0.94 (Critical)</div>
              <span style={{ fontSize: 10.5, color: "var(--muted)" }}>Reconstruction loss threshold exceeded</span>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: 12 }}>
              <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Sliding Window Window</span>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)", marginTop: 4 }}>60s Window</div>
              <span style={{ fontSize: 10.5, color: "var(--muted)" }}>Tumbler count: 889,200 events</span>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: 12 }}>
              <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>PySpark Batch Latency</span>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--green)", marginTop: 4 }}>18.4 ms</div>
              <span style={{ fontSize: 10.5, color: "var(--muted)" }}>Zero-day payload pattern detected</span>
            </div>
          </div>
        </div>

        {/* ── Adapter Status Table ── */}
        <div className="tool-panel">
          <div className="tool-panel-header">Adapter Status</div>
          <table className="data-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Adapter</th>
                <th>Scanner</th>
                <th>Input Format</th>
                <th>Output Format</th>
                <th>Success Rate</th>
                <th>Last Run</th>
              </tr>
            </thead>
            <tbody>
              {ADAPTERS.map(a => {
                const rate = parseFloat(a.rate);
                const rateColor = rate >= 99 ? "var(--green)" : rate >= 97 ? "var(--primary)" : "var(--yellow)";
                return (
                  <tr key={a.name}>
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td style={{ color: "var(--muted)", fontSize: 12 }}>{a.scanner}</td>
                    <td>
                      <span style={{ background: "rgba(79,195,247,0.12)", color: "#4fc3f7", borderRadius: 3, padding: "2px 7px", fontSize: 11, fontWeight: 600, fontFamily: "monospace" }}>
                        {a.input}
                      </span>
                    </td>
                    <td>
                      <span style={{ background: "rgba(76,175,80,0.12)", color: "var(--green)", borderRadius: 3, padding: "2px 7px", fontSize: 11, fontWeight: 600, fontFamily: "monospace" }}>
                        {a.output}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: rateColor, fontWeight: 700, fontSize: 13 }}>{a.rate}</span>
                    </td>
                    <td style={{ color: "var(--muted)", fontSize: 12 }}>{a.lastRun}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Raw Finding Viewer ── */}
        <div className="tool-panel">
          <div className="tool-panel-header">Raw Finding Viewer</div>

          {/* Tab switcher */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 16px" }}>
            {VIEWER_LABELS.map(t => (
              <button
                key={t.key}
                onClick={() => setViewerTab(t.key)}
                style={{
                  padding: "8px 16px", background: "transparent", border: "none",
                  borderBottom: viewerTab === t.key ? "2px solid var(--primary)" : "2px solid transparent",
                  color: viewerTab === t.key ? "var(--primary)" : "var(--muted)",
                  fontWeight: viewerTab === t.key ? 700 : 400, fontSize: 12, cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Code viewer */}
          <div style={{ padding: "12px 16px" }}>
            <pre style={{
              background: "rgba(0,0,0,0.3)", borderRadius: 6, padding: "14px 16px",
              fontSize: 12, fontFamily: "monospace", color: viewerTab === "canonical" ? "var(--primary)" : "var(--green)",
              whiteSpace: "pre" as const, overflowX: "auto", margin: 0,
              border: "1px solid var(--border)", lineHeight: 1.6,
              minHeight: 180,
            }}>
              {VIEWER_CONTENT[viewerTab]}
            </pre>
          </div>

          {/* Transformation note for canonical tab */}
          {viewerTab === "canonical" && (
            <div style={{ padding: "0 16px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, background: "rgba(232,145,45,0.15)", color: "var(--primary)", borderRadius: 4, padding: "4px 10px", fontWeight: 600 }}>
                ✓ Schema Valid
              </span>
              <span style={{ fontSize: 11, background: "rgba(76,175,80,0.12)", color: "var(--green)", borderRadius: 4, padding: "4px 10px", fontWeight: 600 }}>
                CVSS 9.8 → Critical
              </span>
              <span style={{ fontSize: 11, background: "rgba(79,195,247,0.12)", color: "#4fc3f7", borderRadius: 4, padding: "4px 10px", fontWeight: 600 }}>
                CWE-89 mapped
              </span>
              <span style={{ fontSize: 11, background: "rgba(206,147,216,0.12)", color: "#ce93d8", borderRadius: 4, padding: "4px 10px", fontWeight: 600 }}>
                OWASP A03:2021
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
