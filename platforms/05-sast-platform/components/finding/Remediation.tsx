"use client";

import { useState } from "react";
import type { SASTFinding } from "@/types/sast";

type Props = { finding: SASTFinding };

export default function Remediation({ finding: f }: Props) {
  const [active, setActive] = useState(0);

  if (f.remediation.length === 0) return null;
  const current = f.remediation[active];

  const lines = current.code.split("\n");

  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <h2 className="text-lg font-bold text-white mb-5">🔧 Remediation Guide</h2>

      {f.remediation.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {f.remediation.map((r, i) => (
            <button
              key={r.platform}
              onClick={() => setActive(i)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active === i ? "rgba(0,212,255,0.15)" : "var(--background)",
                border: `1px solid ${active === i ? "rgba(0,212,255,0.4)" : "var(--border)"}`,
                color: active === i ? "var(--primary)" : "var(--muted)",
              }}
            >
              {r.platform}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--muted)" }}>{current.explanation}</p>

      <div className="terminal">
        <div className="terminal-header">
          <div className="terminal-dot" style={{ background: "#ff5f57" }} />
          <div className="terminal-dot" style={{ background: "#febc2e" }} />
          <div className="terminal-dot" style={{ background: "#28c840" }} />
          <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>{current.platform.toLowerCase()}</span>
        </div>
        <pre className="p-5 text-xs overflow-x-auto" style={{ lineHeight: 1.8 }}>
          {lines.map((line, i) => {
            const isVulnerable = line.startsWith("// ❌") || line.startsWith("# ❌");
            const isFixed      = line.startsWith("// ✅") || line.startsWith("# ✅");
            return (
              <span
                key={i}
                style={{
                  display: "block",
                  color: isVulnerable ? "var(--critical)" : isFixed ? "var(--low)" : "var(--foreground)",
                  background: isVulnerable ? "rgba(255,59,48,0.05)" : isFixed ? "rgba(52,199,89,0.05)" : "transparent",
                  paddingLeft: "0.25rem",
                  marginLeft: "-0.25rem",
                }}
              >
                {line}
              </span>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
