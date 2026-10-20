"use client";

import { useState } from "react";
import { Terminal, Copy, CheckCircle2, Bot, Layers, Sparkles } from "lucide-react";

export default function McpServerPage() {
  const [copied, setCopied] = useState(false);

  const mcpConfig = `{
  "mcpServers": {
    "xtrike-sast": {
      "command": "npx",
      "args": ["@xtrike/mcp-sast-server"],
      "env": {
        "XTRIKE_API_KEY": "xt_live_948fbc2819e94",
        "XTRIKE_HYBRID_ENGINE": "true"
      }
    }
  }
}`;

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 4, background: "#f4e5dc", border: "1px solid var(--border)", color: "#8b4528", fontSize: 11, fontWeight: 800, marginBottom: 8 }}>
          <Terminal size={13} />
          <span>XTRIKE MCP SPECIFICATION &middot; MODEL CONTEXT PROTOCOL</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1f1b18" }}>XTRIKE MCP Server &amp; IDE Hub</h1>
        <p style={{ fontSize: 14, color: "#5c5349" }}>
          Connect XTRIKE IDE extensions and desktop agents directly to XTRIKE SAST hybrid analysis via the Model Context Protocol.
        </p>
      </div>

      <div style={{ background: "#fbf8f3", border: "1px solid var(--border)", borderRadius: 14, padding: 22, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "#1f1b18" }}>XTRIKE IDE / Agent Config (xtrike_mcp_config.json)</h2>
          <button
            onClick={() => {
              navigator.clipboard.writeText(mcpConfig);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{
              background: "#f4e5dc",
              border: "1px solid var(--border)",
              color: "#8b4528",
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
          background: "#f3eee4",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 14,
          fontSize: 12.5,
          fontFamily: "monospace",
          color: "#8b4528",
          lineHeight: 1.5
        }}>
          {mcpConfig}
        </pre>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <div style={{ background: "#ece5d8", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1f1b18", marginBottom: 6 }}>tool: scan_active_buffer</div>
          <p style={{ fontSize: 12, color: "#5c5349" }}>Runs AST + XTRIKE Neural-Triage scan on the developer's unsaved in-memory editor buffer.</p>
        </div>
        <div style={{ background: "#ece5d8", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1f1b18", marginBottom: 6 }}>tool: generate_1click_fix</div>
          <p style={{ fontSize: 12, color: "#5c5349" }}>Sends AST patch directly to the developer's IDE workspace to apply line edits automatically.</p>
        </div>
        <div style={{ background: "#ece5d8", border: "1px solid rgba(226, 133, 59, 0.25)", borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1f1b18", marginBottom: 6 }}>tool: explain_taint_path</div>
          <p style={{ fontSize: 12, color: "#5c5349" }}>Returns plain-English explanation of untrusted source-to-sink reachability.</p>
        </div>
      </div>
    </div>
  );
}
