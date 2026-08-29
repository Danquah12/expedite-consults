"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sliders,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  Flame,
  Terminal,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Search,
  Lock,
  Unlock,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu,
  HardDrive,
  Eye,
  Crosshair,
  FileCode,
  Sparkles,
  BarChart3,
  Check,
  Copy,
  ExternalLink
} from "lucide-react";
import { RansomwareVulnerability } from "@/types/recovery";

// Rich dataset of real CVEs weaponized by active ransomware groups
const INITIAL_VULNERABILITIES: RansomwareVulnerability[] = [
  {
    id: "vuln-01",
    cveId: "CVE-2023-27997",
    title: "Fortinet FortiOS Heap-based Buffer Overflow SSL-VPN RCE",
    affectedSoftware: "Fortinet FortiOS SSL-VPN 7.0.x",
    cvssScore: 9.8,
    epssProbabilityPct: 97.4,
    cisaKevKnownRansomware: true,
    weaponizedGroups: ["LockBit 3.0", "BlackCat / ALPHV", "Akira"],
    lateralMovementPotential: 9.5,
    assetTier: "TIER_0",
    calculatedRiskScore: 98.6,
    patchSlaHours: 24,
    timeRemainingHours: -14, // Overdue
    patchStatus: "OVERDUE",
    affectedAssetsCount: 4,
    runbookSnippet: `# Ansible Playbook: FortiOS Virtual Patching\n- name: Enforce SSL-VPN ACL Restriction\n  fortios_firewall_policy:\n    vdom: "root"\n    name: "Block_Unauth_VPN_Heap"\n    action: "deny"`,
    mitigationSteps: [
      "Disable SSL-VPN service immediately or restrict ingress to trusted CIDR blocks.",
      "Upgrade FortiOS firmware to version 7.0.12 or 7.2.5+.",
      "Inspect VPN logs for suspicious HTTP POST requests to /remote/hostcheck_validate."
    ]
  },
  {
    id: "vuln-02",
    cveId: "CVE-2024-3400",
    title: "Palo Alto PAN-OS Command Injection in GlobalProtect Gateway",
    affectedSoftware: "PAN-OS 10.2, 11.0, 11.1 GlobalProtect",
    cvssScore: 10.0,
    epssProbabilityPct: 96.2,
    cisaKevKnownRansomware: true,
    weaponizedGroups: ["BlackCat / ALPHV", "Cl0p"],
    lateralMovementPotential: 10.0,
    assetTier: "TIER_0",
    calculatedRiskScore: 99.2,
    patchSlaHours: 12,
    timeRemainingHours: 4,
    patchStatus: "ACTION_REQUIRED",
    affectedAssetsCount: 2,
    runbookSnippet: `# PowerShell PAN-OS API Hotfix\nInvoke-RestMethod -Uri "https://pan-gw.mercy.local/api/?type=op&cmd=<set><telemetry><device-telemetry-disable/></telemetry></set>"`,
    mitigationSteps: [
      "Disable Device Telemetry on PAN-OS until hotfix is installed.",
      "Apply Threat Prevention signature IDs 95187, 95189, and 95191.",
      "Verify no unbacked Python scripts running in /var/tmp/."
    ]
  },
  {
    id: "vuln-03",
    cveId: "CVE-2023-4966",
    title: "Citrix NetScaler ADC & Gateway Sensitive Information Disclosure (Citrix Bleed)",
    affectedSoftware: "Citrix ADC / Gateway 13.0, 13.1",
    cvssScore: 9.4,
    epssProbabilityPct: 94.8,
    cisaKevKnownRansomware: true,
    weaponizedGroups: ["LockBit 3.0", "Black Basta"],
    lateralMovementPotential: 8.8,
    assetTier: "TIER_1",
    calculatedRiskScore: 92.4,
    patchSlaHours: 24,
    timeRemainingHours: 11,
    patchStatus: "ACTION_REQUIRED",
    affectedAssetsCount: 3,
    runbookSnippet: `# Citrix ADC CLI Session Wipe\nkill aaa session -all\nreboot -warm`,
    mitigationSteps: [
      "Terminate all active AAA / ICA user sessions to invalidate stolen session tokens.",
      "Deploy NetScaler ADC updated build 13.1-49.13.",
      "Rotate domain user passwords that authenticated through NetScaler in the last 72 hours."
    ]
  },
  {
    id: "vuln-04",
    cveId: "CVE-2021-34473",
    title: "Microsoft Exchange Server Remote Code Execution (ProxyShell)",
    affectedSoftware: "MS Exchange 2013, 2016, 2019",
    cvssScore: 9.8,
    epssProbabilityPct: 98.1,
    cisaKevKnownRansomware: true,
    weaponizedGroups: ["LockBit 3.0", "Black Basta", "Play", "BianLian"],
    lateralMovementPotential: 9.6,
    assetTier: "TIER_0",
    calculatedRiskScore: 97.8,
    patchSlaHours: 24,
    timeRemainingHours: -36, // Overdue
    patchStatus: "OVERDUE",
    affectedAssetsCount: 2,
    runbookSnippet: `# IIS URL Rewrite Rule for ProxyShell\nAdd-WebConfigurationProperty -PSPath 'IIS:\\Sites\\Default Web Site' -Filter 'system.webServer/rewrite/rules' -Name '.' -Value @{name='BlockProxyShell'; patternSyntax='ECMAScript'; stopProcessing='True'}`,
    mitigationSteps: [
      "Apply Microsoft Security Update KB5001779.",
      "Block external access to /autodiscover/autodiscover.json on perimeter reverse proxies.",
      "Audit Exchange Mailbox Export requests for unauthorized PST dumps."
    ]
  },
  {
    id: "vuln-05",
    cveId: "CVE-2024-1709",
    title: "ConnectWise ScreenConnect Authentication Bypass Vulnerability",
    affectedSoftware: "ScreenConnect 23.9.7 and prior",
    cvssScore: 10.0,
    epssProbabilityPct: 98.9,
    cisaKevKnownRansomware: true,
    weaponizedGroups: ["LockBit 3.0", "Akira", "Black Basta"],
    lateralMovementPotential: 9.8,
    assetTier: "TIER_1",
    calculatedRiskScore: 99.4,
    patchSlaHours: 12,
    timeRemainingHours: 2,
    patchStatus: "ACTION_REQUIRED",
    affectedAssetsCount: 1,
    runbookSnippet: `# ScreenConnect Firewall Quarantine\nNew-NetFirewallRule -DisplayName "Block-ScreenConnect-Setup" -Direction Inbound -LocalPort 8040,8041 -Protocol TCP -Action Block`,
    mitigationSteps: [
      "Upgrade ScreenConnect instances immediately to version 23.9.8+.",
      "Check C:\\Program Files (x86)\\ScreenConnect\\App_Data\\ for rogue User.xml modifications.",
      "Isolate server if unauthenticated SetupWizard.aspx was accessed."
    ]
  },
  {
    id: "vuln-06",
    cveId: "CVE-2023-34362",
    title: "Progress MOVEit Transfer SQL Injection Vulnerability",
    affectedSoftware: "MOVEit Transfer 2023.0.0",
    cvssScore: 9.8,
    epssProbabilityPct: 99.1,
    cisaKevKnownRansomware: true,
    weaponizedGroups: ["Cl0p Syndicate"],
    lateralMovementPotential: 8.5,
    assetTier: "TIER_1",
    calculatedRiskScore: 96.0,
    patchSlaHours: 24,
    timeRemainingHours: 18,
    patchStatus: "IN_PROGRESS",
    affectedAssetsCount: 2,
    runbookSnippet: `# Snort 3 IPS Rule for MOVEit\nalert tcp any any -> $HTTP_SERVERS 443 (msg:"AEGIS - MOVEit SQLi attempt"; content:"human2.aspx"; http_uri; sid:1009841;)`,
    mitigationSteps: [
      "Disable HTTP/HTTPS traffic to MOVEit Transfer environment until patched.",
      "Scan for human2.aspx webshell in wwwroot directory.",
      "Rotate Azure blob storage and service account database keys."
    ]
  },
  {
    id: "vuln-07",
    cveId: "CVE-2023-22515",
    title: "Atlassian Confluence Data Center Broken Access Control RCE",
    affectedSoftware: "Confluence Server 8.0.0 - 8.5.1",
    cvssScore: 9.8,
    epssProbabilityPct: 91.5,
    cisaKevKnownRansomware: true,
    weaponizedGroups: ["LockBit 3.0", "Akira"],
    lateralMovementPotential: 7.8,
    assetTier: "TIER_2",
    calculatedRiskScore: 88.2,
    patchSlaHours: 48,
    timeRemainingHours: 32,
    patchStatus: "ACTION_REQUIRED",
    affectedAssetsCount: 1,
    runbookSnippet: `# Nginx Block for Confluence Setup-Restore\nlocation /server-info.action { return 403; }\nlocation /setup/setupadministrator.action { return 403; }`,
    mitigationSteps: [
      "Upgrade Confluence to 8.3.3, 8.4.3, or 8.5.2+.",
      "Block access to /setup/* endpoints on ingress reverse proxy.",
      "Audit confluence-administrators group for newly created backdoor accounts."
    ]
  }
];

