"use client";

import { useState, useEffect } from "react";
import { Code2, Play, Terminal } from "lucide-react";
import type { SASTFinding } from "@/types/sast";

type Props = { finding: SASTFinding };

const FINDING_CODE_SAMPLES: Record<string, { code: string; lineStart: number; steps: { line: number; label: string; details: string }[] }> = {
  "F-001": {
    code: `package com.api;
import org.springframework.jdbc.core.JdbcTemplate;
import javax.servlet.http.HttpServletRequest;

public class UserController {
    private JdbcTemplate jdbcTemplate;

    public String getUser(HttpServletRequest request) {
        String id = request.getParameter("id");
        
        // String concatenation creates unsafe query
        String sql = "SELECT * FROM users WHERE id = " + id;
        
        // Execute vulnerable query sink
        return jdbcTemplate.query(sql, new UserRowMapper());
    }
}`,
    lineStart: 135,
    steps: [
      { line: 142, label: "Source Input", details: "Unsanitized parameter 'id' enters the application from HTTP request query string." },
      { line: 145, label: "Taint Propagation", details: "Unsanitized string flows directly into query builder variable concatenation." },
      { line: 148, label: "Vulnerable Sink", details: "jdbcTemplate.query executes query string directly on SQL DB without bind variables." }
    ]
  },
  "F-002": {
    code: `package com.api;
import java.io.ObjectInputStream;
import javax.servlet.http.Cookie;

public class SessionManager {
    public Object loadSession(HttpServletRequest request) {
        Cookie sessionCookie = request.getCookies()[0];
        byte[] data = Base64.decode(sessionCookie.getValue());
        
        // Deserialization starts
        ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data));
        return ois.readObject();
    }
}`,
    lineStart: 80,
    steps: [
      { line: 86, label: "Source Input", details: "User session cookie loaded directly from client request cookies." },
      { line: 87, label: "Taint Decode", details: "Base64 decodes cookie payload, preparing binary array for parsing." },
      { line: 90, label: "ObjectInputStream", details: "ObjectInputStream initializes over base64 decoded cookie payload." },
      { line: 91, label: "Critical Sink", details: "ois.readObject executes deserialization trigger, opening remote execution gadget vectors." }
    ]
  }
};

