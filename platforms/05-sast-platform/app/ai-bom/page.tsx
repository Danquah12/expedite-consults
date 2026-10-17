"use client";

import { useState } from "react";
import { Box, Sparkles, ShieldCheck, AlertTriangle, Cpu, Terminal, Layers, ArrowRight } from "lucide-react";

export default function AIBomPage() {
  const models = [
    {
      id: "AI-M-01",
      name: "meta-llama/Llama-3-8B-Instruct",
      source: "Hugging Face Hub",
      format: "Safetensors (GGUF)",
      license: "Llama 3 Community",
      risk: "LOW",
      promptInjectionRisk: "Guarded (LlamaGuard 3)",
      vulnerabilities: "None (SHA-256 Verified)"
    },
    {
      id: "AI-M-02",
      name: "langchain-rag-agent-v2",
      source: "Internal Repo / LLM Chain",
      format: "Python LangGraph Pipeline",
      license: "Proprietary",
      risk: "CRITICAL",
      promptInjectionRisk: "Direct Indirect Injection in User Prompt",
      vulnerabilities: "CVE-2024-LangChain-Eval (Untrusted Code Exec)"
    },
    {
      id: "AI-M-03",
      name: "sentence-transformers/all-MiniLM-L6-v2",
      source: "Hugging Face Embeddings",
      format: "PyTorch / ONNX",
      license: "Apache-2.0",
      risk: "LOW",
      promptInjectionRisk: "N/A (Embedding Only)",
      vulnerabilities: "Clean Model Weights"
    },
    {
      id: "AI-M-04",
      name: "mcp-filesystem-server-v1",
      source: "Model Context Protocol (MCP)",
      format: "JSON-RPC Stdio Server",
      license: "MIT",
      risk: "HIGH",
      promptInjectionRisk: "Directory Traversal via Tool Arguments",
      vulnerabilities: "Path Escape in fs_read tool"
    }
  ];

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: 30 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 4, background: "rgba(226, 133, 59, 0.15)", border: "1px solid rgba(226, 133, 59, 0.4)", color: "#e2853b", fontSize: 11, fontWeight: 800, marginBottom: 8 }}>
          <Box size={13} />
          <span>CHECKMARX AI SUPPLY CHAIN &amp; AI-BOM</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#ececef" }}>AI Inventory &amp; AI-BOM Security Hub</h1>
        <p style={{ fontSize: 14, color: "#9aa0ab" }}>
          Inventory, verify, and monitor LLM model weights, LangChain/LlamaIndex pipelines, prompt injection vectors, and MCP server endpoints.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
        <div style={{ background: "rgba(22, 25, 31, 0.8)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>Discovered AI Assets</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#ececef", marginTop: 4 }}>1,420 Models</div>
        </div>
        <div style={{ background: "rgba(22, 25, 31, 0.8)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>MCP Server Endpoints</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#7aa2f7", marginTop: 4 }}>38 Active Tools</div>
        </div>
        <div style={{ background: "rgba(22, 25, 31, 0.8)", border: "1px solid rgba(229, 72, 77, 0.3)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>Prompt Injection Risks</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#e5484d", marginTop: 4 }}>2 Critical</div>
        </div>
      </div>

      <div style={{ background: "rgba(22, 25, 31, 0.8)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#ececef" }}>AI-BOM Components &amp; Model Lineage</h2>
          <span style={{ fontSize: 12, color: "#e2853b", fontWeight: 700 }}>CycloneDX AI-BOM 1.6</span>
        </div>

        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {models.map(m => (
            <div key={m.id} style={{ background: "rgba(28, 32, 40, 0.7)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: "rgba(122, 162, 247, 0.2)", color: "#7aa2f7" }}>{m.id}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#ececef" }}>{m.name}</span>
                </div>
                <span style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: m.risk === "CRITICAL" ? "rgba(229, 72, 77, 0.2)" : m.risk === "HIGH" ? "rgba(226, 133, 59, 0.2)" : "rgba(70, 163, 110, 0.2)",
                  color: m.risk === "CRITICAL" ? "#e5484d" : m.risk === "HIGH" ? "#e2853b" : "#46a36e"
                }}>
                  {m.risk} RISK
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, fontSize: 12, color: "#9aa0ab" }}>
                <div>Source: <span style={{ color: "#c3c7cf" }}>{m.source}</span></div>
                <div>Format: <span style={{ color: "#c3c7cf" }}>{m.format}</span></div>
                <div>Injection Risk: <span style={{ color: "#7aa2f7" }}>{m.promptInjectionRisk}</span></div>
                <div>Vulnerabilities: <span style={{ color: m.risk === "LOW" ? "#46a36e" : "#e5484d" }}>{m.vulnerabilities}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
