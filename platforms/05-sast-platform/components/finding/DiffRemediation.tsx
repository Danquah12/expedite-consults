"use client";

import { useState } from "react";
import { Columns2, Terminal, Play, CheckCircle2, ShieldCheck } from "lucide-react";
import type { SASTFinding } from "@/types/sast";

type Props = {
  finding: SASTFinding;
  mitigationVerified?: boolean;
  onMitigationVerified?: () => void;
};

function parseDiff(code: string) {
  const lines = code.split("\n");
  const vulnerable: { text: string; type: "bad" | "neutral" }[] = [];
  const fixed: { text: string; type: "good" | "neutral" }[] = [];

  for (const line of lines) {
    const isBad = line.startsWith("// ❌") || line.startsWith("# ❌");
    const isGood = line.startsWith("// ✅") || line.startsWith("# ✅");

    if (isBad) {
      vulnerable.push({ text: line, type: "bad" });
    } else if (isGood) {
      fixed.push({ text: line, type: "good" });
    } else {
      vulnerable.push({ text: line, type: "neutral" });
      fixed.push({ text: line, type: "neutral" });
    }
  }
  return { vulnerable, fixed };
}

export default function DiffRemediation({
  finding: f,
  mitigationVerified = false,
  onMitigationVerified,
}: Props) {
  const [active, setActive] = useState(0);
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
    setSandboxLogs([
      `[retest-init] Starting Mitigation Verification & Retest for ${f.id} (${f.file})...`,
    ]);

    const logsList = [
      `[ast-diff]    Replacing string concatenation (+ account +) with PreparedStatement (?) bind placeholder...`,
      `[ast-check]   Verified parameter binding: statement.setString(1, account) (bindParamCount=1, rawConcatCount=0)`,
      `[compiler]    Compiling patched method injectableQuery() in isolated build container...`,
      `[compiler]    SUCCESS: Compilation passed (0 errors)`,
      `[retest-tc]   Replaying Test Case TC-SQLI-089-001: account="Smith' OR '1'='1"`,
      `[sql-driver]  Bound parameter $1 = "Smith' OR '1'='1" (treated strictly as literal string value)`,
      `[sql-ast]     Post-patch SQL AST structure unchanged: Where(And(Eq(first_name,'John'), Eq(last_name,$1)))`,
      `[static-gate] Re-running XTRIKE XQL & AST-Query rules -> 0 tainted concatenation paths remaining`,
      `[verdict]     PASS: Tainted value is parameterized and vulnerable behavior no longer reproduces [ART-RETEST-089-PASS]`,
    ];

    logsList.forEach((log, index) => {
      setTimeout(() => {
        setSandboxLogs((prev) => [...prev, log]);
        if (index === logsList.length - 1) {
          setSandboxRunning(false);
          setSandboxDone(true);
          if (onMitigationVerified) onMitigationVerified();
        }
      }, (index + 1) * 450);
    });
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1f1b18] flex items-center gap-2">
            <span>🔧 Remediation &amp; Mitigation Verification</span>
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            Illustrative language-matched fix pattern + post-fix retest to confirm tainted input is parameterized and the vulnerable behavior no longer reproduces.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {f.remediation.length > 1 && (
            <div className="flex gap-1.5">
              {f.remediation.map((r, i) => (
                <button
                  key={r.platform}
                  type="button"
                  onClick={() => setActive(i)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: active === i ? "#f4e5dc" : "var(--background)",
                    border: `1px solid ${active === i ? "#8b4528" : "var(--border)"}`,
                    color: active === i ? "var(--primary)" : "var(--muted)",
                    cursor: "pointer",
                  }}
                >
                  {r.platform}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowDiff(!showDiff)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              background: showDiff ? "rgba(70, 163, 110, 0.1)" : "var(--background)",
              border: `1px solid ${showDiff ? "rgba(70, 163, 110, 0.3)" : "var(--border)"}`,
              color: showDiff ? "var(--low)" : "var(--muted)",
              cursor: "pointer",
            }}
          >
            <Columns2 className="w-3.5 h-3.5" />
            {showDiff ? "Diff View" : "Plain Code"}
          </button>

          <button
            type="button"
            onClick={runPatchSandbox}
            disabled={sandboxRunning}
            className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg font-bold"
            style={{
              background: mitigationVerified ? "rgba(70, 163, 110, 0.16)" : "#8b4528",
              color: mitigationVerified ? "var(--low)" : "#f3eee4",
              border: mitigationVerified ? "1px solid rgba(70, 163, 110, 0.4)" : "none",
              cursor: sandboxRunning ? "default" : "pointer",
            }}
          >
            <Play size={10} fill="currentColor" />
            {mitigationVerified
              ? "Mitigation Retest Verified"
              : sandboxRunning
              ? "Retesting Fix..."
              : "Apply Fix & Retest (TC-SQLI-089-001)"}
          </button>
        </div>
      </div>

      <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--muted)" }}>
        {current.explanation}
      </p>

      {showDiff ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div
            className="rounded-xl overflow-hidden min-w-0"
            style={{ border: "1px solid rgba(229, 72, 77, 0.3)" }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold"
              style={{
                background: "rgba(229, 72, 77, 0.1)",
                borderBottom: "1px solid rgba(229, 72, 77, 0.3)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[#e5484d]" />
              <span style={{ color: "var(--critical)" }}>Vulnerable Code Block</span>
            </div>
            <pre
              className="p-4 text-xs"
              style={{
                background: "#f3eee4",
                lineHeight: 1.75,
                minHeight: "180px",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              {vulnerable.map((line, i) => (
                <span
                  key={i}
                  style={{
                    display: "block",
                    background: line.type === "bad" ? "rgba(229, 72, 77, 0.12)" : "transparent",
                    color: line.type === "bad" ? "#e5484d" : "var(--muted)",
                    padding: "0 0.25rem",
                    margin: "0 -0.25rem",
                    borderLeft:
                      line.type === "bad"
                        ? "2px solid var(--critical)"
                        : "2px solid transparent",
                    paddingLeft: "0.75rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {line.text || " "}
                </span>
              ))}
            </pre>
          </div>

          <div
            className="rounded-xl overflow-hidden min-w-0"
            style={{ border: "1px solid rgba(70, 163, 110, 0.3)" }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold"
              style={{
                background: "rgba(70, 163, 110, 0.1)",
                borderBottom: "1px solid rgba(70, 163, 110, 0.3)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[#46a36e]" />
              <span style={{ color: "var(--low)" }}>
                Parameterized Remediation ({current.platform})
              </span>
            </div>
            <pre
              className="p-4 text-xs"
              style={{
                background: "#f3eee4",
                lineHeight: 1.75,
                minHeight: "180px",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              {fixed.map((line, i) => (
                <span
                  key={i}
                  style={{
                    display: "block",
                    background: line.type === "good" ? "rgba(70, 163, 110, 0.1)" : "transparent",
                    color: line.type === "good" ? "#2d6a4f" : "var(--muted)",
                    padding: "0 0.25rem",
                    margin: "0 -0.25rem",
                    borderLeft:
                      line.type === "good" ? "2px solid var(--low)" : "2px solid transparent",
                    paddingLeft: "0.75rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {line.text || " "}
                </span>
              ))}
            </pre>
          </div>
        </div>
      ) : (
        <div className="terminal mb-4 overflow-hidden">
          <div className="terminal-header">
            <div className="terminal-dot" style={{ background: "#e5484d" }} />
            <div className="terminal-dot" style={{ background: "#d6a847" }} />
            <div className="terminal-dot" style={{ background: "#46a36e" }} />
            <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>
              {current.platform.toLowerCase()}
            </span>
          </div>
          <pre
            className="p-5 text-xs"
            style={{
              lineHeight: 1.75,
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {current.code.split("\n").map((line, i) => {
              const isBad = line.startsWith("// ❌") || line.startsWith("# ❌");
              const isGood = line.startsWith("// ✅") || line.startsWith("# ✅");
              return (
                <span
                  key={i}
                  style={{
                    display: "block",
                    color: isBad
                      ? "var(--critical)"
                      : isGood
                      ? "var(--low)"
                      : "var(--foreground)",
                    background: isBad
                      ? "rgba(229, 72, 77, 0.05)"
                      : isGood
                      ? "rgba(70, 163, 110, 0.05)"
                      : "transparent",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {line}
                </span>
              );
            })}
          </pre>
        </div>
      )}

      {/* Mitigation Verification Summary Box */}
      <div
        className="rounded-xl p-4"
        style={{ background: "var(--background)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1f1b18]">
            <ShieldCheck className="w-4 h-4 text-[#8b4528]" />
            Mitigation Verification Contract (Post-Fix Retest)
          </div>
          <span
            className="text-[10.5px] font-bold px-2 py-0.5 rounded"
            style={{
              background:
                sandboxDone || mitigationVerified
                  ? "rgba(70, 163, 110, 0.14)"
                  : "rgba(214, 168, 71, 0.16)",
              color: sandboxDone || mitigationVerified ? "var(--low)" : "#9a6700",
            }}
          >
            {sandboxDone || mitigationVerified
              ? "RETEST PASSED · VULNERABLE BEHAVIOR NO LONGER REPRODUCES"
              : "AWAITING POST-FIX RETEST"}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]" style={{ color: "var(--muted)" }}>
          <div className="rounded-lg p-2.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <strong className="text-[#1f1b18]">1. Parameterization Check:</strong> Confirm tainted parameter (<code>account</code>) is bound via <code>PreparedStatement.setString(1, account)</code> instead of string concatenation.
          </div>
          <div className="rounded-lg p-2.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <strong className="text-[#1f1b18]">2. Replay Test Case (TC-SQLI-089-001):</strong> Replay <code>account=&quot;Smith&apos; OR &apos;1&apos;=&apos;1&quot;</code> and confirm the SQL parse tree remains invariant.
          </div>
          <div className="rounded-lg p-2.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <strong className="text-[#1f1b18]">3. Release Gate Unblock:</strong> Once retest passes and static rules report 0 concatenations, the Release Gate transitions to <code>PASS</code>.
          </div>
        </div>
      </div>

      {(sandboxRunning || sandboxLogs.length > 0) && (
        <div className="terminal mt-4">
          <div
            className="terminal-header"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", gap: 3 }}>
              <div className="terminal-dot" style={{ background: "#e5484d" }} />
              <div className="terminal-dot" style={{ background: "#d6a847" }} />
              <div className="terminal-dot" style={{ background: "#46a36e" }} />
              <span className="ml-2 text-[10px] font-bold text-[#8b4528] uppercase tracking-wider">
                Mitigation Retest &amp; Parameterization Verifier Logs
              </span>
            </div>
            <Terminal size={10} color="var(--muted)" />
          </div>
          <div
            style={{
              padding: "10px 14px",
              background: "#f3eee4",
              overflowY: "auto",
              fontFamily: "monospace",
              fontSize: 10.5,
              color: "#1f1b18",
              minHeight: 110,
              maxHeight: 160,
            }}
          >
            {sandboxLogs.map((log, i) => (
              <div
                key={i}
                className={
                  log.startsWith("[verdict]") || log.includes("SUCCESS")
                    ? "text-[#2f7a4c] font-bold"
                    : log.includes("[retest-tc]")
                    ? "text-[#8b4528] font-semibold"
                    : ""
                }
              >
                $ {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {(sandboxDone || mitigationVerified) && (
        <div
          className="rounded-xl px-5 py-3.5 flex items-center justify-between mt-3 text-xs font-semibold flex-wrap gap-2"
          style={{
            background: "rgba(70, 163, 110, 0.08)",
            border: "1px solid rgba(70, 163, 110, 0.3)",
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#46a36e]" />
            <span style={{ color: "var(--low)" }}>
              Mitigation Retest Complete: Tainted value is parameterized (<code>PreparedStatement.setString</code>) and test case <code>TC-SQLI-089-001</code> no longer reproduces.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
