"use client";
import { useState } from "react";
import { Play, Plus, X, Copy, RefreshCw } from "lucide-react";
import { statusColor } from "@/lib/utils";

const DEFAULT_REQUEST = `POST /api/auth/login HTTP/1.1
Host: app.target.local
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9.sig
Cookie: session=abc123; _ga=GA1.2.123456789
Accept: application/json
User-Agent: DAST-Workstation/2.0

{"username":"admin","password":"test123"}`;

const INITIAL_TABS = [
  { id: "1", label: "POST /api/auth/login",      request: DEFAULT_REQUEST,             response: "", status: undefined as number | undefined, timeMs: undefined as number | undefined, length: undefined as number | undefined },
  { id: "2", label: "GET /api/users/1001",        request: `GET /api/users/1001 HTTP/1.1\r\nHost: app.target.local\r\nAuthorization: Bearer eyJhbGci...\r\n`, response: "", status: undefined, timeMs: undefined, length: undefined },
  { id: "3", label: "GET /api/products/search",   request: `GET /api/products/search?q=' UNION SELECT username,password,3,4 FROM users-- HTTP/1.1\r\nHost: app.target.local\r\nAuthorization: Bearer eyJhbGci...\r\n`, response: "", status: undefined, timeMs: undefined, length: undefined },
];

const MOCK_RESPONSES: Record<string, { status: number; body: string; timeMs: number }> = {
  "1": { status: 200, body: `HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nSet-Cookie: authToken=eyJhbGciOiJSUzI1NiJ9...; HttpOnly; Secure\r\n\r\n{"token":"eyJhbGciOiJSUzI1NiJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9.signature","user":{"id":1,"email":"admin@acme.com","role":"admin"}}`, timeMs: 142 },
  "2": { status: 200, body: `HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"id":1001,"name":"Jane Smith","email":"jane@corp.com","ssn_last4":"7821","salary":94000,"role":"employee"}`, timeMs: 98 },
  "3": { status: 200, body: `HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n[{"id":"admin","name":"$2a$10$rBhvQtyV.H8MKl3rDT3pROJgZ...","price":3,"category":4}]`, timeMs: 287 },
};

type RTab = { id: string; label: string; request: string; response: string; status?: number; timeMs?: number; length?: number };

type ViewMode = "Raw" | "Pretty";

