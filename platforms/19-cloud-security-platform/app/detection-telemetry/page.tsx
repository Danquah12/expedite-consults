"use client";

import { Radio } from "lucide-react";

export default function DetectionTelemetryPage() {
  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Radio size={20} color="#060913" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Cloud Audit Telemetry &amp; Detection Engineering</h1>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>AWS CloudTrail, Azure Activity, GCP Cloud Logging &amp; GuardDuty Stream Ingestion</div>
        </div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>Real-Time Cloud Audit Stream</h3>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>Ingesting 14,800 events/sec with automated Sigma rule matching.</div>
      </div>
    </div>
  );
}
