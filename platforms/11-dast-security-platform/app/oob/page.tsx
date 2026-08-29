"use client";
import { useState, useEffect, useRef } from "react";
import { Copy, Radio, Wifi, Globe, Trash2, Filter, CheckCircle, Activity } from "lucide-react";

type InteractionType = "DNS" | "HTTP" | "SMTP";

interface Interaction {
  id:        string;
  type:      InteractionType;
  sourceIP:  string;
  payloadId: string;
  findingId: string | null;
  protocol:  string;
  timestamp: Date;
  host:      string;
  details:   string;
}

const OOB_DOMAIN = "ax1m9f3k.axiom-oob.io";

const SEED_INTERACTIONS: Interaction[] = [
  { id:"int-001", type:"DNS",  sourceIP:"54.239.28.85",  payloadId:"oob-ssrf-b4f2a1c9", findingId:"F-003", protocol:"A",    timestamp:new Date(Date.now()-62000),  host:`ax1m9f3k.axiom-oob.io`, details:"DNS A record lookup from cloud metadata subnet" },
  { id:"int-002", type:"HTTP", sourceIP:"54.239.28.85",  payloadId:"oob-ssrf-b4f2a1c9", findingId:"F-003", protocol:"GET",  timestamp:new Date(Date.now()-61500),  host:`ax1m9f3k.axiom-oob.io`, details:"GET / HTTP/1.1 — User-Agent: python-requests/2.28.0" },
  { id:"int-003", type:"DNS",  sourceIP:"203.0.113.42",  payloadId:"oob-xxe-c8d3e7f2",  findingId:null,    protocol:"AAAA", timestamp:new Date(Date.now()-44000),  host:`ax1m9f3k.axiom-oob.io`, details:"DNS AAAA lookup — XXE OOB test (no HTTP follow-up, potential false)" },
  { id:"int-004", type:"HTTP", sourceIP:"10.0.1.88",     payloadId:"oob-cmdi-a1b2c3d4", findingId:"F-001", protocol:"POST", timestamp:new Date(Date.now()-22000),  host:`ax1m9f3k.axiom-oob.io`, details:"POST /oob HTTP/1.1 — Body contains exfiltrated DB fragment" },
  { id:"int-005", type:"DNS",  sourceIP:"192.168.1.100", payloadId:"oob-ssrf-e5f6a7b8", findingId:"F-003", protocol:"A",   timestamp:new Date(Date.now()-8000),   host:`ax1m9f3k.axiom-oob.io`, details:"DNS A lookup from internal network — confirms internal SSRF" },
];

const typeColor: Record<InteractionType, string> = { DNS:"#4fc3f7", HTTP:"#a5d6a7", SMTP:"#ce93d8" };
const typeIcon  = (t: InteractionType) => t === "DNS" ? <Globe size={10}/> : t === "HTTP" ? <Wifi size={10}/> : <Radio size={10}/>;

function relTime(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60)  return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

