"use client";

import { FileSpreadsheet, Download } from "lucide-react";

export default function ComplianceReportingPage() {
  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileSpreadsheet size={20} color="#060913" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Multi-Tier Compliance &amp; Boardroom Reporting</h1>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>CIS Benchmarks, NIST 800-53, PCI-DSS v4.0, HIPAA &amp; SEC Form 8-K</div>
          </div>
        </div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>Executive Compliance Scorecards</h3>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>Download auditor-certified PDF &amp; CSV compliance evidence packages.</div>
      </div>
    </div>
  );
}
