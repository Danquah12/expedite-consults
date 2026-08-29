"use client";
import { useState, useRef } from "react";
import { COLLECTIONS, ENVIRONMENTS } from "@/data/findings";
import { methodColor, methodBg, statusColor, formatMs } from "@/lib/utils";
import type { ApiRequest } from "@/types/api";
import { Play, Square, Settings, CheckCircle, XCircle, AlertTriangle, Upload } from "lucide-react";

interface RunResult {
  req:       ApiRequest;
  status:    number;
  time:      number;
  passed:    number;
  failed:    number;
  tests:     { name: string; passed: boolean }[];
  iteration: number;
}

const CSV_DATA = `username,password,expected_status
admin@acme.com,admin123,200
user@acme.com,user123,200
attacker@evil.com,wrongpass,401
;DROP TABLE users--,admin123,400`;

export default function RunnerPage() {
  const col           = COLLECTIONS[0];
  const allReqs       = col.folders.flatMap(f => [...f.requests, ...(f.folders?.flatMap(sf => sf.requests) ?? [])]);
  const [selected, setSelected]   = useState<Set<string>>(new Set(allReqs.map(r => r.id)));
  const [iterations, setIter]     = useState(1);
  const [delay,     setDelay]     = useState(0);
  const [stopOnFail, setStopFail] = useState(false);
  const [dataMode,  setDataMode]  = useState(false);
  const [running,   setRunning]   = useState(false);
  const [results,   setResults]   = useState<RunResult[]>([]);
  const [progress,  setProgress]  = useState(0);
  const [done,      setDone]      = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeEnv = ENVIRONMENTS.find(e => e.active);

  const toggle = (id: string) => setSelected(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const run = async () => {
    setRunning(true); setResults([]); setProgress(0); setDone(false);
    const reqs = allReqs.filter(r => selected.has(r.id));
    const total = reqs.length * iterations;
    let done = 0;

    for (let i = 0; i < iterations; i++) {
      for (const req of reqs) {
        if (delay > 0) await new Promise(r => setTimeout(r, delay));
        else await new Promise(r => setTimeout(r, 280 + Math.random() * 220));

        const isSecTest = req.tags.includes("security") || req.tags.includes("sqli") || req.tags.includes("xss") || req.tags.includes("jwt");
        const status = isSecTest ? (req.tags.includes("jwt") ? 401 : Math.random() > 0.5 ? 200 : 500) : 200;
        const time   = Math.floor(Math.random() * 180 + 60);
        const tests  = req.testScript
          ? req.testScript.split("test(").slice(1).map((t, ti) => {
              const name = t.split('"')[1] || t.split("'")[1] || `Test ${ti + 1}`;
              const passed = status === 200 || name.includes("rejected") || name.includes("403") || name.includes("sanitized") || name.includes("escalation");
              return { name, passed };
            })
          : [];
        const result: RunResult = {
          req, status, time, iteration: i + 1,
          passed: tests.filter(t => t.passed).length,
          failed: tests.filter(t => !t.passed).length,
          tests,
        };
        done++;
        setResults(rs => [...rs, result]);
        setProgress(Math.round((done / total) * 100));
        if (stopOnFail && result.failed > 0) { setRunning(false); setDone(true); return; }
      }
    }
    setRunning(false); setDone(true);
  };

  const passed = results.filter(r => r.failed === 0).length;
  const failed = results.filter(r => r.failed > 0).length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Play size={12} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>Collection Runner</span>
        <select className="tool-select" style={{ marginLeft: 8, fontSize: 11 }}>
          {COLLECTIONS.map(c => <option key={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {running
            ? <button className="btn-secondary" onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setRunning(false); }}><Square size={11} color="#ef5350" /> Stop</button>
            : <button className="btn-primary" onClick={run} disabled={selected.size === 0}><Play size={12} /> Run {selected.size} Requests</button>
          }
        </div>
      </div>

      {progress > 0 && (
        <div style={{ padding: "0 12px 4px", flexShrink: 0 }}>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%`, background: done ? "var(--green)" : "var(--primary)" }} /></div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3, display: "flex", gap: 12 }}>
            <span>{progress}%</span>
            {done && <><span style={{ color: "var(--green)" }}>✓ {passed} passed</span><span style={{ color: "#ef5350" }}>✗ {failed} failed</span></>}
          </div>
        </div>
      )}

      <div className="split-h" style={{ flex: 1 }}>
        {/* Config panel */}
        <div style={{ width: 280, flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div className="tool-panel-header" style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
            <Settings size={11} /> Run Configuration
          </div>
          <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
            {/* Settings */}
            <div style={{ padding: "6px 12px 10px" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>Iterations</div>
                  <input className="tool-input" type="number" min={1} max={100} value={iterations} onChange={e => setIter(+e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>Delay (ms)</div>
                  <input className="tool-input" type="number" min={0} value={delay} onChange={e => setDelay(+e.target.value)} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 11.5 }}>
                <input type="checkbox" id="stopfail" checked={stopOnFail} onChange={e => setStopFail(e.target.checked)} style={{ accentColor: "var(--primary)" }} />
                <label htmlFor="stopfail" style={{ color: "var(--muted)", cursor: "pointer" }}>Stop on failure</label>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 11.5 }}>
                <input type="checkbox" id="datamode" checked={dataMode} onChange={e => setDataMode(e.target.checked)} style={{ accentColor: "var(--primary)" }} />
                <label htmlFor="datamode" style={{ color: "var(--muted)", cursor: "pointer" }}>Data file (CSV/JSON)</label>
              </div>
              <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 3 }}>Environment</div>
              <select className="tool-select" style={{ width: "100%", fontSize: 11 }}>
                {ENVIRONMENTS.map(e => <option key={e.id} selected={e.active}>{e.name}</option>)}
              </select>
            </div>

            {dataMode && (
              <div style={{ margin: "0 12px 10px", borderRadius: 5, border: "1px solid var(--border)" }}>
                <div style={{ padding: "5px 8px", fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>Data File (CSV)</div>
                <pre style={{ padding: 8, fontSize: 10, color: "#a5d6a7", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{CSV_DATA}</pre>
                <div style={{ padding: "4px 8px", borderTop: "1px solid var(--border)", display: "flex", gap: 4 }}>
                  <button className="btn-secondary" style={{ fontSize: 10, padding: "2px 6px" }}><Upload size={9} /> Upload</button>
                </div>
              </div>
            )}

            {/* Request list with checkboxes */}
            <div style={{ padding: "6px 12px 4px", fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Requests ({selected.size}/{allReqs.length} selected)
            </div>
            {allReqs.map((r, i) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", borderBottom: "1px solid var(--border)" }}>
                <input type="checkbox" checked={selected.has(r.id)} style={{ accentColor: "var(--primary)" }} onChange={() => toggle(r.id)} />
                <span style={{ fontSize: 10, color: "var(--muted)", width: 16, textAlign: "right" }}>{i + 1}</span>
                <span className="pill" style={{ background: methodBg(r.method), color: methodColor(r.method), fontSize: 8.5 }}>{r.method}</span>
                <span style={{ fontSize: 11, color: "var(--foreground)", flex: 1 }}>{r.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div className="tool-panel-header" style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
            Results
            {done && <span style={{ marginLeft: "auto" }}>
              <span style={{ color: "var(--green)" }}>✓ {passed}</span> / <span style={{ color: "#ef5350" }}>✗ {failed}</span>
            </span>}
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table className="data-table">
              <thead><tr><th style={{ width: 24 }}>#</th><th style={{ width: 60 }}>Method</th><th>Request</th><th style={{ width: 50 }}>Status</th><th style={{ width: 60 }}>Time</th><th style={{ width: 50 }}>Tests</th><th style={{ width: 40 }} /></tr></thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td style={{ color: "var(--muted)", fontSize: 10 }}>{r.iteration > 1 ? `${r.iteration}.` : ""}{i + 1}</td>
                    <td><span className="pill" style={{ background: methodBg(r.req.method), color: methodColor(r.req.method), fontSize: 9 }}>{r.req.method}</span></td>
                    <td style={{ color: "var(--foreground)", fontWeight: 500 }}>{r.req.name}</td>
                    <td style={{ color: statusColor(r.status), fontFamily: "monospace", fontWeight: 700 }}>{r.status}</td>
                    <td style={{ color: "var(--muted)", fontFamily: "monospace" }}>{r.time}ms</td>
                    <td>
                      {r.tests.length > 0
                        ? <span style={{ color: r.failed > 0 ? "#ef5350" : "var(--green)", fontWeight: 700, fontSize: 11 }}>{r.passed}/{r.tests.length}</span>
                        : <span style={{ color: "var(--muted)", fontSize: 10 }}>—</span>
                      }
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {r.failed === 0 && r.tests.length > 0 && <CheckCircle size={12} color="var(--green)" />}
                      {r.failed > 0 && <XCircle size={12} color="#ef5350" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length === 0 && !running && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
                Select requests and click Run to execute the collection
              </div>
            )}
          </div>

          {/* Summary */}
          {done && (
            <div style={{ borderTop: "1px solid var(--border)", padding: "10px 14px", display: "flex", gap: 16, flexShrink: 0 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                <span style={{ color: "#fff", fontWeight: 700 }}>{results.length}</span> requests ·{" "}
                <span style={{ color: "var(--green)", fontWeight: 700 }}>{passed}</span> passed ·{" "}
                <span style={{ color: "#ef5350", fontWeight: 700 }}>{failed}</span> failed ·{" "}
                <span style={{ color: "var(--muted)" }}>avg {Math.round(results.reduce((a, r) => a + r.time, 0) / (results.length || 1))}ms</span>
              </div>
              <button className="btn-secondary" style={{ marginLeft: "auto", fontSize: 11 }}>Export Report</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
