"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ServiceCard {
  id: string;
  port: number;
  label: string;
  icon: string;
  cat: string;
  featured?: boolean;
  targetUrl: string;
  desc: string;
  chips: string[];
  color: string;
}

const APPS: ServiceCard[] = [
  {
    id: "mission_control", port: 9000, label: "Mission Control Launchpad", icon: "🚀",
    cat: "gateway", featured: true,
    targetUrl: "http://localhost:9000/",
    desc: "Unified Fleet Gateway — Central Mission Control & Product Switcher",
    chips: ["Launch Pad", "Fleet Gateway", "Port 9000"],
    color: "#00e5b0",
  },
  {
    id: "expedite_strike", port: 9012, label: "Expedite Strike & Fusion 2026", icon: "⚡",
    cat: "offence", featured: true,
    targetUrl: "http://localhost:9012/",
    desc: "Autonomous CTEM & ASPM · Expedite Fusion™ Hybrid Scanning · AI-BOM & LLM Scanner · Checkmarx MCP Server · Auto-PR GitHub/GitLab",
    chips: ["Fusion Hybrid", "ASPM", "AI-BOM", "MCP Server", "Auto-PR", "Choke Point"],
    color: "#a855f7",
  },
  {
    id: "soc_platform", port: 9011, label: "Ægis SOC Platform & ASPM", icon: "🏛️",
    cat: "gateway", featured: true,
    targetUrl: "http://localhost:9011/app/",
    desc: "Full unified platform — 68+ modules, ReAct AI Attack Chains, Multi-Host Kill Chain & Neo4j Relational Graph",
    chips: ["Full SOC", "Port 9011", "ASPM", "ReAct DAG", "68+ Modules"],
    color: "#00e5b0",
  },
  {
    id: "autonomous_pentest", port: 9011, label: "Autonomous PenTest Console", icon: "🎯",
    cat: "offence", featured: true,
    targetUrl: "http://localhost:9011/app/?standalone=1",
    desc: "Standalone Penetration Testing Console — Multi-Target Weaponized Exploit Queue, Live Terminal Evidence & PoC Verification",
    chips: ["Standalone PenTest", "PoC Proofs", "Auto-Exploit", "Neo4j"],
    color: "#38bdf8",
  },
  {
    id: "cloud_launchpad", port: 443, label: "Sphera Cloud Portal", icon: "🌐",
    cat: "gateway", featured: false,
    targetUrl: "https://sphera-portal.vercel.app/",
    desc: "Global Cloud Production Launchpad on Vercel — Unified access across all 6 flagship enterprise platforms",
    chips: ["Vercel Cloud", "Production Live", "Global Portal"],
    color: "#6366f1",
  },
  {
    id: "admin_portal", port: 9011, label: "Admin & Security Center", icon: "🔐",
    cat: "admin",
    targetUrl: "http://localhost:9011/app/",
    desc: "User management · Role-Based Access Control · Whitelist · 2FA · Security Audit Log",
    chips: ["User Mgmt", "RBAC", "2FA", "Audit Logs"],
    color: "#ff3535",
  },
  {
    id: "red_team_ops", port: 9011, label: "Red Team Ops & Exploitability", icon: "🎯",
    cat: "offence",
    targetUrl: "https://14-exploitability-platform.vercel.app/exploit",
    desc: "Web App PT · C2 · Exploitation · Post-Exploit Operations & Live Telemetry Broadcast",
    chips: ["Web App PT", "C2", "Exploitation", "Live Telemetry"],
    color: "#ef4444",
  },
  {
    id: "red_team_suite", port: 9011, label: "Cloud Pentest & IAM PrivEsc", icon: "☁️",
    cat: "offence",
    targetUrl: "https://19-cloud-security-platform.vercel.app/attack-paths",
    desc: "Multi-cloud attack path analysis, AWS/Azure/GCP STS privilege escalation & authorized drills",
    chips: ["Multi-Cloud", "IAM PrivEsc", "Attack Paths", "STS"],
    color: "#f97316",
  },
  {
    id: "cyber_defence", port: 9011, label: "Cyber Defence & AXIOM DAST", icon: "🛡️",
    cat: "defence",
    targetUrl: "https://11-dast-security-platform.vercel.app",
    desc: "Dynamic AppSec scanner, OWASP Top 10 fuzzing, ZAP automation & runtime container protection",
    chips: ["DAST", "OWASP Top 10", "ZAP Fuzzing", "Container"],
    color: "#00c2ff",
  },
  {
    id: "specialised_ops", port: 9011, label: "Aegis Ransomware Recovery", icon: "🛡️",
    cat: "defence",
    targetUrl: "https://17-ransomware-recovery-platform.vercel.app",
    desc: "Full-lifecycle autonomous ransomware recovery, eBPF syscall freeze, RAM key rescue & AD-FDR",
    chips: ["eBPF Freeze", "Key Rescue", "AD-FDR", "Zero-Loss"],
    color: "#ffaa00",
  },
  {
    id: "grc_suite", port: 9011, label: "Unified Integration & SOAR", icon: "📋",
    cat: "governance",
    targetUrl: "https://18-unified-integration-layer.vercel.app",
    desc: "Cross-platform SOAR playbooks, streaming gRPC telemetry (24,500 evt/s) & STIX 2.1 IOC sync",
    chips: ["SOAR Playbooks", "gRPC Stream", "STIX 2.1", "NIST"],
    color: "#00e676",
  },
  {
    id: "digital_forensics", port: 9011, label: "CERBERUS-RE Malware Intel", icon: "🔬",
    cat: "defence",
    targetUrl: "https://16-malware-analysis-platform.vercel.app",
    desc: "Autonomous binary reverse engineering, Cutter/Ghidra disassembler, Volatility & YARA Forge",
    chips: ["Ghidra/Cutter", "Memory Forensics", "x32dbg", "YARA"],
    color: "#9d4edd",
  },
];

