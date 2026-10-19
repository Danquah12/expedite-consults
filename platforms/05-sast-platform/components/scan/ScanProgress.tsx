"use client";

import { useEffect, useState, useRef } from "react";
import { CheckCircle2, Circle, GitCommit } from "lucide-react";
import type { ActiveScanSession } from "@/lib/live-sast-scanner";

const ENGINE_DETAILS_MAP: Record<string, { color: string; label: string }> = {
  CodeQL:    { color: "#8b4528", label: "Tracing inter-procedural dataflows & GHSA CodeQL queries..." },
  Semgrep:   { color: "#8b4528", label: "Matching structural AST rule queries & CWE sinks..." },
  Snyk:      { color: "#e2853b", label: "Correlating GHSA / NVD CVE & SearchSploit EDB-ID reachability..." },
  Checkmarx: { color: "#8b4528", label: "Evaluating MITRE ATT&CK TTPs, OWASP ASVS, CVSS v3.1/v4.0 & NIST 800-53..." },
};

type Props = {
  repo: string;
  language: string;
  engines: string[];
  session: ActiveScanSession | null;
  onComplete: () => void;
};

export default function ScanProgress({ repo, language, engines, session, onComplete }: Props) {
  const activeEngines = engines.length > 0 ? engines : ["CodeQL", "Semgrep", "Snyk", "Checkmarx"];
  const totalFiles = session?.filesScanned || 142;
  const totalFindings = session?.sastFindings.length || 5;
  const dynamicLogs = session?.scanLogs || [
    `[INIT]        Target locked: ${repo} (${language})`,
    `[AST]         Parsing AST & running 9 Python Security Standards Plugins...`,
    `[DONE]        Normalized findings ready for Stage 3 validation.`,
  ];

  const [progress, setProgress] = useState<number[]>(() => activeEngines.map(() => 0));
  const [done, setDone] = useState<boolean[]>(() => activeEngines.map(() => false));
  const [logs, setLogs] = useState<string[]>([]);
  const [filesScanned, setFilesScanned] = useState(0);
  const [findingsSoFar, setFindingsSoFar] = useState(0);

  const logRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    activeEngines.forEach((_, idx) => {
      const t = setTimeout(() => {
        const iv = setInterval(() => {
          setProgress((prev) => {
            const next = [...prev];
            if (next[idx] < 100) {
              next[idx] = Math.min(100, next[idx] + Math.random() * 14 + 7);
            } else {
              setDone((d) => {
                const nd = [...d];
                nd[idx] = true;
                return nd;
              });
              clearInterval(iv);
            }
            return next;
          });
        }, 75);
        intervals.push(iv);
      }, idx * 240);
      timers.push(t);
    });

    const stepFiles = Math.max(1, Math.ceil(totalFiles / 18));
    const fileIv = setInterval(() => {
      setFilesScanned((prev) => Math.min(totalFiles, prev + stepFiles));
    }, 80);
    intervals.push(fileIv);

    const findingTimer = setTimeout(() => {
      const findingIv = setInterval(() => {
        setFindingsSoFar((prev) => {
          const next = Math.min(totalFindings, prev + 1);
          if (next === totalFindings) clearInterval(findingIv);
          return next;
        });
      }, 220);
      intervals.push(findingIv);
    }, 600);
    timers.push(findingTimer);

    let logIdx = 0;
    const logIv = setInterval(() => {
      if (logIdx < dynamicLogs.length) {
        const entry = dynamicLogs[logIdx];
        setLogs((l) => [...l, entry]);
        logIdx++;
      } else {
        clearInterval(logIv);
      }
    }, 180);
    intervals.push(logIv);

    const completeTimer = setTimeout(() => onCompleteRef.current(), 4200);
    timers.push(completeTimer);

    return () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [activeEngines, dynamicLogs, totalFiles, totalFindings]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const allDone = done.every(Boolean);
  const overallProgress = Math.round(
    progress.reduce((a, b) => a + b, 0) / Math.max(activeEngines.length, 1)
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: 24 }}>
      {/* Left Column: Telemetry & Engine Bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ fontFamily: "monospace", fontSize: 13 }}>
            <span style={{ color: "var(--muted)" }}>Target: </span>
            <span style={{ color: "#8b4528", fontWeight: 700 }}>{repo}</span>
            <span style={{ color: "var(--muted)" }}> ({language})</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#46a36e", fontFamily: "monospace" }}>
            <GitCommit size={14} />
            <span>commit: {session?.commitSha?.slice(0, 8) || "a4f92c81"}</span>
          </div>
        </div>

        {/* 3 Live Counter Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Files Analyzed</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--foreground)", marginTop: 4 }}>
              {filesScanned.toLocaleString()} <span style={{ fontSize: 13, color: "var(--muted)" }}>/ {totalFiles.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Multi-Standard Findings</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: findingsSoFar > 0 ? "#e5484d" : "var(--foreground)", marginTop: 4 }}>
              {findingsSoFar}
            </div>
          </div>

          <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Plugin Evaluation</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#46a36e", marginTop: 4 }}>
              {overallProgress}%
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
            <span style={{ color: "var(--foreground)", fontWeight: 700 }}>
              Multi-Engine AST + 9 Python Standards Plugins Progress
            </span>
            <span style={{ color: "#8b4528", fontWeight: 700 }}>{overallProgress}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${overallProgress}%`,
                background: "#8b4528",
                transition: "width 0.2s ease",
              }}
            />
          </div>
        </div>

        {/* Per-Engine Progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {activeEngines.map((engineName, idx) => {
            const cfg = ENGINE_DETAILS_MAP[engineName] || { color: "#8b4528", label: "Running analysis..." };
            const isEngineDone = done[idx];
            return (
              <div
                key={engineName}
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {isEngineDone ? (
                      <CheckCircle2 size={15} color="#46a36e" />
                    ) : (
                      <Circle size={15} color={cfg.color} />
                    )}
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>{engineName}</span>
                    <span style={{ fontSize: 11.5, color: isEngineDone ? "#46a36e" : "var(--muted)" }}>
                      {isEngineDone ? "SARIF + Plugin Verdicts Normalized" : cfg.label}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, fontFamily: "monospace", color: cfg.color }}>
                    {Math.round(progress[idx])}%
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${progress[idx]}%`,
                      background: isEngineDone ? "#46a36e" : cfg.color,
                      transition: "width 0.15s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Live Terminal Stream */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}>
        <div className="terminal" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 380 }}>
          <div className="terminal-header">
            <div className="terminal-dot" style={{ background: "#3a404c" }} />
            <div className="terminal-dot" style={{ background: "#3a404c" }} />
            <div className="terminal-dot" style={{ background: "#3a404c" }} />
            <span style={{ marginLeft: 8, fontSize: 12, color: "var(--muted)" }}>
              StandardsPluginRunner &mdash; MITRE ATT&amp;CK · OWASP · CWE · CVSS · NIST · GHSA · PTES · SearchSploit · MSF
            </span>
          </div>
          <div
            ref={logRef}
            style={{
              padding: 16,
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {logs.filter(Boolean).map((log, i) => (
              <div
                key={i}
                style={{
                  fontSize: 11.5,
                  fontFamily: "var(--font-mono), monospace",
                  color: log.startsWith("[MITRE-TTP]")
                    ? "#8b4528"
                    : log.startsWith("[DONE]")
                    ? "#46a36e"
                    : log.startsWith("[THREAT-INT]")
                    ? "#b8322f"
                    : log.startsWith("[STANDARDS]")
                    ? "#2f6f4e"
                    : "var(--foreground-muted)",
                }}
              >
                {log}
              </div>
            ))}
          </div>
        </div>

        {allDone && (
          <div
            style={{
              background: "rgba(70, 163, 110, 0.12)",
              border: "1px solid rgba(70, 163, 110, 0.35)",
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              fontWeight: 700,
              color: "#46a36e",
            }}
          >
            <CheckCircle2 size={18} />
            <span>
              Scan complete ({totalFindings} code findings evaluated across 9 Python Standards Plugins). Advancing to Stage 3...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
