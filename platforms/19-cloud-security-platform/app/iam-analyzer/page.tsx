"use client";

import { Key, ShieldAlert, ArrowRight, Lock } from "lucide-react";
import { IAM_PRIVESC_ROUTES } from "@/data/cloudData";

export default function IAMAnalyzerPage() {
  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #f59e0b 0%, #a855f7 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Key size={20} color="#060913" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Cloud IAM Analyzer &amp; Privilege Escalation Studio</h1>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Detects 28+ known AWS IAM, Azure RBAC, and GCP Service Account Escalation Patterns</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {IAM_PRIVESC_ROUTES.map(route => (
          <div key={route.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc" }}>{route.identityName}</span>
                <div style={{ fontSize: 10.5, color: "var(--muted)" }}>Type: {route.identityType} &middot; Provider: {route.provider}</div>
              </div>
              <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(244,63,94,0.15)", color: "#f43f5e", fontWeight: 800 }}>
                {route.riskLevel}
              </span>
            </div>

            <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: 8, fontSize: 11, marginBottom: 12 }}>
              <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: 4 }}>Escalation Vector:</div>
              <div style={{ color: "var(--fg-2)" }}>{route.escalationVector}</div>
              <div style={{ marginTop: 8, color: "#f43f5e", fontWeight: 700 }}>Resulting Access: {route.targetPrivilege}</div>
            </div>

            <div style={{ fontSize: 10.5, color: "#10b981", fontWeight: 600 }}>
              &check; <strong>Remediation:</strong> {route.remediationPolicy}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
