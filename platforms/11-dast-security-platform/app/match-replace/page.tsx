"use client";
import { useState } from "react";
import { RefreshCw, Plus, Trash2 } from "lucide-react";

interface Rule {
  id:      string;
  enabled: boolean;
  scope:   "request" | "response" | "both";
  matchIn: "url" | "header" | "body" | "cookie";
  match:   string;
  replaceIn: "header" | "body" | "url";
  replaceKey: string;
  replaceVal: string;
  notes:   string;
}

const DEFAULT_RULES: Rule[] = [
  { id: "r1", enabled: true,  scope: "request",  matchIn: "url",    match: "/api/*",            replaceIn: "header", replaceKey: "Authorization",      replaceVal: "Bearer {{access_token}}", notes: "Inject auth token on all API calls" },
  { id: "r2", enabled: true,  scope: "request",  matchIn: "header", match: "X-Debug: true",     replaceIn: "header", replaceKey: "X-Debug",            replaceVal: "",                       notes: "Strip debug header before sending" },
  { id: "r3", enabled: true,  scope: "response", matchIn: "header", match: "Server",            replaceIn: "header", replaceKey: "Server",              replaceVal: "",                       notes: "Remove Server header for analysis" },
  { id: "r4", enabled: false, scope: "request",  matchIn: "url",    match: "staging.acme.com",  replaceIn: "url",    replaceKey: "Host",               replaceVal: "prod.acme.com",          notes: "Redirect staging → prod (disabled)" },
  { id: "r5", enabled: true,  scope: "request",  matchIn: "body",   match: "\"user_id\"",        replaceIn: "body",   replaceKey: "user_id",            replaceVal: "1001",                   notes: "IDOR test — override user ID" },
  { id: "r6", enabled: false, scope: "both",     matchIn: "header", match: "Content-Security-Policy", replaceIn: "header", replaceKey: "Content-Security-Policy", replaceVal: "", notes: "Remove CSP for XSS testing" },
];

export default function MatchReplacePage() {
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);

  const addRule = () => setRules(rs => [...rs, {
    id: Date.now().toString(), enabled: true, scope: "request", matchIn: "url",
    match: "", replaceIn: "header", replaceKey: "", replaceVal: "", notes: "",
  }]);
  const update = (id: string, field: keyof Rule, val: string | boolean) =>
    setRules(rs => rs.map(r => r.id === id ? { ...r, [field]: val } : r));

  const active = rules.filter(r => r.enabled).length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <RefreshCw size={13} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>Match &amp; Replace Rules</span>
        <span style={{ fontSize: 11, color: "var(--green)" }}>{active} active</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>· {rules.length - active} disabled</span>
        <div style={{ marginLeft: "auto" }}>
          <button className="btn-primary" onClick={addRule}><Plus size={11} /> Add Rule</button>
        </div>
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        <table className="data-table" style={{ fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ width: 28 }} />
              <th style={{ width: 80 }}>Scope</th>
              <th style={{ width: 80 }}>Match In</th>
              <th>Match Pattern</th>
              <th style={{ width: 80 }}>Replace In</th>
              <th>Key</th>
              <th>Value</th>
              <th>Notes</th>
              <th style={{ width: 28 }} />
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id} style={{ opacity: r.enabled ? 1 : 0.4 }}>
                <td>
                  <input type="checkbox" checked={r.enabled} style={{ accentColor: "var(--primary)" }}
                    onChange={e => update(r.id, "enabled", e.target.checked)} />
                </td>
                <td>
                  <select className="tool-select" value={r.scope} onChange={e => update(r.id, "scope", e.target.value)} style={{ fontSize: 10, padding: "2px 4px", color: r.scope === "request" ? "var(--blue)" : r.scope === "response" ? "var(--green)" : "var(--yellow)" }}>
                    <option value="request">Request</option>
                    <option value="response">Response</option>
                    <option value="both">Both</option>
                  </select>
                </td>
                <td>
                  <select className="tool-select" value={r.matchIn} onChange={e => update(r.id, "matchIn", e.target.value)} style={{ fontSize: 10, padding: "2px 4px" }}>
                    <option value="url">URL</option>
                    <option value="header">Header</option>
                    <option value="body">Body</option>
                    <option value="cookie">Cookie</option>
                  </select>
                </td>
                <td><input className="kv-input" value={r.match} placeholder="Pattern…" style={{ fontFamily: "monospace", fontSize: 10.5, color: "var(--yellow)" }} onChange={e => update(r.id, "match", e.target.value)} /></td>
                <td>
                  <select className="tool-select" value={r.replaceIn} onChange={e => update(r.id, "replaceIn", e.target.value)} style={{ fontSize: 10, padding: "2px 4px" }}>
                    <option value="header">Header</option>
                    <option value="body">Body</option>
                    <option value="url">URL</option>
                  </select>
                </td>
                <td><input className="kv-input" value={r.replaceKey} placeholder="Header / field…" style={{ fontFamily: "monospace", fontSize: 10.5 }} onChange={e => update(r.id, "replaceKey", e.target.value)} /></td>
                <td><input className="kv-input" value={r.replaceVal} placeholder="New value (empty = remove)…" style={{ fontFamily: "monospace", fontSize: 10.5, color: r.replaceVal.startsWith("{{") ? "var(--yellow)" : undefined }} onChange={e => update(r.id, "replaceVal", e.target.value)} /></td>
                <td><input className="kv-input" value={r.notes} placeholder="Notes…" style={{ fontSize: 10.5 }} onChange={e => update(r.id, "notes", e.target.value)} /></td>
                <td>
                  <button onClick={() => setRules(rs => rs.filter(x => x.id !== r.id))} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                    <Trash2 size={11} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: "6px 12px", borderTop: "1px solid var(--border)", flexShrink: 0, fontSize: 10.5, color: "var(--muted)" }}>
        Rules are applied in order top-to-bottom · <span style={{ color: "var(--yellow)", fontFamily: "monospace" }}>{"{{variable}}"}</span> substitution supported in values
      </div>
    </div>
  );
}
