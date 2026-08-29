"use client";
import { useState } from "react";
import { ENVIRONMENTS } from "@/data/findings";
import type { Environment, KVPair } from "@/types/api";
import { Plus, Trash2, Eye, EyeOff, Globe2, CheckCircle } from "lucide-react";

const GLOBAL_VARS: KVPair[] = [
  { id: "g1", key: "app_name",     value: "ACME Corp",         enabled: true },
  { id: "g2", key: "api_version",  value: "v2",                enabled: true },
  { id: "g3", key: "timeout_ms",   value: "5000",              enabled: true },
];

const VARIABLE_SCOPES = [
  { scope: "Global",       color: "#ce93d8", vars: GLOBAL_VARS,                    desc: "Shared across all environments and collections" },
  { scope: "Workspace",    color: "#4fc3f7", vars: [{ id: "w1", key: "team", value: "security-team", enabled: true }], desc: "Scoped to this workspace" },
];

export default function EnvironmentsPage() {
  const [envs, setEnvs]         = useState<Environment[]>(ENVIRONMENTS);
  const [selected, setSelected] = useState(ENVIRONMENTS.find(e => e.active)!);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  const setActive = (id: string) => {
    setEnvs(es => es.map(e => ({ ...e, active: e.id === id })));
    setSelected(envs.find(e => e.id === id) ?? selected);
  };

  const addVar = () => {
    const newVar: KVPair = { id: Date.now().toString(), key: "", value: "", enabled: true };
    const updated = { ...selected, vars: [...selected.vars, newVar] };
    setSelected(updated);
    setEnvs(es => es.map(e => e.id === selected.id ? updated : e));
  };

  const updateVar = (id: string, field: keyof KVPair, value: string | boolean) => {
    const updated = { ...selected, vars: selected.vars.map(v => v.id === id ? { ...v, [field]: value } : v) };
    setSelected(updated);
    setEnvs(es => es.map(e => e.id === selected.id ? updated : e));
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Globe2 size={12} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>Environments & Variables</span>
        <div style={{ marginLeft: "auto" }}>
          <button className="btn-secondary"><Plus size={11} /> New Environment</button>
        </div>
      </div>

      <div className="split-h" style={{ flex: 1 }}>
        {/* Left: env list */}
        <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {/* Variable scopes */}
            <div style={{ padding: "6px 12px", fontSize: 9.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>Scopes</div>
            {VARIABLE_SCOPES.map(s => (
              <div key={s.scope} style={{ padding: "7px 12px", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(13,148,136,0.03)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11.5, color: "var(--foreground)" }}>{s.scope}</span>
                  <span style={{ fontSize: 9, color: "var(--muted)", marginLeft: "auto" }}>{s.vars.length} vars</span>
                </div>
                <div style={{ fontSize: 9.5, color: "var(--muted)", marginTop: 2, paddingLeft: 13 }}>{s.desc}</div>
              </div>
            ))}

            {/* Environments */}
            <div style={{ padding: "6px 12px", fontSize: 9.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", marginTop: 6 }}>Environments</div>
            {envs.map(env => (
              <div key={env.id}
                onClick={() => setSelected(env)}
                style={{
                  padding: "8px 12px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                  background: selected.id === env.id ? "rgba(13,148,136,0.08)" : "transparent",
                  borderLeft: selected.id === env.id ? "2px solid var(--primary)" : "2px solid transparent",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: env.active ? "var(--green)" : "var(--muted)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: env.active ? 600 : 400, color: env.active ? "var(--foreground)" : "var(--muted)", flex: 1 }}>{env.name}</span>
                  {env.active && <CheckCircle size={11} color="var(--green)" />}
                </div>
                <div style={{ fontSize: 10, color: "var(--muted)", paddingLeft: 13 }}>{env.vars.length} variables</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: variable editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "8px 12px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{selected.name}</span>
            {selected.active && <span className="pill" style={{ background: "rgba(13,148,136,0.1)", color: "var(--primary)" }}>ACTIVE</span>}
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              {!selected.active && (
                <button className="btn-primary" onClick={() => setActive(selected.id)} style={{ fontSize: 11 }}>
                  Set Active
                </button>
              )}
              <button className="btn-secondary" onClick={addVar} style={{ fontSize: 11 }}><Plus size={10} /> Add Variable</button>
            </div>
          </div>

          {/* Hint */}
          <div style={{ padding: "6px 12px", fontSize: 10.5, color: "var(--muted)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            Use <span style={{ color: "var(--yellow)", fontFamily: "monospace" }}>{"{{variable_name}}"}</span> in requests to substitute values.
            Secret variables are masked and encrypted at rest.
          </div>

          {/* Variable table */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 28 }} />
                  <th>Variable</th>
                  <th>Initial Value</th>
                  <th>Current Value</th>
                  <th style={{ width: 65 }}>Type</th>
                  <th style={{ width: 35 }} />
                </tr>
              </thead>
              <tbody>
                {selected.vars.map(v => (
                  <tr key={v.id}>
                    <td>
                      <input type="checkbox" checked={v.enabled} style={{ accentColor: "var(--primary)" }}
                        onChange={e => updateVar(v.id, "enabled", e.target.checked)} />
                    </td>
                    <td>
                      <input className="kv-input" value={v.key} placeholder="variable_name"
                        style={{ color: "var(--yellow)", fontFamily: "monospace" }}
                        onChange={e => updateVar(v.id, "key", e.target.value)} />
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <input className="kv-input"
                          type={v.secret && !showSecret[v.id] ? "password" : "text"}
                          value={v.value} placeholder="value"
                          style={{ color: v.value.startsWith("{{") ? "var(--yellow)" : "var(--foreground)", fontFamily: "monospace" }}
                          onChange={e => updateVar(v.id, "value", e.target.value)} />
                        {v.secret && (
                          <button onClick={() => setShowSecret(s => ({ ...s, [v.id]: !s[v.id] }))}
                            style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", flexShrink: 0 }}>
                            {showSecret[v.id] ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)" }}>{v.value.startsWith("{{") ? <span style={{ color: "var(--yellow)" }}>{v.value}</span> : v.value.length > 20 ? v.value.slice(0, 20) + "…" : v.value}</span>
                    </td>
                    <td>
                      <button onClick={() => updateVar(v.id, "secret", !v.secret)}
                        className="btn-secondary" style={{ padding: "2px 6px", fontSize: 9.5, color: v.secret ? "var(--primary)" : "var(--muted)" }}>
                        {v.secret ? "🔒 Secret" : "Public"}
                      </button>
                    </td>
                    <td>
                      <button onClick={() => {
                        const updated = { ...selected, vars: selected.vars.filter(x => x.id !== v.id) };
                        setSelected(updated);
                        setEnvs(es => es.map(e => e.id === selected.id ? updated : e));
                      }} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* JSON preview */}
          <div style={{ borderTop: "1px solid var(--border)", flexShrink: 0 }}>
            <div style={{ padding: "4px 12px", fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", background: "var(--surface-2)" }}>JSON Preview</div>
            <pre style={{ padding: "10px 12px", fontSize: 11, color: "#a5d6a7", fontFamily: "monospace", overflowX: "auto", background: "var(--background)", maxHeight: 130 }}>
              {JSON.stringify(Object.fromEntries(selected.vars.filter(v => v.enabled).map(v => [v.key, v.secret ? "***" : v.value])), null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