export default function VulnPrioritizationPage() {
  const [vulns, setVulns] = useState<RansomwareVulnerability[]>(INITIAL_VULNERABILITIES);
  const [selectedVuln, setSelectedVuln] = useState<RansomwareVulnerability>(INITIAL_VULNERABILITIES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [tierFilter, setTierFilter] = useState<string>("ALL");

  // Dynamic Formula Weight Sliders
  const [cvssWeight, setCvssWeight] = useState(1.0);
  const [epssWeight, setEpssWeight] = useState(1.2);
  const [weaponizationMult, setWeaponizationMult] = useState(1.5);
  const [lateralFactor, setLateralFactor] = useState(1.1);
  const [showFormulaDrawer, setShowFormulaDrawer] = useState(false);
  const [patchModalVuln, setPatchModalVuln] = useState<RansomwareVulnerability | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [patchSuccessMsg, setPatchSuccessMsg] = useState<string | null>(null);

  // Recalculate dynamic scores based on analyst sliders
  const scoredVulns = useMemo(() => {
    return vulns.map((v) => {
      const tierMult = v.assetTier === "TIER_0" ? 1.3 : v.assetTier === "TIER_1" ? 1.15 : 1.0;
      const weaponMult = v.cisaKevKnownRansomware ? weaponizationMult : 1.0;
      const rawScore =
        (v.cvssScore * 10 * cvssWeight * 0.3) +
        (v.epssProbabilityPct * epssWeight * 0.35) +
        (v.lateralMovementPotential * 10 * lateralFactor * 0.2) *
        weaponMult *
        tierMult;
      const normalizedScore = Math.min(99.9, Math.max(10, Math.round(rawScore * 0.58 * 10) / 10));
      return { ...v, dynamicRisk: normalizedScore };
    }).sort((a, b) => b.dynamicRisk - a.dynamicRisk);
  }, [vulns, cvssWeight, epssWeight, weaponizationMult, lateralFactor]);

  // Filtered list
  const filteredVulns = useMemo(() => {
    return scoredVulns.filter((v) => {
      const matchStatus = statusFilter === "ALL" || v.patchStatus === statusFilter;
      const matchTier = tierFilter === "ALL" || v.assetTier === tierFilter;
      const matchSearch =
        searchQuery === "" ||
        v.cveId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.affectedSoftware.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.weaponizedGroups.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchStatus && matchTier && matchSearch;
    });
  }, [scoredVulns, statusFilter, tierFilter, searchQuery]);

  // Handle Deploy Virtual Patch
  const handleDeployPatch = (vulnId: string) => {
    setVulns((prev) =>
      prev.map((v) => (v.id === vulnId ? { ...v, patchStatus: "PATCHED", timeRemainingHours: 0 } : v))
    );
    setPatchModalVuln(null);
    setPatchSuccessMsg(`VIRTUAL PATCH DEPLOYED: Hotfix & IPS signatures active for ${selectedVuln.cveId}. Patch SLA satisfied.`);
    setTimeout(() => setPatchSuccessMsg(null), 5000);
  };

  return (
    <div style={{ padding: "20px 24px", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header & Breadcrumb */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
            <span style={{ color: "#10b981", fontWeight: 700 }}>STAGE 1: PREPARE</span>
            <span>/</span>
            <span>VULNERABILITY MANAGEMENT</span>
            <span>/</span>
            <span style={{ color: "var(--fg)" }}>RANSOMWARE VULNERABILITY PRIORITIZER</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", color: "#f8fafc" }}>
              Ransomware-Specific Vulnerability Prioritizer
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "3px 8px",
                borderRadius: 4,
                background: "rgba(16,185,129,0.15)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.3)"
              }}
            >
              MULTI-FACTOR FORMULA ACTIVE
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            Multi-factor scoring formula: {'Ransomware Risk = CVSS × EPSS × Weaponization × Lateral Movement × Asset Tier'}.
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() => setShowFormulaDrawer(!showFormulaDrawer)}
          style={{
            background: showFormulaDrawer ? "var(--primary)" : "var(--surface-2)",
            color: showFormulaDrawer ? "#070b12" : "var(--fg)",
            border: "1px solid var(--border)",
            padding: "8px 14px",
            borderRadius: 6,
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <Sliders size={14} />
          <span>{showFormulaDrawer ? "Hide Formula Weights" : "Adjust Scoring Formula Weights"}</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {patchSuccessMsg && (
        <div
          style={{
            background: "rgba(16,185,129,0.15)",
            border: "1px solid #10b981",
            borderRadius: 6,
            padding: "10px 14px",
            marginBottom: 16,
            color: "#10b981",
            fontSize: 12.5,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <CheckCircle2 size={16} />
          <span>{patchSuccessMsg}</span>
        </div>
      )}

      {/* Formula Adjustment Drawer */}
      {showFormulaDrawer && (
        <div
          className="card-tactical"
          style={{
            padding: "16px 20px",
            marginBottom: 20,
            background: "linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(14,21,38,0.95) 100%)",
            border: "1px solid rgba(6,182,212,0.4)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
              <Sliders size={15} color="#06b6d4" />
              <span>Multi-Factor Risk Formula Weight Tuner</span>
            </div>
            <button
              onClick={() => {
                setCvssWeight(1.0);
                setEpssWeight(1.2);
                setWeaponizationMult(1.5);
                setLateralFactor(1.1);
              }}
              style={{ background: "transparent", border: "none", color: "#06b6d4", fontSize: 11, cursor: "pointer", fontWeight: 700 }}
            >
              Reset to Defaults
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                <span style={{ color: "var(--muted)" }}>CVSS Base Weight</span>
                <span style={{ color: "#06b6d4", fontFamily: "monospace" }}>{cvssWeight.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={cvssWeight}
                onChange={(e) => setCvssWeight(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#06b6d4" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                <span style={{ color: "var(--muted)" }}>EPSS Probability Weight</span>
                <span style={{ color: "#06b6d4", fontFamily: "monospace" }}>{epssWeight.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={epssWeight}
                onChange={(e) => setEpssWeight(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#06b6d4" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                <span style={{ color: "var(--muted)" }}>Ransomware Weaponization</span>
                <span style={{ color: "#f43f5e", fontFamily: "monospace" }}>{weaponizationMult.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={weaponizationMult}
                onChange={(e) => setWeaponizationMult(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#f43f5e" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                <span style={{ color: "var(--muted)" }}>Lateral Movement Factor</span>
                <span style={{ color: "#a855f7", fontFamily: "monospace" }}>{lateralFactor.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={lateralFactor}
                onChange={(e) => setLateralFactor(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#a855f7" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Visual EPSS vs CVSS Risk Scatter Plot Matrix */}
      <div className="card-tactical" style={{ padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart3 size={16} color="#10b981" />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc" }}>
              Exploit Prediction (EPSS) vs Severity (CVSS) Scatter Matrix
            </h2>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            Bubble size = Lateral Movement potential · Bubble color = Ransomware Risk Score
          </span>
        </div>

        {/* Visual Scatter Grid Representation */}
        <div
          style={{
            position: "relative",
            height: 180,
            background: "var(--surface-2)",
            borderRadius: 8,
            border: "1px solid var(--border)",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center"
          }}
        >
          {/* Scatter Plot Axes Labels */}
          <div style={{ position: "absolute", left: 8, top: 8, fontSize: 9.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
            ▲ High EPSS (90-100%)
          </div>
          <div style={{ position: "absolute", right: 12, bottom: 8, fontSize: 9.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
            High CVSS (9.0-10.0) ▶
          </div>

          {/* Scatter Points */}
          <div style={{ display: "flex", justifyContent: "space-around", width: "100%", alignItems: "center" }}>
            {scoredVulns.map((v) => {
              const isSelected = selectedVuln.id === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVuln(v)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    transform: isSelected ? "scale(1.15)" : "scale(1)",
                    transition: "transform 0.15s ease"
                  }}
                >
                  <div
                    style={{
                      width: 32 + v.lateralMovementPotential * 2,
                      height: 32 + v.lateralMovementPotential * 2,
                      borderRadius: "50%",
                      background:
                        v.dynamicRisk >= 95
                          ? "rgba(244,63,94,0.3)"
                          : v.dynamicRisk >= 90
                          ? "rgba(245,158,11,0.3)"
                          : "rgba(16,185,129,0.3)",
                      border: `2px solid ${
                        v.dynamicRisk >= 95 ? "#f43f5e" : v.dynamicRisk >= 90 ? "#f59e0b" : "#10b981"
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: isSelected ? "0 0 20px rgba(16,185,129,0.5)" : "none"
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 900, color: "#f8fafc", fontFamily: "monospace" }}>
                      {Math.round(v.dynamicRisk)}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: isSelected ? "#10b981" : "var(--muted)", marginTop: 6 }}>
                    {v.cveId.split("-")[1]}-{v.cveId.split("-")[2]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: CVE Prioritization Table (Left) + Remediation Runbook Drawer (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 20 }}>
        {/* Left: Prioritized CVE Table */}
        <div className="card-tactical" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Flame size={16} color="#f43f5e" />
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#f8fafc" }}>
                Prioritized Ransomware Vulnerability Backlog
              </h2>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="tool-select"
                style={{ fontSize: 11.5, padding: "4px 8px" }}
              >
                <option value="ALL">All Patch Statuses</option>
                <option value="OVERDUE">Overdue SLAs Only</option>
                <option value="ACTION_REQUIRED">Action Required</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PATCHED">Patched</option>
              </select>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="tool-select"
                style={{ fontSize: 11.5, padding: "4px 8px" }}
              >
                <option value="ALL">All Asset Tiers</option>
                <option value="TIER_0">Tier 0 (Identity/Core)</option>
                <option value="TIER_1">Tier 1 (Clinical/DB)</option>
                <option value="TIER_2">Tier 2 (Apps/Internal)</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <Search size={14} color="var(--muted)" style={{ position: "absolute", left: 10, top: 10 }} />
            <input
              type="text"
              placeholder="Search by CVE ID, Title, Affected Software, Weaponized Gang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tool-input"
              style={{ width: "100%", paddingLeft: 32, fontSize: 12 }}
            />
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Risk Score</th>
                  <th>CVE ID / Software</th>
                  <th>CVSS / EPSS</th>
                  <th>Weaponized Gangs</th>
                  <th>Patch SLA</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Runbook</th>
                </tr>
              </thead>
              <tbody>
                {filteredVulns.map((v) => {
                  const isSel = selectedVuln.id === v.id;
                  const isOverdue = v.patchStatus === "OVERDUE";
                  const isPatched = v.patchStatus === "PATCHED";

                  return (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedVuln(v)}
                      style={{
                        cursor: "pointer",
                        background: isSel ? "rgba(16,185,129,0.08)" : undefined,
                        borderLeft: isSel ? "3px solid #10b981" : "3px solid transparent"
                      }}
                    >
                      <td>
                        <div
                          style={{
                            fontWeight: 900,
                            fontFamily: "monospace",
                            fontSize: 14,
                            color: (v.dynamicRisk || v.calculatedRiskScore) >= 95 ? "#f43f5e" : (v.dynamicRisk || v.calculatedRiskScore) >= 90 ? "#f59e0b" : "#10b981"
                          }}
                        >
                          {(v.dynamicRisk ?? v.calculatedRiskScore ?? 90).toFixed(1)}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: "#f8fafc", fontSize: 12 }}>
                          {v.cveId}
                        </div>
                        <div style={{ fontSize: 10.5, color: "var(--muted)", maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {v.affectedSoftware}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 11, color: "var(--fg)", fontWeight: 700 }}>
                          CVSS {v.cvssScore}
                        </div>
                        <div style={{ fontSize: 10, color: "#06b6d4", fontFamily: "monospace" }}>
                          EPSS {v.epssProbabilityPct}%
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                          {v.weaponizedGroups.map((grp) => (
                            <span
                              key={grp}
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                padding: "1px 4px",
                                borderRadius: 3,
                                background: "rgba(244,63,94,0.15)",
                                color: "#f43f5e",
                                border: "1px solid rgba(244,63,94,0.3)"
                              }}
                            >
                              {grp}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 11, fontWeight: 700, color: isOverdue ? "#f43f5e" : isPatched ? "#10b981" : "#f59e0b" }}>
                          {isPatched
                            ? "Satisfied"
                            : isOverdue
                            ? `Overdue (${Math.abs(v.timeRemainingHours)}h ago)`
                            : `${v.timeRemainingHours}h remaining`}
                        </div>
                        <div style={{ fontSize: 9.5, color: "var(--muted)" }}>
                          SLA: {v.patchSlaHours}h window
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge-sev ${
                            isPatched ? "badge-success" : isOverdue ? "badge-critical animate-pulse" : "badge-high"
                          }`}
                        >
                          {v.patchStatus.replace("_", " ")}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVuln(v);
                            setPatchModalVuln(v);
                          }}
                          style={{
                            background: isPatched ? "rgba(255,255,255,0.05)" : "rgba(16,185,129,0.15)",
                            border: isPatched ? "1px solid var(--border)" : "1px solid rgba(16,185,129,0.4)",
                            color: isPatched ? "var(--muted)" : "#10b981",
                            padding: "4px 8px",
                            borderRadius: 4,
                            fontSize: 10.5,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          {isPatched ? "View Patch" : "Remediate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Remediation Runbook & Virtual Patching Inspector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {selectedVuln && (
            <div className="card-tactical" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                  <FileCode size={15} color="#10b981" />
                  <span>1-Click Remediation Runbook</span>
                </div>
                <span className="badge-sev badge-critical">
                  RISK: {(selectedVuln?.dynamicRisk ?? selectedVuln?.calculatedRiskScore ?? 95).toFixed(1)}/100
                </span>
              </div>

              {/* CVE Title & Software */}
              <div style={{ background: "var(--surface-2)", borderRadius: 6, padding: "12px", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                  {selectedVuln.cveId}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  {selectedVuln.title}
                </div>
              </div>

              {/* Remediation Steps Checklist */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                  Emergency Action Steps
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {selectedVuln.mitigationSteps.map((step, sIdx) => (
                    <div key={sIdx} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11, color: "var(--fg-2)" }}>
                      <span style={{ color: "#10b981", fontWeight: 700 }}>•</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automation Script Preview */}
              <div style={{ background: "var(--surface-2)", borderRadius: 6, padding: "10px", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Ansible / PowerShell Hotfix Script
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedVuln.runbookSnippet);
                      setCopiedSnippet(true);
                      setTimeout(() => setCopiedSnippet(false), 2000);
                    }}
                    style={{ background: "transparent", border: "none", color: "#10b981", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Copy size={11} />
                    <span>{copiedSnippet ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre style={{ margin: 0, fontSize: 10.5, fontFamily: "monospace", color: "#10b981", background: "#070b12", padding: "8px", borderRadius: 4, whiteSpace: "pre-wrap" }}>
                  {selectedVuln.runbookSnippet}
                </pre>
              </div>

              {/* 1-Click Virtual Patch Button */}
              <button
                onClick={() => handleDeployPatch(selectedVuln.id)}
                disabled={selectedVuln.patchStatus === "PATCHED"}
                style={{
                  width: "100%",
                  background:
                    selectedVuln.patchStatus === "PATCHED"
                      ? "rgba(255,255,255,0.05)"
                      : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: selectedVuln.patchStatus === "PATCHED" ? "var(--muted)" : "#070b12",
                  fontWeight: 900,
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "none",
                  cursor: selectedVuln.patchStatus === "PATCHED" ? "not-allowed" : "pointer",
                  fontSize: 12.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6
                }}
              >
                <ShieldCheck size={16} />
                <span>
                  {selectedVuln.patchStatus === "PATCHED"
                    ? "VIRTUAL PATCH APPLIED"
                    : `DEPLOY 1-CLICK VIRTUAL PATCH (${selectedVuln.affectedAssetsCount} HOSTS)`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
