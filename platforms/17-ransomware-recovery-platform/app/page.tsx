"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  Server,
  Database,
  Lock,
  Unlock,
  Radio,
  Clock,
  ArrowRight,
  TrendingDown,
  FileText,
  Binary,
  Layers,
  Cpu,
  Terminal,
  Zap,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
  Crosshair,
  Volume2
} from "lucide-react";
import { MOCK_CASES, MOCK_BACKUP_SOURCES } from "@/data/recoveryData";
import { IncidentSeverity, IncidentStatus } from "@/types/recovery";

export default function CommandCenterHub() {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [defconLevel, setDefconLevel] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [containmentActive, setContainmentActive] = useState(false);
  const [networkIsolation, setNetworkIsolation] = useState(true);
  const [s3VaultLocked, setS3VaultLocked] = useState(true);
  const [activeTab, setActiveTab] = useState<"live-feed" | "containment" | "studios">("live-feed");
  const [elapsedSeconds, setElapsedSeconds] = useState(3640);

  const activeCase = MOCK_CASES[activeCaseIndex] || MOCK_CASES[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const pillars = [
    {
      step: "01",
      name: "DETECT & IDENTIFY",
      status: "COMPLETED",
      desc: "Telemetry ingested, LockBit 3.0 signature validated",
      href: "/triage",
      active: true,
      color: "#10b981"
    },
    {
      step: "02",
      name: "ANALYZE & PRESERVE",
      status: "IN_PROGRESS",
      desc: "FRE 901 Merkle roots locked, DAG impact calculated",
      href: "/crypto-analysis",
      active: true,
      color: "#06b6d4"
    },
    {
      step: "03",
      name: "RECOVER & ORCHESTRATE",
      status: "ACTIVE",
      desc: "ZFS & S3 immutable streams restoring 24 targets",
      href: "/recovery-ops",
      active: true,
      color: "#f59e0b"
    },
    {
      step: "04",
      name: "PROTECT & VALIDATE",
      status: "QUEUED",
      desc: "Reinfection hunter & gatekeeper dual-custody",
      href: "/reinfection-risk",
      active: false,
      color: "#8493a8"
    },
    {
      step: "05",
      name: "GOVERN & LEARN",
      status: "QUEUED",
      desc: "Executive post-mortem, ledger reporting",
      href: "/reports",
      active: false,
      color: "#8493a8"
    }
  ];

  const recentIncidents = [
    {
      time: "00:18:24 UTC",
      level: "ALERT",
      msg: "ZFS Snapshot #20260823 partition stream at 842 MB/s on SAN-POOL-01",
      badge: "RESTORE"
    },
    {
      time: "00:15:10 UTC",
      level: "CONTAIN",
      msg: "Vlan 104 (Clinical Medical Imaging) blocked outbound port 445 / 3389",
      badge: "FIREWALL"
    },
    {
      time: "00:11:42 UTC",
      level: "INTEL",
      msg: "Attribution correlation matches UNC3944 (Scattered Spider affiliate)",
      badge: "NEXUS"
    },
    {
      time: "00:08:05 UTC",
      level: "CRITICAL",
      msg: "Compromised domain admin credential 'svc_backup_mgmt' revoked",
      badge: "IDENTITY"
    },
    {
      time: "00:02:19 UTC",
      level: "SUCCESS",
      msg: "Primary Domain Controller DC01.mercy.local staged clean in Sandbox-A",
      badge: "ENCLAVE"
    }
  ];

  const studios = [
    { title: "Automated Incident Triage", path: "/triage", desc: "1-Click sample extraction & rapid AI verdict", tag: "Pillar 1", icon: Zap, color: "#10b981" },
    { title: "SOC Threat Analyst Workspace", path: "/soc-analyst", desc: "IOC ledger, C2 sniffer & signed notes", tag: "Intelligence", icon: Terminal, color: "#06b6d4" },
    { title: "Executive Boardroom Impact", path: "/executive", desc: "$/hr loss tracker & compliance exposure", tag: "C-Level", icon: Activity, color: "#f43f5e" },
    { title: "Recovery Operations Desk", path: "/recovery-ops", desc: "Real-time SAN / VMFS volume restoration", tag: "Ops", icon: Cpu, color: "#f59e0b" },
    { title: "Ransom Note NLP & Tor", path: "/ransom-notes", desc: "Darknet links, onion entities & sentiment", tag: "Pillar 1", icon: FileText, color: "#a855f7" },
    { title: "Encrypted File Pattern Analyzer", path: "/file-patterns", desc: "Byte-level header damage & entropy map", tag: "Pillar 1", icon: Binary, color: "#06b6d4" },
    { title: "Campaign Correlator & Nexus", path: "/campaigns", desc: "Cross-tenant affiliate cluster intelligence", tag: "Pillar 1", icon: Layers, color: "#10b981" },
    { title: "Incident Intake & Case Desk", path: "/cases", desc: "FRE 901 custody & task assignment", tag: "Pillar 1", icon: ShieldCheck, color: "#3b82f6" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* DEFCON STATUS BANNER */}
      <div
        style={{
          background: "linear-gradient(90deg, rgba(244,63,94,0.18) 0%, rgba(14,21,38,0.9) 60%, rgba(16,185,129,0.1) 100%)",
          border: "1px solid rgba(244,63,94,0.4)",
          borderRadius: 10,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 0 25px rgba(244,63,94,0.15)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: "rgba(244,63,94,0.2)",
              border: "1px solid #f43f5e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Flame size={24} color="#f43f5e" className="animate-bounce" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", color: "#f43f5e", fontFamily: "monospace" }}>
                DEFCON CONDITION {defconLevel}
              </span>
              <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(244,63,94,0.3)", color: "#fecdd3", fontWeight: 700 }}>
                ACTIVE RANSOMWARE INCIDENT
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#f8fafc", marginTop: 2 }}>
              {activeCase.organization} — {activeCase.title}
            </div>
          </div>
        </div>

        {/* Tactical Counters */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Incident Elapsed</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#06b6d4", fontFamily: "monospace" }}>{formatTimer(elapsedSeconds)}</div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Target RTO</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#10b981", fontFamily: "monospace" }}>{activeCase.estimatedRecoveryTimeHours}h 00m</div>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDefconLevel(lvl as 1 | 2 | 3 | 4 | 5)}
                style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 800,
                  fontFamily: "monospace",
                  cursor: "pointer",
                  background: defconLevel === lvl ? "#f43f5e" : "var(--surface-2)",
                  color: defconLevel === lvl ? "#fff" : "var(--muted)",
                  border: defconLevel === lvl ? "1px solid #f43f5e" : "1px solid var(--border)"
                }}
              >
                D{lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Affected Hosts</span>
            <Server size={15} color="#f43f5e" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f8fafc", marginTop: 8 }}>
            24 <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>/ 24 isolated</span>
          </div>
          <div style={{ fontSize: 10.5, color: "#f43f5e", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <span>● 100% network contained</span>
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Encrypted Files</span>
            <Lock size={15} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f8fafc", marginTop: 8 }}>
            47.2k <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>files (1.8 TB)</span>
          </div>
          <div style={{ fontSize: 10.5, color: "#f59e0b", marginTop: 4 }}>
            AES-256 + ChaCha20 combo
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Ransom Extortion</span>
            <Radio size={15} color="#f43f5e" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f43f5e", marginTop: 8 }}>
            $1.8M <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>(28.5 BTC)</span>
          </div>
          <div style={{ fontSize: 10.5, color: "#10b981", marginTop: 4 }}>
            Strategy: ZERO-PAYMENT BACKUP
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Clean Backups</span>
            <ShieldCheck size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981", marginTop: 8 }}>
            95.0% <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>readiness</span>
          </div>
          <div style={{ fontSize: 10.5, color: "#10b981", marginTop: 4 }}>
            Immutable S3 + ZFS snapshots
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Est. RTO Target</span>
            <Clock size={15} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#06b6d4", marginTop: 8 }}>
            18.5h <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>total</span>
          </div>
          <div style={{ fontSize: 10.5, color: "#06b6d4", marginTop: 4 }}>
            6.2h Tier-0 Identity restored
          </div>
        </div>
      </div>

      {/* 5-PILLAR LIFECYCLE PROGRESSION */}
      <div className="card-tactical" style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", letterSpacing: "0.04em" }}>
              5-PILLAR AUTONOMOUS RECOVERY LIFECYCLE
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              Deterministic transition gates from ingestion to dual-custody production re-entry
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>● PHASE 3 IN PROGRESS (42%)</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, position: "relative" }}>
          {pillars.map((pillar, idx) => (
            <Link
              key={idx}
              href={pillar.href}
              style={{
                textDecoration: "none",
                background: pillar.active ? "var(--surface-2)" : "rgba(22,32,56,0.5)",
                border: pillar.active ? `1px solid ${pillar.color}` : "1px solid var(--border)",
                borderRadius: 8,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                transition: "all 0.15s ease",
                cursor: "pointer"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: pillar.color, fontFamily: "monospace" }}>
                  PILLAR {pillar.step}
                </span>
                <span
                  style={{
                    fontSize: 8.5,
                    fontWeight: 800,
                    padding: "2px 5px",
                    borderRadius: 3,
                    background: pillar.status === "COMPLETED" ? "rgba(16,185,129,0.2)" : pillar.status === "IN_PROGRESS" || pillar.status === "ACTIVE" ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.05)",
                    color: pillar.status === "COMPLETED" ? "#10b981" : pillar.status === "IN_PROGRESS" || pillar.status === "ACTIVE" ? "#06b6d4" : "var(--muted)"
                  }}
                >
                  {pillar.status}
                </span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>{pillar.name}</div>
              <div style={{ fontSize: 10.5, color: "var(--muted)", lineHeight: 1.3 }}>{pillar.desc}</div>
              <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: pillar.color, fontWeight: 700 }}>
                <span>Launch Studio</span>
                <ChevronRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* DUAL WORKSPACE SECTION: INCIDENT FEED & CONTAINMENT vs QUICK LAUNCH */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
        {/* Left Column: Live Feed and Emergency Controls */}
        <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setActiveTab("live-feed")}
                style={{
                  background: activeTab === "live-feed" ? "rgba(16,185,129,0.15)" : "transparent",
                  color: activeTab === "live-feed" ? "#10b981" : "var(--muted)",
                  border: activeTab === "live-feed" ? "1px solid rgba(16,185,129,0.4)" : "1px solid transparent",
                  padding: "5px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Real-Time Incident Stream
              </button>
              <button
                onClick={() => setActiveTab("containment")}
                style={{
                  background: activeTab === "containment" ? "rgba(244,63,94,0.15)" : "transparent",
                  color: activeTab === "containment" ? "#f43f5e" : "var(--muted)",
                  border: activeTab === "containment" ? "1px solid rgba(244,63,94,0.4)" : "1px solid transparent",
                  padding: "5px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Emergency Containment Matrix
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--muted)" }}>
              <Activity size={13} color="#10b981" />
              <span>LIVE TELEMETRY</span>
            </div>
          </div>

          {activeTab === "live-feed" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentIncidents.map((inc, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 6,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)"
                  }}
                >
                  <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace", width: 85 }}>{inc.time}</span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontFamily: "monospace",
                      background: inc.level === "CRITICAL" || inc.level === "ALERT" ? "rgba(244,63,94,0.2)" : inc.level === "SUCCESS" ? "rgba(16,185,129,0.2)" : "rgba(6,182,212,0.2)",
                      color: inc.level === "CRITICAL" || inc.level === "ALERT" ? "#f43f5e" : inc.level === "SUCCESS" ? "#10b981" : "#06b6d4"
                    }}
                  >
                    {inc.badge}
                  </span>
                  <span style={{ fontSize: 11.5, color: "var(--fg-2)", flex: 1 }}>{inc.msg}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Emergency switches allow zero-trust isolation of corrupted subnets, revocation of administrative Kerberos tickets, and hardware snapshot write-locks.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ padding: 12, borderRadius: 6, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Network Egress Sever</span>
                    <button
                      onClick={() => setNetworkIsolation(!networkIsolation)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: networkIsolation ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.2)",
                        color: networkIsolation ? "#f43f5e" : "#10b981",
                        border: networkIsolation ? "1px solid #f43f5e" : "1px solid #10b981"
                      }}
                    >
                      {networkIsolation ? "SEVERED" : "ENABLED"}
                    </button>
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 6 }}>BGP routes withdrawn; WAN firewalls dropping all egress packets</div>
                </div>

                <div style={{ padding: 12, borderRadius: 6, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Immutable S3 Object Lock</span>
                    <button
                      onClick={() => setS3VaultLocked(!s3VaultLocked)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: s3VaultLocked ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.2)",
                        color: s3VaultLocked ? "#10b981" : "#f43f5e",
                        border: s3VaultLocked ? "1px solid #10b981" : "1px solid #f43f5e"
                      }}
                    >
                      {s3VaultLocked ? "COMPLIANCE WORM" : "UNLOCKED"}
                    </button>
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 6 }}>AWS S3 Compliance mode prevents deletion even by root account</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => alert("Kerberos KRBTGT double password roll triggered enterprise-wide.")}
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: 11.5, justifyContent: "center" }}
                >
                  <RefreshCw size={13} />
                  <span>Execute KRBTGT Double Roll</span>
                </button>
                <button
                  onClick={() => alert("Forensic RAM snapshot dumped to cold storage.")}
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: 11.5, justifyContent: "center" }}
                >
                  <Database size={13} />
                  <span>Freeze Hypervisor State</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Quick-Launch Studios Matrix */}
        <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>RECOVERY STUDIOS QUICK-LAUNCH</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Direct access to all forensic and restoration consoles</div>
            </div>
            <ExternalLink size={14} color="#06b6d4" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {studios.map((st, i) => {
              const Icon = st.icon;
              return (
                <Link
                  key={i}
                  href={st.path}
                  style={{
                    textDecoration: "none",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 4, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={12} color={st.color} />
                    </div>
                    <span style={{ fontSize: 9, color: st.color, fontWeight: 800, fontFamily: "monospace" }}>{st.tag}</span>
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>{st.title}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {st.desc}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
