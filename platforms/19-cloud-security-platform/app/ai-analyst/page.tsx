"use client";

import { useState } from "react";
import { Bot, Send, Sparkles, Code, Shield } from "lucide-react";

export default function AIAnalystPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! I am your AXIOM AI Cloud Security Copilot. Ask me to explain attack paths, generate Terraform remediation scripts, or prioritize cloud vulnerabilities." }
  ]);

  const handleSend = () => {
    if (!query) return;
    setMessages(prev => [
      ...prev,
      { sender: "user", text: query },
      { sender: "ai", text: "Analysis Complete: The identified attack path involves an EC2 SSRF reading IMDSv1 tokens. To eliminate this choke-point, enforce IMDSv2 with 'http_tokens = required' in your AWS Terraform configuration." }
    ]);
    setQuery("");
  };

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bot size={20} color="#060913" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>AI Cloud Security Analyst &amp; IaC Copilot</h1>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Natural-Language Attack Path Reasoning &middot; Terraform / OpenTofu Generation</div>
        </div>
      </div>

      <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20, overflowY: "auto", marginBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 12, display: "flex", justifyContent: m.sender === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "75%", background: m.sender === "user" ? "rgba(245,158,11,0.2)" : "var(--surface-2)", border: `1px solid ${m.sender === "user" ? "#f59e0b" : "var(--border)"}`, borderRadius: 8, padding: 12, fontSize: 11.5, color: "#f8fafc" }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="text"
          placeholder="Ask AXIOM Copilot (e.g., 'How to fix Azure Key Vault Contributor escalation?')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", color: "#f8fafc", padding: "10px 14px", borderRadius: 8, fontSize: 12, outline: "none" }}
        />
        <button onClick={handleSend} style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#060913", padding: "10px 18px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
