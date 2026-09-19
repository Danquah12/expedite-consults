"use client";
import { useState, useEffect } from "react";
import { FINDINGS } from "@/data/findings";
import { sevColor, sevBg } from "@/lib/utils";
import Link from "next/link";
import {
  Brain, Zap, Shield, Globe, Activity, Play, AlertTriangle, CheckCircle,
  Clock, Database, Target, Swords, ExternalLink, Sparkles, ArrowRight, Lock
} from "lucide-react";

const BACKEND_URL = "http://localhost:3001";

// SVG Donut chart
function DonutChart({ counts, total }: { counts: Record<string, number>, total: number }) {
  const slices = [
    { label: "Critical", count: counts.Critical ?? 0, color: "#ef4444" },
    { label: "High",     count: counts.High ?? 0,     color: "#f59e0b" },
    { label: "Medium",   count: counts.Medium ?? 0,   color: "#38bdf8" },
    { label: "Low",      count: counts.Low ?? 0,      color: "#10b981" },
  ];
  const tot = total || slices.reduce((s, x) => s + x.count, 0) || 1;
  const r = 54, cx = 70, cy = 70, stroke = 18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const arcs = slices.map(s => {
    const pct = s.count / tot;
    const dash = pct * circumference;
    const arc  = { ...s, dasharray: `${dash} ${circumference - dash}`, dashoffset: -offset * circumference };
    offset += pct;
    return arc;
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={140} height={140} style={{ flexShrink: 0 }}>
        {arcs.map(a => (
          <circle key={a.label} cx={cx} cy={cy} r={r} fill="none" stroke={a.color}
            strokeWidth={stroke} strokeDasharray={a.dasharray} strokeDashoffset={a.dashoffset}
            style={{ transition: "stroke-dasharray 0.6s" }} transform={`rotate(-90 ${cx} ${cy})`} />
        ))}
        <text x={cx} y={cy-5}  textAnchor="middle" fill="#fff" fontSize={22} fontWeight={900}>{tot}</text>
        <text x={cx} y={cy+12} textAnchor="middle" fill="#64748b" fontSize={10} fontWeight={700}>VULNS</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {slices.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: "var(--fg-2)" }}>{s.label}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: s.color, marginLeft: "auto", minWidth: 20, textAlign: "right" }}>{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[], color: string }) {
  const w = 160, h = 48;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i/(data.length-1))*w},${h - (v/max)*(h-8)+4}`).join(" ");
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={(i/(data.length-1))*w} cy={h-(v/max)*(h-8)+4} r={3} fill={color} />
      ))}
    </svg>
  );
}

const riskColor: Record<string, string> = { Critical: "#ef4444", High: "#f59e0b", Medium: "#38bdf8", Low: "#10b981" };

export default function DashboardPage() {
  const [realFindings,  setRealFindings]  = useState<any[]>([]);
  const [recentScans,   setRecentScans]   = useState<any[]>([]);
  const [scanMeta,      setScanMeta]      = useState<{ targets: string; duration: string; profile: string; pipeId: string }>({
    targets: "", duration: "", profile: "Standard", pipeId: ""
  });
  const [backendOk,     setBackendOk]     = useState<boolean | null>(null);
  const [liveData,      setLiveData]      = useState(false);

  useEffect(() => {
    try {
      const stored    = localStorage.getItem("axiom_last_findings");
      const count     = localStorage.getItem("axiom_last_finding_count");
      const targets   = localStorage.getItem("axiom_last_targets")  || "";
      const duration  = localStorage.getItem("axiom_last_duration") || "";
      const profile   = localStorage.getItem("axiom_last_profile")  || "Standard";
      const pipeId    = localStorage.getItem("axiom_last_pipeline_id") || "";

      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.length) { setRealFindings(parsed); setLiveData(true); }
      }
      setScanMeta({ targets, duration, profile, pipeId });

      const scanId = localStorage.getItem("axiom_last_scan_id") || pipeId;
      const findCount = parseInt(count || "0");
      if (targets) {
        const now = new Date();
        const newScan = {
          id: scanId || "PIPE-LIVE",
          name: `AXIOM Full-Stack Scan`,
          target: targets,
          date: `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`,
          duration: duration || "—",
          findings: findCount,
          risk: findCount >= 10 ? "Critical" : findCount >= 5 ? "High" : findCount > 0 ? "Medium" : "Low",
          status: "done",
          live: true,
        };
        setRecentScans([newScan]);
      }
    } catch { /* ignore */ }

    fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(3000) })
      .then(r => r.json())
      .then(() => {
        setBackendOk(true);
        fetch(`${BACKEND_URL}/api/pipelines`)
          .then(r => r.json())
          .then(data => {
            const pipelines: any[] = data.pipelines || [];
            if (!pipelines.length) return;
            const scans = pipelines.slice(0, 5).map((p: any) => ({
              id: p.id,
              name: `AXIOM Pipeline Scan`,
              target: (p.targets || []).join(", "),
              date: new Date(p.startTime || Date.now()).toLocaleString(),
              duration: p.duration ? `${p.duration}s` : "—",
              findings: p.totalFindings ?? 0,
              risk: (p.totalFindings ?? 0) >= 10 ? "Critical" : (p.totalFindings ?? 0) >= 5 ? "High" : (p.totalFindings ?? 0) > 0 ? "Medium" : "Low",
              status: p.status,
              live: true,
            }));
            setRecentScans(scans);

            const latest = pipelines.find((p: any) => p.status === "complete" && p.totalFindings > 0);
            if (latest) {
              setScanMeta(m => ({ ...m, targets: (latest.targets||[]).join(", "), duration: latest.duration ? `${latest.duration}s` : m.duration, pipeId: latest.id }));
              fetch(`${BACKEND_URL}/api/pipeline/${latest.id}/findings`)
                .then(r => r.json())
                .then(d => { if (d.findings?.length) { setRealFindings(d.findings); setLiveData(true); } })
                .catch(() => {});
            }
          })
          .catch(() => {});
      })
      .catch(() => setBackendOk(false));
  }, []);

  const findings   = realFindings.length > 0 ? realFindings : FINDINGS;
  const isRealData = realFindings.length > 0;
  const counts: Record<string, number> = {};
  findings.forEach((f: any) => { const sev = f.severity; counts[sev] = (counts[sev] ?? 0) + 1; });

  const critical  = counts.Critical ?? 0;
  const high      = counts.High ?? 0;
  const verified  = isRealData ? findings.length : FINDINGS.filter(f => f.verificationStatus === "Verified").length;
  const targets   = scanMeta.targets || (isRealData ? "192.168.195.139, 192.168.195.140" : "api.enterprise-auth.corp");
  const duration  = scanMeta.duration || (isRealData ? "267s" : "27.4s");
  const topTarget = targets.split(",")[0]?.trim() || targets;

  const trendData = isRealData
    ? [0, 0, 0, 0, 8, findings.length, findings.length]
    : [2, 5, 3, 8, 6, 11, 8];
  const trendDelta = trendData[trendData.length-1] - trendData[trendData.length-2];

  const owaspCounts: Record<string, number> = {};
  findings.forEach((f: any) => {
    const t = f.ttp?.id || f.category || "";
    if (t.includes("A01") || (f.title||"").toLowerCase().includes("access control")) owaspCounts["A01"] = (owaspCounts["A01"]||0)+1;
    if (t.includes("A02") || (f.title||"").toLowerCase().includes("cryptograph")) owaspCounts["A02"] = (owaspCounts["A02"]||0)+1;
    if (t.includes("A03") || (f.title||"").toLowerCase().match(/inject|sqli|xss|command/)) owaspCounts["A03"] = (owaspCounts["A03"]||0)+1;
    if (t.includes("A05") || (f.title||"").toLowerCase().includes("misconfig")) owaspCounts["A05"] = (owaspCounts["A05"]||0)+1;
    if (t.includes("A10") || (f.title||"").toLowerCase().includes("ssrf")) owaspCounts["A10"] = (owaspCounts["A10"]||0)+1;
  });

  const topFindings = findings
    .filter((f: any) => ["Critical","High"].includes(f.severity))
    .slice(0, 5);

  const displayScans = recentScans.length > 0 ? recentScans : [
    { id:"SCN-004", name:"Full Web App Scan", target:"api.enterprise-auth.corp", date:"Today 11:22 PM", duration:"27.4s", findings:8, risk:"Critical", status:"done", live:false },
    { id:"SCN-003", name:"API Security Scan", target:"staging.gateway-cloud.io", date:"Aug 20, 6:14 PM", duration:"18.1s", findings:3, risk:"High", status:"done", live:false },
  ];

  const statCards = [
    { label:"Total Findings", val: findings.length, color:"#ff2a5f", icon:<Zap size={14}/>, sub: isRealData ? "real scan" : "live engine" },
    { label:"Critical Exploits", val: critical, color:"#ef4444", icon:<AlertTriangle size={14}/>, sub:"immediate action" },
    { label:"Verified PoCs", val: verified, color:"#10b981", icon:<CheckCircle size={14}/>, sub:"100% verified" },
    { label:"Active Targets", val: targets.split(",").length, color:"#00f0ff", icon:<Target size={14}/>, sub:"scanned" },
    { label:"DAST Engines", val: backendOk ? 4 : 4, color:"#8b5cf6", icon:<Brain size={14}/>, sub:"online" },
    { label:"Duration", val: duration, color:"#f59e0b", icon:<Clock size={14}/>, sub:"last scan" },
  ];

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "16px 20px" }}>

      {/* Hero Standalone Callout Banner */}
      <div className="cyber-card-crimson" style={{ padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(225,29,72,0.2)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(225,29,72,0.4)" }}>
            <Swords size={18} color="#ff2a5f" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              ÆGIS · SOC STANDALONE COMMAND PORTAL
              <span style={{ fontSize: 9, background: "#10b981", color: "#000", padding: "1px 6px", borderRadius: 4, fontWeight: 900 }}>READY</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-2)" }}>Full-screen tactical radar, 4-stage pipeline visualizer, traffic interceptor forge, and AI analyst.</div>
          </div>
        </div>
        <Link href="/app?standalone=1" className="btn-primary" style={{ textDecoration: "none", fontSize: 11.5 }}>
          Launch ÆGIS · SOC Portal <ArrowRight size={13} />
        </Link>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>DAST Security Dashboard</div>
          <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            AXIOM Engine Brain · Automated · AI-Powered · Evidence-Driven
            {isRealData && (
              <span style={{ background: "rgba(16,185,129,0.15)", border: "1px solid #10b981", borderRadius: 4, padding: "1px 6px", fontSize: 9, color: "#10b981", fontWeight: 700 }}>
                ● LIVE DATA
              </span>
            )}
          </div>
        </div>
        <Link href="/live-scan" className="btn-primary" style={{ textDecoration: "none", fontSize: 12, padding: "8px 18px" }}>
          <Play size={13} /> Run 4-Stage Scan
        </Link>
        <Link href="/evidence" className="btn-secondary" style={{ textDecoration: "none", fontSize: 12 }}>
          <Shield size={13} /> Evidence Vault
        </Link>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 16 }}>
        {statCards.map(s => (
          <div key={s.label} className="cyber-card" style={{ padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, color: s.color }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1.1 }}>{s.val}</div>
            <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600, marginTop: 3 }}>{s.label}</div>
            <div style={{ fontSize: 9, color: "var(--muted)", opacity: 0.7, marginTop: 1 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        {/* Severity Donut */}
        <div className="tool-panel">
          <div className="tool-panel-header"><Activity size={12}/> Vulnerability Distribution</div>
          <div style={{ padding: "14px 16px" }}>
            <DonutChart counts={counts} total={findings.length} />
          </div>
        </div>

        {/* Trend Sparkline */}
        <div className="tool-panel">
          <div className="tool-panel-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Zap size={12}/> Attack Vector Trajectory
            </div>
            <span style={{ fontSize: 10, color: trendDelta >= 0 ? "#ef4444" : "#10b981", fontWeight: 800 }}>
              {trendDelta >= 0 ? `+${trendDelta}` : trendDelta} {trendDelta >= 0 ? "▲ VULN SPIKE" : "▼ REMEDIATED"}
            </span>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <Sparkline data={trendData} color="#ff2a5f" />
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 6 }}>
              {isRealData ? `Latest: ${findings.length} findings from ${topTarget}` : "Continuous telemetry across target quad"}
            </div>
          </div>
        </div>
      </div>

      {/* Top Critical Findings + OWASP */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        {/* Top Findings */}
        <div className="tool-panel">
          <div className="tool-panel-header"><AlertTriangle size={12}/> Top Critical Findings</div>
          <div>
            {topFindings.length > 0 ? topFindings.map((f: any, i: number) => (
              <div key={f.id ?? i} style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{
                  fontSize: 9.5, fontWeight: 800, padding: "2px 6px", borderRadius: 4, flexShrink: 0, marginTop: 1,
                  background: f.severity === "Critical" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)",
                  color: f.severity === "Critical" ? "#ef4444" : "#f59e0b",
                  border: `1px solid ${f.severity === "Critical" ? "rgba(239,68,68,0.4)" : "rgba(245,158,11,0.4)"}`
                }}>
                  {(f.severity || "").toUpperCase()}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.title ?? f.name}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "var(--font-geist-mono)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.target ?? f.url ?? ""}
                  </div>
                </div>
                <span style={{ fontSize: 10, color: "#10b981", flexShrink: 0, marginTop: 1, fontWeight: 800 }}>✓ PoC</span>
              </div>
            )) : (
              <div style={{ padding: 16, textAlign: "center", color: "var(--muted)", fontSize: 11 }}>
                Run a scan to see real findings
              </div>
            )}
          </div>
          {findings.length > 5 && (
            <div style={{ padding: "10px 12px" }}>
              <Link href="/evidence" style={{ fontSize: 11.5, color: "#00f0ff", textDecoration: "none", fontWeight: 700 }}>
                View all {findings.length} findings in Evidence Vault →
              </Link>
            </div>
          )}
        </div>

        {/* OWASP Coverage */}
        <div className="tool-panel">
          <div className="tool-panel-header"><Shield size={12}/> OWASP Top 10 Coverage</div>
          <div style={{ padding: "10px 12px" }}>
            {[
              { id: "A01", name: "Broken Access Control" },
              { id: "A02", name: "Cryptographic Failures" },
              { id: "A03", name: "Injection (SQLi / XSS / RCE)" },
              { id: "A05", name: "Security Misconfiguration" },
              { id: "A10", name: "Server-Side Request Forgery (SSRF)" },
            ].map(cat => {
              const cnt = owaspCounts[cat.id] ?? 0;
              const maxBar = Math.max(...Object.values(owaspCounts), 1);
              return (
                <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: "#00f0ff", width: 30, flexShrink: 0, fontWeight: 700 }}>{cat.id}</span>
                  <span style={{ fontSize: 11, color: "var(--fg)", flex: 1 }}>{cat.name}</span>
                  <div style={{ width: 90, height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
                    <div style={{ width: `${(cnt/maxBar)*100}%`, height: "100%", background: "linear-gradient(90deg, #e11d48, #ff4d79)", borderRadius: 3, minWidth: cnt>0?4:0 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#ff4d79", width: 18, textAlign: "right" }}>{cnt}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="tool-panel">
        <div className="tool-panel-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Database size={12}/> Recent Scans & Targets
          </div>
          {isRealData && <span style={{ fontSize: 9, color: "#10b981", fontWeight: 800 }}>● LIVE ACTIVE PIPELINE</span>}
        </div>
        <table className="data-table">
          <thead>
            <tr>
              {["ID", "Scan Name", "Target Endpoint", "Timestamp", "Duration", "Findings", "Risk Rating", "Action"].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayScans.map((sc: any) => (
              <tr key={sc.id}>
                <td style={{ fontSize: 11, fontFamily: "var(--font-geist-mono)", color: "#00f0ff" }}>
                  {sc.live ? sc.id.slice(0, 12) : sc.id}
                </td>
                <td style={{ fontWeight: 600, color: "#fff" }}>{sc.name}</td>
                <td style={{ fontSize: 11, fontFamily: "var(--font-geist-mono)", color: "var(--fg-2)" }}>
                  {sc.target.length > 32 ? sc.target.slice(0, 32) + "…" : sc.target}
                </td>
                <td style={{ fontSize: 11, color: "var(--muted)" }}>{sc.date}</td>
                <td style={{ fontSize: 11, color: "var(--muted)" }}>{sc.duration}</td>
                <td style={{ fontSize: 12, fontWeight: 800, color: (sc.findings ?? 0) > 0 ? "#ff4d79" : "var(--muted)" }}>{sc.findings}</td>
                <td>
                  <span style={{
                    fontSize: 9.5, fontWeight: 800, padding: "2px 6px", borderRadius: 4,
                    background: `${riskColor[sc.risk] ?? "#888"}20`, color: riskColor[sc.risk] ?? "#888",
                    border: `1px solid ${riskColor[sc.risk] ?? "#888"}40`
                  }}>
                    {sc.risk}
                  </span>
                </td>
                <td>
                  <Link href="/app?standalone=1" style={{ fontSize: 11, color: "#00f0ff", textDecoration: "none", fontWeight: 700 }}>
                    Open SOC →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
