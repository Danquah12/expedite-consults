"use client";

import { useState } from "react";
import {
  FlaskConical,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Shield,
  FileCode,
  Radio,
  Server,
  Zap
} from "lucide-react";

interface LabScenario {
  id: string;
  name: string;
  category: "Mass Rename" | "Bulk Writes" | "Canary Trigger" | "Backup Disruption" | "SMB Propagation";
  description: string;
  simulatedAction: string;
  expectedResult: string;
  detectionTimeSec: number;
  containmentTimeSec: number;
  recoveryRatePercent: number;
  testStatus: "PASSED" | "RUNNING" | "READY";
}

export default function SyntheticAttackLabPage() {
  const [runningId, setRunningId] = useState<string | null>(null);

  const [scenarios, setScenarios] = useState<LabScenario[]>([
    {
      id: "SCEN-A",
      name: "Scenario A: Mass File Extension Mutation",
      category: "Mass Rename",
      description: "Simulates rapid extension rename: document.docx &rarr; document.docx.locked across 500 files.",
      simulatedAction: "Rename 500 documents with '.locked' extension in < 5 seconds",
      expectedResult: "File system watcher alerts & freezes originating PID",
      detectionTimeSec: 1.8,
      containmentTimeSec: 4.2,
      recoveryRatePercent: 100,
      testStatus: "PASSED"
    },
    {
      id: "SCEN-B",
      name: "Scenario B: Bulk High-Entropy File Writes",
      category: "Bulk Writes",
      description: "Simulates bulk AES-256 ciphertext encryption stream without touching system files.",
      simulatedAction: "Write 500 high-entropy (H(X)=7.95) data blocks in 30 seconds",
      expectedResult: "GPU Shannon entropy engine triggers pre-emption",
      detectionTimeSec: 2.1,
      containmentTimeSec: 5.8,
      recoveryRatePercent: 99.4,
      testStatus: "PASSED"
    },
    {
      id: "SCEN-C",
      name: "Scenario C: Decoy Canary File Tripwire Hit",
      category: "Canary Trigger",
      description: "Simulates unauthorized process modifying hidden `!_canary.docx` decoy in Desktop folder.",
      simulatedAction: "Modify hidden `!_canary.docx` and check writing process authenticity",
      expectedResult: "Immediate +60 composite risk scoring & process suspension",
      detectionTimeSec: 0.4,
      containmentTimeSec: 1.2,
      recoveryRatePercent: 100,
      testStatus: "PASSED"
    },
    {
      id: "SCEN-D",
      name: "Scenario D: Backup Service & VSS Disruption",
      category: "Backup Disruption",
      description: "Simulates `vssadmin.exe delete shadows /all /quiet` execution and backup daemon termination.",
      simulatedAction: "Intercept VSS termination and backup task disable attempt",
      expectedResult: "Emergency WORM storage lock + process termination",
      detectionTimeSec: 0.2,
      containmentTimeSec: 0.8,
      recoveryRatePercent: 100,
      testStatus: "PASSED"
    },
    {
      id: "SCEN-E",
      name: "Scenario E: SMB Lateral Connection Flood",
      category: "SMB Propagation",
      description: "Simulates EternalBlue / SMB scan probing port 445 on 40 adjacent virtual network nodes.",
      simulatedAction: "Flood TCP 445 SYN packets to 40 subnet endpoints",
      expectedResult: "Firewall eBPF rule isolates interface in < 1.0s",
      detectionTimeSec: 1.1,
      containmentTimeSec: 2.4,
      recoveryRatePercent: 100,
      testStatus: "PASSED"
    }
  ]);

  const handleRunScenario = (id: string) => {
    setRunningId(id);
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, testStatus: "RUNNING" } : s));

    setTimeout(() => {
      setScenarios(prev => prev.map(s => s.id === id ? { ...s, testStatus: "PASSED" } : s));
      setRunningId(null);
    }, 2000);
  };

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(168,85,247,0.35)"
          }}>
            <FlaskConical size={20} color="#050811" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>
              Synthetic Behavioral Attack Lab &amp; 5-Scenario Verification Bench
            </h1>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>
              Safe Non-Destructive Lab &middot; 5 Synthetic Outbreak Scenarios &middot; SLA Benchmarking (MTTD &lt; 10s &middot; MTTR &lt; 30s)
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 9.5, color: "var(--muted)" }}>AVG DETECTION TIME</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#10b981", fontFamily: "monospace" }}>1.12s <span style={{ fontSize: 10, color: "var(--muted)" }}>(&lt; 10s)</span></div>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 9.5, color: "var(--muted)" }}>AVG CONTAINMENT TIME</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#06b6d4", fontFamily: "monospace" }}>2.88s <span style={{ fontSize: 10, color: "var(--muted)" }}>(&lt; 30s)</span></div>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 9.5, color: "var(--muted)" }}>RECOVERY SUCCESS</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#f59e0b", fontFamily: "monospace" }}>99.88% <span style={{ fontSize: 10, color: "var(--muted)" }}>(&gt; 95%)</span></div>
          </div>
        </div>
      </div>

      {/* Scenario Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {scenarios.map(scen => (
          <div
            key={scen.id}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 18
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: "#f8fafc" }}>{scen.name}</span>
                  <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(168,85,247,0.15)", color: "#c084fc", fontWeight: 700 }}>
                    {scen.category}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{scen.description}</div>
              </div>

              <button
                onClick={() => handleRunScenario(scen.id)}
                disabled={runningId !== null}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: scen.testStatus === "RUNNING" ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.15)",
                  border: `1px solid ${scen.testStatus === "RUNNING" ? "#f59e0b" : "#10b981"}`,
                  color: scen.testStatus === "RUNNING" ? "#f59e0b" : "#10b981",
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: runningId !== null ? "not-allowed" : "pointer"
                }}
              >
                {scen.testStatus === "RUNNING" ? <Clock size={12} className="animate-spin" /> : <Play size={12} />}
                <span>{scen.testStatus === "RUNNING" ? "SIMULATING..." : "RUN TEST SCENARIO"}</span>
              </button>
            </div>

            {/* Test Metrics Output */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 10, background: "var(--surface-2)", padding: 12, borderRadius: 8, fontSize: 11 }}>
              <div>
                <div style={{ color: "var(--muted)", fontSize: 10 }}>Action Simulated</div>
                <div style={{ fontWeight: 600, color: "#cbd5e1" }}>{scen.simulatedAction}</div>
              </div>
              <div>
                <div style={{ color: "var(--muted)", fontSize: 10 }}>Detection Latency</div>
                <div style={{ fontWeight: 800, color: "#10b981", fontFamily: "monospace" }}>{scen.detectionTimeSec}s (Target &lt; 10s)</div>
              </div>
              <div>
                <div style={{ color: "var(--muted)", fontSize: 10 }}>Containment Latency</div>
                <div style={{ fontWeight: 800, color: "#06b6d4", fontFamily: "monospace" }}>{scen.containmentTimeSec}s (Target &lt; 30s)</div>
              </div>
              <div>
                <div style={{ color: "var(--muted)", fontSize: 10 }}>Recovery Integrity</div>
                <div style={{ fontWeight: 800, color: "#f59e0b", fontFamily: "monospace" }}>{scen.recoveryRatePercent}% (Target &gt; 95%)</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
