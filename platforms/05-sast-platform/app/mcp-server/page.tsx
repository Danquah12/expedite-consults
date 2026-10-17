"use client";

import { useState } from "react";
import { Terminal, Copy, CheckCircle2, Bot, Layers, Sparkles } from "lucide-react";

export default function McpServerPage() {
  const [copied, setCopied] = useState(false);

  const mcpConfig = `{
  "mcpServers": {
    "axiom-sast": {
      "command": "npx",
      "args": ["@axiom/mcp-sast-server"],
      "env": {
        "AXIOM_API_KEY": "ax_live_948fbc2819e94",
        "AXIOM_HYBRID_ENGINE": "true"
      }
    }
  }
}`;

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 4, background: "rgba(122, 162, 247, 0.15)", border: "1px solid var(--border)", color: "#7aa2f7", fontSize: 11, fontWeight: 800, marginBottom: 8 }}>
          <Terminal size={13} />
          <span>CHECKMARX MCP SPECIFICATION &middot; MODEL CONTEXT PROTOCOL</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#ececef" }}>AXIOM MCP Server &amp; IDE Hub</h1>
        <p style={{ fontSize: 14, color: "#9aa0ab" }}>
          Connect Cursor, VS Code, Windsurf, and Claude Desktop directly to SAST hybrid analysis via the open Model Context Protocol.
        </p>
      </div>

      <div style={{ background: "rgba(22, 25, 31, 0.8)", border: "1px solid var(--border)", borderRadius: 14, padding: 22, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "#ececef" }}>Cursor / Claude Desktop Config (claude_desktop_config.json)</h2>
          <button
            onClick={() => {
              navigator.clipboard.writeText(mcpConfig);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{
              background: "rgba(122, 162, 247, 0.2)",
              border: "1px solid var(--border)",
              color: "#7aa2f7",
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            {copied ? <CheckCircle2 size={13} color="#46a36e" /> : <Copy size={13} />}
            <span>{copied ? "Copied JSON" : "Copy Configuration"}</span>
          </button>
        </div>

        <pre style={{
          background: "#0f1115",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 14,
          fontSize: 12.5,
          fontFamily: "monospace",
          color: "#7aa2f7",
          lineHeight: 1.5
        }}>
          {mcpConfig}
        </pre>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <div style={{ background: "rgba(28, 32, 40, 0.6)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#ececef", marginBottom: 6 }}>tool: scan_active_buffer</div>
          <p style={{ fontSize: 12, color: "#9aa0ab" }}>Runs AST + Frontier AI scan on the developer's unsaved in-memory editor buffer.</p>
        </div>
        <div style={{ background: "rgba(28, 32, 40, 0.6)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#ececef", marginBottom: 6 }}>tool: generate_1click_fix</div>
          <p style={{ fontSize: 12, color: "#9aa0ab" }}>Sends AST patch directly to Cursor/VS Code to apply line edits automatically.</p>
        </div>
        <div style={{ background: "rgba(28, 32, 40, 0.6)", border: "1px solid rgba(226, 133, 59, 0.25)", borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#ececef", marginBottom: 6 }}>tool: explain_taint_path</div>
          <p style={{ fontSize: 12, color: "#9aa0ab" }}>Returns plain-English explanation of untrusted source-to-sink reachability.</p>
        </div>
      </div>
    </div>
  );
}