export default function EvidencePanel({ finding: f }: Props) {
  const sample = FINDING_CODE_SAMPLES[f.id] || {
    code: f.taintPath.join("\n"),
    lineStart: f.line - 1,
    steps: f.taintPath.map((t, idx) => ({ line: f.line + idx, label: idx === 0 ? "Source Input" : idx === f.taintPath.length - 1 ? "Sink Node" : "Propagation Path", details: t }))
  };

  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>(["[ready] Trace Simulator online. Click 'Simulate Trace' to play."]);

  useEffect(() => {
    if (!isPlaying) return;

    let current = 0;
    setSimulationLogs([`[start] Initializing dataflow simulation for ${f.id}...`]);

    const iv = setInterval(() => {
      if (current < sample.steps.length) {
        setActiveStep(current);
        const step = sample.steps[current];
        setSimulationLogs(l => [
          ...l,
          `[flow] Step ${current + 1} — Node: ${step.label} at Line ${step.line}`,
          `  └> Input: "${f.taintPath[current] || "tainted_var"}"`
        ]);
        current++;
      } else {
        setIsPlaying(false);
        setSimulationLogs(l => [...l, `[done] ✅ Dataflow path trace confirmed reachable!`]);
        clearInterval(iv);
      }
    }, 1500);

    return () => clearInterval(iv);
  }, [isPlaying, f.id, sample.steps, f.taintPath]);

  const triggerPlay = () => {
    setIsPlaying(true);
    setActiveStep(0);
  };

  const codeLines = sample.code.trim().split("\n");

  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      
      <div className="flex items-center justify-between mb-4 border-b pb-3" style={{ borderColor: "var(--border)" }}>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-cyan-400" />
          Interactive Taint Flow Simulator
        </h2>
        <button
          onClick={triggerPlay}
          disabled={isPlaying}
          className="btn-primary flex items-center gap-1 text-xs py-1.5 px-3"
          style={{
            background: isPlaying ? "var(--border)" : "linear-gradient(135deg, #00d4ff, #0098b8)",
            color: isPlaying ? "var(--muted)" : "#0a0f1a",
            border: "none",
            cursor: isPlaying ? "default" : "pointer"
          }}
        >
          <Play size={10} fill="currentColor" />
          {isPlaying ? "Simulating..." : "Simulate Trace"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>Taint Hops:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sample.steps.map((step, idx) => {
              const isSelected = activeStep === idx;
              const isSource = idx === 0;
              const isSink = idx === sample.steps.length - 1;

              return (
                <div
                  key={idx}
                  onClick={() => { if (!isPlaying) setActiveStep(idx); }}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: isSelected ? "rgba(0,212,255,0.08)" : "var(--bg)",
                    border: isSelected ? "1px solid rgba(0,212,255,0.4)" : "1px solid var(--border)",
                    cursor: isPlaying ? "default" : "pointer",
                    position: "relative",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: isSource ? "rgba(239,83,80,0.15)" : isSink ? "rgba(239,83,80,0.2)" : "rgba(255,255,255,0.06)",
                      color: isSource || isSink ? "#ef5350" : "var(--muted)"
                    }}>
                      Hop {idx + 1}: {step.label}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace", marginLeft: "auto" }}>
                      Line {step.line}
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, fontFamily: "monospace", color: "#fff", margin: "4px 0", wordBreak: "break-all" }}>
                    {f.taintPath[idx]}
                  </div>
                  <div style={{ fontSize: 9.5, color: "var(--muted)", lineHeight: "1.3" }}>
                    {step.details}
                  </div>
                  {idx < sample.steps.length - 1 && (
                    <div style={{
                      position: "absolute",
                      bottom: -15,
                      left: 20,
                      height: 10,
                      width: 1,
                      borderLeft: "2px dashed var(--border)",
                      zIndex: 10
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>Target Code View:</div>
          <div className="terminal" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div className="terminal-header">
              <div className="terminal-dot" style={{ background: "#ff5f57" }} />
              <div className="terminal-dot" style={{ background: "#febc2e" }} />
              <div className="terminal-dot" style={{ background: "#28c840" }} />
              <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>{f.file.split("/").pop()}</span>
            </div>
            <div style={{ padding: 12, fontFamily: "monospace", fontSize: 11, overflowY: "auto", flex: 1, background: "var(--bg)", maxHeight: 310 }}>
              {codeLines.map((line, i) => {
                const currentLineNum = sample.lineStart + i;
                const activeLineNum = sample.steps[activeStep]?.line;
                const isSelected = activeLineNum === currentLineNum;

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      background: isSelected ? "rgba(0,212,255,0.08)" : "transparent",
                      borderLeft: isSelected ? "3px solid var(--primary)" : "3px solid transparent",
                      padding: "1.5px 0",
                      marginRight: -12,
                      marginLeft: -12,
                      paddingLeft: isSelected ? 9 : 12
                    }}
                  >
                    <span style={{ width: 28, color: "var(--border)", flexShrink: 0, userSelect: "none" }}>
                      {currentLineNum}
                    </span>
                    <span style={{
                      color: isSelected
                        ? "var(--primary)"
                        : line.startsWith("import") || line.startsWith("package")
                        ? "var(--muted)"
                        : line.trim().startsWith("//")
                        ? "#6a737d"
                        : "#fff",
                      fontStyle: line.trim().startsWith("//") ? "italic" : "normal",
                      whiteSpace: "pre"
                    }}>
                      {line}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      <div className="terminal" style={{ marginTop: 12 }}>
        <div className="terminal-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 3 }}>
            <div className="terminal-dot" style={{ background: "#ff5f57" }} />
            <div className="terminal-dot" style={{ background: "#febc2e" }} />
            <div className="terminal-dot" style={{ background: "#28c840" }} />
            <span className="ml-2 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Taint Analyzer Output console</span>
          </div>
          <Terminal size={10} color="var(--muted)" />
        </div>
        <div style={{ padding: "8px 12px", background: "#000", overflowY: "auto", fontFamily: "monospace", fontSize: 10, color: "var(--muted)", height: 80 }}>
          {simulationLogs.map((log, i) => (
            <div key={i} className={log.includes("✅") ? "text-emerald-400" : log.includes("Step") ? "text-cyan-400" : ""}>
              $ {log}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
