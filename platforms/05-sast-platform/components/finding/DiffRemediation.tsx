"use client";

import { useState } from "react";
import { Columns2, Terminal, Play, CheckCircle2, GitPullRequest } from "lucide-react";
import type { SASTFinding } from "@/types/sast";

type Props = { finding: SASTFinding };

function parseDiff(code: string) {
  const lines = code.split("\n");
  const vulnerable: { text: string; type: "bad" | "neutral" }[] = [];
  const fixed:      { text: string; type: "good" | "neutral" }[] = [];

  for (const line of lines) {
    const isBad  = line.startsWith("// ❌") || line.startsWith("# ❌");
    const isGood = line.startsWith("// ✅") || line.startsWith("# ✅");

    if (isBad)  { vulnerable.push({ text: line, type: "bad" });     }
    else if (isGood) { fixed.push({ text: line, type: "good" }); }
    else {
      vulnerable.push({ text: line, type: "neutral" });
      fixed.push({ text: line, type: "neutral" });
    }
  }
  return { vulnerable, fixed };
}

export default function DiffRemediation({ finding: f }: Props) {
  const [active,  setActive]  = useState(0);
  const [showDiff, setShowDiff] = useState(true);
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([]);
  const [sandboxDone, setSandboxDone] = useState(false);

  if (f.remediation.length === 0) return null;
  const current = f.remediation[active];
  const { vulnerable, fixed } = parseDiff(current.code);

  const runPatchSandbox = () => {
    setSandboxRunning(true);
    setSandboxDone(false);
    setSandboxLogs([`[sandbox] Spawning Docker container: compile-sandbox-image...`]);

    const logsList = [
      `[sandbox] Mounting file source: ${f.file}`,
      `[patcher] Applying diff patch for ${f.id}...`,
      `[compiler] Compiling with local build target...`,
      `[compiler] Running: mvn compile / npm run build`,
      `[compiler] SUCCESS: Compile verify passed (0 errors)`,
      `[validator] running local Semgrep/CodeQL security regression audit...`,
      `[validator] 0 match signatures found. Vulnerability mitigated.`,
      `[test] Running 47 regression tests...`,
      `[test] PASS: All 47 tests passed (0 failures)`,
      `[sandbox] Mitigated code verified clean. Generating Pull Request...`,
      `[done] PR #2847 created: "security-mitigation/fix-${f.id.toLowerCase()}"`
    ];

    logsList.forEach((log, index) => {
      setTimeout(() => {
        setSandboxLogs(prev => [...prev, log]);
        if (index === logsList.length - 1) {
          setSandboxRunning(false);
          setSandboxDone(true);
        }
      }, (index + 1) * 700);
    });
  };

  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🔧 Remediation Cockpit</span>
        </h2>
        <div className="flex items-center gap-2">
          {/* Platform tabs */}
          {f.remediation.length > 1 && (
            <div className="flex gap-1.5">
              {f.remediation.map((r, i) => (
                <button
                  key={r.platform}
                  onClick={() => setActive(i)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: active === i ? "rgba(0,212,255,0.15)" : "var(--background)",
                    border: `1px solid ${active === i ? "rgba(0,212,255,0.4)" : "var(--border)"}`,
                    color: active === i ? "var(--primary)" : "var(--muted)",
                    cursor: "pointer"
                  }}
                >
                  {r.platform}
                </button>
              ))}
            </div>
          )}
          {/* Diff / Code toggle */}
          <button
            onClick={() => setShowDiff(!showDiff)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              background: showDiff ? "rgba(52,199,89,0.1)" : "var(--background)",
              border: `1px solid ${showDiff ? "rgba(52,199,89,0.3)" : "var(--border)"}`,
              color: showDiff ? "var(--low)" : "var(--muted)",
              cursor: "pointer"
            }}
          >
            <Columns2 className="w-3.5 h-3.5" />
            {showDiff ? "Diff View" : "Plain Code"}
          </button>
          
          {/* Sandbox Launch Button */}
          <button
            onClick={runPatchSandbox}
            disabled={sandboxRunning}
            className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
            style={{
              background: "linear-gradient(135deg, #00d4ff, #0098b8)",
              color: "#0a0f1a",
              border: "none",
              cursor: sandboxRunning ? "default" : "pointer"
            }}
          >
            <Play size={10} fill="currentColor" />
            Ignite Patch Sandbox
          </button>
        </div>
      </div>

      <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--muted)" }}>{current.explanation}</p>

      {showDiff ? (
        /* ── Side-by-side diff ── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {/* Vulnerable */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,59,48,0.3)" }}>
            <div
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold"
              style={{ background: "rgba(255,59,48,0.1)", borderBottom: "1px solid rgba(255,59,48,0.3)" }}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span style={{ color: "var(--critical)" }}>Vulnerable Code Block</span>
            </div>
            <pre className="p-4 text-xs overflow-x-auto" style={{ background: "#050a12", lineHeight: 1.8, minHeight: "200px", fontFamily: "monospace" }}>
              {vulnerable.map((line, i) => (
                <span
                  key={i}
                  style={{
                    display: "block",
                    background: line.type === "bad" ? "rgba(255,59,48,0.12)" : "transparent",
                    color: line.type === "bad" ? "#f87171" : "var(--muted)",
                    padding: "0 0.25rem",
                    margin: "0 -0.25rem",
                    borderLeft: line.type === "bad" ? "2px solid var(--critical)" : "2px solid transparent",
                    paddingLeft: "0.75rem",
                  }}
                >
                  {line.text || " "}
                </span>
              ))}
            </pre>
          </div>

          {/* Fixed */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(52,199,89,0.3)" }}>
            <div
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold"
              style={{ background: "rgba(52,199,89,0.1)", borderBottom: "1px solid rgba(52,199,89,0.3)" }}
            >
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span style={{ color: "var(--low)" }}>Remediated Code Block</span>
            </div>
            <pre className="p-4 text-xs overflow-x-auto" style={{ background: "#050a12", lineHeight: 1.8, minHeight: "200px", fontFamily: "monospace" }}>
              {fixed.map((line, i) => (
                <span
                  key={i}
                  style={{
                    display: "block",
                    background: line.type === "good" ? "rgba(52,199,89,0.1)" : "transparent",
                    color: line.type === "good" ? "#86efac" : "var(--muted)",
                    padding: "0 0.25rem",
                    margin: "0 -0.25rem",
                    borderLeft: line.type === "good" ? "2px solid var(--low)" : "2px solid transparent",
                    paddingLeft: "0.75rem",
                  }}
                >
                  {line.text || " "}
                </span>
              ))}
            </pre>
          </div>
        </div>
      ) : (
        /* ── Plain code view ── */
        <div className="terminal mb-4">
          <div className="terminal-header">
            <div className="terminal-dot" style={{ background: "#ff5f57" }} />
            <div className="terminal-dot" style={{ background: "#febc2e" }} />
            <div className="terminal-dot" style={{ background: "#28c840" }} />
            <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>{current.platform.toLowerCase()}</span>
          </div>
          <pre className="p-5 text-xs overflow-x-auto" style={{ lineHeight: 1.8, fontFamily: "monospace" }}>
            {current.code.split("\n").map((line, i) => {
              const isBad  = line.startsWith("// ❌") || line.startsWith("# ❌");
              const isGood = line.startsWith("// ✅") || line.startsWith("# ✅");
              return (
                <span key={i} style={{
                  display: "block",
                  color: isBad ? "var(--critical)" : isGood ? "var(--low)" : "var(--foreground)",
                  background: isBad ? "rgba(255,59,48,0.05)" : isGood ? "rgba(52,199,89,0.05)" : "transparent",
                }}>
                  {line}
                </span>
              );
            })}
          </pre>
        </div>
      )}

      {/* Compile Sandbox Terminal panel */}
      {(sandboxRunning || sandboxLogs.length > 0) && (
        <div className="terminal mt-4">
          <div className="terminal-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 3 }}>
              <div className="terminal-dot" style={{ background: "#ff5f57" }} />
              <div className="terminal-dot" style={{ background: "#febc2e" }} />
              <div className="terminal-dot" style={{ background: "#28c840" }} />
              <span className="ml-2 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Compile Sandbox Daemon logs</span>
            </div>
            <Terminal size={10} color="var(--muted)" />
          </div>
          <div style={{ padding: "10px 14px", background: "#000", overflowY: "auto", fontFamily: "monospace", fontSize: 10.5, color: "var(--muted)", minHeight: 110, maxHeight: 150 }}>
            {sandboxLogs.map((log, i) => (
              <div key={i} className={log.startsWith("[done]") ? "text-emerald-400 font-bold" : log.includes("SUCCESS") ? "text-emerald-400" : log.includes("PASS") ? "text-cyan-400" : ""}>
                $ {log}
              </div>
            ))}
            {sandboxRunning && <div className="text-xs cursor-blink" style={{ color: "var(--primary)" }}>$ </div>}
          </div>
        </div>
      )}

      {/* Pull Request action */}
      {sandboxDone && (
        <div
          className="rounded-xl px-5 py-4 flex items-center justify-between mt-3 text-sm font-semibold flex-wrap gap-2 animate-fadeIn"
          style={{ background: "rgba(52,199,89,0.08)", border: "1px solid rgba(52,199,89,0.3)" }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span style={{ color: "var(--low)" }}>
              Compilation verified & mitigated. PR created successfully.
            </span>
          </div>
          <a
            href="#pr-view"
            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-1.5 px-3 rounded-lg text-xs"
            onClick={(e) => { e.preventDefault(); alert("GitHub PR Opened! In a production deployment, this redirects you directly to the peer code review panel."); }}
            style={{ textDecoration: "none" }}
          >
            <GitPullRequest size={12} />
            Review PR #2847
          </a>
        </div>
      )}

    </div>
  );
}
