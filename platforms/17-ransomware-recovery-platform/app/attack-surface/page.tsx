"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Globe,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  Flame,
  Radio,
  Server,
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
  ExternalLink,
  ShieldX,
  Network
} from "lucide-react";
import { ExposedAttackAsset } from "@/types/recovery";

// Internet Exposed Assets with Ransomware Group Affinities
const INITIAL_ASSETS: ExposedAttackAsset[] = [
  {
    id: "asset-01",
    hostname: "vpn.mercygeneral.org",
    ipAddress: "198.51.100.42",
    exposureType: "VULNERABLE_VPN",
    servicePort: 443,
    serviceBanner: "Fortinet FortiOS SSL-VPN (v7.0.4) - Unauthenticated RCE",
    vulnerabilityCve: "CVE-2023-27997",
    cvssScore: 9.8,
    assetCriticality: "TIER_0",
    ransomwareAffinities: ["LockBit", "BlackCat", "Akira"],
    exploitAvailability: "ACTIVE_WORM",
    exposureIndexScore: 98,
    firstDiscovered: "2026-08-20T04:12:00Z",
    lastScanned: "2026-08-24T00:15:00Z",
    remediationStatus: "UNMITIGATED"
  },
  {
    id: "asset-02",
    hostname: "mail.mercygeneral.org",
    ipAddress: "198.51.100.45",
    exposureType: "EXCHANGE_PROXYSHELL",
    servicePort: 443,
    serviceBanner: "Microsoft Exchange Server 2019 CU10 (Backend SSRF / PowerShell RCE)",
    vulnerabilityCve: "CVE-2021-34473 (ProxyShell)",
    cvssScore: 9.8,
    assetCriticality: "TIER_0",
    ransomwareAffinities: ["LockBit", "Black Basta", "Play"],
    exploitAvailability: "PUBLIC_EXPLOIT",
    exposureIndexScore: 95,
    firstDiscovered: "2026-08-21T06:00:00Z",
    lastScanned: "2026-08-24T00:10:00Z",
    remediationStatus: "UNMITIGATED"
  },
  {
    id: "asset-03",
    hostname: "rdp-telehealth.mercygeneral.org",
    ipAddress: "198.51.100.88",
    exposureType: "RDP_EXPOSED",
    servicePort: 3389,
    serviceBanner: "Microsoft Windows Terminal Services (NLA Disabled / Brute Force Risk)",
    vulnerabilityCve: "N/A (Exposed BlueKeep / Auth Surface)",
    cvssScore: 8.5,
    assetCriticality: "TIER_1",
    ransomwareAffinities: ["LockBit", "Akira", "Medusa"],
    exploitAvailability: "POC_AVAILABLE",
    exposureIndexScore: 88,
    firstDiscovered: "2026-08-22T08:30:00Z",
    lastScanned: "2026-08-24T00:20:00Z",
    remediationStatus: "UNMITIGATED"
  },
  {
    id: "asset-04",
    hostname: "gateway.paloalto.mercygeneral.org",
    ipAddress: "198.51.100.12",
    exposureType: "VULNERABLE_VPN",
    servicePort: 443,
    serviceBanner: "Palo Alto PAN-OS GlobalProtect Gateway (CVE-2024-3400 Telemetry Injection)",
    vulnerabilityCve: "CVE-2024-3400",
    cvssScore: 10.0,
    assetCriticality: "TIER_0",
    ransomwareAffinities: ["BlackCat", "LockBit", "Cl0p"],
    exploitAvailability: "ACTIVE_WORM",
    exposureIndexScore: 99,
    firstDiscovered: "2026-08-22T10:00:00Z",
    lastScanned: "2026-08-24T00:22:00Z",
    remediationStatus: "PORT_BLOCKED"
  },
  {
    id: "asset-05",
    hostname: "citrix-adc.mercygeneral.org",
    ipAddress: "198.51.100.99",
    exposureType: "VULNERABLE_VPN",
    servicePort: 443,
    serviceBanner: "Citrix NetScaler ADC / Gateway (Citrix Bleed Session Hijack)",
    vulnerabilityCve: "CVE-2023-4966 (Citrix Bleed)",
    cvssScore: 9.4,
    assetCriticality: "TIER_1",
    ransomwareAffinities: ["LockBit", "Black Basta"],
    exploitAvailability: "PUBLIC_EXPLOIT",
    exposureIndexScore: 89,
    firstDiscovered: "2026-08-23T02:00:00Z",
    lastScanned: "2026-08-24T00:25:00Z",
    remediationStatus: "HARDENED"
  },
  {
    id: "asset-06",
    hostname: "pacs-public.mercygeneral.org",
    ipAddress: "198.51.100.150",
    exposureType: "OPEN_SMB",
    servicePort: 445,
    serviceBanner: "SMBv1 / SMBv2 Open Share (Anonymous Read IPC$)",
    vulnerabilityCve: "MS17-010 / Null Session Enum",
    cvssScore: 8.8,
    assetCriticality: "TIER_1",
    ransomwareAffinities: ["LockBit", "Medusa", "Play"],
    exploitAvailability: "PUBLIC_EXPLOIT",
    exposureIndexScore: 84,
    firstDiscovered: "2026-08-23T11:00:00Z",
    lastScanned: "2026-08-24T00:26:00Z",
    remediationStatus: "UNMITIGATED"
  },
  {
    id: "asset-07",
    hostname: "scada-vnc-gw.mercygeneral.org",
    ipAddress: "198.51.100.210",
    exposureType: "EXPOSED_VNC",
    servicePort: 5900,
    serviceBanner: "RealVNC 5.2 / UltraVNC Exposed GUI Session",
    vulnerabilityCve: "CVE-2019-15693",
    cvssScore: 7.8,
    assetCriticality: "TIER_2",
    ransomwareAffinities: ["Akira", "Medusa"],
    exploitAvailability: "POC_AVAILABLE",
    exposureIndexScore: 74,
    firstDiscovered: "2026-08-23T14:00:00Z",
    lastScanned: "2026-08-24T00:28:00Z",
    remediationStatus: "UNMITIGATED"
  }
];

