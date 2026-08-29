"use client";

import { useEffect, useState, useRef } from "react";
import { CheckCircle2, Circle, FileCode2 } from "lucide-react";

const ENGINE_DETAILS_MAP: Record<string, { color: string; label: string }> = {
  CodeQL:   { color: "#6e40c9", label: "Tracing dataflows & taint paths..." },
  Semgrep:  { color: "#1f8dd6", label: "Matching structural rule queries..." },
  Snyk:     { color: "#f48fb1", label: "Evaluating package dependencies (SCA)..." },
  Checkmarx:{ color: "#00d4ff", label: "Auditing enterprise compliance standards..." }
};

const ALL_LOGS = [
  "[INIT]     Cloning repository...",
  "[INIT]     Extracting source files (1,247 files, 89,342 LOC)...",
  "[PARSE]    Building Abstract Syntax Tree...",
  "[ENGINES]  Starting parallel analysis",
  "[CodeQL]   Taint flow: UserController.java:142 → jdbcTemplate.query()",
  "[Semgrep]  MATCH: java.sql-injection rule at line 142",
  "[Checkmarx] Compliance validation: SQLi fails PCI-DSS Req 6.2.4",
  "[CodeQL]   Deserialization gadget chain: SessionManager.java:87",
  "[Semgrep]  MATCH: jwt-none-algorithm at auth.middleware.ts:22",
  "[Snyk]     VULNERABILITY: jwt-none-algorithm matches CVE-2024-3456",
  "[Checkmarx] CSRF protection disabled at config/WebSecurityConfig.java:31",
  "[Snyk]     OUTDATED: postgres:16-alpine matches CVE-2024-1234",
  "[AI]       Running Challenge Agent — validating findings...",
  "[AI]       Confidence scoring complete. 27 findings validated.",
  "[DONE]     Scan complete — generating report...",
];

const TOTAL_FILES = 1247;
const TOTAL_FINDINGS = 27;

type Props = { repo: string; language: string; engines: string[]; onComplete: () => void };