export default function MissionControlPage() {
  const [filter, setFilter] = useState("all");
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => setTime(new Date().toUTCString());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredApps = APPS.filter(a => filter === "all" || a.cat === filter);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-5 mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg">
            🚀
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Mission Control Launchpad</h1>
            <div className="text-xs text-zinc-400">Expedite Consults Platform Gateway & Service Registry</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/feed"
            className="text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-xl transition"
          >
            ← Back to Feed
          </Link>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All Services Online
          </span>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
          <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Total Services</div>
          <div className="text-2xl font-bold text-white mt-1">12</div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
          <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Active Services</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">12</div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
          <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Maintenance</div>
          <div className="text-2xl font-bold text-zinc-500 mt-1">0</div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
          <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Security Modules</div>
          <div className="text-2xl font-bold text-zinc-200 mt-1">68+</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "gateway", "offence", "defence", "governance", "admin"].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition capitalize ${
              filter === cat
                ? "bg-white text-zinc-950 shadow-sm"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {filteredApps.map(app => (
          <a
            key={app.id}
            href={app.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between transition group"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xl">{app.icon}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  ONLINE
                </span>
              </div>
              <div className="text-sm font-bold text-white group-hover:text-zinc-200 transition-colors mb-1">{app.label}</div>
              <div className="text-[11px] text-zinc-500 font-mono mb-2">Port :{app.port}</div>
              <div className="text-xs text-zinc-400 leading-relaxed mb-4">{app.desc}</div>
            </div>

            <div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {app.chips.map(chip => (
                  <span key={chip} className="text-[10px] text-zinc-400 bg-zinc-800 border border-zinc-700/60 px-2 py-0.5 rounded-md font-medium">
                    {chip}
                  </span>
                ))}
              </div>
              <div className="text-xs font-semibold text-zinc-300 group-hover:text-white flex items-center justify-end gap-1 transition">
                <span>Launch</span>
                <span>↗</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-10 border-t border-zinc-800 pt-4 flex justify-between items-center text-xs text-zinc-500 flex-wrap gap-2">
        <div>Expedite Consults · Mission Control & Operations Gateway</div>
        <div className="font-mono">{time || "UTC"}</div>
      </div>
    </div>
  );
}
