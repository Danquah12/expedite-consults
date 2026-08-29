"use client";

import { Globe, Search } from "lucide-react";

export default function ReconPage() {
  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Globe size={20} color="#060913" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>External Attack Surface &amp; Cloud Reconnaissance</h1>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Public S3/GCS Buckets, DNS Subdomain Enumeration &amp; Exposed K8s Ports</div>
        </div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>Internet-Facing Cloud Perimeter</h3>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>Passive DNS &amp; Certificate Transparency stream discovering shadow cloud assets.</div>
      </div>
    </div>
  );
}
