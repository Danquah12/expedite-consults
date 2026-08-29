"use client";
import { useState } from "react";
import { Crosshair, Plus, Trash2, CheckCircle, XCircle, Globe } from "lucide-react";

interface ScopeRule {
  id:      string;
  type:    "include" | "exclude";
  match:   "domain" | "prefix" | "regex" | "extension";
  pattern: string;
  enabled: boolean;
  notes:   string;
}

const DEFAULT_RULES: ScopeRule[] = [
  { id: "r1", type: "include", match: "domain",    pattern: "app.target.local",           enabled: true,  notes: "Main application" },
  { id: "r2", type: "include", match: "domain",    pattern: "api.target.local",            enabled: true,  notes: "API server" },
  { id: "r3", type: "include", match: "prefix",    pattern: "https://app.target.local/api",enabled: true,  notes: "API endpoints" },
  { id: "r4", type: "exclude", match: "extension", pattern: ".png, .jpg, .gif, .css, .js", enabled: true,  notes: "Static assets" },
  { id: "r5", type: "exclude", match: "domain",    pattern: "cdn.target.local",            enabled: true,  notes: "CDN — avoid" },
  { id: "r6", type: "exclude", match: "prefix",    pattern: "/api/internal/logs",          enabled: true,  notes: "Internal diagnostics" },
  { id: "r7", type: "exclude", match: "regex",     pattern: ".*\\.well-known.*",           enabled: false, notes: "Standard endpoints" },
];

const IN_SCOPE  = 47;
const OUT_SCOPE = 12;
const SAMPLE_URLS = [
  { url: "https://app.target.local/",                       in: true  },
  { url: "https://app.target.local/login",                  in: true  },
  { url: "https://api.target.local/v2/users",               in: true  },
  { url: "https://api.target.local/v2/admin",               in: true  },
  { url: "https://cdn.target.local/assets/logo.png",        in: false },
  { url: "https://app.target.local/static/bundle.js",       in: false },
  { url: "https://api.target.local/internal/logs",          in: false },
  { url: "https://third-party.example.com/widget",          in: false },
];

export default function ScopePage() {
  const [rules, setRules] = useState<ScopeRule[]>(DEFAULT_RULES);

  const addRule = () => setRules(rs => [...rs, {
    id: Date.now().toString(), type: "include", match: "prefix", pattern: "", enabled: true, notes: "",
  }]);
  const update = (id: string, field: keyof ScopeRule, value: string | boolean) =>
    setRules(rs => rs.map(r => r.id === id ? { ...r, [field]: value } : r));

  const included = rules.filter(r => r.type === "include" && r.enabled).length;
  const excluded = rules.filter(r => r.type === "exclude" && r.enabled).length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Crosshair size={13} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>Scope Manager</span>
        <span style={{ fontSize: 11, color: "var(--green)", marginLeft: 8 }}>{IN_SCOPE} in-scope</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>·</span>
        <span style={{ fontSize: 11, color: "#ef5350" }}>{OUT_SCOPE} excluded</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className="btn-secondary" onClick={addRule}><Plus size={11} /> Add Rule</button>
          <button className="btn-primary">Apply to Engine</button>
        </div>
      </div>

      <div className="split-h" style={{ flex: 1 }}>
        {/* Rule editor */}
        <div style={{ flex: 1, borderRight: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="tool-panel-header" style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>Rules ({rules.length})</div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 28 }} />
                  <th style={{ width: 80 }}>Action</th>
                  <th style={{ width: 90 }}>Match Type</th>
                  <th>Pattern</th>
                  <th>Notes</th>
                  <th style={{ width: 32 }} />
                </tr>
              </thead>
              <tbody>
                {rules.map(r => (
                  <tr key={r.id} style={{ opacity: r.enabled ? 1 : 0.45 }}>
                    <td>
                      <input type="checkbox" checked={r.enabled} style={{ accentColor: "var(--primary)" }}
                        onChange={e => update(r.id, "enabled", e.target.checked)} />
                    </td>
                    <td>
                      <select className="tool-select" value={r.type} onChange={e => update(r.id, "type", e.target.value)}
                        style={{ color: r.type === "include" ? "var(--green)" : "#ef5350", fontSize: 11, padding: "3px 6px" }}>
                        <option value="include">Include</option>
                        <option value="exclude">Exclude</option>
                      </select>
                    </td>
                    <td>
                      <select className="tool-select" value={r.match} onChange={e => update(r.id, "match", e.target.value)} style={{ fontSize: 11, padding: "3px 6px" }}>
                        <option value="domain">Domain</option>
                        <option value="prefix">URL Prefix</option>
                        <option value="regex">Regex</option>
                        <option value="extension">Extension</option>
                      </select>
                    </td>
                    <td>
                      <input className="kv-input" value={r.pattern} placeholder="Pattern…"
                        style={{ fontFamily: "monospace", fontSize: 11, color: "var(--yellow)" }}
                        onChange={e => update(r.id, "pattern", e.target.value)} />
                    </td>
                    <td>
                      <input className="kv-input" value={r.notes} placeholder="Notes…" style={{ fontSize: 11 }}
                        onChange={e => update(r.id, "notes", e.target.value)} />
                    </td>
                    <td>
                      <button onClick={() => setRules(rs => rs.filter(x => x.id !== r.id))}
                        style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "6px 12px", borderTop: "1px solid var(--border)", flexShrink: 0, fontSize: 10.5, color: "var(--muted)" }}>
            {included} include rules · {excluded} exclude rules active
          </div>
        </div>

        {/* Scope preview */}
        <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div className="tool-panel-header" style={{ borderRadius: 0, borderTop: "none", borderRight: "none" }}>
            <Globe size={11} /> Scope Preview
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {SAMPLE_URLS.map((u, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 10px", borderBottom: "1px solid var(--border)" }}>
                {u.in
                  ? <CheckCircle size={12} color="var(--green)" style={{ flexShrink: 0 }} />
                  : <XCircle size={12} color="#ef5350" style={{ flexShrink: 0 }} />}
                <span style={{ fontSize: 10.5, fontFamily: "monospace", color: u.in ? "var(--muted)" : "rgba(100,116,139,0.5)", wordBreak: "break-all" }}>{u.url}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: "8px 10px", borderTop: "1px solid var(--border)", fontSize: 10, color: "var(--muted)" }}>
            <div style={{ color: "var(--green)" }}>✓ {IN_SCOPE} URLs in scope</div>
            <div style={{ color: "#ef5350" }}>✗ {OUT_SCOPE} URLs excluded</div>
          </div>
        </div>
      </div>
    </div>
  );
}
