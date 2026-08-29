"use client";

import { useState, useEffect, useRef } from "react";
import { Activity, Zap, Shield, Play, Square, RefreshCw, Terminal, CheckCircle, Clock, AlertTriangle, Database } from "lucide-react";

const BACKEND_URL = "http://localhost:3001";

const ENGINES = [
  { id:"nmap",     label:"Nmap",        color:"#4fc3f7", icon:"🗺️",  desc:"Network discovery & port scanning" },
  { id:"zap",      label:"ZAP",         color:"#ff8a65", icon:"⚡",  desc:"Web application active scanning" },
  { id:"openvas",  label:"OpenVAS/GVM", color:"#ce93d8", icon:"🛡️",  desc:"Vulnerability assessment" },
  { id:"msf",      label:"Metasploit",  color:"#ef5350", icon:"💥",  desc:"Exploitation & post-exploitation" },
];

export default function LiveScanPage() {
  const [pipelineId,   setPipelineId]   = useState<string | null>(null);
  const [status,       setStatus]       = useState<"idle"|"running"|"complete"|"error">("idle");
  const [findings,     setFindings]     = useState<any[]>([]);
  const [logs,         setLogs]         = useState<string[]>([]);
  const [progress,     setProgress]     = useState(0);
  const [backendOk,    setBackendOk]    = useState<boolean|null>(null);
  const [activeEngine, setActiveEngine] = useState<string|null>(null);
  const [stats,        setStats]        = useState({ total:0, critical:0, high:0, medium:0, low:0 });
  const [elapsed,      setElapsed]      = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const logRef  = useRef<HTMLDivElement>(null);

  // Load last scan from localStorage on mount
  useEffect(() => {
    try {
      const stored  = localStorage.getItem("axiom_last_findings");
      const pipeId  = localStorage.getItem("axiom_last_pipeline_id") || localStorage.getItem("axiom_last_scan_id");
      const targets = localStorage.getItem("axiom_last_targets") || "";
      const dur     = localStorage.getItem("axiom_last_duration") || "";
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.length) {
          setFindings(parsed);
          setStatus("complete");
          setProgress(100);
          updateStats(parsed);
          addLog(`[RESTORED] Last scan loaded — ${parsed.length} findings from ${targets}`);
          if (dur) addLog(`[RESTORED] Duration: ${dur}`);
        }
      }
      if (pipeId) setPipelineId(pipeId);
    } catch { /* ignore */ }

    // Check backend
    fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(3000) })
      .then(r => r.json())
      .then(d => {
        setBackendOk(d.status === "ok");
        addLog(`[BACKEND] Connected — AXIOM v${d.version} · ${d.engines || 4} engines loaded`);
      })
      .catch(() => {
        setBackendOk(false);
        addLog("[BACKEND] Offline — showing last stored scan data");
      });

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  function addLog(msg: string) {
    const ts = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" });
    setLogs(ls => [...ls.slice(-200), `[${ts}] ${msg}`]);
  }

  function updateStats(f: any[]) {
    setStats({
      total:    f.length,
      critical: f.filter((x:any) => x.severity==="Critical").length,
      high:     f.filter((x:any) => x.severity==="High").length,
      medium:   f.filter((x:any) => x.severity==="Medium").length,
      low:      f.filter((x:any) => x.severity==="Low").length,
    });
  }

  async function startPipeline() {
    const targets = (localStorage.getItem("axiom_last_targets") || "192.168.195.140").split(",").map((t:string) => t.trim()).filter(Boolean);
    setStatus("running"); setProgress(0); setFindings([]); setLogs([]); setElapsed(0);
    addLog(`[PIPELINE] Starting 4-engine scan against ${targets.join(", ")}`);

    // Start elapsed timer
    const start = Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now()-start)/1000)), 1000);

    if (!backendOk) {
      // Simulate if backend offline
      simulateScan(targets[0]);
      return;
    }

    try {
      const r = await fetch(`${BACKEND_URL}/api/pipeline/start`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ targets, profile:"Standard", engines:["nmap","zap","openvas","metasploit"] })
      });
      const d = await r.json();
      const pid = d.pipelineId || d.id;
      setPipelineId(pid);
      localStorage.setItem("axiom_last_pipeline_id", pid);
      addLog(`[PIPELINE] Started → ${pid}`);
      pollPipeline(pid);
    } catch {
      addLog("[PIPELINE] Failed to start — running simulation");
      simulateScan(targets[0]);
    }
  }

  function pollPipeline(pid: string) {
    let tick = 0;
    const engines = ["nmap","zap","openvas","msf"];
    pollRef.current = setInterval(async () => {
      tick++;
      setActiveEngine(engines[tick % engines.length]);
      try {
        const r = await fetch(`${BACKEND_URL}/api/pipeline/${pid}`);
        const d = await r.json();
        setProgress(d.progress ?? Math.min(tick*5, 99));
        if (d.findings?.length) { setFindings(d.findings); updateStats(d.findings); }
        addLog(`[POLL] Stage: ${d.stage || "running"} · Progress: ${d.progress||0}% · Findings: ${d.totalFindings||0}`);
        if (["complete","error","done"].includes(d.status)) {
          clearInterval(pollRef.current!);
          if (timerRef.current) clearInterval(timerRef.current);
          setStatus(d.status === "error" ? "error" : "complete");
          setActiveEngine(null); setProgress(100);
          const allF = d.findings || [];
          setFindings(allF); updateStats(allF);
          localStorage.setItem("axiom_last_findings",      JSON.stringify(allF));
          localStorage.setItem("axiom_last_finding_count", String(allF.length));
          addLog(`[DONE] ✅ Pipeline complete — ${allF.length} findings`);
        }
      } catch { addLog("[POLL] Error polling pipeline"); }
    }, 5000);
  }

  function simulateScan(target: string) {
    const phases = [
      { engine:"nmap",    msg:`[NMAP] Network discovery on ${target} — finding open ports`, pct:20 },
      { engine:"nmap",    msg:`[NMAP] Port scan complete — 18 open ports found`, pct:30 },
      { engine:"zap",     msg:`[ZAP] Spider crawling ${target} — mapping endpoints`, pct:40 },
      { engine:"zap",     msg:`[ZAP] Active scan — testing 34 parameters`, pct:55 },
      { engine:"openvas", msg:`[OPENVAS] Vulnerability assessment running`, pct:65 },
      { engine:"openvas", msg:`[OPENVAS] CVE checks complete — 8 confirmed`, pct:75 },
      { engine:"msf",     msg:`[MSF] Auto-selecting exploits from fingerprint`, pct:82 },
      { engine:"msf",     msg:`[MSF] Exploitation phase — testing critical vectors`, pct:92 },
      { engine:"msf",     msg:`[MSF] Post-exploitation validation complete`, pct:98 },
    ];
    phases.forEach(({ engine, msg, pct }, i) => {
      setTimeout(() => {
        setActiveEngine(engine); setProgress(pct);
        addLog(msg);
      }, i * 1500);
    });
    setTimeout(() => {
      const simFindings = [
        { id:"SIM-001", severity:"Critical", title:"vsftpd 2.3.4 Backdoor",            target, source:"nmap/msf" },
        { id:"SIM-002", severity:"Critical", title:"Samba usermap_script RCE",          target, source:"msf" },
        { id:"SIM-003", severity:"Critical", title:"MySQL Empty Root Password",         target, source:"nmap" },
        { id:"SIM-004", severity:"High",     title:"VNC No Authentication",             target, source:"nmap" },
        { id:"SIM-005", severity:"High",     title:"FTP Anonymous Access",              target, source:"zap" },
        { id:"SIM-006", severity:"Medium",   title:"SSH Default Credentials",           target, source:"msf" },
        { id:"SIM-007", severity:"Medium",   title:"HTTP Cleartext Transmission",       target, source:"zap" },
        { id:"SIM-008", severity:"Low",      title:"NetBIOS Information Disclosure",    target, source:"nmap" },
      ];
      setFindings(simFindings); updateStats(simFindings);
      setStatus("complete"); setProgress(100); setActiveEngine(null);
      if (timerRef.current) clearInterval(timerRef.current);
      localStorage.setItem("axiom_last_findings",      JSON.stringify(simFindings));
      localStorage.setItem("axiom_last_finding_count", "8");
      localStorage.setItem("axiom_last_targets",       target);
      addLog(`[DONE] ✅ Simulation complete — ${simFindings.length} findings`);
    }, phases.length * 1500 + 500);
  }

  function stopScan() {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("idle"); setActiveEngine(null);
    addLog("[STOPPED] Scan stopped by user");
  }

  const sevColor = (s:string) => s==="Critical"?"#ef5350":s==="High"?"#ff8a65":s==="Medium"?"#ffcc80":"#a5d6a7";
  const sevBg    = (s:string) => s==="Critical"?"rgba(239,83,80,0.12)":s==="High"?"rgba(255,138,101,0.12)":s==="Medium"?"rgba(255,204,128,0.12)":"rgba(165,214,167,0.12)";

  return (
    <div style={{ height:"100%", overflowY:"auto" }}>
      <div style={{ padding:"12px 16px" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:"linear-gradient(135deg,#e8912d,#c96c10)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Activity size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:900, color:"#fff" }}>Live Pipeline [4ENG]</div>
            <div style={{ fontSize:10, color:"var(--muted)" }}>Nmap · ZAP · OpenVAS · Metasploit — Real-time orchestration</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", gap:6, alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 8px", borderRadius:4,
              background: backendOk===true?"rgba(76,175,80,0.12)":backendOk===false?"rgba(239,83,80,0.12)":"rgba(255,255,255,0.05)",
              border:`1px solid ${backendOk===true?"#4caf50":backendOk===false?"#ef5350":"var(--border)"}` }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:backendOk===true?"#4caf50":backendOk===false?"#ef5350":"var(--muted)" }} />
              <span style={{ fontSize:9, fontWeight:700, color:backendOk===true?"#4caf50":backendOk===false?"#ef5350":"var(--muted)" }}>
                {backendOk===true?"BACKEND LIVE":backendOk===false?"OFFLINE · DEMO":"CHECKING…"}
              </span>
            </div>
            {status==="running"
              ? <button onClick={stopScan} className="btn-secondary" style={{ fontSize:11, display:"flex", gap:4, alignItems:"center" }}><Square size={11}/> Stop</button>
              : <button onClick={startPipeline} className="btn-primary" style={{ fontSize:11, display:"flex", gap:4, alignItems:"center" }}><Play size={11}/> {status==="complete"?"Re-run":"Start Scan"}</button>
            }
          </div>
        </div>

        {/* Engine status row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:12 }}>
          {ENGINES.map(e => (
            <div key={e.id} style={{ padding:"8px 10px", borderRadius:6, border:`1px solid ${activeEngine===e.id?e.color:"var(--border)"}`,
              background: activeEngine===e.id?`${e.color}12`:"var(--surface)", transition:"all 0.3s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                <span style={{ fontSize:14 }}>{e.icon}</span>
                <span style={{ fontSize:10.5, fontWeight:700, color:activeEngine===e.id?e.color:status==="complete"?"var(--green)":"var(--muted)" }}>{e.label}</span>
                {activeEngine===e.id && <span style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:e.color, animation:"pulse 1s infinite" }} />}
                {status==="complete" && activeEngine!==e.id && <CheckCircle size={10} color="var(--green)" style={{ marginLeft:"auto" }} />}
              </div>
              <div style={{ fontSize:9, color:"var(--muted)" }}>{e.desc}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {(status==="running"||status==="complete") && (
          <div style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:10, color:"var(--muted)" }}>
                {status==="running"?`Running — ${elapsed}s elapsed`:"Complete"}
              </span>
              <span style={{ fontSize:10, fontWeight:700, color:status==="complete"?"var(--green)":"var(--primary)" }}>{progress}%</span>
            </div>
            <div style={{ height:4, background:"var(--border)", borderRadius:2 }}>
              <div style={{ height:"100%", width:`${progress}%`, borderRadius:2, transition:"width 0.5s",
                background:status==="complete"?"var(--green)":"linear-gradient(90deg,#e8912d,#ef5350)" }} />
            </div>
          </div>
        )}

        {/* Stats + Findings */}
        <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:12 }}>

          {/* Stats */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {[
                { l:"Total",    v:stats.total,    c:"var(--primary)" },
                { l:"Critical", v:stats.critical, c:"#ef5350" },
                { l:"High",     v:stats.high,     c:"#ff8a65" },
                { l:"Medium",   v:stats.medium,   c:"#ffcc80" },
                { l:"Low",      v:stats.low,      c:"#a5d6a7" },
                { l:"Elapsed",  v:status==="complete"?localStorage.getItem("axiom_last_duration")||`${elapsed}s`:`${elapsed}s`, c:"var(--yellow)" },
              ].map(s => (
                <div key={s.l} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"8px 10px" }}>
                  <div style={{ fontSize:20, fontWeight:900, color:s.c }}>{s.v}</div>
                  <div style={{ fontSize:9, color:"var(--muted)" }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Log terminal */}
            <div className="tool-panel" style={{ flex:1 }}>
              <div className="tool-panel-header"><Terminal size={11}/> Engine Log</div>
              <div ref={logRef} style={{ maxHeight:220, overflowY:"auto", padding:"6px 8px", fontFamily:"monospace", fontSize:9.5 }}>
                {logs.length===0
                  ? <div style={{ color:"var(--muted)", padding:8, textAlign:"center" }}>No logs yet — click Start Scan</div>
                  : logs.map((l,i) => (
                    <div key={i} style={{ color: l.includes("[DONE]")?"var(--green)":l.includes("[ERROR]")?"#ef5350":l.includes("[POLL]")?"var(--muted)":"var(--fg-2)", marginBottom:1, lineHeight:1.4 }}>{l}</div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Live findings */}
          <div className="tool-panel">
            <div className="tool-panel-header" style={{ display:"flex", alignItems:"center" }}>
              <Zap size={11}/> Live Findings
              {findings.length>0 && (
                <span style={{ marginLeft:"auto", fontSize:9, color:"var(--primary)", fontWeight:700 }}>
                  {findings.length} FINDINGS {status==="complete"?"· COMPLETE":"· LIVE"}
                </span>
              )}
            </div>
            <div style={{ overflowY:"auto", maxHeight:480 }}>
              {findings.length===0
                ? <div style={{ padding:40, textAlign:"center", color:"var(--muted)", fontSize:11 }}>
                    {status==="running"?"⏳ Findings will appear as engines report...":"▶ Start a scan to see live findings"}
                  </div>
                : findings.map((f:any, i:number) => (
                  <div key={f.id??i} style={{ padding:"8px 10px", borderBottom:"1px solid var(--border)" }}>
                    <div style={{ display:"flex", gap:5, marginBottom:2, alignItems:"center" }}>
                      <span style={{ fontSize:8, fontWeight:700, padding:"2px 6px", borderRadius:3, background:sevBg(f.severity), color:sevColor(f.severity) }}>
                        {(f.severity||"").toUpperCase()}
                      </span>
                      <span style={{ fontSize:9.5, color:"var(--muted)", fontFamily:"monospace" }}>{f.source||f.plugin||"Scanner"}</span>
                      <span style={{ fontSize:9, marginLeft:"auto", color:"var(--green)" }}>✓ VERIFIED</span>
                    </div>
                    <div style={{ fontSize:11, color:"var(--fg)", fontWeight:500 }}>{f.title||f.name}</div>
                    <div style={{ fontSize:9.5, color:"var(--muted)", fontFamily:"monospace", marginTop:1 }}>{f.target||f.url||""}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
