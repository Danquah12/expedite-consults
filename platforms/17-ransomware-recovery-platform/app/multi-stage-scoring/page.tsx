"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Target,
  FileCode,
  Flame,
  Radio,
  Sliders,
  CheckCircle2,
  AlertOctagon,
  Percent,
  Check,
  TrendingDown
} from "lucide-react";

export default function MultiStageScoringPage() {
  const [canaryHit, setCanaryHit] = useState<boolean>(true); // +60
  const [unsignedBinary, setUnsignedBinary] = useState<boolean>(true); // +30
  const [massWrites, setMassWrites] = useState<boolean>(true); // +20
  const [entropySurge, setEntropySurge] = useState<boolean>(true); // +10
  const [smbScanning, setSmbScanning] = useState<boolean>(false); // +10

  // Calculate composite score
  const score = 
    (canaryHit ? 60 : 0) +
    (unsignedBinary ? 30 : 0) +
    (massWrites ? 20 : 0) +
    (entropySurge ? 10 : 0) +
    (smbScanning ? 10 : 0);

  const getDecision = (s: number) => {
    if (s >= 90) return { tier: "AUTO CONTAINMENT", desc: "Process Terminated & Host Network Isolated in < 0.5s", color: "#f43f5e", bg: "rgba(244,63,94,0.15)" };
    if (s >= 70) return { tier: "HIGH PRIORITY INCIDENT", desc: "Automated Backup Lockdown & SOC Alert Dispatched", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" };
    if (s >= 31) return { tier: "ANALYST INVESTIGATION", desc: "Telemetry Flagged for Human Review Queue", color: "#06b6d4", bg: "rgba(6,182,212,0.15)" };
    return { tier: "MONITOR & LOG ONLY", desc: "Legitimate Business Activity / Low Risk", color: "#10b981", bg: "rgba(16,185,129,0.15)" };
  };

  const decision = getDecision(score);

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(244,63,94,0.35)"
          }}>
            <Target size={20} color="#050811" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>
              Multi-Stage 6-Signal False-Positive Elimination Studio
            </h1>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>
              Multi-Signal Composite Risk Model &middot; Canary Tripwires &middot; Binary Authenticity &middot; Entropy &middot; Zero-Disruption Thresholds
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 9.5, color: "var(--muted)" }}>FALSE POSITIVE RATE</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#10b981", fontFamily: "monospace" }}>1.2% <span style={{ fontSize: 10, color: "var(--muted)" }}>(&lt; 2% SLA)</span></div>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 9.5, color: "var(--muted)" }}>PRECISION</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#06b6d4", fontFamily: "monospace" }}>98.6% <span style={{ fontSize: 10, color: "var(--muted)" }}>(&gt; 95% SLA)</span></div>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 9.5, color: "var(--muted)" }}>MTTD</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#f59e0b", fontFamily: "monospace" }}>3.8s <span style={{ fontSize: 10, color: "var(--muted)" }}>(&lt; 10s SLA)</span></div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Signal Toggle vs Decision Scorecard */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
        {/* Left: 5 Signal Toggles */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#f8fafc", margin: "0 0 16px 0" }}>
            Active Signal Correlator (Multi-Indicator Weights)
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Stage 1: Canary */}
            <div
              onClick={() => setCanaryHit(!canaryHit)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: canaryHit ? "rgba(244,63,94,0.1)" : "var(--surface-2)",
                border: `1px solid ${canaryHit ? "rgba(244,63,94,0.4)" : "var(--border)"}`,
                borderRadius: 8,
                padding: 14,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13, color: canaryHit ? "#f43f5e" : "#f8fafc" }}>
                  <Target size={15} color={canaryHit ? "#f43f5e" : "var(--muted)"} />
                  Stage 1: Hidden Canary Decoy File Modified (`!_canary.docx`)
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>High-confidence tripwire placed in Desktop, Documents, Network Shares</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: canaryHit ? "#f43f5e" : "var(--muted)", fontFamily: "monospace" }}>
                +60 pts
              </div>
            </div>

            {/* Stage 2: Process */}
            <div
              onClick={() => setUnsignedBinary(!unsignedBinary)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: unsignedBinary ? "rgba(245,158,11,0.1)" : "var(--surface-2)",
                border: `1px solid ${unsignedBinary ? "rgba(245,158,11,0.4)" : "var(--border)"}`,
                borderRadius: 8,
                padding: 14,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13, color: unsignedBinary ? "#f59e0b" : "#f8fafc" }}>
                  <FileCode size={15} color={unsignedBinary ? "#f59e0b" : "var(--muted)"} />
                  Stage 2: Process Reputation &amp; Execution Path Anomaly
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Unsigned binary executing from `%TEMP%` or `%APPDATA%` unbacked memory</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: unsignedBinary ? "#f59e0b" : "var(--muted)", fontFamily: "monospace" }}>
                +30 pts
              </div>
            </div>

            {/* Stage 3: Bulk Writes */}
            <div
              onClick={() => setMassWrites(!massWrites)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: massWrites ? "rgba(6,182,212,0.1)" : "var(--surface-2)",
                border: `1px solid ${massWrites ? "rgba(6,182,212,0.4)" : "var(--border)"}`,
                borderRadius: 8,
                padding: 14,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13, color: massWrites ? "#06b6d4" : "#f8fafc" }}>
                  <Flame size={15} color={massWrites ? "#06b6d4" : "var(--muted)"} />
                  Stage 3: Mass File Renaming &amp; High-Velocity I/O Burst
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>&gt; 500 file modifications / 30 seconds with extension mutations (`.locked`)</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: massWrites ? "#06b6d4" : "var(--muted)", fontFamily: "monospace" }}>
                +20 pts
              </div>
            </div>

            {/* Stage 4: Entropy */}
            <div
              onClick={() => setEntropySurge(!entropySurge)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: entropySurge ? "rgba(168,85,247,0.1)" : "var(--surface-2)",
                border: `1px solid ${entropySurge ? "rgba(168,85,247,0.4)" : "var(--border)"}`,
                borderRadius: 8,
                padding: 14,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13, color: entropySurge ? "#a855f7" : "#f8fafc" }}>
                  <Percent size={15} color={entropySurge ? "#a855f7" : "var(--muted)"} />
                  Stage 4: GPU-Verified High Shannon Entropy Burst
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>File block randomness jumps from H(X) 5.1 &rarr; 7.94 (AES/ChaCha20 ciphertext)</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: entropySurge ? "#a855f7" : "var(--muted)", fontFamily: "monospace" }}>
                +10 pts
              </div>
            </div>

            {/* Stage 5: SMB */}
            <div
              onClick={() => setSmbScanning(!smbScanning)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: smbScanning ? "rgba(16,185,129,0.1)" : "var(--surface-2)",
                border: `1px solid ${smbScanning ? "rgba(16,185,129,0.4)" : "var(--border)"}`,
                borderRadius: 8,
                padding: 14,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13, color: smbScanning ? "#10b981" : "#f8fafc" }}>
                  <Radio size={15} color={smbScanning ? "#10b981" : "var(--muted)"} />
                  Stage 5: Lateral Network Propagation &amp; SMB Spraying
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Rapid connection attempts to port 445 on 20+ adjacent subnet endpoints</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: smbScanning ? "#10b981" : "var(--muted)", fontFamily: "monospace" }}>
                +10 pts
              </div>
            </div>
          </div>
        </div>

        {/* Right: Decision Matrix & Action Execution */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#f8fafc", margin: "0 0 16px 0" }}>
            Multi-Stage Composite Verdict
          </h3>

          <div style={{ background: decision.bg, border: `1px solid ${decision.color}`, borderRadius: 8, padding: 18, marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: decision.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              TOTAL COMPOSITE RISK SCORE
            </div>
            <div style={{ fontSize: 44, fontWeight: 900, color: decision.color, fontFamily: "monospace", lineHeight: 1 }}>
              {score} <span style={{ fontSize: 18, color: "var(--muted)" }}>/ 130</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#f8fafc", marginTop: 8 }}>
              {decision.tier}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              {decision.desc}
            </div>
          </div>

          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 10, textTransform: "uppercase" }}>
              Automated Response Tiers
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: score >= 90 ? "#f43f5e" : "var(--muted)", fontWeight: score >= 90 ? 800 : 500 }}>
                <span>&bull; Score 90+: Immediate Host Isolation &amp; Kill</span>
                <span style={{ fontFamily: "monospace" }}>[AUTONOMIC]</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: score >= 70 && score < 90 ? "#f59e0b" : "var(--muted)", fontWeight: score >= 70 && score < 90 ? 800 : 500 }}>
                <span>&bull; Score 70&ndash;89: Backup WORM Lockdown &amp; High Alert</span>
                <span style={{ fontFamily: "monospace" }}>[LOCKDOWN]</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: score >= 31 && score < 70 ? "#06b6d4" : "var(--muted)", fontWeight: score >= 31 && score < 70 ? 800 : 500 }}>
                <span>&bull; Score 31&ndash;69: Dispatch SOC Analyst Investigation</span>
                <span style={{ fontFamily: "monospace" }}>[QUEUE]</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: score < 31 ? "#10b981" : "var(--muted)", fontWeight: score < 31 ? 800 : 500 }}>
                <span>&bull; Score 0&ndash;30: Log Telemetry Only (Cleanware)</span>
                <span style={{ fontFamily: "monospace" }}>[PASS]</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
