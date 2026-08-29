"use client";

import { useState } from "react";
import { Search, Server, Cloud, Database, Box, Key, Globe, Shield } from "lucide-react";
import { CLOUD_ACCOUNTS } from "@/data/cloudData";

export default function DiscoveryPage() {
  const [search, setSearch] = useState("");

  const assets = [
    { id: "ast-01", name: "expedite-prod-vpc", type: "VPC Network", provider: "AWS", region: "us-east-1", status: "SECURE", tags: "env=prod" },
    { id: "ast-02", name: "app-server-node-01", type: "EC2 Instance", provider: "AWS", region: "us-east-1", status: "VULNERABLE", tags: "imds=v1" },
    { id: "ast-03", name: "expedite-customer-uploads-prod", type: "S3 Bucket", provider: "AWS", region: "us-east-1", status: "CRITICAL", tags: "public=true" },
    { id: "ast-04", name: "core-enterprise-vault", type: "Key Vault", provider: "Azure", region: "eastus", status: "VULNERABLE", tags: "tier=0" },
    { id: "ast-05", name: "prod-datalake-parquet", type: "Cloud Storage", provider: "GCP", region: "us-central1", status: "SECURE", tags: "retention=365d" },
    { id: "ast-06", name: "stripe-processor-pod", type: "EKS Pod", provider: "Kubernetes", region: "us-east-1", status: "SECURE", tags: "irsa=true" }
  ];

  const filtered = assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Search size={20} color="#060913" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Multi-Cloud Asset Discovery &amp; Inventory</h1>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Live GraphQL &amp; Cloud Asset Inventory Graph across AWS, Azure, GCP &amp; Kubernetes</div>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search resources, types, regions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "#f8fafc", padding: "6px 12px", borderRadius: 6, fontSize: 12, outline: "none", width: 260 }}
        />
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)", textAlign: "left" }}>
              <th style={{ padding: "10px 12px" }}>RESOURCE NAME</th>
              <th style={{ padding: "10px 12px" }}>TYPE</th>
              <th style={{ padding: "10px 12px" }}>PROVIDER</th>
              <th style={{ padding: "10px 12px" }}>REGION</th>
              <th style={{ padding: "10px 12px" }}>TAGS</th>
              <th style={{ padding: "10px 12px", textAlign: "right" }}>POSTURE</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "12px", fontWeight: 700, color: "#f8fafc" }}>{row.name}</td>
                <td style={{ padding: "12px", color: "var(--muted)" }}>{row.type}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--surface-2)", color: "#f59e0b", fontWeight: 800 }}>{row.provider}</span>
                </td>
                <td style={{ padding: "12px", fontFamily: "monospace" }}>{row.region}</td>
                <td style={{ padding: "12px", fontFamily: "monospace", color: "var(--muted)" }}>{row.tags}</td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: row.status === "CRITICAL" ? "rgba(244,63,94,0.15)" : row.status === "VULNERABLE" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)", color: row.status === "CRITICAL" ? "#f43f5e" : row.status === "VULNERABLE" ? "#f59e0b" : "#10b981", fontWeight: 800 }}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
