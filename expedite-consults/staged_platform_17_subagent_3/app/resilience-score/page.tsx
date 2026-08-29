"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  Download,
  Printer,
  ChevronRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Lock,
  HardDrive,
  Key,
  Activity,
  Eye,
  Crosshair
} from "lucide-react";

interface ResilienceDomain {
  key: string;
  name: string;
  score: number; // 0 - 100
  weight: number;
  grade: "A+" | "A" | "B" | "C" | "D";
  status: "OPTIMAL" | "ADEQUATE" | "NEEDS_ATTENTION";
  color: string;
  icon: any;
  keyControls: { name: string; score: number; passed: boolean }[];
  recommendations: string[];
}

const INITIAL_DOMAINS: ResilienceDomain[] = [
  {
    key: "PREVENTION",
    name: "Perimeter & Endpoint Prevention",
    score: 82,
    weight: 0.15,
    grade: "A",
    status: "OPTIMAL",
    color: "#10b981",
    icon: ShieldCheck,
    keyControls: [
      { name: "External Attack Surface Vulnerability Patch SLA (< 7d)", score: 85, passed: true },
      { name: "Phishing-Resistant Email Gateway & DMARC Strict", score: 90, passed: true },
      { name: "Legacy Protocol Filter (SMBv1 / NTLMv1 Disabled)", score: 72, passed: true }
    ],
    recommendations: [
      "Retire remaining 3 legacy web servers with NTLM fallback.",
      "Implement geofencing on edge VPN portals."
    ]
  },
  {
    key: "DETECTION",
    name: "Detection & Early Warning",
    score: 91,
    weight: 0.20,
    grade: "A+",
    status: "OPTIMAL",
    color: "#06b6d4",
    icon: Eye,
    keyControls: [
      { name: "100% EDR Agent Deployment with Anti-Tamper Active", score: 98, passed: true },
      { name: "Pre-Encryption File Entropy Spikes & Canary File Grid", score: 94, passed: true },
      { name: "24/7 MDR SOC Mean Time to Detect (< 15 mins)", score: 90, passed: true }
    ],
    recommendations: [
      "Expand canary tripwire trap files into shared SharePoint online drives."
    ]
  },
  {
    key: "CONTAINMENT",
    name: "Automated Micro-Containment",
    score: 76,
    weight: 0.15,
    grade: "B",
    status: "ADEQUATE",
    color: "#f59e0b",
    icon: Lock,
    keyControls: [
      { name: "Host-Level Software-Defined Quarantine Automation", score: 88, passed: true },
      { name: "Zero-Trust Clinical Micro-Segmentation Egress", score: 70, passed: true },
      { name: "Automated BGP / DNS Sinkhole for C2 Domains", score: 70, passed: false }
    ],
    recommendations: [
      "Automate dynamic BGP routing cutoff for identified adversary egress IPs.",
      "Complete microsegmentation rules between PACS storage and diagnostic workstations."
    ]
  },
  {
    key: "RECOVERY",
    name: "Safe Recovery & Orchestration",
    score: 88,
    weight: 0.20,
    grade: "A",
    status: "OPTIMAL",
    color: "#a855f7",
    icon: Zap,
    keyControls: [
      { name: "Mean Time to Restore (MTTR) SLA < 6 Hours", score: 92, passed: true },
      { name: "Air-Gapped Clean Recovery Zone (IRE) Automated Provisioning", score: 86, passed: true },
      { name: "Clean Recovery Gatekeeper Binary Verification", score: 85, passed: true }
    ],
    recommendations: [
      "Conduct weekly automated VM boot integrity tests in sandbox."
    ]
  },
  {
    key: "IDENTITY",
    name: "Identity & Active Directory Resilience",
    score: 65,
    weight: 0.15,
    grade: "C",
    status: "NEEDS_ATTENTION",
    color: "#f43f5e",
    icon: Key,
    keyControls: [
      { name: "Privileged Access Workstations (PAW) for Domain Admins", score: 70, passed: true },
      { name: "Automated KRBTGT Double-Roll Rotation (< 90 Days)", score: 55, passed: false },
      { name: "Phishing-Resistant FIDO2 MFA on All Admin Logins", score: 92, passed: true }
    ],
    recommendations: [
      "Enforce mandatory 90-day automated KRBTGT rotation script.",
      "Achieve 100% PAW hardware deployment across all tier-0 administrators."
    ]
  },
  {
    key: "BACKUPS",
    name: "Backup Immutability & Air-Gap",
    score: 94,
    weight: 0.15,
    grade: "A+",
    status: "OPTIMAL",
    color: "#10b981",
    icon: HardDrive,
    keyControls: [
      { name: "AWS S3 Object Lock Compliance Mode (90-Day Retention)", score: 100, passed: true },
      { name: "Offsite Physical LTO-8 Tape Archival (3-2-1-1-0 Rule)", score: 95, passed: true },
      { name: "Multi-Party Root MFA for Backup Repository Changes", score: 90, passed: true }
    ],
    recommendations: [
      "Perform monthly physical tape drive read-verification in air-gap lab."
    ]
  }
];

