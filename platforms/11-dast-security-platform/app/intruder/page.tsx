"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Square, Trash2, ShieldAlert, Code, Eye, Settings, FileText, Plus, X, Pause, RefreshCw, Layers, Sliders, CheckSquare, Search, Info, Globe, Shield, Zap } from "lucide-react";
import { statusColor } from "@/lib/utils";

type FuzzMode = "Focus Spike" | "Blast Wave" | "Multi-Vector" | "Matrix Fusion";
type MutationType = "Simple List" | "Numerical Range" | "Brute Combinations" | "Null Baselines";
type MainTab = "target" | "coordinates" | "mutations" | "sentinels";

const PRESET_MUTATIONS = {
  SQLi: [
    "' OR 1=1 --",
    "' UNION SELECT username, password FROM users--",
    "admin' --",
    "'; DROP TABLE logs; --",
    "' AND 1=2 UNION SELECT 1, @@version, 3--",
    "1' OR '1'='1",
    "admin' AND '1'='1"
  ],
  XSS: [
    "<script>alert(1)</script>",
    "<img src=x onerror=alert(1)>",
    "javascript:alert(1)",
    "<svg onload=alert(1)>",
    "'\"><script>confirm(document.cookie)</script>",
    "<iframe src=javascript:alert(1)>"
  ],
  PathTraversal: [
    "../../../../etc/passwd",
    "..\\..\\..\\windows\\win.ini",
    "/etc/passwd",
    "....//....//etc/passwd",
    "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd"
  ],
  CmdInjection: [
    "; cat /etc/passwd",
    "| id",
    "& whoami",
    "&& ping -c 4 127.0.0.1",
    "\nwhoami\n"
  ]
};

interface IntruderResult {
  id: number;
  payload: string;
  status: number;
  length: number;
  timeMs: number;
  match: boolean;
  anomalyReason: string;
  error: boolean;
  rawRequest: string;
  rawResponse: string;
}

const BASE_REQUEST = `POST /api/products/search HTTP/1.1
Host: 192.168.195.140
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9.sig
Accept: application/json
Content-Type: application/json
User-Agent: DAST-Workstation/3.0

{
  "category": "electronics",
  "query": "§laptops§",
  "limit": 10
}`;

