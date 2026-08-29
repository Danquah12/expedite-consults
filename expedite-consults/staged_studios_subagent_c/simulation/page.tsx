"use client";

import React, { useState, useEffect } from "react";
import {
  PlaySquare,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileSpreadsheet,
  Download,
  Terminal,
  Cpu,
  Server,
  Layers,
  Sparkles,
  Users
} from "lucide-react";

interface ScenarioInject {
  minute: number;
  title: string;
  description: string;
  choices: {
    text: string;
    rtoImpactMin: number;
    riskImpactPct: number;
    feedback: string;
  }[];
}

interface Scenario {
  id: string;
  title: string;
  threatActor: string;
  family: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "CATASTROPHIC";
  targetSector: string;
  estimatedDurationMin: number;
  description: string;
  initialInfectionVector: string;
  targetAssets: string[];
  stagesCount: number;
  injects: ScenarioInject[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "sim-001",
    title: "Operation DarkPulse: LockBit 3.0 Hospital Blackout",
    threatActor: "FIN12 / LockBit Affiliate #31",
    family: "LockBit 3.0 (Black)",
    difficulty: "ADVANCED",
    targetSector: "Healthcare / Regional Trauma Hospital",
    estimatedDurationMin: 45,
    description: "Simulates an overnight compromise of domain credentials via Phishing + Ivanti VPN CVE-2024-21887, followed by speed-encryption of 24 hypervisors and EHR databases.",
    initialInfectionVector: "Compromised SSL-VPN credential with MFA bypass -> PsExec lateral movement",
    targetAssets: ["Domain Controllers (DC01, DC02)", "Epic EHR Database Cluster", "PACS DICOM Repository", "Clinical Workstations"],
    stagesCount: 4,
    injects: [
      {
        minute: 5,
        title: "Inject 1: Threat Actor detected dumping LSASS memory on VPN Gateway",
        description: "EDR triggers high-severity alert for mimikatz memory harvesting on edge gateway. Network traffic indicates staging to external IP 185.220.101.5.",
        choices: [
          { text: "Immediately isolate edge VPN host from network", rtoImpactMin: -15, riskImpactPct: -25, feedback: "Decisive containment move! Prevented widespread credential broadcast to Domain Controllers." },
          { text: "Deploy active honeytoken account and monitor lateral movement", rtoImpactMin: 30, riskImpactPct: 40, feedback: "High risk! Threat actor managed to execute secondary Cobalt Strike beacon on DC01." },
          { text: "Initiate emergency enterprise-wide password reset", rtoImpactMin: 45, riskImpactPct: -10, feedback: "Caused major operational friction for night-shift clinical staff, but delayed attacker." }
        ]
      },
      {
        minute: 18,
        title: "Inject 2: Mass vssadmin shadow copy deletion & BitLocker trigger",
        description: "Adversary launches automated batch script executing 'vssadmin delete shadows /all /quiet' and deploying .lockbit payload via GPO.",
        choices: [
          { text: "Sever inter-VLAN core routing and freeze hypervisor RAM", rtoImpactMin: -20, riskImpactPct: -35, feedback: "Optimal incident command choice! Preserved 80% of virtual machine disk states." },
          { text: "Attempt in-memory decryption key scraping before power-cycling", rtoImpactMin: 10, riskImpactPct: -15, feedback: "Technical success! Extracted ChaCha20 round keys for 4 hosts, though 12 were encrypted." },
          { text: "Gracefully shut down all database servers via remote CLI", rtoImpactMin: 60, riskImpactPct: 20, feedback: "Adversary script completed encryption during the 8-minute shutdown cycle." }
        ]
      },
      {
        minute: 32,
        title: "Inject 3: Ransom note drop and 72-hour Darknet leak timer",
        description: "Ransom note 'Restore-My-Files.txt' appears on nurse stations demanding $1.8M BTC. Threat actor opens Tor chat channel.",
        choices: [
          { text: "Engage legal counsel & activate immutable S3 bare-metal restore", rtoImpactMin: -40, riskImpactPct: -50, feedback: "Playbook adherence! Restored from clean S3 object lock without ransom payment." },
          { text: "Initiate contact on Tor negotiation portal to stall for time", rtoImpactMin: 15, riskImpactPct: 10, feedback: "Provided intelligence on extortion wallet, but delayed host rebuild efforts." },
          { text: "Issue public media statement declaring major system outage", rtoImpactMin: 30, riskImpactPct: 5, feedback: "Met regulatory compliance (HIPAA), but increased public panic." }
        ]
      }
    ]
  },
  {
    id: "sim-002",
    title: "RustStorm: BlackCat / ALPHV Cloud Datastore Wipe",
    threatActor: "Scattered Spider (UNC3944)",
    family: "BlackCat / ALPHV (Rust)",
    difficulty: "CATASTROPHIC",
    targetSector: "Financial Clearing & Global Payments",
    estimatedDurationMin: 60,
    description: "Multi-threaded Rust ransomware targeting ESXi datastores with intermittent AES-CTR encryption. Threat actor exfiltrates 4TB of SWIFT wire transaction records.",
    initialInfectionVector: "Social engineering of IT Helpdesk (SIM Swap) -> Okta session hijacking",
    targetAssets: ["ESXi Datastores #1-6", "SWIFT Payment Settlement Gateways", "Customer Core Banking SQL", "AWS S3 Backups"],
    stagesCount: 5,
    injects: [
      {
        minute: 8,
        title: "Inject 1: Helpdesk receives urgent SMS for executive MFA reset",
        description: "Attacker impersonates VP of Engineering requesting reset of Okta FastPass token due to lost corporate phone.",
        choices: [
          { text: "Require biometric video verification with manager sign-off", rtoImpactMin: -30, riskImpactPct: -45, feedback: "Attack thwarted at perimeter! Social engineering logged and reported to SOC." },
          { text: "Issue temporary bypass code via SMS", rtoImpactMin: 90, riskImpactPct: 75, feedback: "Critical failure. Attacker bypassed MFA and accessed Okta Admin Console." }
        ]
      }
    ]
  },
  {
    id: "sim-003",
    title: "Zeon Strike: Royal Ransomware OT SCADA Sabotage",
    threatActor: "DEV-0569 (Zeon Syndicate)",
    family: "Royal Ransomware",
    difficulty: "INTERMEDIATE",
    targetSector: "Aerospace Defense Manufacturing",
    estimatedDurationMin: 35,
    description: "Custom intermittent encryption targeting engineering CAD files and CNC machining controllers via unpatched Log4j vulnerability.",
    initialInfectionVector: "Log4Shell (CVE-2021-44228) on internal telemetry server",
    targetAssets: ["SCADA Plant HMI Controllers", "Aerospace CAD Repository", "Production Scheduling DB"],
    stagesCount: 3,
    injects: [
      {
        minute: 10,
        title: "Inject 1: CNC assembly machines reporting corrupt toolpath files",
        description: "Assembly line stops abruptly as .royal_u extension is appended to all numerical control program files.",
        choices: [
          { text: "Engage Air-Gap physical switch to isolate factory floor network", rtoImpactMin: -25, riskImpactPct: -40, feedback: "Successfully quarantined plant subnet, preventing malware spread to corporate ERP." },
          { text: "Restart CNC controllers and retry execution", rtoImpactMin: 40, riskImpactPct: 50, feedback: "Dangerous! Rebooting while encryptor was running caused catastrophic header corruption." }
        ]
      }
    ]
  }
];

