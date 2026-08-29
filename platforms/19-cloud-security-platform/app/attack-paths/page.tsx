"use client";

import { useState } from "react";
import {
  GitGraph,
  ShieldAlert,
  Target,
  Key,
  Database,
  Server,
  Zap,
  ArrowRight,
  CheckCircle2,
  Code,
  Lock,
  Play
} from "lucide-react";
import { ATTACK_PATH_CHAINS } from "@/data/cloudData";

export default function AttackPathsPage() {
  const [selectedChainId, setSelectedChainId] = useState(ATTACK_PATH_CHAINS[0].id);
  const activeChain = ATTACK_PATH_CHAINS.find(c => c.id === selectedChainId) || ATTACK_PATH_CHAINS[0];

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(244,63,94,0.35)"
          }}>
            <GitGraph size={20} color="#060913" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>
              Multi-Cloud Attack Path Engine &amp; Blast Radius Visualizer
            </h1>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>
              Flagship Differentiator: Chained Exploit Simulation across AWS STS, Azure RBAC, GCP Service Accounts &amp; Kubernetes
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {ATTACK_PATH_CHAINS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedChainId(c.id)}
              style={{
                padding: "6px 12px",
                background: selectedChainId === c.id ? "rgba(245,158,11,0.2)" : "var(--surface)",
                border: `1px solid ${selectedChainId === c.id ? "#f59e0b" : "var(--border)"}`,
                color: selectedChainId === c.id ? "#f59e0b" : "var(--muted)",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              {c.provider}: Chain #{c.id.split("-")[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chain Visualizer */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Left: Interactive Node/Edge Graph */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#f8fafc", margin: 0 }}>
              {activeChain.name}
            </h3>
            <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 4, background: "rgba(244,63,94,0.15)", color: "#f43f5e", fontWeight: 800 }}>
              DEPTH: {activeChain.depth} HOPS
            </span>
          </div>

          {/* Graph Nodes Sequence */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {activeChain.nodes.map((node, idx) => (
              <div key={node.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  flex: 1,
                  background: "var(--surface-2)",
                  border: `1px solid ${node.type === "CROWN_JEWEL" ? "#f43f5e" : node.type === "PRIVILEGE_ESCALATION" ? "#f59e0b" : "var(--border)"}`,
                  borderRadius: 8,
                  padding: 14,
                  boxShadow: node.type === "CROWN_JEWEL" ? "0 0 15px rgba(244,63,94,0.15)" : "none"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#06b6d4" }}>NODE 0{idx + 1} &middot; {node.type}</span>
                    <span style={{ fontSize: 9.5, padding: "1px 6px", borderRadius: 4, background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontWeight: 700 }}>
                      Risk: {node.riskScore}/100
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>{node.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{node.details}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Blast Radius & Automated Remediation */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#f8fafc", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldAlert size={15} color="#f43f5e" /> Estimated Blast Radius
            </h3>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#f43f5e", marginBottom: 8 }}>
              {activeChain.estimatedBlastRadius}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
              Exploit Feasibility: <strong style={{ color: "#f59e0b" }}>{activeChain.exploitFeasibility}</strong>. An adversary entering through {activeChain.entryPoint} can leverage the intermediate IAM privilege escalations to assume unrestricted administrative control over {activeChain.targetAsset}.
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#f8fafc", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <Code size={15} color="#10b981" /> Choke-Point IaC Remediation
            </h3>
            <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700, marginBottom: 8 }}>
              {activeChain.chokePoint}
            </div>
            <pre style={{ background: "#050811", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: 12, fontSize: 10.5, color: "#94a3b8", fontFamily: "monospace", overflowX: "auto" }}>
              {activeChain.remediationSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
