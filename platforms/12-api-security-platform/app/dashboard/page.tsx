"use client";
import { useState } from "react";
import { FINDINGS, SCAN_SUMMARY } from "@/data/findings";
import { sevColor, sevBg, sevBorder, sevGlow, categoryIcon, methodColor, methodBg } from "@/lib/utils";
import type { APIFinding } from "@/types/api";
import { Shield, Filter } from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["All", "BOLA", "Auth", "Data Exposure", "Rate Limiting", "Mass Assignment", "CORS", "Injection", "JWT", "Schema"];

export default function DashboardPage() {
  const [sev,    setSev]    = useState("All");
  const [cat,    setCat]    = useState("All");
  const [selected, setSelected] = useState<APIFinding | null>(null);

  let results = [...FINDINGS];
  if (sev !== "All") results = results.filter(f => f.severity === sev);
  if (cat !== "All") results = results.filter(f => f.category === cat);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", flexShrink: 0, flexWrap: "wrap" }}>
        <Shield size={12} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>Security Scan — OWASP API Top 10</span>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>
          Target: <span style={{ color: "var(--primary)", fontFamily: "monospace" }}>{SCAN_SUMMARY.target}</span>
          &nbsp;·&nbsp; {SCAN_SUMMARY.endpointsScanned} endpoints
        </div>
        <Link href="/scan" className="btn-primary" style={{ marginLeft: "auto", textDecoration: "none" }}>
          <Shield size={11} /> New Scan
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, padding: "10px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        {[
          { l: "Critical", v: SCAN_SUMMARY.criticalCount,  c: "#ef5350", bg: "rgba(239,83,80,0.06)" },
          { l: "High",     v: SCAN_SUMMARY.highCount,      c: "#ffb74d", bg: "rgba(255,183,77,0.06)" },
          { l: "Medium",   v: SCAN_SUMMARY.mediumCount,    c: "#ffcc00", bg: "rgba(255,204,0,0.06)" },
          { l: "Endpoints",v: SCAN_SUMMARY.endpointsScanned, c: "var(--primary)", bg: "rgba(13,148,136,0.06)" },
          { l: "Total",    v: SCAN_SUMMARY.totalFindings,  c: "var(--foreground)", bg: "var(--surface)" },
        ].map(s => (
          <div key={s.l} style={{ background: s.bg, border: "1px solid var(--border)", borderRadius: 5, padding: "8px 10px" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 10, color: "var(--muted)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 4, padding: "6px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0, overflowX: "auto" }}>
        {["All","Critical","High","Medium","Low","Informational"].map(s => (
          <button key={s} onClick={() => setSev(s)} className="btn-secondary"
            style={sev === s ? { borderColor: "var(--primary)", color: "var(--primary)", fontSize: 10 } : { fontSize: 10 }}>
            {s}
          </button>
        ))}
        <div style={{ width: 1, background: "var(--border)", flexShrink: 0, margin: "0 4px" }} />
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} className="btn-secondary"
            style={cat === c ? { borderColor: "var(--primary)", color: "var(--primary)", fontSize: 10 } : { fontSize: 10 }}>
            {categoryIcon(c as any)} {c}
          </button>
        ))}
      </div>

      {/* Split: list | detail */}
      <div className="split-h" style={{ flex: 1 }}>
        {/* Finding list */}
        <div style={{ width: 380, flexShrink: 0, borderRight: "1px solid var(--border)", overflowY: "auto" }}>
          {results.map(f => (
            <div key={f.id} onClick={() => setSelected(f)}
              style={{
                padding: "9px 12px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                borderLeft: selected?.id === f.id ? `2px solid ${sevColor(f.severity)}` : "2px solid transparent",
                background: selected?.id === f.id ? `${sevColor(f.severity)}06` : "transparent",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 13 }}>{categoryIcon(f.category)}</span>
                <span className="badge-sev" style={{ background: sevBg(f.severity), color: sevColor(f.severity) }}>{f.severity}</span>
                <span className="pill" style={{ background: methodBg(f.endpoint.method), color: methodColor(f.endpoint.method), fontSize: 9 }}>{f.endpoint.method}</span>
                <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace", flex: 1 }}>{f.owaspRef}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 2 }}>{f.title}</div>
              <div style={{ fontSize: 10.5, fontFamily: "monospace", color: "var(--muted)" }}>{f.endpoint.path}</div>
            </div>
          ))}
        </div>

        {/* Finding detail */}
        {selected ? (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 15 }}>{categoryIcon(selected.category)}</span>
                <span className="badge-sev" style={{ background: sevBg(selected.severity), border: `1px solid ${sevBorder(selected.severity)}`, color: sevColor(selected.severity) }}>{selected.severity}</span>
                <span className="pill" style={{ background: methodBg(selected.endpoint.method), color: methodColor(selected.endpoint.method) }}>{selected.endpoint.method}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{selected.owaspRef} · {selected.cweId}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{selected.title}</div>
              <div style={{ fontFamily: "monospace", fontSize: 11.5, color: "var(--muted)" }}>{selected.endpoint.path}</div>
            </div>

            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Description", content: selected.description, color: "var(--foreground)" },
                { label: "Impact",      content: selected.impact,      color: "#ef5350" },
                { label: "Remediation", content: selected.remediation, color: "var(--green)" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{s.label}</div>
                  <p style={{ fontSize: 12, color: s.color, lineHeight: 1.7 }}>{s.content}</p>
                </div>
              ))}

              {/* Request/Response evidence */}
              {["requestExample","responseExample"].map((k, i) => (
                <div key={k}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
                    {i === 0 ? "Request Evidence" : "Response Evidence"}
                  </div>
                  <pre className="http-raw" style={{ borderRadius: 5, border: "1px solid var(--border)", fontSize: 11, color: i === 0 ? "#80cbc4" : "#a5d6a7" }}>
                    {selected[k as keyof APIFinding] as string}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 12 }}>
            Select a finding to view details
          </div>
        )}
      </div>
    </div>
  );
}
