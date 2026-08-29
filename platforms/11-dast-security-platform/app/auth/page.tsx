"use client";
import { useState } from "react";
import { Shield, Play, CheckCircle, XCircle, Eye, EyeOff, RefreshCw, Plus, Trash2 } from "lucide-react";

type AuthType = "static" | "form" | "jwt" | "oauth" | "apikey" | "mtls";
type AuthStatus = "idle" | "testing" | "success" | "failed";

interface AuthConfig {
  id:       string;
  name:     string;
  type:     AuthType;
  target:   string;
  status:   AuthStatus;
  lastTested?: string;
  sessionInfo?: string;
}

const AUTH_CONFIGS: AuthConfig[] = [
  { id: "a1", name: "Admin User",     type: "form",   target: "/api/auth/login",    status: "success", lastTested: "14:22:03", sessionInfo: "sess_a1b2c3d4…" },
  { id: "a2", name: "Standard User",  type: "form",   target: "/api/auth/login",    status: "success", lastTested: "14:22:04", sessionInfo: "sess_f9e8d7c6…" },
  { id: "a3", name: "API Service",    type: "jwt",    target: "/api/auth/token",    status: "success", lastTested: "14:22:05", sessionInfo: "eyJhbGci…" },
  { id: "a4", name: "OAuth Test",     type: "oauth",  target: "/oauth/authorize",   status: "idle" },
  { id: "a5", name: "API Key",        type: "apikey", target: "X-API-Key header",   status: "idle" },
];

const FLOW_STEPS_FORM = [
  "Open login page",
  "Locate username field",
  "Enter credentials",
  "Locate password field",
  "Enter password",
  "Submit form",
  "Capture cookies / session token",
  "Verify authentication (check protected resource)",
  "Begin crawl with captured session",
];

const FLOW_STEPS_JWT = [
  "Send POST to /api/auth/token",
  "Parse access_token from response",
  "Verify token expiry",
  "Store Bearer token for all requests",
  "Monitor for 401 → re-authenticate",
];

