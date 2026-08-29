"use client";
import { API_HISTORY } from "@/data/findings";
import { methodColor, methodBg, statusColor, formatMs } from "@/lib/utils";
import { useState } from "react";
import { History, Filter } from "lucide-react";

export default function HistoryPage() {
  const [filter, setFilter] = useState("");
  const [envFilter, setEnvFilter] = useState("All");
  const envs = ["All", ...new Set(API_HISTORY.map(h => h.env))];
  const visible = API_HISTORY.filter(h =>
    (!filter || h.url.toLowerCase().includes(filter) || h.method.toLowerCase().includes(filter)) &&
    (envFilter === "All" || h.env === envFilter)
  );
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <History size={12} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>Request History</span>
        <Filter size={11} color="var(--muted)" style={{ marginLeft: 8 }} />
        <input className="tool-input" placeholder="Filter URL or method…" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 260 }} />
        <select className="tool-select" value={envFilter} onChange={e => setEnvFilter(e.target.value)}>
          {envs.map(e => <option key={e}>{e}</option>)}
        </select>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)" }}>{visible.length} entries</span>
      </div>
      <div style={{ overflowY: "auto", flex: 1 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>Time</th>
              <th style={{ width: 70 }}>Method</th>
              <th>URL</th>
              <th style={{ width: 50 }}>Status</th>
              <th style={{ width: 55 }}>Duration</th>
              <th style={{ width: 80 }}>Env</th>
              <th>Collection</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(h => (
              <tr key={h.id}>
                <td style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)" }}>{h.timestamp}</td>
                <td><span className="pill" style={{ background: methodBg(h.method), color: methodColor(h.method) }}>{h.method}</span></td>
                <td style={{ fontFamily: "monospace", fontSize: 11.5, color: "var(--muted)", maxWidth: 280 }}>{h.url}</td>
                <td style={{ color: statusColor(h.status), fontFamily: "monospace", fontWeight: 700 }}>{h.status}</td>
                <td style={{ fontFamily: "monospace", color: h.time > 200 ? "var(--yellow)" : "var(--muted)" }}>{h.time}ms</td>
                <td><span className="pill" style={{ background: "rgba(13,148,136,0.08)", color: "var(--primary)", fontSize: 9 }}>{h.env}</span></td>
                <td style={{ fontSize: 11, color: "var(--muted)" }}>{h.collection ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
