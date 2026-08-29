"use client";
import { useState } from "react";
import { PROXY_HISTORY } from "@/data/proxy-history";
import { methodColor, methodBg, statusColor, formatBytes } from "@/lib/utils";
import type { ProxyEntry } from "@/types/dast";
import { Send, Trash2, Filter, Circle } from "lucide-react";

const VIEW_TABS = ["Raw", "Pretty", "Headers", "Params"] as const;
type ViewTab = typeof VIEW_TABS[number];

function RequestView({ entry, tab }: { entry: ProxyEntry; tab: ViewTab }) {
  const req = entry.request;
  if (tab === "Raw") {
    const lines = req.raw.split(/\r?\n/);
    return (
      <div className="http-raw" style={{ height: "100%" }}>
        {lines.map((line, i) => {
          if (i === 0) return <div key={i} className="http-method-line">{line}</div>;
          if (line.includes(":") && !line.startsWith("{") && !line.startsWith("[")) {
            const [k, ...v] = line.split(":");
            return <div key={i}><span className="http-header-name">{k}</span>:<span className="http-header-value">{v.join(":")}</span></div>;
          }
          if (line === "") return <div key={i}>&nbsp;</div>;
          return <div key={i} className="http-body">{line}</div>;
        })}
      </div>
    );
  }
  if (tab === "Headers") {
    return (
      <div className="http-raw" style={{ height: "100%" }}>
        {Object.entries(req.headers).map(([k, v]) => (
          <div key={k}><span className="http-header-name">{k}</span>: <span className="http-header-value">{v}</span></div>
        ))}
      </div>
    );
  }
  if (tab === "Pretty" && req.body) {
    try {
      const parsed = JSON.parse(req.body);
      return <pre className="http-raw" style={{ height: "100%", color: "#dce775" }}>{JSON.stringify(parsed, null, 2)}</pre>;
    } catch { /**/ }
  }
  return <div className="http-raw" style={{ height: "100%", color: "var(--muted)" }}>No content for this view</div>;
}

function ResponseView({ entry, tab }: { entry: ProxyEntry; tab: ViewTab }) {
  const res = entry.response;
  const statusClass = res.statusCode >= 500 ? "http-status-5" : res.statusCode >= 400 ? "http-status-4" : res.statusCode >= 300 ? "http-status-3" : "http-status-2";
  if (tab === "Raw") {
    return (
      <div className="http-raw" style={{ height: "100%" }}>
        <div className={statusClass}>{res.protocol} {res.statusCode} {res.statusText}</div>
        {Object.entries(res.headers).map(([k, v]) => (
          <div key={k}><span className="http-header-name">{k}</span>: <span className="http-header-value">{v}</span></div>
        ))}
        <div>&nbsp;</div>
        <div className="http-body">{res.body}</div>
      </div>
    );
  }
  if (tab === "Pretty" && res.body) {
    try {
      const parsed = JSON.parse(res.body);
      return <pre className="http-raw" style={{ height: "100%", color: "#a5d6a7" }}>{JSON.stringify(parsed, null, 2)}</pre>;
    } catch { /**/ }
  }
  if (tab === "Headers") {
    return (
      <div className="http-raw" style={{ height: "100%" }}>
        <div className={statusClass} style={{ marginBottom: 8 }}>{res.protocol} {res.statusCode} {res.statusText}</div>
        {Object.entries(res.headers).map(([k, v]) => (
          <div key={k}><span className="http-header-name">{k}</span>: <span className="http-header-value">{v}</span></div>
        ))}
      </div>
    );
  }
  return <div className="http-raw" style={{ height: "100%", color: "var(--muted)" }}>No content for this view</div>;
}

