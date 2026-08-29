"use client";
import { useState, useRef, useEffect } from "react";
import { ScrollText } from "lucide-react";

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG" | "FINDING";

interface LogEntry {
  ts:        string;
  level:     LogLevel;
  source:    string;
  correlId:  string;
  message:   string;
}

const BASE_LOGS: LogEntry[] = [
  { ts:"14:22:01.014", level:"INFO",    source:"Engine",     correlId:"cx-001", message:"Engine cycle started — target: app.target.local, intensity: Normal" },
  { ts:"14:22:01.102", level:"INFO",    source:"Scope",      correlId:"cx-001", message:"Scope resolved — 47 in-scope URLs, 12 excluded" },
  { ts:"14:22:01.340", level:"DEBUG",   source:"Crawler",    correlId:"cx-001", message:"Launching Playwright v1.49 — headless:true, timeout:30000ms" },
  { ts:"14:22:03.881", level:"INFO",    source:"Crawler",    correlId:"cx-001", message:"Authentication completed — session cookie captured" },
  { ts:"14:22:07.220", level:"INFO",    source:"Crawler",    correlId:"cx-001", message:"Crawl complete — 20 endpoints, 34 params, 8 forms" },
  { ts:"14:22:07.440", level:"INFO",    source:"Scanner",    correlId:"cx-002", message:"Dispatching plugin: SQLi — 8 endpoints × 34 params = 272 tests" },
  { ts:"14:22:09.112", level:"DEBUG",   source:"SQLi",       correlId:"cx-003", message:"Payload sent: GET /api/products/search?q=%27+UNION+SELECT+1,2,3--" },
  { ts:"14:22:09.440", level:"ERROR",   source:"HTTP",       correlId:"cx-003", message:"Received 500 Internal Server Error — SQL syntax error in response body" },
  { ts:"14:22:09.441", level:"FINDING", source:"SQLi",       correlId:"cx-003", message:"SQL Injection confirmed — /api/products/search | CVSS 9.8 | Evidence captured" },
  { ts:"14:22:12.005", level:"INFO",    source:"Scanner",    correlId:"cx-004", message:"Dispatching plugin: SSRF — testing webhook endpoints" },
  { ts:"14:22:13.120", level:"DEBUG",   source:"SSRF",       correlId:"cx-004", message:"OOB callback dispatched: id=oob-b4f2a1c9 → target parameter injected" },
  { ts:"14:22:16.880", level:"INFO",    source:"OOB",        correlId:"cx-004", message:"OOB interaction received from 169.254.x.x — DNS + HTTP callback confirmed" },
  { ts:"14:22:16.881", level:"FINDING", source:"SSRF",       correlId:"cx-004", message:"Blind SSRF → Cloud Metadata confirmed | CVSS 9.6 | OOB evidence attached" },
  { ts:"14:22:18.200", level:"INFO",    source:"Scanner",    correlId:"cx-005", message:"Dispatching plugin: XSS — stored + reflected variants" },
  { ts:"14:22:20.100", level:"WARN",    source:"RateLimit",  correlId:"cx-005", message:"Rate limit detected — throttling to 5 req/s on api.target.local" },
  { ts:"14:22:22.450", level:"FINDING", source:"XSS",        correlId:"cx-005", message:"Stored XSS confirmed — displayName field | CVSS 8.7 | Evidence captured" },
  { ts:"14:22:25.001", level:"INFO",    source:"Evidence",   correlId:"cx-006", message:"Capturing request/response chain for 8 findings..." },
  { ts:"14:22:26.300", level:"INFO",    source:"Evidence",   correlId:"cx-006", message:"Reproduction steps generated — all 8 findings verified" },
  { ts:"14:22:27.001", level:"INFO",    source:"AI",         correlId:"cx-007", message:"AI triage running — assigning CVSS scores, attack chains, owner mapping" },
  { ts:"14:22:28.100", level:"INFO",    source:"Report",     correlId:"cx-008", message:"Report generated — HTML + JSON export ready (8 findings, 3 Critical)" },
  { ts:"14:22:28.200", level:"INFO",    source:"Engine",     correlId:"cx-001", message:"Engine cycle complete — duration: 27.2s" },
];

