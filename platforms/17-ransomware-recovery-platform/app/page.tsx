"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Activity,
  Server,
  Database,
  Lock,
  Clock,
  ArrowRight,
  FileText,
  Binary,
  Layers,
  Cpu,
  Terminal,
  Zap,
  CheckCircle2,
  RefreshCw,
  Search,
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";

export default function CommandCenterHub() {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [deskQuery, setDeskQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [networkIsolation, setNetworkIsolation] = useState(true);
  const [s3VaultLocked, setS3VaultLocked] = useState(true);
  const [activeTab, setActiveTab] = useState<"live-feed" | "containment">("live-feed");
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
      step: "PILLAR 01",
      name: "Detect & Identify",
      status: "COMPLETED",
      desc: "Telemetry ingested, LockBit 3.0 signature validated",
      href: "/triage",
      active: true,
    },
    {
      step: "PILLAR 02",
      name: "Analyze & Preserve",
      status: "IN PROGRESS",
      desc: "FRE 901 Merkle roots locked, DAG impact calculated",
      href: "/crypto-analysis",
      active: true,
    },
    {
      step: "PILLAR 03",
      name: "Recover & Orchestrate",
      status: "ACTIVE",
      desc: "ZFS & S3 immutable streams restoring 24 targets",
      href: "/recovery-ops",
      active: true,
    },
    {
      step: "PILLAR 04",
      name: "Protect & Validate",
      status: "QUEUED",
      desc: "Reinfection hunter & gatekeeper dual-custody",
      href: "/reinfection-risk",
      active: false,
    },
    {
      step: "PILLAR 05",
      name: "Govern & Learn",
      status: "QUEUED",
      desc: "Executive post-mortem & SEC/HIPAA ledger reporting",
      href: "/reports",
      active: false,
    },
  ];

  const recentIncidents = [
    {
      time: "00:18:24 UTC",
      badge: "RESTORE",
      msg: "ZFS Snapshot #20260823 partition stream verified at 842 MB/s on SAN-POOL-01",
    },
    {
      time: "00:15:10 UTC",
      badge: "FIREWALL",
      msg: "VLAN 104 (Clinical Medical Imaging) blocked outbound SMB/RDP ports 445 & 3389",
    },
    {
      time: "00:11:42 UTC",
      badge: "NEXUS",
      msg: "Attribution correlation matches UNC3944 / LockBit 3.0 affiliate cluster",
    },
    {
      time: "00:08:05 UTC",
      badge: "IDENTITY",
      msg: "Compromised domain admin credential 'svc_backup_mgmt' revoked & KRBTGT rotated",
    },
    {
      time: "00:02:19 UTC",
      badge: "ENCLAVE",
      msg: "Primary Domain Controller DC01.mercy.local staged clean in isolated Sandbox-A",
    },
  ];

  const studios = [
    {
      title: "Automated Incident Triage",
      href: "/triage",
      kicker: "PILLAR 01 · TRIAGE",
      badge: "LockBit 3.0",
      desc: "1-Click encrypted sample extraction, cipher family attribution, and rapid zero-payment recovery feasibility verdict.",
      metrics: ["Sample Verdict", "Strain Attribution", "Zero-Payment Check"],
      icon: Zap,
      category: "triage",
    },
    {
      title: "Cryptographic & FRE 901 Evidence Desk",
      href: "/crypto-analysis",
      kicker: "PILLAR 02 · FORENSICS",
      badge: "FRE 901 Locked",
      desc: "Inspect AES-256 + ChaCha20 header damage, PRNG seed entropy, and cryptographically signed Merkle chain-of-custody.",
      metrics: ["Entropy Map", "Key Schedule Audit", "FRE 901 Ledger"],
      icon: Lock,
      category: "crypto",
    },
    {
      title: "Recovery Operations & SAN Stream Desk",
      href: "/recovery-ops",
      kicker: "PILLAR 03 · RESTORATION",
      badge: "24 Targets",
      desc: "Real-time SAN, VMFS, and immutable S3/ZFS snapshot orchestration across Tier-0 Active Directory and clinical databases.",
      metrics: ["842 MB/s Stream", "ZFS Snapshot #20260823", "Tier-0 Priority"],
      icon: Cpu,
      category: "ops",
    },
    {
      title: "Reinfection Guard & Clean-Room Gatekeeper",
      href: "/reinfection-risk",
      kicker: "PILLAR 04 · VALIDATION",
      badge: "Dual-Custody",
      desc: "Scans restored snapshots in isolated Sandbox-A for dormant WMI/scheduled-task persistence before production re-entry.",
      metrics: ["Sandbox-A Enclave", "Persistence Sweep", "Dual Sign-Off"],
      icon: ShieldCheck,
      category: "validation",
    },
    {
      title: "SOC Threat Analyst Workspace",
      href: "/soc-analyst",
      kicker: "INTELLIGENCE DESK",
      badge: "IOC Ledger",
      desc: "Correlates C2 beacons, lateral movement paths, and signed analyst notes across affected subnets and identity providers.",
      metrics: ["IOC Correlation", "C2 Sniffer", "Signed Notes"],
      icon: Terminal,
      category: "triage",
    },
    {
      title: "Executive Boardroom & RTO Impact",
      href: "/executive",
      kicker: "PILLAR 05 · GOVERNANCE",
      badge: "RTO 18.5h",
      desc: "Tracks hourly downtime averted, zero-ransom-payment savings ($1.8M preserved), and SEC/HIPAA disclosure readiness.",
      metrics: ["$1.8M Preserved", "18.5h Target RTO", "SEC / HIPAA Ready"],
      icon: Activity,
      category: "gov",
    },
    {
      title: "Ransom Note NLP & Darknet Intel",
      href: "/ransom-notes",
      kicker: "PILLAR 01 · ATTRIBUTION",
      badge: "NLP Match",
      desc: "Linguistic stylometry, Tor onion entity extraction, and affiliate negotiation playbook behavioral profiling.",
      metrics: ["Stylometry", "Affiliate Cluster", "Tor Entity Graph"],
      icon: FileText,
      category: "triage",
    },
    {
      title: "Encrypted File Pattern Analyzer",
      href: "/file-patterns",
      kicker: "PILLAR 02 · BYTE-LEVEL",
      badge: "47.2k Files",
      desc: "Analyzes intermittent stripe encryption, file-header corruption offsets, and partial block reconstruction viability.",
      metrics: ["Stripe Offset", "Header Diff", "1.8 TB Scanned"],
      icon: Binary,
      category: "crypto",
    },
    {
      title: "Incident Intake & Case Desk",
      href: "/cases",
      kicker: "CASE MANAGEMENT",
      badge: "3 Active Cases",
      desc: "Multi-tenant incident case ledger, forensic evidence locker, and role-based responder task assignment.",
      metrics: ["FRE 901 Custody", "Responder Roster", "Audit Trail"],
      icon: Layers,
      category: "gov",
    },
  ];

  const filteredStudios = studios.filter((s) => {
    const matchFilter = selectedFilter === "all" || s.category === selectedFilter;
    const matchQuery =
      !deskQuery ||
      s.title.toLowerCase().includes(deskQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(deskQuery.toLowerCase()) ||
      s.kicker.toLowerCase().includes(deskQuery.toLowerCase());
    return matchFilter && matchQuery;
  });

  return (
    <div className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* XTRIKE RECOVERY DESK Editorial Masthead Section (Matching Desk Note screenshot) */}
      <section className="space-y-6">
        <div className="space-y-2 max-w-3xl">
          <div className="desk-kicker">XTRIKE RECOVERY DESK &middot; PLATFORM 17</div>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight font-editorial"
            style={{ color: "var(--foreground)" }}
          >
            XTRIKE Recovery Desk
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--muted)" }}>
            Live incident telemetry and immutable backup snapshots stay current. The front page is first. Choose a tab for Triage, Crypto Forensics, SAN Recovery, Reinfection Guard, or Governance. A readiness number scores snapshot integrity—it is a cryptographic proof, not a guess.
          </p>
        </div>

        {/* Action Strip (Matching "Turn off notifications" in the reference design) */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/triage"
            className="px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
            style={{
              background: "var(--surface)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              boxShadow: "0 1px 2px rgba(31, 27, 24, 0.05)",
            }}
          >
            Run Forensic Triage &amp; Snapshot Check
          </Link>
          <p className="text-xs max-w-xl leading-relaxed" style={{ color: "var(--muted)" }}>
            Enclave isolation stays on for this desk (`24 / 24 hosts contained`). Elapsed incident timer: <strong>{formatTimer(elapsedSeconds)}</strong> &middot; Target RTO: <strong>{activeCase.estimatedRecoveryTimeHours}h 00m</strong>.
          </p>
        </div>

        {/* Search the desk */}
        <div className="space-y-2 pt-2">
          <label
            className="block text-xs font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Search the desk
          </label>
          <div className="relative">
            <Search
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--subtle)" }}
            />
            <input
              type="text"
              value={deskQuery}
              onChange={(e) => setDeskQuery(e.target.value)}
              placeholder="Case, ransomware strain, ZFS snapshot, FRE 901 hash, or studio..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                boxShadow: "0 1px 2px rgba(31, 27, 24, 0.03)",
              }}
            />
          </div>
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            Last job &middot; Case `{activeCase.caseNumber}` ({activeCase.organization} &mdash; 95.0% clean backup readiness). Open a studio, or inspect a snapshot stream.
          </div>
        </div>

        {/* Region / Active Case Selector + Filter Pill Strip + Breaking Ticker (Matching Desk Note screenshot) */}
        <div
          className="pt-4 border-t space-y-3.5"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span
              className="text-[11px] font-bold uppercase tracking-wider shrink-0"
              style={{ color: "var(--muted)" }}
            >
              ACTIVE CASE
            </span>
            <select
              value={activeCaseIndex}
              onChange={(e) => setActiveCaseIndex(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              {MOCK_CASES.map((c, idx) => (
                <option key={c.id} value={idx}>
                  {c.organization} &mdash; {c.title} ({c.ransomwareFamily} &middot; {c.caseNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "Front page", count: "5 hot" },
              { id: "triage", label: "Triage & Intel", count: "3" },
              { id: "crypto", label: "Crypto & Evidence", count: "FRE 901" },
              { id: "ops", label: "SAN & ZFS Restore", count: "24 Hosts" },
              { id: "validation", label: "Reinfection Guard", count: "Clean" },
              { id: "gov", label: "Executive & Cases", count: "RTO 18.5h" },
            ].map((pill) => {
              const active = selectedFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedFilter(pill.id)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  style={{
                    background: active ? "var(--accent)" : "var(--surface)",
                    color: active ? "#fbf8f3" : "var(--foreground)",
                    border: active
                      ? "1px solid #72361d"
                      : "1px solid var(--border)",
                    boxShadow: "0 1px 2px rgba(31, 27, 24, 0.04)",
                  }}
                >
                  <span>{pill.label}</span>
                  {pill.count && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: active ? "#fbf8f3" : "var(--accent-soft)",
                        color: "var(--accent)",
                      }}
                    >
                      {pill.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Breaking / Verified Recovery Ticker Strip */}
          <div
            className="flex items-center rounded-lg overflow-hidden border text-xs"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <span
              className="px-3 py-2 font-bold uppercase tracking-wider shrink-0"
              style={{
                background: "var(--accent)",
                color: "#fbf8f3",
                fontSize: "0.68rem",
              }}
            >
              BREAKING
            </span>
            <div
              className="px-3.5 py-2 flex items-center gap-6 overflow-x-auto whitespace-nowrap"
              style={{ color: "var(--muted)" }}
            >
              <span>
                <strong style={{ color: "var(--foreground)" }}>ZFS Snapshot #20260823</strong> &middot; Partition stream restoring at 842 MB/s on SAN-POOL-01
              </span>
              <span>
                <strong style={{ color: "var(--foreground)" }}>Zero-Payment Verified</strong> &middot; 95.0% immutable S3 Object Lock + ZFS coverage ($1.8M extortion bypassed)
              </span>
              <span>
                <strong style={{ color: "var(--foreground)" }}>Sandbox-A Enclave</strong> &middot; Primary Domain Controller `DC01.mercy.local` staged clean
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* THE READING: Main Editorial Container Card */}
      <section className="card-surface p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="desk-kicker">THE READING &middot; 5-PILLAR AUTONOMOUS RECOVERY</div>
            <h2
              className="text-2xl sm:text-3xl font-bold font-editorial"
              style={{ color: "var(--foreground)" }}
            >
              The clean snapshot first
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Deterministic transition gates from initial sample triage and FRE 901 Merkle evidence locking to clean-room ZFS/S3 restoration and dual-custody production re-entry.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs" style={{ color: "var(--muted)" }}>
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ background: "var(--foreground)" }}
              />
              <strong style={{ color: "var(--foreground)" }}>Live</strong>
              <span>24/24 hosts isolated &middot; 47.2k encrypted files mapped &middot; Phase 3 restoration in progress (42%).</span>
            </div>
          </div>

          <Link
            href="/recovery-ops"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0"
            style={{
              background: "var(--surface)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              boxShadow: "0 1px 2px rgba(31, 27, 24, 0.04)",
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Open Recovery Ops Desk</span>
          </Link>
        </div>

        {/* 5-Pillar Lifecycle Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {pillars.map((pillar) => (
            <Link
              key={pillar.step}
              href={pillar.href}
              className="p-4 rounded-xl flex flex-col justify-between gap-3 card-hover"
              style={{
                background: "var(--background)",
                border: pillar.active ? "1px solid var(--accent)" : "1px solid var(--border)",
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="desk-kicker">{pillar.step}</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: pillar.active ? "var(--accent-soft)" : "var(--surface-2)",
                      color: pillar.active ? "var(--accent)" : "var(--muted)",
                    }}
                  >
                    {pillar.status}
                  </span>
                </div>
                <div className="text-sm font-bold font-editorial" style={{ color: "var(--foreground)" }}>
                  {pillar.name}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                  {pillar.desc}
                </p>
              </div>
              <div className="pt-2 border-t flex items-center justify-between text-[11px] font-bold" style={{ borderColor: "var(--border)", color: "var(--accent)" }}>
                <span>Open Gate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>

        {/* 3-Column Editorial Workbench Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudios.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.href}
                href={s.href}
                className="flex flex-col justify-between p-5 rounded-xl transition-all card-hover"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="space-y-3">
                  <div
                    className="flex items-center justify-between gap-2 border-b pb-2.5"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span className="desk-kicker">{s.kicker}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                      }}
                    >
                      {s.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        color: "var(--accent)",
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3
                      className="text-lg font-bold leading-snug font-editorial"
                      style={{ color: "var(--foreground)" }}
                    >
                      {s.title}
                    </h3>
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                    {s.desc}
                  </p>
                </div>

                <div
                  className="pt-4 mt-4 border-t flex flex-wrap items-center justify-between gap-2"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {s.metrics.map((m) => (
                      <span
                        key={m}
                        className="text-[11px] px-2 py-0.5 rounded font-medium"
                        style={{
                          background: "var(--surface)",
                          color: "var(--muted)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Live Telemetry Ledger & Emergency Containment Controls */}
      <section className="card-surface p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("live-feed")}
              className="px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
              style={{
                background: activeTab === "live-feed" ? "var(--accent)" : "var(--background)",
                color: activeTab === "live-feed" ? "#fbf8f3" : "var(--foreground)",
                border: activeTab === "live-feed" ? "1px solid #72361d" : "1px solid var(--border)",
              }}
            >
              Real-Time Incident Stream
            </button>
            <button
              onClick={() => setActiveTab("containment")}
              className="px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
              style={{
                background: activeTab === "containment" ? "var(--accent)" : "var(--background)",
                color: activeTab === "containment" ? "#fbf8f3" : "var(--foreground)",
                border: activeTab === "containment" ? "1px solid #72361d" : "1px solid var(--border)",
              }}
            >
              Emergency Containment Matrix
            </button>
          </div>
          <div className="text-xs font-semibold flex items-center gap-2" style={{ color: "var(--muted)" }}>
            <CheckCircle2 className="w-4 h-4" style={{ color: "var(--success)" }} />
            <span>Zero-Payment Strategy &middot; 95.0% Immutable Snapshot Coverage</span>
          </div>
        </div>

        {activeTab === "live-feed" ? (
          <div className="grid grid-cols-1 gap-2.5">
            {recentIncidents.map((inc, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs font-mono font-bold px-2.5 py-1 rounded shrink-0"
                    style={{
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                    }}
                  >
                    {inc.badge}
                  </span>
                  <span className="text-xs sm:text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {inc.msg}
                  </span>
                </div>
                <span className="text-xs font-mono shrink-0" style={{ color: "var(--muted)" }}>
                  {inc.time}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="p-5 rounded-xl space-y-2"
              style={{ background: "var(--background)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-editorial" style={{ color: "var(--foreground)" }}>
                  Network Egress Sever (VLAN 104)
                </span>
                <button
                  onClick={() => setNetworkIsolation(!networkIsolation)}
                  className="px-3 py-1 rounded-full text-xs font-bold cursor-pointer"
                  style={{
                    background: networkIsolation ? "var(--accent)" : "var(--surface)",
                    color: networkIsolation ? "#fbf8f3" : "var(--foreground)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {networkIsolation ? "SEVERED" : "ENABLED"}
                </button>
              </div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                BGP routes withdrawn and SMB/RDP ports 445 &amp; 3389 isolated across 24 affected clinical hosts.
              </p>
            </div>

            <div
              className="p-5 rounded-xl space-y-2"
              style={{ background: "var(--background)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-editorial" style={{ color: "var(--foreground)" }}>
                  Immutable S3 Object Lock (WORM)
                </span>
                <button
                  onClick={() => setS3VaultLocked(!s3VaultLocked)}
                  className="px-3 py-1 rounded-full text-xs font-bold cursor-pointer"
                  style={{
                    background: s3VaultLocked ? "var(--accent)" : "var(--surface)",
                    color: s3VaultLocked ? "#fbf8f3" : "var(--foreground)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {s3VaultLocked ? "COMPLIANCE WORM" : "UNLOCKED"}
                </button>
              </div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                AWS S3 Object Lock Compliance mode &amp; ZFS read-only hardware locks prevent snapshot tampering.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