export default function OOBPage() {
  const [interactions, setInteractions] = useState<Interaction[]>(SEED_INTERACTIONS);
  const [filter, setFilter] = useState<"All"|InteractionType>("All");
  const [selected, setSelected] = useState<Interaction | null>(SEED_INTERACTIONS[1]);
  const [listening, setListening] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tick, setTick] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  // Tick for relative time refresh
  useEffect(() => { const t = setInterval(() => setTick(x=>x+1), 5000); return () => clearInterval(t); }, []);

  // Simulate new interaction arriving
  const simulateInteraction = () => {
    const types: InteractionType[] = ["DNS","HTTP","DNS"];
    const t = types[Math.floor(Math.random()*types.length)];
    const ni: Interaction = {
      id: `int-${Date.now()}`, type: t,
      sourceIP: `${Math.floor(Math.random()*200)+50}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
      payloadId:`oob-sim-${Math.random().toString(36).slice(2,10)}`,
      findingId: Math.random()>0.5 ? "F-003" : null,
      protocol: t === "DNS" ? "A" : "GET",
      timestamp: new Date(),
      host: OOB_DOMAIN,
      details: t === "DNS" ? "Simulated DNS A record lookup" : "Simulated HTTP GET callback",
    };
    setInteractions(is => [ni, ...is]);
    setSelected(ni);
  };

  const copy = () => { navigator.clipboard.writeText(OOB_DOMAIN); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const visible = filter === "All" ? interactions : interactions.filter(i => i.type === filter);
  const dnsCount  = interactions.filter(i=>i.type==="DNS").length;
  const httpCount = interactions.filter(i=>i.type==="HTTP").length;
  const correlated= interactions.filter(i=>i.findingId).length;

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ padding:"8px 14px", background:"var(--surface)", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <Radio size={13} color="var(--primary)" />
          <span style={{ fontSize:12, fontWeight:700, color:"var(--fg)" }}>OOB Interaction Monitor</span>
          <span style={{ fontSize:9.5, color:listening?"var(--green)":"var(--muted)", display:"flex", alignItems:"center", gap:4 }}>
            {listening && <span className="animate-pulse" style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)" }}/>}
            {listening ? "LISTENING" : "PAUSED"}
          </span>
          <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
            <button className="btn-secondary" onClick={simulateInteraction} style={{ fontSize:11 }}>Simulate Interaction</button>
            <button className="btn-secondary" onClick={()=>setListening(l=>!l)} style={{ fontSize:11, color: listening?"#ef5350":"var(--green)", borderColor: listening?"#ef5350":"var(--green)" }}>
              {listening ? "Pause" : "Resume"}
            </button>
          </div>
        </div>

        {/* OOB domain strip */}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", background:"var(--bg)", borderRadius:6, border:"1px solid var(--border)" }}>
          <span style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Your OOB Domain</span>
          <code style={{ fontFamily:"monospace", fontSize:12, color:"var(--primary)", fontWeight:700 }}>{OOB_DOMAIN}</code>
          <button onClick={copy} className="btn-secondary" style={{ fontSize:10, padding:"2px 8px", marginLeft:"auto", display:"flex", alignItems:"center", gap:4, color:copied?"var(--green)":"var(--muted)" }}>
            {copied ? <><CheckCircle size={10}/> Copied</> : <><Copy size={10}/> Copy</>}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:10, marginTop:8 }}>
          {[
            { l:"Total Interactions",  v:interactions.length, c:"var(--primary)" },
            { l:"DNS Callbacks",       v:dnsCount,             c:"#4fc3f7" },
            { l:"HTTP Callbacks",      v:httpCount,            c:"#a5d6a7" },
            { l:"Correlated Findings", v:correlated,           c:"var(--yellow)" },
            { l:"Uncorrelated",        v:interactions.length-correlated, c:"var(--muted)" },
          ].map(s => (
            <div key={s.l} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"5px 10px", flex:1 }}>
              <div style={{ fontSize:16, fontWeight:900, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:9.5, color:"var(--muted)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:0, background:"var(--surface)", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
        {(["All","DNS","HTTP","SMTP"] as const).map(f => (
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:"7px 16px", background:"none", border:"none", borderBottom: filter===f?"2px solid var(--primary)":"2px solid transparent", color:filter===f?"var(--primary)":"var(--muted)", cursor:"pointer", fontSize:11.5, fontWeight:filter===f?600:400, display:"flex", alignItems:"center", gap:4 }}>
            {f !== "All" && <span style={{ color:typeColor[f as InteractionType] }}>{typeIcon(f as InteractionType)}</span>}
            {f} {f!=="All" && <span style={{ fontSize:9.5 }}>({interactions.filter(i=>i.type===f).length})</span>}
          </button>
        ))}
        <button onClick={()=>setInteractions([])} className="btn-secondary" style={{ marginLeft:"auto", marginRight:10, marginTop:4, marginBottom:4, fontSize:10, display:"flex", alignItems:"center", gap:4, color:"var(--muted)" }}>
          <Trash2 size={10}/> Clear
        </button>
      </div>

      <div className="split-h" style={{ flex:1 }}>
        {/* Interaction list */}
        <div style={{ flex:1, overflowY:"auto", borderRight:"1px solid var(--border)" }}>
          {visible.length === 0 && (
            <div style={{ padding:24, textAlign:"center", color:"var(--muted)", fontSize:12 }}>
              No interactions yet. Waiting for OOB callbacks…
            </div>
          )}
          {visible.map(i => (
            <div key={i.id} onClick={()=>setSelected(i)}
              style={{ padding:"8px 12px", borderBottom:"1px solid var(--border)", cursor:"pointer", background: selected?.id===i.id ? "rgba(232,145,45,0.06)" : "transparent", borderLeft: selected?.id===i.id ? "2px solid var(--primary)" : "2px solid transparent" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                <span style={{ fontSize:9.5, fontWeight:700, color:typeColor[i.type], background:`${typeColor[i.type]}18`, padding:"1px 6px", borderRadius:8, display:"flex", alignItems:"center", gap:3 }}>
                  {typeIcon(i.type)} {i.type}
                </span>
                <span style={{ fontFamily:"monospace", fontSize:10, color:"var(--muted)" }}>{i.protocol}</span>
                {i.findingId && <span style={{ fontSize:9.5, color:"var(--yellow)", background:"rgba(255,204,0,0.1)", padding:"1px 6px", borderRadius:8 }}>→ {i.findingId}</span>}
                <span style={{ marginLeft:"auto", fontSize:9.5, color:"var(--muted)" }}>{relTime(i.timestamp)}</span>
              </div>
              <div style={{ fontSize:10.5, color:"var(--muted)", fontFamily:"monospace" }}>
                <span style={{ color:"#4fc3f7" }}>{i.sourceIP}</span>
                <span style={{ color:"var(--border)", margin:"0 5px" }}>→</span>
                <span style={{ color:"var(--primary)" }}>{i.host}</span>
              </div>
              <div style={{ fontSize:10, color:"var(--muted)", marginTop:2, opacity:0.7, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{i.details}</div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div style={{ width:340, flexShrink:0, overflowY:"auto" }}>
            <div style={{ padding:"10px 14px", borderBottom:"1px solid var(--border)", background:"var(--surface)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <span style={{ fontSize:10, fontWeight:700, color:typeColor[selected.type] }}>{selected.type} CALLBACK</span>
                {selected.findingId && <span style={{ fontSize:10, color:"var(--yellow)" }}>Correlated: {selected.findingId}</span>}
              </div>
              <div style={{ fontSize:9.5, color:"var(--muted)" }}>{selected.timestamp.toLocaleString()}</div>
            </div>
            <div style={{ padding:"10px 14px" }}>
              {[
                { l:"Source IP",   v:selected.sourceIP },
                { l:"Payload ID",  v:selected.payloadId },
                { l:"Protocol",    v:selected.protocol },
                { l:"Host",        v:selected.host },
                { l:"Finding",     v:selected.findingId ?? "Unmatched" },
              ].map(r => (
                <div key={r.l} style={{ padding:"5px 0", borderBottom:"1px solid var(--border)", display:"flex", gap:8 }}>
                  <span style={{ fontSize:10.5, color:"var(--muted)", width:80, flexShrink:0 }}>{r.l}</span>
                  <span style={{ fontSize:10.5, fontFamily:"monospace", color: r.l==="Source IP"?"#4fc3f7": r.l==="Finding" && selected.findingId?"var(--yellow)":"var(--fg)" }}>{r.v}</span>
                </div>
              ))}
              <div style={{ marginTop:10 }}>
                <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:4 }}>Details</div>
                <pre style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:5, padding:"8px 10px", fontSize:11, color:"var(--muted)", whiteSpace:"pre-wrap", wordBreak:"break-all", lineHeight:1.6 }}>{selected.details}</pre>
              </div>
              {selected.type === "HTTP" && (
                <div style={{ marginTop:10 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:4 }}>Simulated HTTP Request</div>
                  <pre style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:5, padding:"8px 10px", fontSize:10.5, color:"var(--muted)", whiteSpace:"pre-wrap", lineHeight:1.6 }}>
{`${selected.protocol} / HTTP/1.1\r\nHost: ${selected.host}\r\nX-Payload-Id: ${selected.payloadId}\r\nX-Source-IP: ${selected.sourceIP}\r\nUser-Agent: axiom-oob-detector/3.1`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ width:340, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--muted)", fontSize:12 }}>Select an interaction</div>
        )}
      </div>
    </div>
  );
}
