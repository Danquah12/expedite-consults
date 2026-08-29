"use client";

import React, { useState, useMemo } from "react";
import {
  Globe,
  ShieldCheck,
  Zap,
  Lock,
  Search,
  Filter,
  Users,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  Copy,
  Check
} from "lucide-react";

interface ThreatCampaignCluster {
  id: string;
  campaignCodename: string;
  threatActor: string;
  ransomwareFamily: string;
  kAnonymityClusterSize: number;
  firstSeenGlobally: string;
  lastActive: string;
  confidenceScore: number;
  privacyMethod: "Differential Privacy + Salted HMAC-SHA256" | "Homomorphic Hash Aggregation";
  anonymizedVictimSectors: string[];
  anonymizedIOCs: {
    type: "STAGER_HASH" | "C2_SUBNET" | "TOR_NEGOTIATION_MIRROR" | "RANSOM_NOTE_SIGNATURE";
    maskedValue: string;
    occurrencesAcrossTenants: number;
  }[];
  extortionPatternSemanticScore: number;
  peerInoculationAvailable: boolean;
  status: "ACTIVE_PROPAGATING" | "CONTAINED_GLOBAL" | "ANALYSIS_IN_PROGRESS";
}

const INITIAL_CAMPAIGNS: ThreatCampaignCluster[] = [
  {
    id: "camp-01",
    campaignCodename: "NEXUS-CAMP-88 (LockBit 3.0 Health Sector Surge)",
    threatActor: "FIN12 / LockBit Affiliate Network 49",
    ransomwareFamily: "LockBit 3.0 (Black)",
    kAnonymityClusterSize: 18,
    firstSeenGlobally: "2026-08-18 03:14 UTC",
    lastActive: "2026-08-24 00:22 UTC",
    confidenceScore: 98.4,
    privacyMethod: "Differential Privacy + Salted HMAC-SHA256",
    anonymizedVictimSectors: ["Healthcare (US)", "Health Insurer (EU)", "Medical Device OEM (CAN)"],
    anonymizedIOCs: [
      { type: "STAGER_HASH", maskedValue: "sha256:7f83b1657ff1fc53...[k=18 verified]", occurrencesAcrossTenants: 14 },
      { type: "C2_SUBNET", maskedValue: "185.220.101.0/24 (Tor Exit Relay Cluster)", occurrencesAcrossTenants: 18 },
      { type: "TOR_NEGOTIATION_MIRROR", maskedValue: "hxxps://lockbit37[anonymized].onion/support", occurrencesAcrossTenants: 12 },
      { type: "RANSOM_NOTE_SIGNATURE", maskedValue: "Restore-My-Files-[TENANT_ID_MASK].txt", occurrencesAcrossTenants: 18 }
    ],
    extortionPatternSemanticScore: 99.1,
    peerInoculationAvailable: true,
    status: "ACTIVE_PROPAGATING"
  },
  {
    id: "camp-02",
    campaignCodename: "NEXUS-CAMP-94 (ALPHV/BlackCat Rust Immutability Bypass)",
    threatActor: "BlackCat Core Operators",
    ransomwareFamily: "ALPHV BlackCat v2.4 (Rust)",
    kAnonymityClusterSize: 12,
    firstSeenGlobally: "2026-08-12 11:45 UTC",
    lastActive: "2026-08-23 18:10 UTC",
    confidenceScore: 96.2,
    privacyMethod: "Differential Privacy + Salted HMAC-SHA256",
    anonymizedVictimSectors: ["Financial Services (US)", "Fintech SaaS (UK)", "Regional Bank (AUS)"],
    anonymizedIOCs: [
      { type: "STAGER_HASH", maskedValue: "sha256:3f79bb7b435b0532...[k=12 verified]", occurrencesAcrossTenants: 9 },
      { type: "C2_SUBNET", maskedValue: "194.26.29.0/24 (Bulletproof VPS Provider)", occurrencesAcrossTenants: 12 },
      { type: "RANSOM_NOTE_SIGNATURE", maskedValue: "RECOVER-[TENANT_HASH]-README.txt", occurrencesAcrossTenants: 12 }
    ],
    extortionPatternSemanticScore: 95.8,
    peerInoculationAvailable: true,
    status: "ACTIVE_PROPAGATING"
  },
  {
    id: "camp-03",
    campaignCodename: "NEXUS-CAMP-77 (Akira Multi-Cloud AWS Snapshot Eraser)",
    threatActor: "Punk Spider / Akira Devs",
    ransomwareFamily: "Akira Linux/ESXi v3.0",
    kAnonymityClusterSize: 26,
    firstSeenGlobally: "2026-07-29 08:30 UTC",
    lastActive: "2026-08-20 14:00 UTC",
    confidenceScore: 94.0,
    privacyMethod: "Homomorphic Hash Aggregation",
    anonymizedVictimSectors: ["Manufacturing (US)", "Logistics (DE)", "Energy Utility (US)"],
    anonymizedIOCs: [
      { type: "STAGER_HASH", maskedValue: "sha256:c0535e4be2b79ffd...[k=26 verified]", occurrencesAcrossTenants: 22 },
      { type: "C2_SUBNET", maskedValue: "45.154.255.0/24", occurrencesAcrossTenants: 26 }
    ],
    extortionPatternSemanticScore: 92.4,
    peerInoculationAvailable: true,
    status: "CONTAINED_GLOBAL"
  }
];

