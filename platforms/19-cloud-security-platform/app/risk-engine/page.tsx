"use client";

import { Sliders, Activity } from "lucide-react";

export default function RiskEnginePage() {
  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #f59e0b 0%, #06b6d4 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sliders size={20} color="#060913" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Multi-Cloud Risk Engine &amp; Exploitability Prioritizer</h1>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Formula: Risk = Exposure + Exploitability + Attack Path + Asset Criticality</div>
        </div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>Mathematical Risk Quantification</h3>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>Filtering 5,000 raw CSPM alerts down to the 3 actual exploitable attack paths.</div>
      </div>
    </div>
  );
}