export default function ScanProgress({ repo, language, engines, onComplete }: Props) {
  // If no engines selected (fallback), default to all
  const activeEngines = engines.length > 0 ? engines : ["CodeQL", "Semgrep", "Snyk", "Checkmarx"];

  const [progress, setProgress] = useState<number[]>(() => activeEngines.map(() => 0));
  const [done, setDone] = useState<boolean[]>(() => activeEngines.map(() => false));
  const [logs, setLogs] = useState<string[]>([]);
  const [filesScanned, setFilesScanned] = useState(0);
  const [findingsSoFar, setFindingsSoFar] = useState(0);
  
  const logRef        = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[]   = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    // Engine progress
    activeEngines.forEach((_, idx) => {
      const t = setTimeout(() => {
        const iv = setInterval(() => {
          setProgress(prev => {
            const next = [...prev];
            if (next[idx] < 100) {
              next[idx] = Math.min(100, next[idx] + Math.random() * 9 + 3);
            } else {
              setDone(d => { const nd = [...d]; nd[idx] = true; return nd; });
              clearInterval(iv);
            }
            return next;
          });
        }, 90);
        intervals.push(iv);
      }, idx * 450);
      timers.push(t);
    });

    // Live file counter
    const fileIv = setInterval(() => {
      setFilesScanned(prev => Math.min(TOTAL_FILES, prev + Math.floor(Math.random() * 40 + 15)));
    }, 70);
    intervals.push(fileIv);

    // Live findings counter
    const findingTimer = setTimeout(() => {
      const findingIv = setInterval(() => {
        setFindingsSoFar(prev => {
          const next = Math.min(TOTAL_FINDINGS, prev + 1);
          if (next === TOTAL_FINDINGS) clearInterval(findingIv);
          return next;
        });
      }, 150);
      intervals.push(findingIv);
    }, 1800);
    timers.push(findingTimer);

    // Log stream - filtered by active engines
    let logIdx = 0;
    const logIv = setInterval(() => {
      if (logIdx < ALL_LOGS.length) {
        const currentLog = ALL_LOGS[logIdx];
        
        // Skip log if it belongs to an inactive engine
        const isEngineLog = currentLog.startsWith("[");
        if (isEngineLog) {
          const engineNameMatch = currentLog.match(/^\[([^\]\s]+)\]/);
          const logEngine = engineNameMatch ? engineNameMatch[1] : null;
          
          if (
            logEngine &&
            !["INIT", "PARSE", "ENGINES", "AI", "DONE"].includes(logEngine) &&
            !activeEngines.includes(logEngine)
          ) {
            logIdx++;
            return; // Skip inactive engine log
          }
        }

        setLogs(l => [...l, currentLog]);
        logIdx++;
      } else {
        clearInterval(logIv);
      }
    }, 320);
    intervals.push(logIv);

    const completeTimer = setTimeout(() => onCompleteRef.current(), 6400);
    timers.push(completeTimer);

    return () => { timers.forEach(clearTimeout); intervals.forEach(clearInterval); };
  }, [activeEngines]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const allDone = done.every(Boolean);
  const overallProgress = Math.round(progress.reduce((a, b) => a + b, 0) / Math.max(activeEngines.length, 1));

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      {/* Target */}
      <div className="rounded-xl px-5 py-3.5 text-sm font-mono" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <span style={{ color: "var(--muted)" }}>Scanning Target: </span>
        <span style={{ color: "var(--primary)" }}>{repo}</span>
        <span style={{ color: "var(--muted)" }}> ({language})</span>
      </div>

      {/* Live counter bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Files Analyzed", value: `${filesScanned.toLocaleString()} / ${TOTAL_FILES.toLocaleString()}`, icon: FileCode2, color: "var(--primary)" },
          { label: "Vulnerabilities Found", value: `${findingsSoFar}`, icon: CheckCircle2, color: findingsSoFar > 0 ? "var(--critical)" : "var(--muted)" },
          { label: "Analysis Status", value: `${overallProgress}%`, icon: null, color: "var(--low)" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-3 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="text-xl font-black mb-0.5" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-[10px]" style={{ color: "var(--muted)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--muted)" }}>
          <span>Overall analysis progress</span>
          <span style={{ color: "var(--primary)" }}>{overallProgress}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface)" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${overallProgress}%`,
              background: "linear-gradient(90deg, #6e40c9, #1f8dd6, #f48fb1, #00d4ff)",
            }}
          />
        </div>
      </div>

      {/* Engine progress bars */}
      <div className="space-y-3">
        {activeEngines.map((engineName, idx) => {
          const cfg = ENGINE_DETAILS_MAP[engineName] || { color: "#8b949e", label: "Running engine analysis..." };
          const isEngineDone = done[idx];
          return (
            <div key={engineName}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {isEngineDone ? (
                    <CheckCircle2 className="w-4 h-4" style={{ color: "var(--low)" }} />
                  ) : (
                    <Circle className="w-4 h-4" style={{ color: cfg.color }} />
                  )}
                  <span className="text-sm font-semibold text-white">{engineName}</span>
                  {!isEngineDone && progress[idx] > 0 && (
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{cfg.label}</span>
                  )}
                  {isEngineDone && <span className="text-xs" style={{ color: "var(--low)" }}>Verification Confirmed</span>}
                </div>
                <span className="text-sm font-mono" style={{ color: cfg.color }}>{Math.round(progress[idx])}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface)" }}>
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{ width: `${progress[idx]}%`, background: `linear-gradient(90deg, ${cfg.color}99, ${cfg.color})` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal log */}
      <div className="terminal">
        <div className="terminal-header">
          <div className="terminal-dot" style={{ background: "#ff5f57" }} />
          <div className="terminal-dot" style={{ background: "#febc2e" }} />
          <div className="terminal-dot" style={{ background: "#28c840" }} />
          <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>sast-pipeline-stream — {language}</span>
        </div>
        <div ref={logRef} className="p-4 h-40 overflow-y-auto space-y-1">
          {logs.filter(Boolean).map((log, i) => (
            <div
              key={i}
              className="text-xs"
              style={{
                color: log.startsWith("[AI]")       ? "#a78bfa"
                     : log.startsWith("[DONE]")     ? "var(--low)"
                     : log.startsWith("[CodeQL]")   ? "#9d71e8"
                     : log.startsWith("[Semgrep]")  ? "#4da8da"
                     : log.startsWith("[Snyk]")     ? "#f48fb1"
                     : log.startsWith("[Checkmarx]")? "var(--primary)"
                     : "var(--muted)",
              }}
            >
              {log}
            </div>
          ))}
          {!allDone && <div className="text-xs cursor-blink" style={{ color: "var(--primary)" }}>$ </div>}
        </div>
      </div>

      {allDone && (
        <div
          className="rounded-xl px-5 py-4 flex items-center gap-3 text-sm font-semibold"
          style={{ background: "rgba(52,199,89,0.08)", border: "1px solid rgba(52,199,89,0.3)" }}
        >
          <CheckCircle2 className="w-5 h-5" style={{ color: "var(--low)" }} />
          <span style={{ color: "var(--low)" }}>
            Scan complete — {TOTAL_FINDINGS} findings across {TOTAL_FILES.toLocaleString()} files. Redirecting to dashboard...
          </span>
        </div>
      )}
    </div>
  );
}
