"use client";

import { Box, ShieldAlert, CheckCircle2 } from "lucide-react";
import { KUBERNETES_WORKLOADS } from "@/data/cloudData";

export default function KubernetesSecurityPage() {
  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box size={20} color="#060913" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Container &amp; Kubernetes (EKS / AKS / GKE) Security</h1>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Privileged Pods, HostPath Escapes, RBAC Cluster-Admin &amp; Workload-to-Cloud IAM</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {KUBERNETES_WORKLOADS.map(w => (
          <div key={w.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: "#f8fafc" }}>{w.workloadName}</span>
                <div style={{ fontSize: 10.5, color: "var(--muted)" }}>Cluster: {w.cluster} &middot; NS: {w.namespace}</div>
              </div>
              <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: w.status === "CRITICAL" ? "rgba(244,63,94,0.15)" : "rgba(16,185,129,0.15)", color: w.status === "CRITICAL" ? "#f43f5e" : "#10b981", fontWeight: 800 }}>
                {w.status}
              </span>
            </div>

            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>
              Privileged: <strong style={{ color: w.isPrivileged ? "#f43f5e" : "#10b981" }}>{w.isPrivileged ? "YES (RISK)" : "NO"}</strong> &middot; HostPath: <strong style={{ color: w.hasHostPath ? "#f43f5e" : "#10b981" }}>{w.hasHostPath ? "MOUNTED" : "NONE"}</strong>
            </div>
            <div style={{ fontSize: 10.5, color: "#38bdf8", fontFamily: "monospace" }}>Cloud Role: {w.cloudIAMRole}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
