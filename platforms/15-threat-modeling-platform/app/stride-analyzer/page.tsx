"use client";

import { GitBranch, Sparkles, ShieldCheck } from "lucide-react";

export default function Page() {
  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: 30 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 4, background: "rgba(0, 240, 255, 0.15)", border: "1px solid rgba(0, 240, 255, 0.4)", color: "#00f0ff", fontSize: 11, fontWeight: 800, marginBottom: 8 }}>
          <GitBranch size={13} />
          <span>AXIOM THREAT MODELING STUDIO</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#f8fafc" }}>STRIDE Risk Identification & Taxonomy Studio</h1>
        <p style={{ fontSize: 14, color: "#94a3b8" }}>
          Enterprise STRIDE analysis, DFD canvas, and attack tree simulations.
        </p>
      </div>

      <div style={{ background: "rgba(14, 8, 38, 0.8)", border: "1px solid var(--border)", borderRadius: 14, padding: 22 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>Threat Model Telemetry</h3>
        <p style={{ fontSize: 13, color: "#94a3b8" }}>42 threats identified and mapped to MITRE ATT&CK countermeasures.</p>
      </div>
    </div>
  );
}
