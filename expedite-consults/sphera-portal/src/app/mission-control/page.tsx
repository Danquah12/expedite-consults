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
    <div style={{ minHeight: "100vh", background: "#05080c", color: "#e2e8f0", fontFamily: "monospace", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "16px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>🚀</span>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#00ff88", margin: 0, letterSpacing: "2px" }}>ÆGIS · MISSION CONTROL</h1>
            <div style={{ fontSize: "11px", color: "#64748b" }}>Unified Security Operations & Autonomous Pentest Fleet</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ color: "#38bdf8", textDecoration: "none", fontSize: "12px", border: "1px solid #0284c7", padding: "6px 12px", borderRadius: "6px" }}>
            ← Back to Portal
          </Link>
          <span style={{ color: "#10b981", fontSize: "11px", background: "rgba(16,185,129,0.15)", padding: "4px 10px", borderRadius: "20px", border: "1px solid rgba(16,185,129,0.3)" }}>
            ● FLEET ONLINE
          </span>
        </div>
      </div>

      {/* Hero Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px 16px" }}>
          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "bold" }}>TOTAL FLEET SERVICES</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#ffffff", marginTop: "4px" }}>12</div>
        </div>
        <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px 16px" }}>
          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "bold" }}>ONLINE SERVICES</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#00ff88", marginTop: "4px" }}>12</div>
        </div>
        <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px 16px" }}>
          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "bold" }}>OFFLINE</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#64748b", marginTop: "4px" }}>0</div>
        </div>
        <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px 16px" }}>
          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "bold" }}>ENTERPRISE MODULES</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#38bdf8", marginTop: "4px" }}>68+</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["all", "gateway", "offence", "defence", "governance", "admin"].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              background: filter === cat ? "#00ff88" : "rgba(30,41,59,0.5)",
              color: filter === cat ? "#05080c" : "#94a3b8",
              border: "1px solid #334155",
              borderRadius: "6px",
              padding: "6px 14px",
              fontSize: "11px",
              fontWeight: "bold",
              cursor: "pointer",
              textTransform: "uppercase"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
        {filteredApps.map(app => (
          <a
            key={app.id}
            href={app.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              color: "inherit",
              background: "rgba(11, 18, 32, 0.9)",
              border: `1px solid ${app.color}44`,
              borderTop: `3px solid ${app.color}`,
              borderRadius: "10px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "20px" }}>{app.icon}</span>
                <span style={{ fontSize: "9px", color: "#10b981", background: "rgba(16,185,129,0.15)", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
                  ONLINE
                </span>
              </div>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: "#ffffff", marginBottom: "4px" }}>{app.label}</div>
              <div style={{ fontSize: "10px", color: app.color, marginBottom: "8px" }}>:{app.port}</div>
              <div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.5", marginBottom: "12px" }}>{app.desc}</div>
            </div>

            <div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                {app.chips.map(chip => (
                  <span key={chip} style={{ fontSize: "9px", color: "#cbd5e1", background: "#1e293b", padding: "2px 6px", borderRadius: "4px" }}>
                    {chip}
                  </span>
                ))}
              </div>
              <div style={{ color: "#00ff88", fontSize: "11px", fontWeight: "bold", textAlign: "right" }}>
                LAUNCH ↗
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "40px", borderTop: "1px solid #1e293b", paddingTop: "16px", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#64748b" }}>
        <div>ÆGIS MISSION CONTROL · SECURITY OPERATIONS CENTER</div>
        <div>{time || "UTC"}</div>
      </div>
    </div>
  );
}
