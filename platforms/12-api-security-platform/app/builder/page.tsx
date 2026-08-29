"use client";
import { useState, useRef } from "react";
import { methodColor, methodBg, statusColor, formatMs, formatBytes } from "@/lib/utils";
import type { HttpMethod, BodyType, AuthType } from "@/types/api";
import { Play, Plus, Trash2, Shield, ChevronDown, RefreshCw, CheckCircle, XCircle } from "lucide-react";

type ReqTab = "Params" | "Headers" | "Auth" | "Body" | "Pre-request" | "Tests";
type ResTab = "Pretty" | "Raw" | "Headers" | "Cookies" | "Timeline" | "Security";

interface KVRow { id: string; key: string; value: string; enabled: boolean; secret?: boolean; }
interface TestResult { name: string; passed: boolean; error?: string; }
interface SecCheck { name: string; status: "pass" | "fail" | "warn" | "skip"; detail: string; }

const METHODS: HttpMethod[] = ["GET","POST","PUT","PATCH","DELETE","OPTIONS","HEAD"];
const BODY_TYPES: BodyType[] = ["none","json","xml","form-data","urlencoded","raw","graphql","binary"];
const AUTH_TYPES: AuthType[] = ["none","bearer","basic","apikey","oauth2","jwt","digest","mtls"];

const DEFAULT_HEADERS: KVRow[] = [
  { id: "h1", key: "Accept", value: "application/json", enabled: true },
  { id: "h2", key: "Content-Type", value: "application/json", enabled: true },
  { id: "h3", key: "User-Agent", value: "API-Workstation/2.0", enabled: true },
];

const MOCK_RESPONSE = {
  status: 200, statusText: "OK", protocol: "HTTP/2", time: 142, size: 2481,
  body: JSON.stringify({
    token: "eyJhbGciOiJSUzI1NiJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImV4cCI6MTc1MDAwMDAwMH0.signature",
    user: { id: 1, email: "admin@acme.com", role: "admin" },
  }, null, 2),
  headers: [
    { id: "rh1", key: "Content-Type", value: "application/json; charset=utf-8", enabled: true },
    { id: "rh2", key: "X-Request-Id", value: "req-abc123", enabled: true },
    { id: "rh3", key: "Cache-Control", value: "no-store", enabled: true },
    { id: "rh4", key: "Strict-Transport-Security", value: "max-age=31536000", enabled: true },
    { id: "rh5", key: "X-Content-Type-Options", value: "nosniff", enabled: true },
  ],
  cookies: [{ id: "c1", key: "session", value: "abc123; HttpOnly; Secure; SameSite=Strict", enabled: true }],
  timeline: [
    { phase: "DNS Lookup",  ms: 2  },
    { phase: "TCP Connect", ms: 8  },
    { phase: "TLS Handshake", ms: 34 },
    { phase: "Request Sent", ms: 1  },
    { phase: "Wait (TTFB)", ms: 89 },
    { phase: "Content Download", ms: 8 },
  ],
  security: [
    { name: "HSTS header present",          status: "pass",  detail: "Strict-Transport-Security: max-age=31536000" },
    { name: "X-Content-Type-Options",        status: "pass",  detail: "nosniff" },
    { name: "Content-Security-Policy",       status: "fail",  detail: "CSP header not found in response" },
    { name: "X-Frame-Options",               status: "fail",  detail: "Header missing — clickjacking risk" },
    { name: "Sensitive data in response",    status: "warn",  detail: "Response contains 'token' — verify TTL and scope" },
    { name: "HTTP/2 protocol",               status: "pass",  detail: "HTTP/2 in use" },
    { name: "No version disclosure",         status: "pass",  detail: "No server version header found" },
    { name: "Referrer-Policy",               status: "fail",  detail: "Header not present" },
  ] as SecCheck[],
  tests: [
    { name: "Status is 200",                 passed: true },
    { name: "Token returned",                passed: true },
    { name: "Response time < 500ms",         passed: true },
    { name: "Content-Type is JSON",          passed: true },
  ] as TestResult[],
};