export default function RepeaterPage() {
  const [tabs, setTabs]       = useState<RTab[]>(INITIAL_TABS);
  const [activeId, setActive] = useState("1");
  const [sending, setSending] = useState(false);
  const [reqMode, setReqMode] = useState<ViewMode>("Raw");
  const [resMode, setResMode] = useState<ViewMode>("Raw");

  const active = tabs.find(t => t.id === activeId)!;

  const setRequest = (val: string) => setTabs(ts => ts.map(t => t.id === activeId ? { ...t, request: val } : t));

  const sendRequest = async () => {
    setSending(true);
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    const mock = MOCK_RESPONSES[activeId];
    if (mock) {
      setTabs(ts => ts.map(t => t.id === activeId ? {
        ...t, response: mock.body, status: mock.status,
        timeMs: mock.timeMs + Math.floor(Math.random() * 20),
        length: mock.body.length,
      } : t));
    } else {
      const ms = Math.floor(Math.random() * 300 + 80);
      setTabs(ts => ts.map(t => t.id === activeId ? {
        ...t, response: `HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"status":"ok"}`,
        status: 200, timeMs: ms, length: 40,
      } : t));
    }
    setSending(false);
  };

  const addTab = () => {
    const id = Date.now().toString();
    setTabs(ts => [...ts, { id, label: `New Request`, request: `GET / HTTP/1.1\r\nHost: app.target.local\r\n`, response: "", status: undefined, timeMs: undefined, length: undefined }]);
    setActive(id);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(ts => ts.filter(t => t.id !== id));
    if (activeId === id) setActive(tabs[0]?.id ?? "");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", alignItems: "center", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", flexShrink: 0, overflowX: "auto" }}>
        {tabs.map(t => (
          <div key={t.id}
            onClick={() => setActive(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 12px", cursor: "pointer", flexShrink: 0, fontSize: 11.5,
              borderRight: "1px solid var(--border)",
              borderBottom: activeId === t.id ? "2px solid var(--primary)" : "2px solid transparent",
              color: activeId === t.id ? "var(--fg)" : "var(--fg-2)",
              background: activeId === t.id ? "var(--surface)" : "transparent",
            }}>
            {t.status && <span style={{ color: statusColor(t.status), fontFamily: "monospace", fontWeight: 700 }}>{t.status}</span>}
            <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.label}</span>
            <X size={10} color="var(--muted)" onClick={e => closeTab(t.id, e)}
              onMouseEnter={e => { (e.currentTarget as unknown as HTMLElement).style.color = "var(--fg)"; }}
              onMouseLeave={e => { (e.currentTarget as unknown as HTMLElement).style.color = "var(--muted)"; }} />
          </div>
        ))}
        <button onClick={addTab} style={{ padding: "8px 12px", background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", flexShrink: 0 }}>
          <Plus size={12} />
        </button>
      </div>

      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
        background: "var(--surface-2)", borderBottom: "1px solid var(--border)", flexShrink: 0,
      }}>
        <button className="btn-primary" onClick={sendRequest} disabled={sending}
          style={sending ? { opacity: 0.6, cursor: "wait" } : {}}>
          {sending ? <RefreshCw size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Play size={12} />}
          {sending ? "Sending…" : "Send"}
        </button>
        <div style={{ width: 1, height: 18, background: "var(--border)" }} />
        <button className="btn-secondary"><Copy size={11} /> Copy</button>
        {active.timeMs && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, fontSize: 11, color: "var(--muted)" }}>
            {active.status && <span style={{ color: statusColor(active.status), fontWeight: 700, fontFamily: "monospace" }}>{active.status}</span>}
            {active.timeMs && <span>{active.timeMs}ms</span>}
            {active.length && <span>{formatBytes(active.length)}</span>}
          </div>
        )}
      </div>

      {/* Split: request editor | response */}
      <div className="split-h" style={{ flex: 1 }}>
        {/* Request */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)" }}>
          <div className="tab-bar">
            <span style={{ fontSize: 10.5, color: "var(--muted)", padding: "7px 10px" }}>REQUEST</span>
            {(["Raw","Pretty"] as ViewMode[]).map(v => (
              <button key={v} className={`tab-item ${reqMode===v?"active":""}`} onClick={() => setReqMode(v)}>{v}</button>
            ))}
          </div>
          <textarea
            className="http-editor"
            style={{ flex: 1, resize: "none" }}
            value={active.request}
            onChange={e => setRequest(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Response */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="tab-bar">
            <span style={{ fontSize: 10.5, color: "var(--muted)", padding: "7px 10px" }}>RESPONSE</span>
            {(["Raw","Pretty"] as ViewMode[]).map(v => (
              <button key={v} className={`tab-item ${resMode===v?"active":""}`} onClick={() => setResMode(v)}>{v}</button>
            ))}
          </div>
          {active.response ? (
            <div className="http-raw" style={{ flex: 1, overflow: "auto" }}>
              {active.response.split(/\r?\n/).map((line, i) => {
                if (i === 0) {
                  const isOk = active.status && active.status < 400;
                  return <div key={i} style={{ color: isOk ? "var(--green)" : "#ef5350", fontWeight: 700 }}>{line}</div>;
                }
                if (line.includes(":") && i < 8) {
                  const [k, ...v] = line.split(":");
                  return <div key={i}><span className="http-header-name">{k}</span>:<span className="http-header-value">{v.join(":")}</span></div>;
                }
                if (line === "") return <div key={i}>&nbsp;</div>;
                return <div key={i} className="http-body">{line}</div>;
              })}
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 12, flexDirection: "column", gap: 6 }}>
              <Play size={20} color="var(--muted)" />
              <span>Click Send to receive response</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b}B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)}KB`;
  return `${(b / 1048576).toFixed(1)}MB`;
}