export default function ProxyPage() {
  const [selected, setSelected]   = useState<ProxyEntry | null>(PROXY_HISTORY[0]);
  const [reqTab, setReqTab]       = useState<ViewTab>("Raw");
  const [resTab, setResTab]       = useState<ViewTab>("Raw");
  const [intercept, setIntercept] = useState(false);
  const [filter, setFilter]       = useState("");

  const visible = PROXY_HISTORY.filter(p =>
    !filter || p.path.toLowerCase().includes(filter.toLowerCase()) ||
    p.method.toLowerCase().includes(filter.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
        background: "var(--surface-2)", borderBottom: "1px solid var(--border)", flexShrink: 0,
      }}>
        <button
          onClick={() => setIntercept(i => !i)}
          className="btn-secondary"
          style={intercept ? { borderColor: "var(--primary)", color: "var(--primary)" } : {}}>
          <Circle size={10} fill={intercept ? "var(--primary)" : "none"} /> Intercept {intercept ? "ON" : "OFF"}
        </button>
        <div style={{ width: 1, height: 18, background: "var(--border)" }} />
        <Filter size={12} color="var(--muted)" />
        <input className="tool-input" placeholder="Filter URLs..." value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ width: 280, padding: "4px 8px" }} />
        <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)" }}>
          {visible.length} requests &nbsp;·&nbsp;
          <span style={{ color: intercept ? "var(--primary)" : "var(--green)" }}>
            {intercept ? "⏸ Intercepting" : "▶ Forwarding"}
          </span>
        </div>
      </div>

      {/* Main split: table | request/response */}
      <div className="split-h" style={{ flex: 1 }}>
        {/* Request list */}
        <div style={{ width: 420, flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 28 }}>#</th>
                  <th style={{ width: 58 }}>Method</th>
                  <th>Path</th>
                  <th style={{ width: 42 }}>Status</th>
                  <th style={{ width: 55 }}>Length</th>
                  <th style={{ width: 50 }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(p => (
                  <tr key={p.id} className={selected?.id === p.id ? "selected" : ""}
                    onClick={() => setSelected(p)}>
                    <td style={{ color: "var(--muted)", fontSize: 10 }}>{p.id}</td>
                    <td>
                      <span className="pill" style={{ background: methodBg(p.method), color: methodColor(p.method), fontSize: 10 }}>
                        {p.method}
                      </span>
                    </td>
                    <td style={{ color: "var(--fg-2)", fontSize: 11.5, maxWidth: 180 }} title={p.path}>{p.path}</td>
                    <td style={{ color: statusColor(p.statusCode), fontFamily: "monospace", fontWeight: 700, fontSize: 11.5 }}>{p.statusCode}</td>
                    <td style={{ color: "var(--muted)", fontSize: 11 }}>{formatBytes(p.responseLength)}</td>
                    <td style={{ color: "var(--muted)", fontSize: 11 }}>{p.timeMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Request + Response viewer */}
        {selected ? (
          <div className="split-v" style={{ flex: 1 }}>
            {/* Request pane */}
            <div className="pane" style={{ flex: 1, display: "flex", flexDirection: "column", borderBottom: "1px solid var(--border)" }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "4px 12px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", flexShrink: 0,
              }}>
                <div className="tab-bar" style={{ border: "none", background: "transparent" }}>
                  <span style={{ fontSize: 10.5, color: "var(--muted)", padding: "7px 10px" }}>REQUEST</span>
                  {VIEW_TABS.map(t => (
                    <button key={t} className={`tab-item ${reqTab === t ? "active" : ""}`} onClick={() => setReqTab(t)}>{t}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-secondary" title="Send to Repeater"><Send size={11} /> Repeater</button>
                  <button className="btn-secondary" title="Drop request"><Trash2 size={11} /></button>
                </div>
              </div>
              <div style={{ flex: 1, overflow: "auto" }}>
                <RequestView entry={selected} tab={reqTab} />
              </div>
            </div>

            {/* Response pane */}
            <div className="pane" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{
                display: "flex", alignItems: "center",
                padding: "4px 12px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", flexShrink: 0,
              }}>
                <div className="tab-bar" style={{ border: "none", background: "transparent" }}>
                  <span style={{ fontSize: 10.5, color: "var(--muted)", padding: "7px 10px" }}>RESPONSE</span>
                  {VIEW_TABS.map(t => (
                    <button key={t} className={`tab-item ${resTab === t ? "active" : ""}`} onClick={() => setResTab(t)}>{t}</button>
                  ))}
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 10, fontSize: 11, color: "var(--muted)" }}>
                  <span style={{ color: statusColor(selected.statusCode), fontWeight: 700, fontFamily: "monospace" }}>{selected.statusCode}</span>
                  <span>{selected.timeMs}ms</span>
                  <span>{formatBytes(selected.responseLength)}</span>
                </div>
              </div>
              <div style={{ flex: 1, overflow: "auto" }}>
                <ResponseView entry={selected} tab={resTab} />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 12 }}>
            Select a request to view details
          </div>
        )}
      </div>
    </div>
  );
}
