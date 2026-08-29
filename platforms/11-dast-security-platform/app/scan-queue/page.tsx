"use client";
import { useState } from "react";
import { Layers, Play, Square, Pause, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { sevColor, sevBg } from "@/lib/utils";
import type { Severity } from "@/types/dast";

type Status = "Queued" | "Running" | "Paused" | "Completed" | "Failed" | "Cancelled";

interface ScanJob {
  id:          string;
  name:        string;
  target:      string;
  status:      Status;
  progress:    number;
  plugins:     number;
  findings:    number;
  severity:    Severity | null;
  started:     string;
  duration:    string;
  engine:      string;
  scheduled?:  string;
}

const JOBS: ScanJob[] = [
  { id: "j1", name: "ACME App — Full Scan",       target: "app.target.local",    status: "Running",   progress: 68, plugins: 15, findings: 5, severity: "Critical", started: "14:22:01", duration: "4m 17s",  engine: "Aggressive" },
  { id: "j2", name: "API Security Audit",          target: "api.target.local",    status: "Queued",    progress: 0,  plugins: 12, findings: 0, severity: null,       started: "—",        duration: "—",       engine: "Normal" },
  { id: "j3", name: "Admin Portal Retest",         target: "admin.target.local",  status: "Paused",    progress: 45, plugins: 8,  findings: 2, severity: "High",     started: "13:55:30", duration: "2m 10s",  engine: "Normal" },
  { id: "j4", name: "Nightly Regression Scan",     target: "staging.target.local",status: "Completed", progress: 100,plugins: 15, findings: 8, severity: "Critical", started: "00:00:01", duration: "18m 42s", engine: "Normal",    scheduled: "Daily 00:00" },
  { id: "j5", name: "WAF Bypass Test",             target: "app.target.local",    status: "Failed",    progress: 23, plugins: 5,  findings: 0, severity: null,       started: "12:30:00", duration: "1m 02s",  engine: "Aggressive" },
  { id: "j6", name: "OWASP Top 10 Baseline",       target: "app.target.local",    status: "Completed", progress: 100,plugins: 10, findings: 3, severity: "High",     started: "11:00:00", duration: "11m 25s", engine: "Normal" },
  { id: "j7", name: "Scheduled Weekly Deep Scan",  target: "*.target.local",      status: "Queued",    progress: 0,  plugins: 15, findings: 0, severity: null,       started: "—",        duration: "—",       engine: "Aggressive", scheduled: "Sunday 02:00" },
];

const statusColor = (s: Status) => s === "Running" ? "var(--green)" : s === "Queued" ? "var(--blue)" : s === "Paused" ? "var(--yellow)" : s === "Completed" ? "var(--primary)" : s === "Failed" ? "#ef5350" : "var(--muted)";
const statusIcon  = (s: Status) => {
  if (s === "Completed") return <CheckCircle size={12} color="var(--primary)" />;
  if (s === "Failed")    return <XCircle size={12} color="#ef5350" />;
  if (s === "Paused")    return <AlertTriangle size={12} color="var(--yellow)" />;
  return null;
};

export default function ScanQueuePage() {
  const [jobs, setJobs] = useState<ScanJob[]>(JOBS);
  const [selected, setSelected] = useState<ScanJob | null>(jobs[0]);

  const update = (id: string, status: Status) =>
    setJobs(js => js.map(j => j.id === id ? { ...j, status } : j));

  const running  = jobs.filter(j => j.status === "Running").length;
  const queued   = jobs.filter(j => j.status === "Queued").length;
  const complete = jobs.filter(j => j.status === "Completed").length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Layers size={13} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>Scan Queue</span>
        <span style={{ fontSize: 11, color: "var(--green)" }}>{running} running</span>
        <span style={{ color: "var(--muted)", fontSize: 11 }}>·</span>
        <span style={{ fontSize: 11, color: "var(--blue)" }}>{queued} queued</span>
        <span style={{ color: "var(--muted)", fontSize: 11 }}>·</span>
        <span style={{ fontSize: 11, color: "var(--primary)" }}>{complete} complete</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className="btn-primary"><Play size={11} /> New Scan</button>
        </div>
      </div>

      <div className="split-h" style={{ flex: 1 }}>
        {/* Job list */}
        <div style={{ flex: 1, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Scan Name</th>
                  <th>Target</th>
                  <th style={{ width: 80 }}>Status</th>
                  <th style={{ width: 90 }}>Progress</th>
                  <th style={{ width: 55 }}>Findings</th>
                  <th style={{ width: 60 }}>Duration</th>
                  <th style={{ width: 80 }}>Engine</th>
                  <th style={{ width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j.id} onClick={() => setSelected(j)} className={selected?.id === j.id ? "selected" : ""}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        {statusIcon(j.status)}
                        <span style={{ color: "var(--fg)", fontWeight: 500 }}>{j.name}</span>
                        {j.scheduled && <span style={{ fontSize: 9.5, color: "var(--blue)", background: "rgba(79,195,247,0.08)", padding: "0 5px", borderRadius: 8 }}>⏰ {j.scheduled}</span>}
                      </div>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)" }}>{j.target}</td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 600, color: statusColor(j.status) }}>
                        {j.status === "Running" && <span className="animate-pulse" style={{ marginRight: 4 }}>●</span>}
                        {j.status}
                      </span>
                    </td>
                    <td>
                      {j.progress > 0 ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ flex: 1, height: 5, background: "var(--surface)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${j.progress}%`, height: "100%", background: statusColor(j.status), borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 10, color: "var(--muted)", width: 28, textAlign: "right", fontFamily: "monospace" }}>{j.progress}%</span>
                        </div>
                      ) : <span style={{ fontSize: 10, color: "var(--muted)" }}>—</span>}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {j.findings > 0
                        ? <span style={{ color: sevColor(j.severity ?? "Low"), fontWeight: 700 }}>{j.findings}</span>
                        : <span style={{ color: "var(--muted)" }}>—</span>}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)" }}>{j.duration}</td>
                    <td style={{ fontSize: 10, color: "var(--muted)" }}>{j.engine}</td>
                    <td>
                      <div style={{ display: "flex", gap: 3 }}>
                        {j.status === "Running"  && <button onClick={e => { e.stopPropagation(); update(j.id, "Paused"); }}    title="Pause"  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--yellow)" }}><Pause size={11} /></button>}
                        {j.status === "Paused"   && <button onClick={e => { e.stopPropagation(); update(j.id, "Running"); }}   title="Resume" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--green)" }}><Play size={11} /></button>}
                        {j.status === "Queued"   && <button onClick={e => { e.stopPropagation(); update(j.id, "Running"); }}   title="Start"  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)" }}><Play size={11} /></button>}
                        {j.status === "Failed"   && <button onClick={e => { e.stopPropagation(); update(j.id, "Queued"); }}    title="Retry"  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--blue)" }}><RefreshCw size={11} /></button>}
                        {(j.status === "Running" || j.status === "Paused") && <button onClick={e => { e.stopPropagation(); update(j.id, "Cancelled"); }} title="Cancel" style={{ background: "none", border: "none", cursor: "pointer", color: "#ef5350" }}><Square size={11} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail */}
        {selected && (
          <div style={{ width: 280, flexShrink: 0, overflowY: "auto", padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)", marginBottom: 10 }}>{selected.name}</div>
            {[
              { l: "Status",   v: selected.status,                  c: statusColor(selected.status) },
              { l: "Target",   v: selected.target,                  c: "var(--primary)" },
              { l: "Engine",   v: selected.engine,                  c: "var(--muted)" },
              { l: "Plugins",  v: `${selected.plugins} active`,     c: "var(--muted)" },
              { l: "Started",  v: selected.started,                 c: "var(--muted)" },
              { l: "Duration", v: selected.duration,                c: "var(--muted)" },
              { l: "Progress", v: `${selected.progress}%`,          c: "var(--primary)" },
              { l: "Findings", v: selected.findings.toString(),     c: selected.findings > 0 ? "#ef5350" : "var(--muted)" },
              ...(selected.severity ? [{ l: "Top Severity", v: selected.severity, c: sevColor(selected.severity) }] : []),
              ...(selected.scheduled ? [{ l: "Schedule", v: selected.scheduled, c: "var(--blue)" }] : []),
            ].map(m => (
              <div key={m.l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 11 }}>
                <span style={{ color: "var(--muted)" }}>{m.l}</span>
                <span style={{ fontFamily: "monospace", color: m.c, fontWeight: 600 }}>{m.v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