export default function ResilienceScorePage() {
  const [domains, setDomains] = useState<ResilienceDomain[]>(INITIAL_DOMAINS);
  const [activeDomainKey, setActiveDomainKey] = useState<string>("PREVENTION");
  const [simulatedScores, setSimulatedScores] = useState<{ [key: string]: number }>({
    PREVENTION: 82,
    DETECTION: 91,
    CONTAINMENT: 76,
    RECOVERY: 88,
    IDENTITY: 65,
    BACKUPS: 94
  });
  const [isSimulatorMode, setIsSimulatorMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeDomain = domains.find(d => d.key === activeDomainKey) || domains[0];

  // Real-time Composite Resilience Score calculation
  const compositeScore = useMemo(() => {
    let scoreAcc = 0;
    domains.forEach(d => {
      const scoreToUse = isSimulatorMode ? simulatedScores[d.key] : d.score;
      scoreAcc += scoreToUse * d.weight;
    });
    const rounded = Math.round(scoreAcc);

    let grade = "C";
    let tier = "Standard Cyber Hygiene";
    if (rounded >= 90) {
      grade = "A+";
      tier = "Apex Hardened Enterprise";
    } else if (rounded >= 80) {
      grade = "A";
      tier = "Enterprise Hardened (Preferred Underwriting)";
    } else if (rounded >= 70) {
      grade = "B";
      tier = "Resilient Baseline (Moderate Risk)";
    }

    return {
      score: rounded,
      grade,
      tier
    };
  }, [domains, simulatedScores, isSimulatorMode]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper for SVG Radar Chart
  const radarPoints = useMemo(() => {
    const center = 150;
    const radius = 110;
    const count = domains.length;
    const angleStep = (Math.PI * 2) / count;

    // Current polygon points
    const points = domains.map((d, idx) => {
      const score = isSimulatorMode ? simulatedScores[d.key] : d.score;
      const r = (score / 100) * radius;
      const angle = idx * angleStep - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");

    // Axis labels positions
    const axes = domains.map((d, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const x = center + (radius + 24) * Math.cos(angle);
      const y = center + (radius + 24) * Math.sin(angle);
      const endX = center + radius * Math.cos(angle);
      const endY = center + radius * Math.sin(angle);
      return {
        key: d.key,
        name: d.name.split(" ")[0],
        score: isSimulatorMode ? simulatedScores[d.key] : d.score,
        x,
        y,
        endX,
        endY
      };
    });

    return { points, axes, center, radius };
  }, [domains, simulatedScores, isSimulatorMode]);

  return (
    <div style={{ padding: "24px 28px", minHeight: "calc(100vh - 54px)", background: "var(--bg)", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "var(--surface-3)",
          border: "1px solid var(--primary)",
          color: "var(--fg)",
          padding: "10px 18px",
          borderRadius: 8,
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 13,
          fontWeight: 600
        }}>
          <Sparkles size={16} color="var(--primary)" />
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              padding: "3px 8px",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 800,
              color: "var(--primary)",
              letterSpacing: "0.08em"
            }}>
              ENTERPRISE RESILIENCE SCORECARD
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              6-Domain Holistic Ransomware Readiness Index
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", color: "var(--fg)", margin: 0 }}>
            Enterprise Ransomware Resilience Scorecard & Radar
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 4, maxWidth: 880 }}>
            Comprehensive 6-domain resilience framework measuring Prevention (82), Detection (91), Containment (76), Recovery (88), Identity (65), and Backups (94) to generate an executive composite posture grade.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => {
              setIsSimulatorMode(!isSimulatorMode);
              triggerToast(isSimulatorMode ? "Returned to live telemetry scores." : "What-If Simulator mode activated.");
            }}
            className="btn-secondary"
            style={{
              background: isSimulatorMode ? "rgba(6,182,212,0.2)" : "var(--surface-2)",
              borderColor: isSimulatorMode ? "var(--cyan)" : "var(--border)",
              color: isSimulatorMode ? "var(--cyan)" : "var(--fg)"
            }}
          >
            <Sliders size={14} />
            {isSimulatorMode ? "Exit Simulator" : "What-If Posture Simulator"}
          </button>

          <button
            onClick={() => {
              window.print();
            }}
            className="btn-primary"
          >
            <Printer size={14} />
            Print Executive Scorecard
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {/* Composite Score */}
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Overall Resilience Score</span>
            <Award size={16} color="var(--primary)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: "var(--fg)" }}>{compositeScore.score}</span>
            <span style={{ fontSize: 14, color: "var(--muted)" }}>/ 100</span>
            <span style={{
              fontSize: 12,
              fontWeight: 800,
              color: "var(--primary)",
              background: "rgba(16,185,129,0.15)",
              padding: "2px 8px",
              borderRadius: 4
            }}>
              GRADE {compositeScore.grade}
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 700 }}>
            {compositeScore.tier}
          </div>
        </div>

        {/* Strongest Domain */}
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--cyan)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Strongest Pillar</span>
            <HardDrive size={16} color="var(--cyan)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--cyan)" }}>
            Backups & WORM (94/100)
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
            100% S3 Object Lock & Offsite Tape Archival
          </div>
        </div>

        {/* Priority Improvement Gap */}
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--rose)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Primary Posture Gap</span>
            <Key size={16} color="var(--rose)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--rose)" }}>
            Identity Resilience (65/100)
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
            KRBTGT Automated Rotation & PAW Rollout Needed
          </div>
        </div>

        {/* 12-Month Progression */}
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--purple)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>12-Month Posture Delta</span>
            <TrendingUp size={16} color="var(--purple)" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "var(--purple)" }}>
            +26 pts (58 → 84)
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
            Quarterly Trajectory: Q1 58 · Q2 66 · Q3 74 · Q4 84
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Interactive Radar Chart & Domain Detail Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 16, flex: 1 }}>
        {/* Left Column: Interactive SVG Spider / Radar Chart */}
        <div className="card-tactical" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", textTransform: "uppercase" }}>
              6-Domain Posture Radar
            </span>
            <span style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "monospace" }}>
              {isSimulatorMode ? "SIMULATION MODE ACTIVE" : "LIVE AUDIT TELEMETRY"}
            </span>
          </div>

          {/* SVG Radar Visualizer */}
          <div style={{ position: "relative", width: 300, height: 300 }}>
            <svg width="300" height="300" viewBox="0 0 300 300">
              {/* Concentric Grid Polygons */}
              {[0.25, 0.5, 0.75, 1.0].map((level, lIdx) => {
                const r = radarPoints.radius * level;
                const pts = domains.map((_, i) => {
                  const a = (i * Math.PI * 2) / domains.length - Math.PI / 2;
                  return `${radarPoints.center + r * Math.cos(a)},${radarPoints.center + r * Math.sin(a)}`;
                }).join(" ");
                return (
                  <polygon
                    key={lIdx}
                    points={pts}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="1"
                    strokeDasharray={level < 1 ? "3 3" : undefined}
                  />
                );
              })}

              {/* Axis Lines */}
              {radarPoints.axes.map((ax, idx) => (
                <line
                  key={idx}
                  x1={radarPoints.center}
                  y1={radarPoints.center}
                  x2={ax.endX}
                  y2={ax.endY}
                  stroke="var(--border)"
                  strokeWidth="1"
                />
              ))}

              {/* Data Filled Polygon */}
              <polygon
                points={radarPoints.points}
                fill="rgba(16, 185, 129, 0.25)"
                stroke="var(--primary)"
                strokeWidth="2.5"
              />

              {/* Node Points & Interactive Clickables */}
              {radarPoints.axes.map((ax) => {
                const isSelected = activeDomainKey === ax.key;
                return (
                  <g key={ax.key} onClick={() => setActiveDomainKey(ax.key)} style={{ cursor: "pointer" }}>
                    <circle
                      cx={ax.endX}
                      cy={ax.endY}
                      r={isSelected ? 6 : 4}
                      fill={isSelected ? "var(--primary)" : "var(--surface-3)"}
                      stroke="var(--primary)"
                      strokeWidth="2"
                    />
                    <text
                      x={ax.x}
                      y={ax.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isSelected ? "var(--primary)" : "var(--fg-2)"}
                      fontSize="10.5"
                      fontWeight="700"
                    >
                      {ax.name} ({ax.score})
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Domain Selection Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, width: "100%" }}>
            {domains.map((d) => {
              const isSelected = activeDomainKey === d.key;
              const currentScore = isSimulatorMode ? simulatedScores[d.key] : d.score;
              return (
                <button
                  key={d.key}
                  onClick={() => setActiveDomainKey(d.key)}
                  style={{
                    background: isSelected ? "rgba(16,185,129,0.15)" : "var(--surface-2)",
                    border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "8px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, color: isSelected ? "var(--primary)" : "var(--fg-2)" }}>
                    {d.name.split(" ")[0]}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: "var(--fg)" }}>
                    {currentScore}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Granular Domain Breakdown & Posture Improvement Guide */}
        <div className="card-tactical" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Domain Title Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                background: "rgba(16,185,129,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(16,185,129,0.3)"
              }}>
                <activeDomain.icon size={20} color="var(--primary)" />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 900, color: "var(--fg)", margin: 0 }}>
                  {activeDomain.name}
                </h2>
                <span style={{ fontSize: 11.5, color: "var(--muted)" }}>
                  Weight in Composite Model: {(activeDomain.weight * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: "var(--fg)" }}>
                {isSimulatorMode ? simulatedScores[activeDomain.key] : activeDomain.score}
              </span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>/ 100</span>
              <span style={{
                fontSize: 11,
                fontWeight: 800,
                color: "var(--primary)",
                background: "rgba(16,185,129,0.15)",
                padding: "2px 6px",
                borderRadius: 4
              }}>
                GRADE {activeDomain.grade}
              </span>
            </div>
          </div>

          {/* Simulator Slider (If active) */}
          {isSimulatorMode && (
            <div style={{
              background: "rgba(6,182,212,0.08)",
              border: "1px solid rgba(6,182,212,0.3)",
              borderRadius: 8,
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 6
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--cyan)" }}>
                  Adjust {activeDomain.name} Score Simulation:
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: "var(--fg)" }}>
                  {simulatedScores[activeDomain.key]} pts
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simulatedScores[activeDomain.key]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSimulatedScores(prev => ({ ...prev, [activeDomain.key]: val }));
                }}
                style={{ accentColor: "var(--cyan)", cursor: "pointer" }}
              />
            </div>
          )}

          {/* Key Controls Audit */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Key Technical Audit Checks
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeDomain.keyControls.map((ctl, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 12
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {ctl.passed ? <CheckCircle2 size={15} color="var(--primary)" /> : <AlertTriangle size={15} color="var(--rose)" />}
                    <span style={{ color: "var(--fg-2)" }}>{ctl.name}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: ctl.passed ? "var(--primary)" : "var(--rose)" }}>
                    {ctl.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Prioritized Posture Improvement Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Prioritized Remediation Actions
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeDomain.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--surface-3)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    borderRadius: 6,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 12,
                    color: "var(--fg)"
                  }}
                >
                  <Sparkles size={14} color="var(--primary)" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