const levelColor: Record<LogLevel, string> = {
  INFO:    "var(--blue)",
  WARN:    "var(--yellow)",
  ERROR:   "#ef5350",
  DEBUG:   "var(--muted)",
  FINDING: "#ef5350",
};
const levelBg: Record<LogLevel, string> = {
  INFO:    "rgba(79,195,247,0.1)",
  WARN:    "rgba(255,183,77,0.1)",
  ERROR:   "rgba(239,83,80,0.1)",
  DEBUG:   "transparent",
  FINDING: "rgba(239,83,80,0.06)",
};

export default function LoggerPage() {
  const [filter,    setFilter]    = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "All">("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [autoScroll, setAutoScroll] = useState(true);
  const logRef = useRef<HTMLDivElement>(null);

  const sources = ["All", ...new Set(BASE_LOGS.map(l => l.source))];
  const logs = BASE_LOGS.filter(l =>
    (levelFilter === "All" || l.level === levelFilter) &&
    (sourceFilter === "All" || l.source === sourceFilter) &&
    (!filter || l.message.toLowerCase().includes(filter.toLowerCase()) || l.source.toLowerCase().includes(filter.toLowerCase()))
  );

  useEffect(() => {
    if (autoScroll && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs, autoScroll]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0, flexWrap: "wrap" }}>
        <ScrollText size={13} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>Logger &amp; Diagnostics</span>
        <input className="tool-input" placeholder="Filter messages…" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 220, padding: "4px 8px", fontSize: 11 }} />
        {(["All","INFO","WARN","ERROR","DEBUG","FINDING"] as const).map(l => (
          <button key={l} onClick={() => setLevelFilter(l)} className="btn-secondary"
            style={levelFilter === l ? { borderColor: l === "All" ? "var(--primary)" : levelColor[l as LogLevel] ?? "var(--primary)", color: l === "All" ? "var(--primary)" : levelColor[l as LogLevel] ?? "var(--primary)", fontSize: 10, padding: "2px 8px" } : { fontSize: 10, padding: "2px 8px" }}>
            {l}
          </button>
        ))}
        <select className="tool-select" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} style={{ fontSize: 11 }}>
          {sources.map(s => <option key={s}>{s}</option>)}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--muted)", cursor: "pointer", marginLeft: "auto" }}>
          <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} style={{ accentColor: "var(--primary)" }} />
          Auto-scroll
        </label>
        <span style={{ fontSize: 10.5, color: "var(--muted)" }}>{logs.length}/{BASE_LOGS.length} entries</span>
      </div>

      {/* Log table */}
      <div ref={logRef} style={{ flex: 1, overflowY: "auto", fontFamily: "monospace", fontSize: 11 }}>
        <table className="data-table" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ width: 90 }}>Timestamp</th>
              <th style={{ width: 70 }}>Level</th>
              <th style={{ width: 80 }}>Source</th>
              <th style={{ width: 90 }}>Correl ID</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i} style={{ background: levelBg[l.level] }}>
                <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{l.ts}</td>
                <td>
                  <span style={{ fontWeight: 700, color: levelColor[l.level], fontSize: 10, letterSpacing: "0.04em" }}>
                    {l.level === "FINDING" ? "🔴 FINDING" : l.level}
                  </span>
                </td>
                <td style={{ color: "var(--primary)", fontSize: 10.5 }}>{l.source}</td>
                <td style={{ color: "rgba(100,116,139,0.6)", fontSize: 10 }}>{l.correlId}</td>
                <td style={{ color: l.level === "ERROR" || l.level === "FINDING" ? "#ef9a9a" : l.level === "WARN" ? "var(--yellow)" : l.level === "DEBUG" ? "var(--muted)" : "var(--fg)", whiteSpace: "normal", wordBreak: "break-word" }}>{l.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats bar */}
      <div style={{ padding: "5px 10px", borderTop: "1px solid var(--border)", flexShrink: 0, display: "flex", gap: 12, fontSize: 10.5 }}>
        {(["INFO","WARN","ERROR","DEBUG","FINDING"] as LogLevel[]).map(l => (
          <span key={l} style={{ color: levelColor[l] }}>{l}: {BASE_LOGS.filter(e => e.level === l).length}</span>
        ))}
      </div>
    </div>
  );
}