export default function SimulationPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState("sim-001");
  const [isRunning, setIsRunning] = useState(false);
  const [simMinute, setSimMinute] = useState(0);
  const [simSpeed, setSimSpeed] = useState(1);
  const [stressIndex, setStressIndex] = useState(35);
  const [rtoCalculatedHours, setRtoCalculatedHours] = useState(18.5);
  const [completedInjects, setCompletedInjects] = useState<{ [injectIdx: number]: number }>({});
  const [showAARModal, setShowAARModal] = useState(false);
  const [feedLogs, setFeedLogs] = useState<string[]>([
    "[00:00:00] Simulation initialized: Operation DarkPulse.",
    "[00:01:10] Baseline network telemetry established. 24 virtual nodes online."
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const scenario = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Simulation timer loop
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSimMinute(prev => {
          if (prev >= scenario.estimatedDurationMin) {
            setIsRunning(false);
            setShowAARModal(true);
            return scenario.estimatedDurationMin;
          }
          return prev + 1;
        });
      }, 1000 / simSpeed);
    }
    return () => clearInterval(interval);
  }, [isRunning, simSpeed, scenario.estimatedDurationMin]);

  const handleSelectChoice = (injectIdx: number, choiceIdx: number) => {
    const inject = scenario.injects[injectIdx];
    const choice = inject.choices[choiceIdx];

    setCompletedInjects(prev => ({ ...prev, [injectIdx]: choiceIdx }));
    setRtoCalculatedHours(prev => Math.max(2, prev + (choice.rtoImpactMin / 60)));
    setStressIndex(prev => Math.min(100, Math.max(10, prev + choice.riskImpactPct)));

    setFeedLogs(prev => [
      `[SIM +${simMinute}m] DECISION: ${choice.text} -> ${choice.feedback}`,
      ...prev
    ]);

    showToast(`Decision recorded: RTO impact ${choice.rtoImpactMin >= 0 ? "+" : ""}${choice.rtoImpactMin}m.`);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSimMinute(0);
    setStressIndex(35);
    setRtoCalculatedHours(18.5);
    setCompletedInjects({});
    setFeedLogs([`[00:00:00] Scenario ${scenario.title} reset to baseline.`]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          top: 70,
          right: 24,
          zIndex: 100,
          background: "rgba(16, 185, 129, 0.95)",
          color: "#04100c",
          padding: "10px 18px",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 13,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        padding: "16px 20px",
        borderRadius: 8,
        border: "1px solid var(--border)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 8,
            background: "rgba(168, 85, 247, 0.15)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <PlaySquare size={22} color="#a855f7" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--fg)" }}>
                Incident Simulation & Tabletop Cyber Exercise Mode
              </h1>
              <span className="badge-sev badge-high">PILLAR 4 · SIMULATE</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Run controlled ransomware outbreak drills across virtual infrastructure to benchmark team RTO & validate playbooks.
            </p>
          </div>
        </div>

        {/* Scenario Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={selectedScenarioId}
            onChange={(e) => {
              setSelectedScenarioId(e.target.value);
              handleReset();
            }}
            className="tool-select"
            style={{ fontWeight: 600 }}
          >
            {SCENARIOS.map(s => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.difficulty})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAARModal(true)}
            className="btn-secondary"
          >
            <FileSpreadsheet size={14} color="#06b6d4" />
            <span>After-Action Report</span>
          </button>
        </div>
      </div>

      {/* Simulator Control Bar & Tactical Gauges */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
        gap: 14
      }}>
        {/* Playback Controls Card */}
        <div className="card-tactical" style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="btn-primary"
              style={{
                background: isRunning ? "#f59e0b" : "var(--primary)",
                padding: "8px 14px"
              }}
            >
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
              <span>{isRunning ? "PAUSE DRILL" : "START DRILL"}</span>
            </button>

            <button
              onClick={handleReset}
              className="btn-secondary"
              style={{ padding: "8px 10px" }}
              title="Reset Scenario"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>SPEED:</span>
            {[1, 2, 5].map(spd => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: simSpeed === spd ? "rgba(16,185,129,0.2)" : "var(--surface-2)",
                  color: simSpeed === spd ? "#10b981" : "var(--muted)",
                  border: simSpeed === spd ? "1px solid rgba(16,185,129,0.4)" : "1px solid var(--border)"
                }}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Clock Gauge */}
        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #06b6d4" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Exercise Clock
            </span>
            <Clock size={16} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#06b6d4", marginTop: 4, fontFamily: "monospace" }}>
            +{simMinute.toString().padStart(2, "0")}:00 / {scenario.estimatedDurationMin}:00m
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
            Stage {Math.min(scenario.stagesCount, Math.floor(simMinute / 12) + 1)} of {scenario.stagesCount}
          </div>
        </div>

        {/* Stress Index */}
        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #f43f5e" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Crisis Stress Index
            </span>
            <Flame size={16} color="#f43f5e" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: stressIndex >= 70 ? "#f43f5e" : stressIndex >= 50 ? "#f59e0b" : "#10b981", marginTop: 4 }}>
            {stressIndex}%
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
            {stressIndex >= 70 ? "CRITICAL OUTAGE" : stressIndex >= 50 ? "ELEVATED FRICTION" : "CONTAINED"}
          </div>
        </div>

        {/* Dynamic RTO Clock */}
        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #10b981" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Projected RTO
            </span>
            <Activity size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#10b981", marginTop: 4 }}>
            {rtoCalculatedHours.toFixed(1)} Hours
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
            Target SLA: &lt; 24.0 Hours
          </div>
        </div>
      </div>

      {/* Main Simulation View: Injects & Live Telemetry Feed */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: 16 }}>
        {/* Left Column: Timeline Injects & Crisis Dilemmas */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
                {scenario.title}
              </h2>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                Threat Actor: {scenario.threatActor} · Family: {scenario.family} · Sector: {scenario.targetSector}
              </div>
            </div>
            <span className="badge-sev badge-high">{scenario.difficulty}</span>
          </div>

          {/* Scenario Injects Timeline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {scenario.injects.map((inj, idx) => {
              const isUnlocked = simMinute >= inj.minute;
              const chosenChoiceIdx = completedInjects[idx];
              const isCompleted = chosenChoiceIdx !== undefined;

              return (
                <div
                  key={idx}
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    background: isCompleted ? "rgba(16, 185, 129, 0.05)" : isUnlocked ? "var(--surface-2)" : "rgba(255,255,255,0.02)",
                    border: isCompleted ? "1px solid rgba(16, 185, 129, 0.3)" : isUnlocked ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid rgba(255,255,255,0.05)",
                    opacity: isUnlocked ? 1 : 0.45,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: isUnlocked ? "#f59e0b" : "var(--surface-3)",
                        color: isUnlocked ? "#04100c" : "var(--muted)"
                      }}>
                        T +{inj.minute}m
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>
                        {inj.title}
                      </span>
                    </div>

                    {isCompleted && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={13} /> Decision Locked
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>
                    {inj.description}
                  </p>

                  {/* Decision Choices */}
                  {isUnlocked && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                        Incident Commander Decision Options:
                      </span>
                      {inj.choices.map((ch, cIdx) => {
                        const isChosen = chosenChoiceIdx === cIdx;
                        return (
                          <button
                            key={cIdx}
                            onClick={() => handleSelectChoice(idx, cIdx)}
                            style={{
                              padding: "10px 12px",
                              borderRadius: 6,
                              textAlign: "left",
                              cursor: isCompleted ? "default" : "pointer",
                              background: isChosen ? "rgba(16, 185, 129, 0.15)" : "var(--surface-3)",
                              border: isChosen ? "1px solid #10b981" : "1px solid var(--border)",
                              color: isChosen ? "#10b981" : "var(--fg-2)",
                              fontSize: 12,
                              fontWeight: isChosen ? 700 : 500,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              transition: "all 0.12s ease"
                            }}
                          >
                            <span>{ch.text}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontFamily: "monospace" }}>
                              <span style={{ color: ch.rtoImpactMin < 0 ? "#10b981" : "#f43f5e" }}>
                                {ch.rtoImpactMin < 0 ? "" : "+"}{ch.rtoImpactMin}m RTO
                              </span>
                              <span style={{ color: ch.riskImpactPct < 0 ? "#10b981" : "#f43f5e" }}>
                                {ch.riskImpactPct < 0 ? "" : "+"}{ch.riskImpactPct}% Risk
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Decision Feedback banner */}
                  {isCompleted && (
                    <div style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      fontSize: 11.5,
                      color: "#10b981"
                    }}>
                      <strong>Outcome Assessment:</strong> {inj.choices[chosenChoiceIdx].feedback}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Virtual Infrastructure Health & Live Telemetry Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Target Infrastructure Grid */}
          <div className="card-tactical" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
              Target Virtual Infrastructure State
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {scenario.targetAssets.map((asset, i) => {
                const isCorrupted = simMinute >= 15 && simMinute < 35 && i !== 3;
                const isRecovered = simMinute >= 35 || completedInjects[2] !== undefined;

                return (
                  <div
                    key={i}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Server size={14} color="var(--muted)" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>{asset}</span>
                    </div>

                    <span style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: isRecovered ? "rgba(16, 185, 129, 0.15)" : isCorrupted ? "rgba(244, 63, 94, 0.15)" : "rgba(6, 182, 212, 0.15)",
                      color: isRecovered ? "#10b981" : isCorrupted ? "#f43f5e" : "#06b6d4"
                    }}>
                      {isRecovered ? "RECOVERED" : isCorrupted ? "ENCRYPTED" : "HEALTHY"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Incident War Room Telemetry Feed */}
          <div className="card-tactical" style={{ padding: 14, background: "#050810", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Terminal size={13} color="#a855f7" />
                <span style={{ fontSize: 11, fontWeight: 800, color: "#a855f7", fontFamily: "monospace" }}>
                  SIMULATION TELEMETRY STREAM
                </span>
              </div>
              <span style={{ fontSize: 9.5, color: "var(--muted)", fontFamily: "monospace" }}>
                WAR ROOM FEED
              </span>
            </div>

            <div style={{
              height: 220,
              overflowY: "auto",
              fontFamily: "monospace",
              fontSize: 11,
              lineHeight: 1.6,
              color: "#cbd5e1",
              display: "flex",
              flexDirection: "column",
              gap: 4
            }}>
              {feedLogs.map((log, i) => (
                <div key={i} style={{ color: log.includes("DECISION") ? "#10b981" : log.includes("CRITICAL") ? "#f43f5e" : "#94a3b8" }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* After-Action Report Modal */}
      {showAARModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          padding: 20
        }}>
          <div className="card-tactical" style={{ width: 600, padding: 28, display: "flex", flexDirection: "column", gap: 18, background: "#0c1322", border: "1px solid #a855f7" }}>
            <div style={{ textAlign: "center", borderBottom: "1px solid var(--border)", paddingBottom: 14 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.15em", color: "#a855f7", textTransform: "uppercase" }}>
                TABLETOP EXERCISE AFTER-ACTION REPORT (AAR)
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", marginTop: 4 }}>
                {scenario.title} — Executive Evaluation
              </h2>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                Evaluated by Aegis Incident Tabletop Engine v4.2
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              <div style={{ padding: 12, borderRadius: 6, background: "var(--surface)", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 700 }}>FINAL RTO ACHIEVED</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 4 }}>{rtoCalculatedHours.toFixed(1)} Hours</div>
              </div>

              <div style={{ padding: 12, borderRadius: 6, background: "var(--surface)", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 700 }}>STRESS RESILIENCE</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: stressIndex < 50 ? "#10b981" : "#f59e0b", marginTop: 4 }}>{100 - stressIndex}%</div>
              </div>

              <div style={{ padding: 12, borderRadius: 6, background: "var(--surface)", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 700 }}>PLAYBOOK ADHERENCE</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#06b6d4", marginTop: 4 }}>Grade A-</div>
              </div>
            </div>

            <div style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.6, background: "var(--surface)", padding: 12, borderRadius: 6, border: "1px solid var(--border)" }}>
              <strong>Executive Summary:</strong> The incident response team demonstrated rapid initial containment by severing edge VPN routing and freezing hypervisor memory state. Backup restoration from S3 Object Lock was initiated within SLA boundaries, preventing ransom payment. Operational gap noted: Kerberos KRBTGT automated rotation workflow should be practiced to reduce manual admin friction.
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
              <button
                onClick={() => setShowAARModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showToast("AAR Report PDF downloaded.");
                  setShowAARModal(false);
                }}
                className="btn-primary"
              >
                <Download size={13} />
                <span>Export Official AAR Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