const SECURITY_ATTACK_LOGS = [
  "[AUTH]      Testing JWT alg:none bypass...",
  "[AUTH]      Testing JWT secret brute-force (top-100)...",
  "[AUTHZ]     Testing BOLA — incrementing ID by ±10...",
  "[AUTHZ]     Testing privilege escalation via role: admin...",
  "[INJECTION] Testing SQLi in all parameters...",
  "[INJECTION] Testing XXE via Content-Type header...",
  "[CONFIG]    Checking CORS preflight headers...",
  "[CONFIG]    Checking rate limiting (50 requests)...",
  "[EXPOSURE]  Checking for sensitive fields in response...",
  "[DONE]      Security test complete — 3 issues found",
];

export default function BuilderPage() {
  const [method,  setMethod]  = useState<HttpMethod>("POST");
  const [url,     setUrl]     = useState("{{base_url}}/auth/login");
  const [reqTab,  setReqTab]  = useState<ReqTab>("Body");
  const [resTab,  setResTab]  = useState<ResTab>("Pretty");
  const [body,    setBody]    = useState('{\n  "username": "{{username}}",\n  "password": "{{password}}"\n}');
  const [bodyType, setBodyType] = useState<BodyType>("json");
  const [authType, setAuthType] = useState<AuthType>("none");
  const [authToken, setAuthToken] = useState("{{access_token}}");
  const [headers, setHeaders] = useState<KVRow[]>(DEFAULT_HEADERS);
  const [params,  setParams]  = useState<KVRow[]>([{ id: "p1", key: "", value: "", enabled: true }]);
  const [preScript, setPreScript] = useState("// Pre-request script\n// pm.environment.set('timestamp', Date.now());\n// pm.request.headers.add({key:'X-Request-ID', value: pm.variables.replaceIn('{{$guid}}')});");
  const [testScript, setTestScript] = useState('test("Status is 200", () => {\n  expect(response.status).toBe(200);\n});\n\ntest("Token returned", () => {\n  expect(response.json.token).toBeDefined();\n});\n\ntest("Response time < 500ms", () => {\n  expect(response.time).toBeLessThan(500);\n});\n\n// Save to environment\npm.environment.set("access_token", response.json.token);');
  const [sending,  setSending]  = useState(false);
  const [response, setResponse] = useState<typeof MOCK_RESPONSE | null>(null);
  const [secRunning, setSecRunning] = useState(false);
  const [secLogs, setSecLogs] = useState<string[]>([]);
  const [reqName, setReqName] = useState("Login");

  const addRow = (arr: KVRow[], set: React.Dispatch<React.SetStateAction<KVRow[]>>) => {
    set([...arr, { id: Date.now().toString(), key: "", value: "", enabled: true }]);
  };
  const updateRow = (arr: KVRow[], set: React.Dispatch<React.SetStateAction<KVRow[]>>, id: string, field: keyof KVRow, value: string | boolean) => {
    set(arr.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const send = async () => {
    setSending(true); setResponse(null);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
    const ms = Math.floor(Math.random() * 80 + 100);
    setResponse({ ...MOCK_RESPONSE, time: ms });
    setSending(false); setResTab("Pretty");
  };

  const runSecurity = async () => {
    setSecRunning(true); setSecLogs([]); setResTab("Security");
    for (const log of SECURITY_ATTACK_LOGS) {
      await new Promise(r => setTimeout(r, 500));
      setSecLogs(l => [...l, log]);
    }
    setSecRunning(false);
    setResponse(MOCK_RESPONSE);
  };

  const KVEditor = ({ rows, set, title }: { rows: KVRow[]; set: React.Dispatch<React.SetStateAction<KVRow[]>>; title: string }) => (
    <div style={{ padding: "8px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 12px 8px", fontSize: 10.5, color: "var(--muted)" }}>
        <span>{title}</span>
        <button className="btn-secondary" style={{ padding: "2px 8px", fontSize: 10 }} onClick={() => addRow(rows, set)}>
          <Plus size={9} /> Add
        </button>
      </div>
      <div className="kv-table">
        <div style={{ display: "flex", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          <div style={{ width: 28, padding: "4px 8px", flexShrink: 0 }} />
          <div style={{ flex: 1, padding: "4px 8px" }}>Key</div>
          <div style={{ flex: 1, padding: "4px 8px" }}>Value</div>
          <div style={{ width: 28, padding: "4px 8px", flexShrink: 0 }} />
        </div>
        {rows.map(r => (
          <div key={r.id} className="kv-row">
            <div style={{ width: 28, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", flexShrink: 0 }}>
              <input type="checkbox" checked={r.enabled} style={{ accentColor: "var(--primary)", width: 12, height: 12 }}
                onChange={e => updateRow(rows, set, r.id, "enabled", e.target.checked)} />
            </div>
            <input className="kv-input" style={{ flex: 1, padding: "5px 8px", opacity: r.enabled ? 1 : 0.4 }}
              value={r.key} placeholder="Key" onChange={e => updateRow(rows, set, r.id, "key", e.target.value)} />
            <input className="kv-input" style={{ flex: 1, padding: "5px 8px", opacity: r.enabled ? 1 : 0.4, color: r.value?.startsWith("{{") ? "var(--yellow)" : undefined }}
              value={r.value} placeholder="Value" onChange={e => updateRow(rows, set, r.id, "value", e.target.value)} />
            <button style={{ width: 28, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", flexShrink: 0 }}
              onClick={() => set(rows.filter(x => x.id !== r.id))}><Trash2 size={10} /></button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* URL Bar */}
      <div style={{ padding: "8px 12px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <input className="tool-input" value={reqName} onChange={e => setReqName(e.target.value)}
            style={{ width: 180, fontSize: 11, padding: "4px 8px" }} placeholder="Request name" />
          <select className="tool-select" style={{ fontSize: 11 }}>
            <option>ACME API v2 / Authentication</option>
            <option>ACME API v2 / Security Tests</option>
          </select>
          <button className="btn-secondary" style={{ fontSize: 11, marginLeft: "auto", gap: 4 }}>Save</button>
        </div>
        <div className="url-bar" style={{ marginBottom: 6 }}>
          <select className="url-method-select" value={method} onChange={e => setMethod(e.target.value as HttpMethod)}
            style={{ color: methodColor(method), fontSize: 13 }}>
            {METHODS.map(m => <option key={m} style={{ color: methodColor(m) }}>{m}</option>)}
          </select>
          <input className="url-input" value={url} onChange={e => setUrl(e.target.value)} placeholder="{{base_url}}/endpoint" />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn-primary" onClick={send} disabled={sending}
            style={sending ? { opacity: 0.6, cursor: "wait" } : {}}>
            {sending ? <RefreshCw size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Play size={12} />}
            {sending ? "Sending…" : "Send"}
          </button>
          <button className="btn-secondary" onClick={runSecurity}
            style={{ borderColor: "rgba(13,148,136,0.5)", color: "var(--primary)" }}>
            <Shield size={11} /> Security Test
          </button>
          {response && (
            <div style={{ marginLeft: "auto", display: "flex", gap: 10, fontSize: 11, alignItems: "center" }}>
              <span style={{ color: statusColor(response.status), fontWeight: 700, fontFamily: "monospace" }}>{response.status} {response.statusText}</span>
              <span style={{ color: "var(--muted)" }}>{formatMs(response.time)}</span>
              <span style={{ color: "var(--muted)" }}>{formatBytes(response.size)}</span>
              <span style={{ color: "var(--muted)" }}>{response.protocol}</span>
              <span style={{ color: response.tests.every(t=>t.passed) ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
                {response.tests.filter(t=>t.passed).length}/{response.tests.length} tests
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Split: request | response */}
      <div className="split-h" style={{ flex: 1 }}>
        {/* Request pane */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)" }}>
          <div className="tab-bar">
            {(["Params","Headers","Auth","Body","Pre-request","Tests"] as ReqTab[]).map(t => (
              <button key={t} className={`tab-item ${reqTab===t?"active":""}`} onClick={() => setReqTab(t)}>{t}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            {reqTab === "Params" && <KVEditor rows={params} set={setParams} title="Query Parameters" />}
            {reqTab === "Headers" && <KVEditor rows={headers} set={setHeaders} title="Request Headers" />}
            {reqTab === "Auth" && (
              <div style={{ padding: 12 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)", lineHeight: "28px" }}>Type:</span>
                  <select className="tool-select" value={authType} onChange={e => setAuthType(e.target.value as AuthType)}>
                    {AUTH_TYPES.map(a => <option key={a} value={a}>{
                      a === "none" ? "No Auth" : a === "bearer" ? "Bearer Token" : a === "basic" ? "Basic Auth" :
                      a === "apikey" ? "API Key" : a === "oauth2" ? "OAuth 2.0 / OIDC" : a === "jwt" ? "JWT" :
                      a === "digest" ? "Digest" : "mTLS / Client Cert"
                    }</option>)}
                  </select>
                </div>
                {authType === "bearer" && (
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>Token</div>
                    <input className="tool-input" value={authToken} onChange={e => setAuthToken(e.target.value)}
                      style={{ fontFamily: "monospace", color: authToken.startsWith("{{") ? "var(--yellow)" : undefined }} />
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>Header: <span style={{ color: "var(--primary)", fontFamily: "monospace" }}>Authorization: Bearer {authToken}</span></div>
                  </div>
                )}
                {authType === "basic" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>Username</div><input className="tool-input" placeholder="{{username}}" /></div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>Password</div><input className="tool-input" type="password" placeholder="{{password}}" /></div>
                  </div>
                )}
                {authType === "apikey" && (
                  <div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <div style={{ flex: 1 }}><div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>Key</div><input className="tool-input" placeholder="X-API-Key" /></div>
                      <div style={{ flex: 1 }}><div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>Value</div><input className="tool-input" placeholder="{{api_key}}" /></div>
                      <div><div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>Add to</div>
                        <select className="tool-select"><option>Header</option><option>Query</option></select>
                      </div>
                    </div>
                  </div>
                )}
                {authType === "none" && (
                  <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 12 }}>No authentication configured</div>
                )}
              </div>
            )}
            {reqTab === "Body" && (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", gap: 6, padding: "6px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
                  {BODY_TYPES.map(t => (
                    <button key={t} onClick={() => setBodyType(t)}
                      className="btn-secondary" style={bodyType === t ? { borderColor: "var(--primary)", color: "var(--primary)" } : { padding: "3px 8px" }}
                      >{t}</button>
                  ))}
                </div>
                {bodyType === "none" ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 12 }}>This request has no body</div>
                ) : (
                  <textarea className="http-editor" style={{ flex: 1 }} value={body} onChange={e => setBody(e.target.value)} spellCheck={false} />
                )}
              </div>
            )}
            {reqTab === "Pre-request" && (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ padding: "6px 12px", borderBottom: "1px solid var(--border)", fontSize: 10, color: "var(--muted)", flexShrink: 0 }}>
                  JavaScript executed before sending request · <span style={{ color: "var(--primary)" }}>pm.environment</span> · <span style={{ color: "var(--primary)" }}>pm.request</span> · <span style={{ color: "var(--primary)" }}>pm.variables</span>
                </div>
                <textarea className="http-editor" style={{ flex: 1 }} value={preScript} onChange={e => setPreScript(e.target.value)} spellCheck={false} />
              </div>
            )}
            {reqTab === "Tests" && (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ padding: "6px 12px", borderBottom: "1px solid var(--border)", fontSize: 10, color: "var(--muted)", flexShrink: 0 }}>
                  Test assertions run after response · <span style={{ color: "var(--yellow)" }}>response.status</span> · <span style={{ color: "var(--yellow)" }}>response.json</span> · <span style={{ color: "var(--yellow)" }}>response.time</span>
                </div>
                <textarea className="http-editor" style={{ flex: 1 }} value={testScript} onChange={e => setTestScript(e.target.value)} spellCheck={false} />
              </div>
            )}
          </div>
        </div>

        {/* Response pane */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="tab-bar">
            {(["Pretty","Raw","Headers","Cookies","Timeline","Security"] as ResTab[]).map(t => (
              <button key={t} className={`tab-item ${resTab===t?"active":""}`} onClick={() => setResTab(t)}>
                {t}{t==="Security" && secRunning ? " ●" : ""}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            {!response && !secRunning && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)", gap: 8 }}>
                <Play size={24} color="var(--muted)" />
                <span style={{ fontSize: 12 }}>Click Send to get a response</span>
                <span style={{ fontSize: 11, color: "rgba(100,116,139,0.6)" }}>or Security Test to run OWASP checks</span>
              </div>
            )}
            {secRunning && (
              <div className="scanner-log" style={{ height: "100%" }}>
                {secLogs.map((l, i) => (
                  <div key={i} style={{ color: l.includes("DONE") ? "var(--green)" : l.startsWith("[AUTH]") ? "#ce93d8" : l.startsWith("[INJECTION]") ? "#ef5350" : "var(--blue)", marginBottom: 3 }}>
                    {l}
                  </div>
                ))}
                <div className="cursor" />
              </div>
            )}
            {response && resTab === "Pretty" && (
              <div className="http-raw"><pre style={{ color: "#a5d6a7" }}>{response.body}</pre></div>
            )}
            {response && resTab === "Raw" && (
              <div className="http-raw">{`HTTP/2 ${response.status} ${response.statusText}\n` + response.headers.map(h => `${h.key}: ${h.value}`).join("\n") + "\n\n" + response.body}</div>
            )}
            {response && resTab === "Headers" && (
              <div style={{ overflowY: "auto" }}>
                <table className="data-table">
                  <thead><tr><th>Header</th><th>Value</th></tr></thead>
                  <tbody>
                    {response.headers.map(h => (
                      <tr key={h.id}><td style={{ fontFamily: "monospace", color: "#80cbc4" }}>{h.key}</td><td style={{ fontFamily: "monospace", color: "#a5d6a7" }}>{h.value}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {response && resTab === "Cookies" && (
              <div style={{ overflowY: "auto" }}>
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Value</th></tr></thead>
                  <tbody>
                    {response.cookies.map(c => (
                      <tr key={c.id}><td style={{ fontFamily: "monospace", color: "#80cbc4" }}>{c.key}</td><td style={{ fontFamily: "monospace", color: "#a5d6a7", maxWidth: 350 }}>{c.value}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {response && resTab === "Timeline" && (
              <div style={{ padding: 12 }}>
                {response.timeline.map((t, i) => {
                  const totalMs = response.timeline.reduce((a, x) => a + x.ms, 0);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--muted)", width: 140, flexShrink: 0 }}>{t.phase}</span>
                      <div style={{ flex: 1, height: 14, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(t.ms / totalMs) * 100}%`, background: "var(--primary)", borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--muted)", width: 45, textAlign: "right" }}>{t.ms}ms</span>
                    </div>
                  );
                })}
                <div style={{ marginTop: 12, paddingTop: 8, borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--muted)" }}>
                  Total: <span style={{ color: "var(--green)", fontWeight: 700 }}>{response.timeline.reduce((a, t) => a + t.ms, 0)}ms</span>
                </div>
              </div>
            )}
            {response && resTab === "Security" && (
              <div>
                {!secRunning && secLogs.length > 0 && (
                  <div style={{ padding: "6px 12px", borderBottom: "1px solid var(--border)", fontSize: 10, color: "var(--muted)" }}>
                    Automated OWASP API Security checks complete
                  </div>
                )}
                {response.security.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 12px", borderBottom: "1px solid var(--border)" }}>
                    {s.status === "pass" && <CheckCircle size={13} color="var(--green)" style={{ flexShrink: 0, marginTop: 1 }} />}
                    {s.status === "fail" && <XCircle size={13} color="#ef5350" style={{ flexShrink: 0, marginTop: 1 }} />}
                    {(s.status === "warn" || s.status === "skip") && <ChevronDown size={13} color="var(--yellow)" style={{ flexShrink: 0, marginTop: 1 }} />}
                    <div>
                      <div style={{ fontSize: 11.5, color: s.status === "pass" ? "var(--foreground)" : s.status === "fail" ? "#ef5350" : "var(--yellow)", fontWeight: 500 }}>{s.name}</div>
                      <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>{s.detail}</div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "8px 12px", fontSize: 10.5, color: "var(--muted)" }}>
                  Tests: {response.tests.map(t => (
                    <span key={t.name} style={{ marginRight: 8, color: t.passed ? "var(--green)" : "#ef5350" }}>
                      {t.passed ? "✓" : "✗"} {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