export default function AuthPage() {
  const [configs, setConfigs] = useState<AuthConfig[]>(AUTH_CONFIGS);
  const [selected, setSelected] = useState<AuthConfig>(AUTH_CONFIGS[0]);
  const [showPw, setShowPw] = useState(false);
  const [testStatus, setTestStatus] = useState<AuthStatus>("idle");
  const [testLog, setTestLog] = useState<string[]>([]);

  const flowSteps = selected.type === "jwt" ? FLOW_STEPS_JWT : FLOW_STEPS_FORM;

  const testAuth = async () => {
    setTestStatus("testing"); setTestLog([]);
    for (let i = 0; i < flowSteps.length; i++) {
      await new Promise(r => setTimeout(r, 380));
      setTestLog(l => [...l, flowSteps[i]]);
    }
    await new Promise(r => setTimeout(r, 400));
    setTestStatus("success");
    setConfigs(cs => cs.map(c => c.id === selected.id ? { ...c, status: "success", lastTested: new Date().toLocaleTimeString(), sessionInfo: "sess_new_" + Date.now().toString(36) } : c));
  };

  const typeColor: Record<AuthType, string> = { static: "var(--muted)", form: "var(--primary)", jwt: "var(--yellow)", oauth: "#ce93d8", apikey: "var(--green)", mtls: "var(--blue)" };
  const typeBg:    Record<AuthType, string> = { static: "var(--surface)", form: "rgba(232,145,45,0.1)", jwt: "rgba(255,204,0,0.07)", oauth: "rgba(206,147,216,0.1)", apikey: "rgba(61,220,132,0.08)", mtls: "rgba(79,195,247,0.08)" };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Shield size={13} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>Authentication Manager</span>
        <span style={{ fontSize: 11, color: "var(--green)" }}>{configs.filter(c => c.status === "success").length} authenticated</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className="btn-secondary"><Plus size={11} /> Add Profile</button>
          <button className="btn-primary" onClick={testAuth} disabled={testStatus === "testing"}>
            {testStatus === "testing" ? <><RefreshCw size={11} style={{ animation: "spin 1s linear infinite" }} /> Testing…</> : <><Play size={11} /> Test Auth</>}
          </button>
        </div>
      </div>

      <div className="split-h" style={{ flex: 1 }}>
        {/* Auth profile list */}
        <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid var(--border)", overflowY: "auto" }}>
          {configs.map(cfg => (
            <div key={cfg.id} onClick={() => { setSelected(cfg); setTestStatus("idle"); setTestLog([]); }}
              style={{ padding: "9px 12px", borderBottom: "1px solid var(--border)", cursor: "pointer", borderLeft: selected.id === cfg.id ? "2px solid var(--primary)" : "2px solid transparent", background: selected.id === cfg.id ? "rgba(232,145,45,0.05)" : "transparent" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                {cfg.status === "success" ? <CheckCircle size={11} color="var(--green)" /> : cfg.status === "failed" ? <XCircle size={11} color="#ef5350" /> : <div style={{ width: 11, height: 11, borderRadius: "50%", border: "1.5px solid var(--muted)" }} />}
                <span style={{ fontSize: 12, fontWeight: selected.id === cfg.id ? 600 : 400, color: "var(--fg)" }}>{cfg.name}</span>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: typeColor[cfg.type], background: typeBg[cfg.type], padding: "1px 6px", borderRadius: 8 }}>{cfg.type.toUpperCase()}</span>
                {cfg.lastTested && <span style={{ fontSize: 9.5, color: "var(--muted)" }}>{cfg.lastTested}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Config editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{selected.name}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: typeColor[selected.type], background: typeBg[selected.type], padding: "2px 8px", borderRadius: 8 }}>{selected.type.toUpperCase()}</span>
              {selected.status === "success" && <span style={{ fontSize: 10, color: "var(--green)", marginLeft: 4 }}>✓ Authenticated</span>}
            </div>

            {/* Form / JWT fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              {selected.type === "form" || selected.type === "static" ? (
                <>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 3 }}>Login URL</div>
                    <input className="tool-input" defaultValue={selected.target} style={{ width: "100%" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 3 }}>Username field / value</div>
                    <input className="tool-input" defaultValue={'{"field":"email","value":"{{SECRET_USERNAME}}"}'} style={{ width: "100%", fontFamily: "monospace", fontSize: 10.5 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 3 }}>Password field / value</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <input className="tool-input" type={showPw ? "text" : "password"} defaultValue="{{SECRET_PASSWORD}}" style={{ flex: 1, fontFamily: "monospace", fontSize: 10.5 }} />
                      <button onClick={() => setShowPw(s => !s)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 4, color: "var(--muted)", cursor: "pointer", padding: "4px 6px" }}>
                        {showPw ? <EyeOff size={11} /> : <Eye size={11} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 3 }}>Verification URL (after login)</div>
                    <input className="tool-input" defaultValue="/api/users/me" style={{ width: "100%" }} />
                  </div>
                </>
              ) : selected.type === "jwt" ? (
                <>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 3 }}>Token endpoint</div>
                    <input className="tool-input" defaultValue={selected.target} style={{ width: "100%" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 3 }}>Token response path</div>
                    <input className="tool-input" defaultValue="$.access_token" style={{ fontFamily: "monospace" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 3 }}>Inject as header</div>
                    <input className="tool-input" defaultValue="Authorization: Bearer {{token}}" style={{ fontFamily: "monospace", fontSize: 10.5 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 3 }}>Expiry field (re-auth trigger)</div>
                    <input className="tool-input" defaultValue="$.expires_in" style={{ fontFamily: "monospace" }} />
                  </div>
                </>
              ) : selected.type === "apikey" ? (
                <>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 3 }}>Header / Query param</div>
                    <input className="tool-input" defaultValue="X-API-Key" style={{ fontFamily: "monospace" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 3 }}>Key value</div>
                    <input className="tool-input" type="password" defaultValue="{{SECRET_API_KEY}}" style={{ fontFamily: "monospace", fontSize: 10.5 }} />
                  </div>
                </>
              ) : (
                <div style={{ gridColumn: "1/-1", color: "var(--muted)", fontSize: 12 }}>Configure {selected.type.toUpperCase()} settings here</div>
              )}
            </div>

            {/* Extra options */}
            <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--muted)" }}>
              {[["Session cookie name", "session"], ["Success indicator", "200 + /api/users/me"], ["Role switching", "disabled"]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", gap: 4 }}>
                  <span>{l}:</span>
                  <span style={{ color: "var(--fg)", fontFamily: "monospace" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Automated flow + log */}
          <div className="split-h" style={{ flex: 1 }}>
            <div style={{ flex: 1, borderRight: "1px solid var(--border)", padding: 12, overflowY: "auto" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>Automated Login Flow</div>
              {flowSteps.map((step, i) => {
                const done = testLog.length > i;
                const active = testLog.length === i && testStatus === "testing";
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: done ? "rgba(61,220,132,0.1)" : active ? "rgba(232,145,45,0.1)" : "var(--surface)", border: `1.5px solid ${done ? "var(--green)" : active ? "var(--primary)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 9.5, color: done ? "var(--green)" : active ? "var(--primary)" : "var(--muted)", fontWeight: 700 }}>
                      {done ? "✓" : i + 1}
                    </div>
                    <span style={{ fontSize: 11.5, color: done ? "var(--fg)" : active ? "var(--primary)" : "var(--muted)", fontWeight: active ? 600 : 400 }}>{step}</span>
                    {active && <span className="animate-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} />}
                  </div>
                );
              })}
            </div>

            <div style={{ width: 280, flexShrink: 0, padding: 12, overflowY: "auto" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>Session State</div>
              {testStatus === "success" && (
                <div style={{ padding: 10, borderRadius: 6, background: "rgba(61,220,132,0.06)", border: "1px solid rgba(61,220,132,0.2)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 700, marginBottom: 5 }}>✓ Authentication Successful</div>
                  <div style={{ fontSize: 10.5, fontFamily: "monospace", color: "var(--muted)" }}>Token: {selected.sessionInfo ?? "sess_new_…"}</div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 3 }}>Verified: /api/users/me → 200</div>
                </div>
              )}
              <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 6 }}>Features enabled:</div>
              {["Session hijacking detection","Token expiry monitoring","Role-switch testing","401 → re-authenticate","Multi-user concurrency"].map(f => (
                <div key={f} style={{ display: "flex", gap: 5, fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: "var(--green)" }}>✓</span>
                  <span style={{ color: "var(--muted)" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