export default function AttackSurfacePage() {
  const [assets, setAssets] = useState<ExposedAttackAsset[]>(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<ExposedAttackAsset>(INITIAL_ASSETS[0]);
  const [exposureFilter, setExposureFilter] = useState<string>("ALL");
  const [groupFilter, setGroupFilter] = useState<string>("ALL");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [hardeningSuccess, setHardeningSuccess] = useState<string | null>(null);

  // Group Affinity Heatmap calculations
  const groupStats = useMemo(() => {
    const groups = ["LockBit", "BlackCat", "Akira", "Black Basta", "Play", "Medusa", "Cl0p"];
    return groups.map((grp) => {
      const matching = assets.filter((a) => a.ransomwareAffinities.includes(grp as any));
      const unmitigated = matching.filter((a) => a.remediationStatus === "UNMITIGATED");
      const avgScore = matching.length > 0 ? Math.round(matching.reduce((acc, a) => acc + a.exposureIndexScore, 0) / matching.length) : 0;
      return { group: grp, totalTargets: matching.length, unmitigatedCount: unmitigated.length, avgScore };
    });
  }, [assets]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchExp = exposureFilter === "ALL" || a.exposureType === exposureFilter;
      const matchGrp = groupFilter === "ALL" || a.ransomwareAffinities.includes(groupFilter as any);
      const matchTier = tierFilter === "ALL" || a.assetCriticality === tierFilter;
      const matchSearch =
        searchQuery === "" ||
        a.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.ipAddress.includes(searchQuery) ||
        a.serviceBanner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.vulnerabilityCve.toLowerCase().includes(searchQuery.toLowerCase());
      return matchExp && matchGrp && matchTier && matchSearch;
    });
  }, [assets, exposureFilter, groupFilter, tierFilter, searchQuery]);

  // Handle 1-Click Perimeter Hardening
  const handleHardenAsset = (assetId: string) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, remediationStatus: "HARDENED", exposureIndexScore: 15 } : a))
    );
    const target = assets.find((a) => a.id === assetId);
    setHardeningSuccess(
      `PERIMETER HARDENED: Port ${target?.servicePort} on ${target?.hostname} (${target?.ipAddress}) quarantined via edge cloud firewall rule.`
    );
    setTimeout(() => setHardeningSuccess(null), 5000);
  };

  return (
    <div style={{ padding: "20px 24px", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header & Breadcrumbs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
            <span style={{ color: "#10b981", fontWeight: 700 }}>STAGE 1: PREPARE</span>
            <span>/</span>
            <span>ATTACK SURFACE INTELLIGENCE</span>
            <span>/</span>
            <span style={{ color: "var(--fg)" }}>RANSOMWARE ATTACK SURFACE MANAGER</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", color: "#f8fafc" }}>
              Ransomware Attack Surface Manager
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "3px 8px",
                borderRadius: 4,
                background: "rgba(244,63,94,0.15)",
                color: "#f43f5e",
                border: "1px solid rgba(244,63,94,0.3)"
              }}
            >
              7 INTERNET EXPOSURES
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            Continuous discovery of internet-exposed entry points weighted by exploit weaponization and ransomware syndicate affinity (LockBit, BlackCat, Akira).
          </p>
        </div>

        {/* Global Action */}
        <button
          onClick={() => {
            setAssets((prev) =>
              prev.map((a) => (a.remediationStatus === "UNMITIGATED" ? { ...a, remediationStatus: "HARDENED", exposureIndexScore: 18 } : a))
            );
            setHardeningSuccess("ALL UNMITIGATED PERIMETERS HARDENED: Automated edge firewall ACL rules pushed.");
            setTimeout(() => setHardeningSuccess(null), 5000);
          }}
          style={{
            background: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
            color: "#fff",
            fontWeight: 800,
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            fontSize: 12.5,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <ShieldAlert size={15} />
          <span>Hard-Quarantine All High Exposures</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {hardeningSuccess && (
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
          <span>{hardeningSuccess}</span>
        </div>
      )}

      {/* Top 4 Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Ransomware Exposure Index
            </span>
            <Activity size={16} color="#f43f5e" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f43f5e", marginTop: 6, fontFamily: "monospace" }}>
            88.4 <span style={{ fontSize: 12, color: "var(--muted)" }}>/ 100 (Critical)</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            Formula: Exploit × Group Affinity × Tier
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Exposed VPN Gateways
            </span>
            <Globe size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b", marginTop: 6, fontFamily: "monospace" }}>
            3 Gateways <span style={{ fontSize: 12, color: "var(--muted)" }}>Vulnerable</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            FortiOS, PAN-OS, Citrix Bleed
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Open RDP & VNC Ports
            </span>
            <Server size={16} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#06b6d4", marginTop: 6, fontFamily: "monospace" }}>
            2 Endpoints <span style={{ fontSize: 12, color: "var(--muted)" }}>Direct Access</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            Port 3389 & 5900 Internet Accessible
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Active CISA KEV Exploits
            </span>
            <Flame size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#a855f7", marginTop: 6, fontFamily: "monospace" }}>
            4 Actively Wormed
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            Known Ransomware Campaign Vectors
          </div>
        </div>
      </div>

      {/* Ransomware Syndicate Affinity Matrix */}
      <div className="card-tactical" style={{ padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Flame size={16} color="#f43f5e" />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc" }}>
              Threat Actor Affinity & Exploit Correlation Matrix
            </h2>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            Syndicates actively targeting your exposed perimeter tech stack
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
          {groupStats.map((item) => (
            <div
              key={item.group}
              onClick={() => setGroupFilter(item.group)}
              style={{
                background: groupFilter === item.group ? "rgba(244,63,94,0.18)" : "var(--surface-2)",
                border: groupFilter === item.group ? "1px solid #f43f5e" : "1px solid var(--border)",
                borderRadius: 6,
                padding: "10px 12px",
                cursor: "pointer",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>{item.group}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: item.unmitigatedCount > 0 ? "#f43f5e" : "#10b981", marginTop: 2 }}>
                {item.unmitigatedCount} <span style={{ fontSize: 10, color: "var(--muted)" }}>targets</span>
              </div>
              <div style={{ fontSize: 9.5, color: "var(--muted)", marginTop: 2 }}>
                Avg REI: {item.avgScore}/100
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Assets Table (Left) + Selected Asset Inspector Drawer (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 20 }}>
        {/* Left: Discovered Exposed Assets Table */}
        <div className="card-tactical" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Globe size={16} color="#06b6d4" />
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#f8fafc" }}>
                Discovered Internet-Exposed Assets
              </h2>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: "var(--surface-3)", color: "var(--muted)" }}>
                {filteredAssets.length} ASSETS
              </span>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select
                value={exposureFilter}
                onChange={(e) => setExposureFilter(e.target.value)}
                className="tool-select"
                style={{ fontSize: 11.5, padding: "4px 8px" }}
              >
                <option value="ALL">All Exposure Types</option>
                <option value="VULNERABLE_VPN">VPN Gateways</option>
                <option value="EXCHANGE_PROXYSHELL">MS Exchange</option>
                <option value="RDP_EXPOSED">RDP (3389)</option>
                <option value="OPEN_SMB">SMB (445)</option>
                <option value="EXPOSED_VNC">VNC (5900)</option>
              </select>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="tool-select"
                style={{ fontSize: 11.5, padding: "4px 8px" }}
              >
                <option value="ALL">All Asset Tiers</option>
                <option value="TIER_0">Tier 0 (Domain / Core)</option>
                <option value="TIER_1">Tier 1 (Clinical / Prod)</option>
                <option value="TIER_2">Tier 2 (Internal Ops)</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <Search size={14} color="var(--muted)" style={{ position: "absolute", left: 10, top: 10 }} />
            <input
              type="text"
              placeholder="Search by Hostname, IP, Service Banner, CVE ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tool-input"
              style={{ width: "100%", paddingLeft: 32, fontSize: 12 }}
            />
          </div>

          {/* Assets Table */}
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>REI Score</th>
                  <th>Hostname / IP</th>
                  <th>Port / Service</th>
                  <th>Vulnerability CVE</th>
                  <th>Threat Group Affinity</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => {
                  const isSel = selectedAsset.id === asset.id;
                  const isHardened = asset.remediationStatus === "HARDENED" || asset.remediationStatus === "PORT_BLOCKED";

                  return (
                    <tr
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      style={{
                        cursor: "pointer",
                        background: isSel ? "rgba(16,185,129,0.08)" : undefined,
                        borderLeft: isSel ? "3px solid #10b981" : "3px solid transparent"
                      }}
                    >
                      <td>
                        <span
                          style={{
                            fontWeight: 900,
                            fontFamily: "monospace",
                            fontSize: 13,
                            color: asset.exposureIndexScore >= 90 ? "#f43f5e" : asset.exposureIndexScore >= 75 ? "#f59e0b" : "#10b981"
                          }}
                        >
                          {asset.exposureIndexScore}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: 12 }}>
                          {asset.hostname}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                          {asset.ipAddress} · <span style={{ color: "#06b6d4" }}>{asset.assetCriticality}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 11.5, color: "var(--fg)", fontWeight: 600 }}>
                          Port {asset.servicePort}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted)", maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {asset.serviceBanner}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: "#f43f5e", fontFamily: "monospace" }}>
                          {asset.vulnerabilityCve.split(" ")[0]}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted)" }}>
                          CVSS: {asset.cvssScore} · {asset.exploitAvailability}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                          {asset.ransomwareAffinities.map((grp) => (
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
                        <span
                          className={`badge-sev ${
                            isHardened ? "badge-success" : "badge-critical"
                          }`}
                        >
                          {asset.remediationStatus.replace("_", " ")}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHardenAsset(asset.id);
                          }}
                          disabled={isHardened}
                          style={{
                            background: isHardened ? "rgba(255,255,255,0.05)" : "rgba(16,185,129,0.15)",
                            border: isHardened ? "1px solid var(--border)" : "1px solid rgba(16,185,129,0.4)",
                            color: isHardened ? "var(--muted)" : "#10b981",
                            padding: "4px 8px",
                            borderRadius: 4,
                            fontSize: 10.5,
                            fontWeight: 700,
                            cursor: isHardened ? "not-allowed" : "pointer"
                          }}
                        >
                          {isHardened ? "Hardened" : "Harden Port"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Asset Forensics & Attack Surface Inspector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {selectedAsset && (
            <div className="card-tactical" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                  <Eye size={15} color="#06b6d4" />
                  <span>Exposure Details Inspector</span>
                </div>
                <span className="badge-sev badge-critical">
                  REI: {selectedAsset.exposureIndexScore}/100
                </span>
              </div>

              {/* Host & Port info */}
              <div style={{ background: "var(--surface-2)", borderRadius: 6, padding: "12px", marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>
                  Target Exposed Host
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc" }}>
                  {selectedAsset.hostname}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", marginTop: 2 }}>
                  IP: {selectedAsset.ipAddress} · Port {selectedAsset.servicePort} · {selectedAsset.assetCriticality}
                </div>
              </div>

              {/* Service Banner Raw Grab */}
              <div style={{ background: "var(--surface-2)", borderRadius: 6, padding: "10px", marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
                  Service Banner / Fingerprint
                </div>
                <pre style={{ margin: 0, fontSize: 11, fontFamily: "monospace", color: "#f59e0b", whiteSpace: "pre-wrap" }}>
                  {selectedAsset.serviceBanner}
                </pre>
              </div>

              {/* Known Weaponization Details */}
              <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 6, padding: "12px", marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: "#f43f5e", textTransform: "uppercase", fontWeight: 800, marginBottom: 4 }}>
                  Weaponized Ransomware Gangs
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                  {selectedAsset.ransomwareAffinities.map((grp) => (
                    <span
                      key={grp}
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "rgba(244,63,94,0.2)",
                        color: "#f43f5e"
                      }}
                    >
                      {grp}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-2)" }}>
                  Primary entry vector used in 84+ double-extortion campaigns in 2026.
                </div>
              </div>

              {/* 1-Click Action Button */}
              <button
                onClick={() => handleHardenAsset(selectedAsset.id)}
                disabled={selectedAsset.remediationStatus === "HARDENED"}
                style={{
                  width: "100%",
                  background:
                    selectedAsset.remediationStatus === "HARDENED"
                      ? "rgba(255,255,255,0.05)"
                      : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: selectedAsset.remediationStatus === "HARDENED" ? "var(--muted)" : "#070b12",
                  fontWeight: 900,
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "none",
                  cursor: selectedAsset.remediationStatus === "HARDENED" ? "not-allowed" : "pointer",
                  fontSize: 12.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6
                }}
              >
                <ShieldCheck size={16} />
                <span>
                  {selectedAsset.remediationStatus === "HARDENED"
                    ? "PERIMETER ALREADY HARDENED"
                    : "EXECUTE 1-CLICK PERIMETER HARDENING"}
                </span>
              </button>
            </div>
          )}

          {/* Automated Edge Mitigation Playbook */}
          <div className="card-tactical" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Terminal size={15} color="#10b981" />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>
                Cloud Perimeter Firewall Automation
              </span>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>
              Automated AWS Security Group & Cloudflare Zero-Trust rule injection script:
            </div>
            <pre
              style={{
                background: "#070b12",
                padding: "8px",
                borderRadius: 4,
                fontSize: 10,
                fontFamily: "monospace",
                color: "#10b981",
                margin: 0,
                whiteSpace: "pre-wrap"
              }}
            >
              {`aws ec2 revoke-security-group-ingress --group-id sg-0941a2 --protocol tcp --port ${selectedAsset.servicePort} --cidr 0.0.0.0/0\n# Cloudflare Access tunnel enforced for IP ${selectedAsset.ipAddress}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
