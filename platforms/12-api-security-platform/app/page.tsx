"use client";
import { COLLECTIONS, ENVIRONMENTS, FINDINGS, SCAN_SUMMARY, API_HISTORY } from "@/data/findings";
import { sevColor, sevBg, methodColor, methodBg, statusColor, categoryIcon } from "@/lib/utils";
import Link from "next/link";
import { Send, FolderOpen, Play, Shield, Activity, Globe2 } from "lucide-react";

const activeEnv = ENVIRONMENTS.find(e => e.active);

export default function WorkspacePage() {
  const crit = FINDINGS.filter(f => f.severity === "Critical").length;
  const high = FINDINGS.filter(f => f.severity === "High").length;
  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>API Workstation</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
            <span style={{ color: "var(--green)" }}>●</span> {activeEnv?.name} · {activeEnv?.vars.find(v => v.key === "base_url")?.value}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Link href="/builder" className="btn-primary" style={{ textDecoration: "none" }}><Send size={12} /> New Request</Link>
          <Link href="/runner" className="btn-secondary" style={{ textDecoration: "none" }}><Play size={12} /> Run Collection</Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Collections", value: COLLECTIONS.length, color: "var(--primary)", bg: "rgba(13,148,136,0.08)" },
          { label: "Saved Requests", value: COLLECTIONS.reduce((a, c) => a + c.folders.reduce((b, f) => b + f.requests.length + (f.folders?.reduce((x, sf) => x + sf.requests.length, 0) ?? 0), 0), 0), color: "var(--blue)", bg: "rgba(79,195,247,0.08)" },
          { label: "Environments", value: ENVIRONMENTS.length, color: "var(--purple)", bg: "rgba(206,147,216,0.08)" },
          { label: "History", value: API_HISTORY.length, color: "var(--yellow)", bg: "rgba(255,183,77,0.08)" },
          { label: "Critical Findings", value: crit, color: "#ef5350", bg: "rgba(239,83,80,0.08)" },
          { label: "Total Findings", value: FINDINGS.length, color: "var(--high)", bg: "rgba(255,149,0,0.08)" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}28`, borderRadius: 6, padding: "10px 12px" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Collections */}
        <div className="tool-panel">
          <div className="tool-panel-header"><FolderOpen size={11} /> Collections <Link href="/collections" style={{ marginLeft: "auto", color: "var(--primary)", fontSize: 10, textDecoration: "none" }}>Manage →</Link></div>
          {COLLECTIONS.map(col => (
            <div key={col.id} style={{ padding: "6px 12px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 3 }}>{col.icon} {col.name}</div>
              {col.folders.map(f => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 10, paddingBottom: 2 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>📁 {f.name}</span>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>{f.requests.length + (f.folders?.reduce((a, sf) => a + sf.requests.length, 0) ?? 0)} req</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Environments */}
        <div className="tool-panel">
          <div className="tool-panel-header"><Globe2 size={11} /> Environments <Link href="/environments" style={{ marginLeft: "auto", color: "var(--primary)", fontSize: 10, textDecoration: "none" }}>Edit →</Link></div>
          {ENVIRONMENTS.map(env => (
            <div key={env.id} style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: env.active ? "var(--green)" : "var(--muted)", flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: env.active ? 600 : 400, color: env.active ? "var(--foreground)" : "var(--muted)", flex: 1 }}>{env.name}</span>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>{env.vars.length} vars</span>
              {env.active && <span className="pill" style={{ background: "rgba(13,148,136,0.1)", color: "var(--primary)", fontSize: 9 }}>ACTIVE</span>}
            </div>
          ))}
        </div>

        {/* Recent requests */}
        <div className="tool-panel">
          <div className="tool-panel-header"><Activity size={11} /> Recent History <Link href="/history" style={{ marginLeft: "auto", color: "var(--primary)", fontSize: 10, textDecoration: "none" }}>All →</Link></div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead><tr><th style={{ width: 60 }}>Method</th><th>URL</th><th style={{ width: 48 }}>Status</th><th style={{ width: 55 }}>Time</th></tr></thead>
              <tbody>
                {API_HISTORY.slice(0, 6).map(h => (
                  <tr key={h.id}>
                    <td><span className="pill" style={{ background: methodBg(h.method), color: methodColor(h.method) }}>{h.method}</span></td>
                    <td style={{ color: "var(--muted)", fontFamily: "monospace", fontSize: 11, maxWidth: 220 }}>
                      {h.url.replace("https://staging.api.acme.com/v2","").replace("https://api.acme.com/v2","") || "/"}
                    </td>
                    <td style={{ color: statusColor(h.status), fontFamily: "monospace", fontWeight: 700 }}>{h.status}</td>
                    <td style={{ color: "var(--muted)", fontFamily: "monospace" }}>{h.time}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security scan */}
        <div className="tool-panel">
          <div className="tool-panel-header"><Shield size={11} /> Security Findings <Link href="/dashboard" style={{ marginLeft: "auto", color: "var(--primary)", fontSize: 10, textDecoration: "none" }}>All {FINDINGS.length} →</Link></div>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {FINDINGS.map(f => (
              <Link key={f.id} href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderBottom: "1px solid var(--border)", textDecoration: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(13,148,136,0.04)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <span className="badge-sev" style={{ background: sevBg(f.severity), color: sevColor(f.severity) }}>{f.severity}</span>
                <span style={{ fontSize: 11, color: "var(--foreground)", flex: 1 }}>{f.title}</span>
                <span style={{ fontSize: 10, color: "var(--muted)" }}>{categoryIcon(f.category)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
