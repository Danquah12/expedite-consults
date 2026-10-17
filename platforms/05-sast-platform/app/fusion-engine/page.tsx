"use client";

import { useState } from "react";
import { Sparkles, Cpu, Bot, CheckCircle2, XCircle, AlertTriangle, ArrowRight, RefreshCw, Shield, Zap, Terminal } from "lucide-react";

export default function FusionEnginePage() {
  const [running, setRunning] = useState(false);

  const findings = [
    {
      id: "FUS-01",
      vuln: "SQL Injection in User Profile Lookup",
      file: "controllers/userController.ts:L34",
      ruleEngineVerdict: "CRITICAL (Pattern Match)",
      llmTriageVerdict: "TRUE POSITIVE",
      confidence: "99.8%",
      fpEliminated: false,
      reasoning: "User parameter 'req.query.id' concatenated directly into raw Postgres query without parameterized bindings or ORM escaping."
    },
    {
      id: "FUS-02",
      vuln: "Server-Side Request Forgery (SSRF)",
      file: "services/webhookDispatcher.ts:L88",
      ruleEngineVerdict: "HIGH (Sink: fetch)",
      llmTriageVerdict: "FALSE POSITIVE ELIMINATED",
      confidence: "99.4%",
      fpEliminated: true,
      reasoning: "LLM verified private subnet guard is present at L82 (isPrivateIP regex and DNS re-binding resolver blocks RFC 1918 / AWS IMDS)."
    },
    {
      id: "FUS-03",
      vuln: "Hardcoded High-Entropy Secret Token",
      file: "config/jwtSigner.ts:L12",
      ruleEngineVerdict: "HIGH (Entropy 5.4)",
      llmTriageVerdict: "FALSE POSITIVE ELIMINATED",
      confidence: "98.9%",
      fpEliminated: true,
      reasoning: "Token is an example placeholder in unit test mock stub ('TEST_MOCK_SECRET_KEY_12345') and cannot be executed in production."
    },
    {
      id: "FUS-04",
      vuln: "Remote Code Execution (RCE) via Deserialization",
      file: "workers/jobProcessor.ts:L54",
      ruleEngineVerdict: "CRITICAL (Sink: node-serialize)",
      llmTriageVerdict: "TRUE POSITIVE",
      confidence: "99.9%",
      fpEliminated: false,
      reasoning: "Untrusted JSON-wrapped buffer parsed by vulnerable node-serialize library with IIFE executable payload trigger."
    }
  ];

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 4, background: "rgba(226, 133, 59, 0.15)", border: "1px solid rgba(226, 133, 59, 0.4)", color: "#e2853b", fontSize: 11, fontWeight: 800, marginBottom: 8 }}>
            <Sparkles size={13} />
            <span>CHECKMARX FUSION &middot; HYBRID ENGINE SPECIFICATION</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#ececef" }}>AXIOM Fusion Hybrid Scanning Studio</h1>
          <p style={{ fontSize: 14, color: "#9aa0ab" }}>
            Combining deterministic Semgrep AST pattern rules with Frontier LLM reasoning to achieve &gt;99% precision.
          </p>
        </div>

        <button
          onClick={() => {
            setRunning(true);
            setTimeout(() => setRunning(false), 1200);
          }}
          style={{
            background: "#7aa2f7",
            color: "#0f1115",
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "none"
          }}
        >
          <RefreshCw size={14} className={running ? "animate-spin" : ""} />
          <span>{running ? "Analyzing with Claude 3.7..." : "Run Hybrid Fusion Benchmark"}</span>
        </button>
      </div>

      <div style={{
        background: "rgba(22, 25, 31, 0.8)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 24,
        marginBottom: 30,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 20
      }}>
        <div style={{ background: "rgba(28, 32, 40, 0.6)", padding: 16, borderRadius: 12, border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#7aa2f7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#0f1115" }}>1</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#ececef" }}>Deterministic AST Match</div>
          </div>
          <p style={{ fontSize: 12, color: "#9aa0ab" }}>Scans 100k lines of code in 1.4s using Semgrep rules and CodeQL predicates.</p>
          <div style={{ marginTop: 10, fontSize: 11, color: "#7aa2f7", fontWeight: 700 }}>Candidate Findings: 42 Detected</div>
        </div>

        <div style={{ background: "rgba(28, 32, 40, 0.6)", padding: 16, borderRadius: 12, border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#7aa2f7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#0f1115" }}>2</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#ececef" }}>Data-Flow Taint Tracing</div>
          </div>
          <p style={{ fontSize: 12, color: "#9aa0ab" }}>Extracts inter-procedural AST call paths from source parameter to database sink.</p>
          <div style={{ marginTop: 10, fontSize: 11, color: "#7aa2f7", fontWeight: 700 }}>Reachable Paths: 14 Validated</div>
        </div>

        <div style={{ background: "rgba(28, 32, 40, 0.6)", padding: 16, borderRadius: 12, border: "1px solid rgba(226, 133, 59, 0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e2853b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#0f1115" }}>3</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#ececef" }}>Frontier AI Triage &amp; Fix</div>
          </div>
          <p style={{ fontSize: 12, color: "#9aa0ab" }}>Anthropic Claude 3.7 eliminates benign matches and generates 1-click git diff fixes.</p>
          <div style={{ marginTop: 10, fontSize: 11, color: "#46a36e", fontWeight: 700 }}>True Positives: 2 Confirmed (94.2% FP Cut)</div>
        </div>
      </div>

      <div style={{ background: "rgba(22, 25, 31, 0.8)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#ececef" }}>Hybrid Fusion Triage Log</h2>
          <span style={{ fontSize: 12, color: "#7aa2f7", fontWeight: 700 }}>4 Analyzed in Sandbox</span>
        </div>

        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          {findings.map((f) => (
            <div
              key={f.id}
              style={{
                background: "rgba(28, 32, 40, 0.7)",
                border: f.fpEliminated ? "1px solid rgba(70, 163, 110, 0.3)" : "1px solid rgba(229, 72, 77, 0.3)",
                borderRadius: 12,
                padding: 16
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: "rgba(122, 162, 247, 0.2)", color: "#7aa2f7" }}>
                    {f.id}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#ececef" }}>{f.vuln}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>{f.file}</span>
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 4,
                    background: f.fpEliminated ? "rgba(70, 163, 110, 0.2)" : "rgba(229, 72, 77, 0.2)",
                    color: f.fpEliminated ? "#46a36e" : "#e5484d"
                  }}>
                    {f.llmTriageVerdict}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: 12.5, color: "#9aa0ab", lineHeight: 1.5, background: "rgba(15, 17, 21, 0.6)", padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)" }}>
                <strong style={{ color: "#7aa2f7" }}>Frontier AI Reasoning: </strong> {f.reasoning}
              </div>

              <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 11, color: "#6f7581" }}>
                  Raw AST Rule: <span style={{ color: "#c3c7cf" }}>{f.ruleEngineVerdict}</span> &middot; Confidence: <span style={{ color: "#7aa2f7" }}>{f.confidence}</span>
                </div>
                {!f.fpEliminated && (
                  <button
                    style={{
                      background: "#7aa2f7",
                      border: "none",
                      color: "#0f1115",
                      fontSize: 11.5,
                      fontWeight: 800,
                      padding: "4px 12px",
                      borderRadius: 6,
                      cursor: "pointer"
                    }}
                  >
                    Generate 1-Click Fix
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
