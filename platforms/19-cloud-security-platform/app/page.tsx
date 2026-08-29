"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Cloud,
  ShieldAlert,
  GitGraph,
  Key,
  Server,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Play,
  Layers,
  Box,
  Globe,
  Sliders,
  FileSpreadsheet,
  TrendingUp,
  Cpu
} from "lucide-react";
import { CLOUD_ACCOUNTS, ATTACK_PATH_CHAINS, CSPM_FINDINGS, IAM_PRIVESC_ROUTES } from "@/data/cloudData";

export default function CloudDashboardPage() {
  const [activeTab, setActiveTab] = useState<"all" | "AWS" | "Azure" | "GCP" | "Kubernetes">("all");

  const totalAssets = CLOUD_ACCOUNTS.reduce((sum, a) => sum + a.totalAssets, 0);
  const criticalChains = ATTACK_PATH_CHAINS.length;

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc" }}>
      {/* Top Welcome Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "linear-gradient(135deg, #f59e0b 0%, #06b6d4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(245,158,11,0.35)"
            }}>
              <Cloud size={20} color="#060913" />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>
                AXIOM Multi-Cloud Security &amp; Attack Path Command Center
              </h1>
              <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 500 }}>
                Autonomous Cloud Penetration Testing &middot; IAM Privilege Escalation Graphing &middot; Multi-Cloud CSPM (AWS / Azure / GCP / EKS)
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/attack-paths"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#060913",
              padding: "7px 14px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 0 14px rgba(245,158,11,0.4)"
            }}
          >
            <GitGraph size={14} />
            <span>Inspect Attack Paths</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Server size={14} color="#06b6d4" /> TOTAL MONITORED ASSETS
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#f8fafc", fontFamily: "monospace" }}>
            {totalAssets.toLocaleString()} <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>resources</span>
          </div>
          <div style={{ fontSize: 10.5, color: "#10b981", marginTop: 4 }}>
            Across 4 Connected Cloud Tenants
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <GitGraph size={14} color="#f43f5e" /> CRITICAL ATTACK PATH CHAINS
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#f43f5e", fontFamily: "monospace" }}>
            {criticalChains} <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>verified</span>
          </div>
          <div style={{ fontSize: 10.5, color: "#f43f5e", marginTop: 4 }}>
            Direct Crown Jewel Takeover Exposure
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Key size={14} color="#f59e0b" /> IAM PRIVILEGE ESCALATIONS
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#f59e0b", fontFamily: "monospace" }}>
            {IAM_PRIVESC_ROUTES.length} <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>routes</span>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
            Wildcard &amp; AssumeRole Chokepoints
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <CheckCircle2 size={14} color="#10b981" /> COMPLIANCE POSTURE (CIS)
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#10b981", fontFamily: "monospace" }}>
            89.2% <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>average</span>
          </div>
          <div style={{ fontSize: 10.5, color: "#10b981", marginTop: 4 }}>
            CIS AWS/Azure/GCP Benchmark v3.0
          </div>
        </div>
      </div>

      {/* Connected Cloud Tenants Grid */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#f8fafc", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Cloud size={15} color="#f59e0b" /> Multi-Cloud Environment Inventory
          </h3>
          <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 4, background: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 700 }}>
            API Agentless Live Sync
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {CLOUD_ACCOUNTS.map(acc => (
            <div
              key={acc.id}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 16
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>{acc.name}</div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "monospace" }}>{acc.accountId}</div>
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: acc.provider === "AWS" ? "rgba(245,158,11,0.15)" : acc.provider === "Azure" ? "rgba(6,182,212,0.15)" : "rgba(16,185,129,0.15)",
                  color: acc.provider === "AWS" ? "#f59e0b" : acc.provider === "Azure" ? "#06b6d4" : "#10b981"
                }}>
                  {acc.provider}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11, marginBottom: 12 }}>
                <div>
                  <span style={{ color: "var(--muted)" }}>Assets:</span> <strong style={{ color: "#f8fafc" }}>{acc.totalAssets}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)" }}>CIS Score:</span> <strong style={{ color: "#10b981" }}>{acc.complianceScore}%</strong>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10.5, color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                <span>{acc.lastScan}</span>
                <span style={{ color: acc.criticalIssues > 0 ? "#f43f5e" : "#10b981", fontWeight: 700 }}>
                  {acc.criticalIssues} Critical
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flagship: Active Multi-Cloud Attack Path Chains */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#f8fafc", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <GitGraph size={15} color="#f43f5e" /> Active Multi-Cloud Attack Path Graph Chains
            </h3>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              Flagship Capability: Chaining weak permissions, SSRF vectors, and IAM privilege escalations into full crown jewel takeovers.
            </div>
          </div>
          <Link
            href="/attack-paths"
            style={{ fontSize: 11.5, color: "#f59e0b", textDecoration: "none", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}
          >
            <span>Open Graph Studio</span> &rarr;
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {ATTACK_PATH_CHAINS.map(chain => (
            <div
              key={chain.id}
              style={{
                background: "var(--surface-2)",
                border: "1px solid rgba(244,63,94,0.3)",
                borderRadius: 8,
                padding: 16,
                boxShadow: "0 0 15px rgba(244,63,94,0.08)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 900, color: "#f8fafc" }}>{chain.name}</span>
                    <span style={{ fontSize: 9.5, padding: "2px 6px", borderRadius: 4, background: "rgba(244,63,94,0.15)", color: "#f43f5e", fontWeight: 800 }}>
                      {chain.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    <strong>Entry Point:</strong> {chain.entryPoint} &rarr; <strong>Crown Jewel Target:</strong> {chain.targetAsset}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>ESTIMATED BLAST RADIUS</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#f43f5e" }}>{chain.estimatedBlastRadius}</div>
                </div>
              </div>

              {/* Chain Node Steps */}
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${chain.nodes.length}, 1fr)`, gap: 8, marginBottom: 12 }}>
                {chain.nodes.map((node, i) => (
                  <div
                    key={node.id}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      padding: 10,
                      position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 9.5, fontWeight: 800, color: "#06b6d4" }}>STEP {i + 1}</span>
                      <span style={{ fontSize: 9, color: node.severity === "CRITICAL" ? "#f43f5e" : "#f59e0b", fontWeight: 800 }}>{node.service}</span>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#f8fafc", marginBottom: 2 }}>{node.label}</div>
                    <div style={{ fontSize: 9.5, color: "var(--muted)", lineHeight: 1.3 }}>{node.details}</div>
                  </div>
                ))}
              </div>

              {/* Choke Point Fix */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 6, padding: "8px 12px" }}>
                <div style={{ fontSize: 11, color: "#10b981" }}>
                  <strong>🛡️ Single Choke-Point Remediation:</strong> {chain.chokePoint}
                </div>
                <Link
                  href="/remediation"
                  style={{ fontSize: 10.5, fontWeight: 800, color: "#10b981", textDecoration: "none", background: "rgba(16,185,129,0.15)", padding: "3px 8px", borderRadius: 4 }}
                >
                  Apply Fix
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