export default function CrossCustomerIntelPage() {
  const [campaigns, setCampaigns] = useState<ThreatCampaignCluster[]>(INITIAL_CAMPAIGNS);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("camp-01");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [inoculatedCount, setInoculatedCount] = useState<number>(142);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchStatus = filterStatus === "ALL" || c.status === filterStatus;
      const matchSearch =
        c.campaignCodename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.threatActor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.ransomwareFamily.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [campaigns, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    return {
      activeCampaigns: campaigns.filter(c => c.status === "ACTIVE_PROPAGATING").length,
      anonymizedTenantsContributing: 184,
      inoculatedRulesPushed: inoculatedCount,
      zeroKnowledgeHealthPct: 100
    };
  }, [campaigns, inoculatedCount]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
    triggerToast("Anonymized telemetry signature copied.");
  };

  const pushInoculation = () => {
    setInoculatedCount(prev => prev + 1);
    triggerToast("Global Inoculation Packet pushed to local firewall and EDR.");
  };

  return (
    <div style={{ padding: "24px 28px", minHeight: "calc(100vh - 54px)", background: "var(--bg)", display: "flex", flexDirection: "column", gap: 20 }}>
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
              PRIVACY-PRESERVING THREAT NEXUS
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              Zero-Knowledge k-Anonymity (k ≥ 12) & Differential Privacy
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", color: "var(--fg)", margin: 0 }}>
            Cross-Customer Ransomware Campaign Intelligence
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 4, maxWidth: 880 }}>
            Aggregates anonymized, privacy-preserving threat telemetry across 180+ enterprises without leaking tenant PII, proprietary IP, or organizational identity—enabling rapid peer-to-peer immune inoculation before local infection occurs.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={pushInoculation}
            className="btn-primary"
          >
            <ShieldCheck size={14} />
            Apply Peer Threat Inoculation
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Active Threat Clusters</span>
            <Activity size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "var(--fg)" }}>{stats.activeCampaigns} Active</div>
          <div style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 700 }}>Real-time Peer Telemetry Feeds</div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--cyan)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Participating Tenants</span>
            <Users size={16} color="var(--cyan)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "var(--cyan)" }}>{stats.anonymizedTenantsContributing}</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Zero-Knowledge Cryptographic Federation</div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--amber)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Inoculation Defense Rules</span>
            <Zap size={16} color="var(--amber)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "var(--amber)" }}>{stats.inoculatedRulesPushed}</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Firewall, EDR & Sigma Signatures Staged</div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--purple)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Privacy & k-Anonymity</span>
            <Lock size={16} color="var(--purple)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "var(--purple)" }}>k ≥ 12</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>No PII or Enterprise Names Transmitted</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.9fr", gap: 16, flex: 1 }}>
        <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: 9, color: "var(--muted)" }} />
              <input
                type="text"
                placeholder="Search threat clusters, malware..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tool-input"
                style={{ paddingLeft: 30, width: "100%" }}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="tool-select"
              style={{ width: 110, fontSize: 11 }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE_PROPAGATING">Active</option>
              <option value="CONTAINED_GLOBAL">Contained</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", maxHeight: 580 }}>
            {filteredCampaigns.map((camp) => {
              const isSelected = selectedCampaignId === camp.id;
              return (
                <div
                  key={camp.id}
                  onClick={() => setSelectedCampaignId(camp.id)}
                  style={{
                    background: isSelected ? "rgba(16,185,129,0.12)" : "var(--surface-2)",
                    border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "14px 16px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.06)",
                      color: "var(--fg-2)",
                      fontFamily: "monospace"
                    }}>
                      k={camp.kAnonymityClusterSize} TENANTS
                    </span>

                    <span style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: camp.status === "ACTIVE_PROPAGATING" ? "var(--rose)" : "var(--primary)"
                    }}>
                      {camp.status === "ACTIVE_PROPAGATING" ? "ACTIVE SURGE" : "GLOBAL CONTAINED"}
                    </span>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>
                    {camp.campaignCodename}
                  </div>

                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    Family: <strong style={{ color: "var(--fg-2)" }}>{camp.ransomwareFamily}</strong>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
                    <span>Actor: <strong style={{ color: "var(--amber)" }}>{camp.threatActor.split("/")[0]}</strong></span>
                    <span style={{ color: "var(--primary)", fontWeight: 700 }}>{camp.confidenceScore}% Correlated</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "rgba(16,185,129,0.15)",
                  color: "var(--primary)",
                  fontFamily: "monospace"
                }}>
                  CORRELATION CONFIDENCE: {selectedCampaign.confidenceScore}%
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>
                  First Seen: {selectedCampaign.firstSeenGlobally}
                </span>
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: "var(--fg)", margin: 0 }}>
                {selectedCampaign.campaignCodename}
              </h2>
            </div>

            <button
              onClick={pushInoculation}
              className="btn-primary"
              style={{ padding: "6px 14px", fontSize: 12 }}
            >
              <Zap size={14} />
              Inoculate Defenses
            </button>
          </div>

          <div style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "14px 18px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            fontSize: 12
          }}>
            <div>
              <span style={{ color: "var(--muted)" }}>Threat Actor Attribution:</span>
              <div style={{ fontWeight: 700, color: "var(--fg)", marginTop: 2 }}>{selectedCampaign.threatActor}</div>
            </div>
            <div>
              <span style={{ color: "var(--muted)" }}>Privacy Preservation Method:</span>
              <div style={{ fontWeight: 700, color: "var(--cyan)", marginTop: 2 }}>{selectedCampaign.privacyMethod}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Anonymized Multi-Tenant Threat Signatures & Artifacts ({selectedCampaign.anonymizedIOCs.length})
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {selectedCampaign.anonymizedIOCs.map((ioc, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--surface-3)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 12
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.06)",
                      color: "var(--fg-2)",
                      fontFamily: "monospace"
                    }}>
                      {ioc.type}
                    </span>
                    <span style={{ fontFamily: "monospace", color: "var(--fg)", fontSize: 11.5 }}>
                      {ioc.maskedValue}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      Found across <strong style={{ color: "var(--cyan)" }}>{ioc.occurrencesAcrossTenants}</strong> peers
                    </span>
                    <button
                      onClick={() => copyToClipboard(ioc.maskedValue)}
                      className="btn-secondary"
                      style={{ padding: "3px 8px", fontSize: 10.5 }}
                    >
                      {copiedText === ioc.maskedValue ? <Check size={12} color="var(--primary)" /> : <Copy size={12} />}
                      {copiedText === ioc.maskedValue ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: "rgba(6,182,212,0.08)",
            border: "1px solid rgba(6,182,212,0.3)",
            borderRadius: 8,
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 6
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                NLP Extortion Note Phrasing & Bitcoin Wallet Clustering
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--cyan)" }}>
                Semantic Match: {selectedCampaign.extortionPatternSemanticScore}%
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>
              Aegis NLP extortion analysis identified matching linguistic patterns, ransom negotiation countdown scripts, and correlated affiliate payment wallet subnets across 14 separate health sector incidents within the last 7 days.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