export default function IntruderPage() {
  const [activeTab, setActiveTab] = useState<MainTab>("coordinates");
  
  // Target Configurations (Target Anchor)
  const [targetHost, setTargetHost] = useState("192.168.195.140");
  const [targetPort, setTargetPort] = useState("80");
  const [useHttps, setUseHttps] = useState(false);
  const [mode, setMode] = useState<FuzzMode>("Focus Spike");

  // Coordinates Tab (Positions)
  const [request, setRequest] = useState(BASE_REQUEST);
  const requestTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Mutations Tab (Payloads)
  const [mutationType, setMutationType] = useState<MutationType>("Simple List");
  const [mutationList, setMutationList] = useState<string[]>(PRESET_MUTATIONS.SQLi);
  const [newMutationItem, setNewMutationItem] = useState("");
  
  // Numerical Range Settings
  const [numFrom, setNumFrom] = useState(1);
  const [numTo, setNumTo] = useState(10);
  const [numStep, setNumStep] = useState(1);

  // Sentinels Tab (Grep Matches)
  const [sentinels, setSentinels] = useState([
    { id: "sql", phrase: "SQL syntax", enabled: true },
    { id: "root", phrase: "root:x", enabled: true },
    { id: "xss", phrase: "alert(1)", enabled: false },
    { id: "error", phrase: "Internal Server Error", enabled: true }
  ]);
  const [newSentinelPhrase, setNewSentinelPhrase] = useState("");

  // Attack execution / window state
  const [attackActive, setAttackActive] = useState(false);
  const [attackPaused, setAttackPaused] = useState(false);
  const [attackProgress, setAttackProgress] = useState(0);
  const [attackResults, setAttackResults] = useState<IntruderResult[]>([]);
  const [selectedAttackRow, setSelectedAttackRow] = useState<IntruderResult | null>(null);
  const [attackDetailTab, setAttackDetailTab] = useState<"request" | "response" | "insights">("request");

  const attackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync hostname from localstorage Target
  useEffect(() => {
    try {
      const targets = localStorage.getItem("axiom_last_targets");
      if (targets) {
        const primary = targets.split(",")[0]?.trim();
        if (primary) {
          setTargetHost(primary);
          setRequest(r => r.replace(/Host:\s*[^\s\r\n]+/g, `Host: ${primary}`));
        }
      }
    } catch {}
  }, []);

  // Request selections
  const addAnchor = () => {
    const el = requestTextareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) return; // No selection
    const text = el.value;
    const word = text.substring(start, end);
    const updated = text.substring(0, start) + `§${word}§` + text.substring(end);
    setRequest(updated);
  };

  const clearAnchors = () => {
    setRequest(r => r.replace(/§/g, ""));
  };

  const autoAnchors = () => {
    let updated = request;
    // Auto wrap JSON values
    updated = updated.replace(/"([^"]+)"\s*:\s*"([^"]+)"/g, '"$1": "§$2§"');
    // Auto wrap query parameters
    updated = updated.replace(/(\?|&)([^=]+)=([^&\s]+)/g, '$1$2=§$3§');
    setRequest(updated);
  };

  // Compile final mutations list
  const getCompiledMutations = (): string[] => {
    if (mutationType === "Simple List") {
      return mutationList;
    }
    if (mutationType === "Numerical Range") {
      const list: string[] = [];
      for (let i = numFrom; i <= numTo; i += numStep) {
        list.push(String(i));
      }
      return list;
    }
    if (mutationType === "Brute Combinations") {
      return ["a", "b", "c", "d", "e", "1", "2", "3", "admin", "guest"];
    }
    if (mutationType === "Null Baselines") {
      return Array(5).fill("");
    }
    return [];
  };

  // Trigger fuzzer modal attack window
  const launchAttack = () => {
    const activeMutations = getCompiledMutations();
    if (!activeMutations.length) return;

    setAttackActive(true);
    setAttackPaused(false);
    setAttackResults([]);
    setAttackProgress(0);
    setSelectedAttackRow(null);

    let idx = 0;
    const baselineLength = 482;

    attackTimerRef.current = setInterval(() => {
      if (attackPaused) return;

      if (idx >= activeMutations.length) {
        if (attackTimerRef.current) clearInterval(attackTimerRef.current);
        setAttackProgress(100);
        return;
      }

      const currentMutation = activeMutations[idx];
      const isSqlPhrase = currentMutation.includes("'") || currentMutation.includes("UNION") || currentMutation.includes("DROP");
      const isXssPhrase = currentMutation.includes("<script>") || currentMutation.includes("onerror");
      const isTraversalPhrase = currentMutation.includes("../") || currentMutation.includes("etc");

      let statusCode = 200;
      let respLength = baselineLength;
      let responseTime = 40 + Math.floor(Math.random() * 30);
      let responseBody = `{"status": "success", "results": [{"item": "ThinkPad T14", "price": 1299}]}`;

      if (isSqlPhrase) {
        if (currentMutation.includes("DROP") || currentMutation.includes("logs")) {
          statusCode = 500;
          respLength = 1254;
          responseBody = `{"error": "SQL Exception: Fatal Database syntax error near line 4: '; DROP TABLE logs; --'"}`;
        } else if (currentMutation.includes("UNION")) {
          statusCode = 200;
          respLength = 2240;
          responseTime = 190;
          responseBody = `[\n  {"username": "admin", "password_hash": "8c6976e5b5410415bde908bd4dee15dfb167a9c8"},\n  {"username": "manager", "password_hash": "21232f297a57a5a743894a0e4a801fc3"}\n]`;
        } else {
          statusCode = 500;
          respLength = 980;
          responseBody = `{"error": "Unclosed quotation mark after the character string."}`;
        }
      } else if (isXssPhrase) {
        statusCode = 200;
        respLength = baselineLength + currentMutation.length + 80;
        responseBody = `{"status": "success", "search_reflected": "${currentMutation.replace(/"/g, '\\"')}"}`;
      } else if (isTraversalPhrase) {
        statusCode = 200;
        respLength = 3450;
        responseBody = `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nsync:x:4:4:sync:/bin:/bin/sync`;
      }

      // Check greps / Sentinels
      const matchingGrepIds: string[] = [];
      sentinels.forEach(s => {
        if (s.enabled && responseBody.toLowerCase().includes(s.phrase.toLowerCase())) {
          matchingGrepIds.push(s.phrase);
        }
      });

      const requestStream = request.replace(/§[^§]+§/g, currentMutation);
      const responseStream = `HTTP/1.1 ${statusCode} ${statusCode === 200 ? "OK" : "Internal Server Error"}
Server: Nginx/1.18.0 (Ubuntu)
Content-Type: ${statusCode === 500 ? "text/html" : "application/json"}
Content-Length: ${respLength}
Connection: close

${responseBody}`;

      const newRow: IntruderResult = {
        id: idx + 1,
        payload: currentMutation,
        status: statusCode,
        length: respLength,
        timeMs: responseTime,
        match: matchingGrepIds.length > 0 || statusCode === 500,
        anomalyReason: statusCode === 500 ? "Server Crash (500 Error)" : matchingGrepIds.length > 0 ? `Sentinel detected: "${matchingGrepIds.join(", ")}"` : "",
        error: statusCode >= 500,
        rawRequest: requestStream,
        rawResponse: responseStream
      };

      setAttackResults(r => [...r, newRow]);
      setAttackProgress(Math.round(((idx + 1) / activeMutations.length) * 100));
      idx++;
    }, 180);
  };

  const closeAttackWindow = () => {
    if (attackTimerRef.current) clearInterval(attackTimerRef.current);
    setAttackActive(false);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg)", color: "var(--fg)" }}>
      
      {/* Configuration Header Tabs */}
      <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0, padding: "4px 8px" }}>
        <div style={{ display: "flex", gap: 2 }}>
          {[
            { id: "target", label: "Target Anchor", icon: Globe },
            { id: "coordinates", label: "Vector Coordinates", icon: Layers },
            { id: "mutations", label: "Mutation Sets", icon: Sliders },
            { id: "sentinels", label: "Response Sentinels", icon: CheckSquare }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as MainTab)}
              style={{
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: activeTab === t.id ? 700 : 400,
                color: activeTab === t.id ? "var(--primary)" : "var(--muted)",
                background: activeTab === t.id ? "var(--bg)" : "transparent",
                border: "1px solid transparent",
                borderBottomColor: activeTab === t.id ? "transparent" : "transparent",
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5
              }}
            >
              <t.icon size={12} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Start Fuzzing Trigger */}
        <button
          className="btn-primary"
          onClick={launchAttack}
          style={{
            marginLeft: "auto",
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 5
          }}
        >
          <Zap size={12} fill="currentColor" /> Ignite Attack
        </button>
      </div>

      {/* Main Tab View Contents */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        
        {/* ── TARGET CONFIG TAB ── */}
        {activeTab === "target" && (
          <div style={{ padding: 24, maxWidth: 540, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 16, background: "var(--surface)" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", marginBottom: 12 }}>DAST Target Anchor</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Host/IP Target Address:</span>
                  <input
                    className="tool-input"
                    value={targetHost}
                    onChange={e => setTargetHost(e.target.value)}
                    placeholder="e.g. 192.168.195.140"
                  />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>Port:</span>
                    <input
                      className="tool-input"
                      value={targetPort}
                      onChange={e => setTargetPort(e.target.value)}
                      placeholder="80"
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, marginTop: 16 }}>
                    <input
                      type="checkbox"
                      id="useHttps"
                      checked={useHttps}
                      onChange={e => setUseHttps(e.target.checked)}
                    />
                    <label htmlFor="useHttps" style={{ fontSize: 11, cursor: "pointer" }}>Use HTTPS</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 16, background: "var(--surface)" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", marginBottom: 8 }}>Attack Profile Mode</h3>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {(["Focus Spike", "Blast Wave", "Multi-Vector", "Matrix Fusion"] as FuzzMode[]).map(m => (
                  <button
                    key={m}
                    className="btn-secondary"
                    onClick={() => setMode(m)}
                    style={mode === m ? { borderColor: "var(--primary)", color: "var(--primary)", fontWeight: 700 } : {}}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
                {mode === "Focus Spike" && "🎯 Focus Spike mode maps a single set of payloads targeting coordinates sequentially (one position at a time)."}
                {mode === "Blast Wave" && "🐏 Blast Wave projects the exact same payload into all marked coordinate fields simultaneously."}
                {mode === "Multi-Vector" && "🔱 Multi-Vector runs discrete payload streams in parallel mapped directly to coordinates."}
                {mode === "Matrix Fusion" && "💣 Matrix Fusion executes comprehensive Cartesian cross-matrix combinations across all coordinates."}
              </div>
            </div>
          </div>
        )}

        {/* ── VECTOR COORDINATES TAB ── */}
        {activeTab === "coordinates" && (
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* Editor Area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)" }}>
              <div className="tool-panel-header" style={{ borderRadius: 0, border: "none", borderBottom: "1px solid var(--border)" }}>
                📄 HTTP PAYLOAD VECTOR LAYOUT
              </div>
              <textarea
                ref={requestTextareaRef}
                className="http-editor"
                style={{ flex: 1, fontFamily: "monospace", fontSize: 12, padding: 12, resize: "none", outline: "none", border: "none", background: "#080c10", color: "#c9d1d9" }}
                value={request}
                onChange={e => setRequest(e.target.value)}
                spellCheck={false}
              />
            </div>
            {/* Action Bar Panel */}
            <div style={{ width: 220, background: "var(--surface)", display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Coordinate Anchors</div>
              <div style={{ fontSize: 10.5, color: "var(--muted)", lineHeight: 1.5 }}>
                Highlight parts of the request structure and tap <strong>Add Anchor</strong> to inject insertion markers.
              </div>
              <button className="btn-primary" onClick={addAnchor} style={{ width: "100%", padding: "8px 0" }}>Add Anchor §</button>
              <button className="btn-secondary" onClick={clearAnchors} style={{ width: "100%", padding: "8px 0" }}>Clear Anchors</button>
              <button className="btn-secondary" onClick={autoAnchors} style={{ width: "100%", padding: "8px 0" }}>Auto Anchors</button>

              <div style={{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 12 }}>
                <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>Active Mode:</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>{mode}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── MUTATION SETS TAB ── */}
        {activeTab === "mutations" && (
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* Setup Form */}
            <div style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 16, background: "var(--surface)" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", marginBottom: 12 }}>Mutation Payload Configurations</h3>
                <div style={{ display: "flex", gap: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>Target Coordinate Set:</span>
                    <select className="tool-select" style={{ width: "100%" }}>
                      <option>1 (Anchors locked: {request.split("§").length > 1 ? Math.floor(request.split("§").length / 2) : 0})</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>Mutation Category:</span>
                    <select
                      className="tool-select"
                      style={{ width: "100%" }}
                      value={mutationType}
                      onChange={e => setMutationType(e.target.value as any)}
                    >
                      <option value="Simple List">Simple List</option>
                      <option value="Numerical Range">Numerical Range</option>
                      <option value="Brute Combinations">Brute Combinations</option>
                      <option value="Null Baselines">Null Baselines</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Conditional sub-types */}
              {mutationType === "Simple List" && (
                <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 16, background: "var(--surface)" }}>
                  <div style={{ display: "flex", justifyItems: "space-between", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>List Items ({mutationList.length})</h3>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-secondary" style={{ fontSize: 10, padding: "3px 8px" }} onClick={() => setMutationList(PRESET_MUTATIONS.SQLi)}>Load SQLi</button>
                      <button className="btn-secondary" style={{ fontSize: 10, padding: "3px 8px" }} onClick={() => setMutationList(PRESET_MUTATIONS.XSS)}>Load XSS</button>
                      <button className="btn-secondary" style={{ fontSize: 10, padding: "3px 8px" }} onClick={() => setMutationList(PRESET_MUTATIONS.PathTraversal)}>Load LFI</button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <input
                      className="tool-input"
                      placeholder="Add custom injection element"
                      value={newMutationItem}
                      onChange={e => setNewMutationItem(e.target.value)}
                      style={{ flex: 1 }}
                      onKeyDown={e => { if (e.key === "Enter" && newMutationItem.trim()) { setMutationList(m => [...m, newMutationItem]); setNewMutationItem(""); } }}
                    />
                    <button
                      className="btn-primary"
                      onClick={() => { if (newMutationItem.trim()) { setMutationList(m => [...m, newMutationItem]); setNewMutationItem(""); } }}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>

                  <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg)" }}>
                    {mutationList.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", borderBottom: "1px solid var(--border)", fontSize: 11, fontFamily: "monospace" }}>
                        <span>{item}</span>
                        <Trash2
                          size={12}
                          color="#ef5350"
                          style={{ cursor: "pointer" }}
                          onClick={() => setMutationList(m => m.filter((_, idx) => idx !== i))}
                        />
                      </div>
                    ))}
                    {mutationList.length === 0 && (
                      <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 11 }}>No payloads loaded. Add some above or load a preset.</div>
                    )}
                  </div>
                </div>
              )}

              {mutationType === "Numerical Range" && (
                <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 16, background: "var(--surface)", display: "flex", gap: 16 }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>From Value:</span>
                    <input className="tool-input" type="number" value={numFrom} onChange={e => setNumFrom(Number(e.target.value))} />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>To Value:</span>
                    <input className="tool-input" type="number" value={numTo} onChange={e => setNumTo(Number(e.target.value))} />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>Interval Step:</span>
                    <input className="tool-input" type="number" value={numStep} onChange={e => setNumStep(Number(e.target.value))} />
                  </div>
                </div>
              )}

              {mutationType === "Brute Combinations" && (
                <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 16, background: "var(--surface)", fontSize: 11, color: "var(--muted)" }}>
                  🧬 Will automatically generate combination characters. Character set: <code>[a-z, 0-9]</code>. (Default 10 items for demo fuzzer).
                </div>
              )}

              {mutationType === "Null Baselines" && (
                <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 16, background: "var(--surface)", fontSize: 11, color: "var(--muted)" }}>
                  🌫️ Sends requests with empty payloads to test baseline server behaviors. Matches 5 request cycles.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RESPONSE SENTINELS TAB ── */}
        {activeTab === "sentinels" && (
          <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
            
            {/* Grep Match Config */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 16, background: "var(--surface)" }}>
              <div style={{ marginBottom: 4 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>Response Fingerprints</h3>
                <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>Check phrases to flag when found in response streams to identify vulnerabilities.</p>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  className="tool-input"
                  placeholder="e.g. database error, root:"
                  value={newSentinelPhrase}
                  onChange={e => setNewSentinelPhrase(e.target.value)}
                  style={{ flex: 1 }}
                  onKeyDown={e => { if (e.key === "Enter" && newSentinelPhrase.trim()) { setSentinels(s => [...s, { id: String(Date.now()), phrase: newSentinelPhrase, enabled: true }]); setNewSentinelPhrase(""); } }}
                />
                <button
                  className="btn-primary"
                  onClick={() => { if (newSentinelPhrase.trim()) { setSentinels(s => [...s, { id: String(Date.now()), phrase: newSentinelPhrase, enabled: true }]); setNewSentinelPhrase(""); } }}
                >
                  <Plus size={14} /> Add Sentinel
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {sentinels.map((grep) => (
                  <div key={grep.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", fontSize: 11 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "var(--fg)" }}>
                      <input
                        type="checkbox"
                        checked={grep.enabled}
                        onChange={e => setSentinels(sList => sList.map(s => s.id === grep.id ? { ...s, enabled: e.target.checked } : s))}
                      />
                      <code>{grep.phrase}</code>
                    </label>
                    <Trash2
                      size={12}
                      color="#ef5350"
                      style={{ cursor: "pointer" }}
                      onClick={() => setSentinels(sList => sList.filter(s => s.id !== grep.id))}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Performance */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 16, background: "var(--surface)", display: "flex", flexDirection: "column", gap: 8 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>Execution Options</h3>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Parallel Threads:</span>
                  <select className="tool-select" defaultValue="5">
                    <option>1 (Sequential)</option>
                    <option>5</option>
                    <option>10</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Delay Gap (ms):</span>
                  <input className="tool-input" type="number" defaultValue="200" />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── VECTOR ATTACK RUNNER WINDOW MODAL ── */}
      {attackActive && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 1000, height: "90vh", background: "#0a0d14", border: "1px solid var(--border)", borderRadius: 10, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            
            {/* Attack Window Title Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
              <div style={{ background: "rgba(232,145,45,0.15)", borderRadius: 4, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🚀</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>AXIOM Vector Attack — {mode} Mode</div>
                <div style={{ fontSize: 9.5, color: "var(--muted)" }}>Target URI: {useHttps ? "https" : "http"}://{targetHost}:{targetPort}</div>
              </div>
              
              {/* Controls */}
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {attackProgress < 100 && (
                  <button
                    className="btn-secondary"
                    style={{ fontSize: 11, padding: "4px 10px", display: "flex", gap: 4, alignItems: "center" }}
                    onClick={() => setAttackPaused(!attackPaused)}
                  >
                    {attackPaused ? <Play size={10} /> : <Pause size={10} />}
                    {attackPaused ? "Resume" : "Pause"}
                  </button>
                )}
                <button
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: "4px 10px", borderColor: "#ef5350", color: "#ef5350" }}
                  onClick={closeAttackWindow}
                >
                  <X size={12} style={{ marginRight: 4 }} /> Close Attack
                </button>
              </div>
            </div>

            {/* Stats Summary & Progress Bar */}
            <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", justifyItems: "space-between", flexWrap: "wrap", gap: 20 }}>
              <div style={{ display: "flex", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>Progress</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{attackProgress}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>Queries Sent</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{attackResults.length} / {getCompiledMutations().length}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>Signals Flagged</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#ff8a65" }}>{attackResults.filter(r => r.match).length}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>Fails (5xx)</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#ef5350" }}>{attackResults.filter(r => r.error).length}</div>
                </div>
              </div>
              
              {/* Progress bar fill */}
              <div style={{ flex: 1, height: 4, background: "var(--bg)", borderRadius: 2, overflow: "hidden", minWidth: 150 }}>
                <div style={{ height: "100%", width: `${attackProgress}%`, background: "linear-gradient(90deg, var(--primary), var(--green))" }} />
              </div>
            </div>

            {/* Split View Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              
              {/* Results Table */}
              <div style={{ flex: 1, overflowY: "auto", borderBottom: "1px solid var(--border)" }}>
                <table className="data-table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>Index</th>
                      <th>Mutation Payload</th>
                      <th style={{ width: 70 }}>Response</th>
                      <th style={{ width: 85 }}>Data Size</th>
                      <th style={{ width: 70 }}>Latency</th>
                      {sentinels.map(s => s.enabled && (
                        <th key={s.id} style={{ width: 100 }}>Signal: "{s.phrase}"</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attackResults.map((r) => {
                      const isSelected = selectedAttackRow?.id === r.id;
                      return (
                        <tr
                          key={r.id}
                          className={isSelected ? "selected" : ""}
                          onClick={() => setSelectedAttackRow(r)}
                          style={r.match ? { background: "rgba(232,145,45,0.06)", cursor: "pointer" } : { cursor: "pointer" }}
                        >
                          <td style={{ color: "var(--muted)", fontSize: 10 }}>{r.id}</td>
                          <td style={{ fontFamily: "monospace", fontSize: 11, color: r.match ? "var(--primary)" : "var(--fg)" }}>{r.payload}</td>
                          <td style={{ color: statusColor(r.status), fontFamily: "monospace", fontWeight: 700 }}>{r.status}</td>
                          <td style={{ fontFamily: "monospace" }}>{r.length} bytes</td>
                          <td style={{ color: "var(--muted)", fontFamily: "monospace" }}>{r.timeMs}ms</td>
                          {sentinels.map(s => s.enabled && (
                            <td key={s.id} style={{ textAlign: "center" }}>
                              {r.rawResponse.toLowerCase().includes(s.phrase.toLowerCase()) ? (
                                <span style={{ color: "var(--primary)", fontWeight: 900 }}>●</span>
                              ) : (
                                <span style={{ color: "var(--muted)", opacity: 0.2 }}>○</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Raw Panel */}
              <div style={{ height: 260, display: "flex", flexDirection: "column", background: "var(--surface)", flexShrink: 0 }}>
                {selectedAttackRow ? (
                  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--surface-2)", flexShrink: 0, padding: "0 8px" }}>
                      <button
                        onClick={() => setAttackDetailTab("request")}
                        style={{ padding: "6px 12px", border: "none", background: "none", color: attackDetailTab === "request" ? "var(--primary)" : "var(--muted)", borderBottom: attackDetailTab === "request" ? "2px solid var(--primary)" : "2px solid transparent", cursor: "pointer", fontSize: 11, fontWeight: attackDetailTab === "request" ? 700 : 400, display: "flex", alignItems: "center", gap: 4 }}
                      >
                        <Code size={11} /> Request
                      </button>
                      <button
                        onClick={() => setAttackDetailTab("response")}
                        style={{ padding: "6px 12px", border: "none", background: "none", color: attackDetailTab === "response" ? "var(--primary)" : "var(--muted)", borderBottom: attackDetailTab === "response" ? "2px solid var(--primary)" : "2px solid transparent", cursor: "pointer", fontSize: 11, fontWeight: attackDetailTab === "response" ? 700 : 400, display: "flex", alignItems: "center", gap: 4 }}
                      >
                        <Eye size={11} /> Response
                      </button>
                      <button
                        onClick={() => setAttackDetailTab("insights")}
                        style={{ padding: "6px 12px", border: "none", background: "none", color: attackDetailTab === "insights" ? "var(--primary)" : "var(--muted)", borderBottom: attackDetailTab === "insights" ? "2px solid var(--primary)" : "2px solid transparent", cursor: "pointer", fontSize: 11, fontWeight: attackDetailTab === "insights" ? 700 : 400, display: "flex", alignItems: "center", gap: 4 }}
                      >
                        <Info size={11} /> Sentinel Insights
                      </button>
                    </div>

                    <div style={{ flex: 1, padding: 12, overflow: "auto", background: "#080c10" }}>
                      {attackDetailTab === "request" && (
                        <pre style={{ margin: 0, fontFamily: "monospace", fontSize: 11, color: "#8be9fd", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                          {selectedAttackRow.rawRequest}
                        </pre>
                      )}
                      {attackDetailTab === "response" && (
                        <pre style={{ margin: 0, fontFamily: "monospace", fontSize: 11, color: selectedAttackRow.match ? "#ff79c6" : "#a5d6a7", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                          {selectedAttackRow.rawResponse}
                        </pre>
                      )}
                      {attackDetailTab === "insights" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11, color: "var(--fg-2)" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <span style={{ color: "var(--muted)" }}>Target URI:</span>
                            <code style={{ color: "#79c0ff" }}>{targetHost}:{targetPort}</code>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <span style={{ color: "var(--muted)" }}>Mutation Injected:</span>
                            <code style={{ color: "var(--yellow)", background: "var(--bg)", padding: "1px 4px", borderRadius: 3 }}>{selectedAttackRow.payload}</code>
                          </div>
                          {selectedAttackRow.match && (
                            <div style={{ background: "rgba(232,145,45,0.08)", border: "1px solid rgba(232,145,45,0.25)", borderRadius: 6, padding: "8px 10px", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                              <ShieldAlert size={14} color="var(--primary)" />
                              <div>
                                <strong style={{ color: "var(--primary)" }}>Signal Triggered:</strong> {selectedAttackRow.anomalyReason}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 12 }}>
                    Select a result row above to inspect the HTTP Stream (Request/Response)
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
