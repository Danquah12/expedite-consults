"use client";

import { Wrench, CheckCircle2, Code } from "lucide-react";

export default function RemediationPage() {
  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #10b981 0%, #f59e0b 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Wrench size={20} color="#060913" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>1-Click Automated Remediation &amp; Drift Engine</h1>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Terraform PR Generation, Jira Sync &amp; Continuous Recurrence Monitoring</div>
        </div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", marginBottom: 12 }}>Pending Infrastructure Remediation PRs</h3>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>3 PRs ready for merge across GitHub &amp; GitLab repositories with automated CI/CD validation.</div>
      </div>
    </div>
  );
}
