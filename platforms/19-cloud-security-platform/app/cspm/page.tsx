"use client";

import { useState } from "react";
import { ShieldCheck, CheckCircle2, AlertTriangle, Play, Terminal, Wrench } from "lucide-react";
import { CSPM_FINDINGS } from "@/data/cloudData";

export default function CSPMPage() {
  const [selectedSeverity, setSelectedSeverity] = useState("all");

  const filtered = selectedSeverity === "all" ? CSPM_FINDINGS : CSPM_FINDINGS.filter(f => f.severity === selectedSeverity);

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={20} color="#060913" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Multi-Cloud CSPM &amp; Posture Management</h1>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>CIS Benchmarks v3.0, NIST 800-53, PCI-DSS v4.0 &amp; Auto-Remediation</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map(finding => (
          <div key={finding.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: "#f8fafc" }}>{finding.title}</span>
                  <span style={{ fontSize: 9.5, padding: "2px 6px", borderRadius: 4, background: "rgba(244,63,94,0.15)", color: "#f43f5e", fontWeight: 800 }}>{finding.severity}</span>
                  <span style={{ fontSize: 9.5, padding: "2px 6px", borderRadius: 4, background: "var(--surface-2)", color: "#f59e0b", fontWeight: 700 }}>{finding.provider}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                  <strong>Resource:</strong> {finding.resourceId} &middot; <strong>Benchmark:</strong> {finding.benchmark}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 11, color: "var(--fg-2)", marginBottom: 12 }}>{finding.description}</div>

            <div style={{ background: "#050811", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: 10, fontSize: 10.5, fontFamily: "monospace", color: "#38bdf8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{finding.remediationCommand}</span>
              <button style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                1-Click Fix
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
