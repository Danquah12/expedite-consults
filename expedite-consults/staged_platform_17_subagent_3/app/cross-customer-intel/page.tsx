"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  ShieldCheck,
  Lock,
  Compass,
  Sparkles,
  Share2,
  EyeOff,
  Radio,
  FileText,
  Binary,
  Key,
  TrendingUp,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Building,
  Copy,
  Check
} from "lucide-react";

interface ThreatCampaignNexus {
  id: string;
  campaignCode: string;
  name: string;
  threatActor: string;
  ransomwareVariant: string;
  confidenceScore: number;
  firstObserved: string;
  correlatedTenantsCount: number;
  anonymizedTenantAliases: string[];
  sharedArtifacts: {
    fileHashes: string[];
    c2Nodes: string[];
    ransomPhrases: string[];
    wallets: string[];
  };
  targetedSectors: string[];
  activeInoculationStatus: "BROADCASTED_ACTIVE" | "VERIFYING_CORRELATION" | "MONITORING";
  mitreTTPs: string[];
}

const CAMPAIGNS: ThreatCampaignNexus[] = [
  {
    id: "camp-01",
    campaignCode: "NEXUS-CAMP-88",
    name: "LockBit 3.0 (Black) Multi-Sector Health & Defense Blitz",
    threatActor: "LockBit Supporter Gang #31 (FIN12 Affiliate)",
    ransomwareVariant: "LockBit 3.0 (ChaCha20 + Curve25519)",
    confidenceScore: 98.4,
    firstObserved: "2026-08-20 04:15 UTC",
    correlatedTenantsCount: 18,
    anonymizedTenantAliases: [
      "Tenant-Alpha (Critical Healthcare - Case INC-2026-8841)",
      "Tenant-Bravo (Regional Medical Center)",
      "Tenant-Charlie (Defense Avionics Contractor - Case INC-2026-7492)",
      "Tenant-Delta (Biotech Pharmaceuticals)",
      "Tenant-Echo (Emergency Hospital Group)"
    ],
    sharedArtifacts: {
      fileHashes: [
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (Stager)",
        "a94a8fe5ccb19ba61c4c0873d391e987982fbbd342be3b2361b7f093a1e5095d (Encryptor DLL)"
      ],
      c2Nodes: [
        "185.220.101.42:443 (Tor Exit Node C2)",
        "45.142.214.99:8443 (Staging VPS)"
      ],
      ransomPhrases: [
        "patient confidential records have been downloaded to our darknet servers",
        "published to the public leak blog within 72 hours"
      ],
      wallets: [
        "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh (Laundering Cluster #4)"
      ]
    },
    targetedSectors: ["Healthcare", "Aerospace & Defense", "Pharmaceuticals"],
    activeInoculationStatus: "BROADCASTED_ACTIVE",
    mitreTTPs: ["T1078.002 (Valid Accounts)", "T1003.006 (DCSync)", "T1490 (Inhibit Recovery)", "T1486 (Data Encrypted)"]
  },
  {
    id: "camp-02",
    campaignCode: "NEXUS-CAMP-94",
    name: "Scattered Spider ALPHV/BlackCat Rust Intermittent Campaign",
    threatActor: "Scattered Spider (UNC3944 / Star Fraud)",
    ransomwareVariant: "BlackCat / ALPHV 2.1 (Intermittent AES-256-CTR)",
    confidenceScore: 95.2,
    firstObserved: "2026-08-21 11:30 UTC",
    correlatedTenantsCount: 12,
    anonymizedTenantAliases: [
      "Tenant-Foxtrot (Global Clearing & Settlement - Case INC-2026-9012)",
      "Tenant-Golf (Retail Payment Gateway)",
      "Tenant-Hotel (Commercial Banking Group)"
    ],
    sharedArtifacts: {
      fileHashes: [
        "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
      ],
      c2Nodes: [
        "194.26.29.112:443 (Fast-Flux C2)"
      ],
      ransomPhrases: [
        "all virtual machines and ESXi datastores have been locked"
      ],
      wallets: [
        "888tNkZrPN6JsEkgFjhx7739YvBkd7993kKlhZ904 (Monero Sub-Address)"
      ]
    },
    targetedSectors: ["Banking & Capital Markets", "FinTech", "Insurance"],
    activeInoculationStatus: "BROADCASTED_ACTIVE",
    mitreTTPs: ["T1566.002 (Spearphishing)", "T1059.001 (PowerShell)", "T1486 (Data Encrypted)"]
  }
];

export default function CrossCustomerIntelPage() {
  const [campaigns, setCampaigns] = useState<ThreatCampaignNexus[]>(CAMPAIGNS);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("camp-01");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.threatActor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.campaignCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [campaigns, searchQuery]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
    setToastMessage(`Copied ${label} to clipboard.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
              PRIVACY-PRESERVING THREAT INTELLIGENCE NEXUS
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              Zero-Knowledge Salted Correlation · k-Anonymity (k=18)
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", color: "var(--fg)", margin: 0 }}>
            Cross-Customer Campaign Intelligence Nexus
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 4, maxWidth: 880 }}>
            Correlates anonymous file hashes, behavioral TTP patterns, ransom note semantic phrasing, and infrastructure nodes across multiple organizations without exposing sensitive customer data or private tenant identities.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            background: "rgba(6,182,212,0.12)",
            border: "1px solid rgba(6,182,212,0.3)",
            padding: "8px 14px",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            fontWeight: 700,
            color: "var(--cyan)"
          }}>
            <EyeOff size={16} />
            k-Anonymity Verified (k=18)
          </div>

          <button
            onClick={() => {
              const exportBlob = new Blob([JSON.stringify(campaigns, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(exportBlob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "Aegis-Cross-Customer-Threat-Nexus.json";
              a.click();
              setToastMessage("Threat Nexus IOC bundle downloaded.");
              setTimeout(() => setToastMessage(null), 3000);
            }}
            className="btn-primary"
          >
            <Download size={14} />
            Export Threat IOC Feed
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Correlated Tenant Hits</span>
            <Building size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "var(--fg)" }}>30 Organizations</div>
          <div style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 700 }}>Inoculated in Real-Time</div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--cyan)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Active Campaign Clusters</span>
            <Compass size={16} color="var(--cyan)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "var(--cyan)" }}>2 Nexus Clusters</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>LockBit 3.0 & ALPHV Rust Intermittent</div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--amber)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Average Correlation Confidence</span>
            <TrendingUp size={16} color="var(--amber)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "var(--amber)" }}>96.8% Match</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Semantic NLP & Merkle Hash Alignment</div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--purple)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Peer Inoculation Lead Time</span>
            <Radio size={16} color="var(--purple)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "var(--purple)" }}>+48 Hours</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Prior to Adversary Re-deployment</div>
        </div>
      </div>

      {/* Main Two-Column Layout: Campaign Selector & Detailed Nexus Analysis */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.9fr", gap: 16, flex: 1 }}>
        {/* Left Column: Campaigns List */}
        <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", textTransform: "uppercase" }}>
              Active Campaign Clusters
            </span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{filteredCampaigns.length} Active</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
                    gap: 8,
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
                      {camp.campaignCode}
                    </span>

                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--primary)" }}>
                      {camp.confidenceScore}% Correlation
                    </span>
                  </div>

                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)" }}>
                    {camp.name}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
                    <span>Actor: <strong style={{ color: "var(--fg-2)" }}>{camp.threatActor}</strong></span>
                    <span style={{ color: "var(--cyan)", fontWeight: 700 }}>{camp.correlatedTenantsCount} Tenants</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Campaign Correlation Nexus */}
        <div className="card-tactical" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Campaign Header */}
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
                  {activeCampaign.campaignCode} · {activeCampaign.confidenceScore}% ATTRIBUTION
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>
                  First Seen: {activeCampaign.firstObserved}
                </span>
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: "var(--fg)", margin: 0 }}>
                {activeCampaign.name}
              </h2>
            </div>

            <div style={{
              background: "rgba(16,185,129,0.15)",
              color: "var(--primary)",
              padding: "5px 12px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800,
              border: "1px solid rgba(16,185,129,0.3)"
            }}>
              {activeCampaign.activeInoculationStatus.replace(/_/g, " ")}
            </div>
          </div>

          {/* Anonymized Correlated Tenants */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              1. Anonymized Participating Tenants ({activeCampaign.correlatedTenantsCount} Masked Nodes)
            </span>
            <div style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              maxHeight: 120,
              overflowY: "auto"
            }}>
              {activeCampaign.anonymizedTenantAliases.map((alias, idx) => (
                <div key={idx} style={{ fontSize: 12, color: "var(--fg-2)", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cyan)" }} />
                  <span>{alias}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Correlated Artifacts Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {/* File Hashes */}
            <div style={{ background: "var(--surface-3)", padding: "12px 14px", borderRadius: 8, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--primary)" }}>Shared Stager Hashes</span>
                <Binary size={14} color="var(--primary)" />
              </div>
              {activeCampaign.sharedArtifacts.fileHashes.map((h, i) => (
                <div key={i} style={{ fontSize: 10.5, fontFamily: "monospace", color: "var(--fg-2)", wordBreak: "break-all" }}>
                  {h}
                </div>
              ))}
            </div>

            {/* C2 Infrastructure */}
            <div style={{ background: "var(--surface-3)", padding: "12px 14px", borderRadius: 8, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--cyan)" }}>Correlated C2 Nodes</span>
                <Radio size={14} color="var(--cyan)" />
              </div>
              {activeCampaign.sharedArtifacts.c2Nodes.map((c2, i) => (
                <div key={i} style={{ fontSize: 11, fontFamily: "monospace", color: "var(--fg-2)" }}>
                  {c2}
                </div>
              ))}
            </div>
          </div>

          {/* Shared Extortion Phrases */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--amber)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              2. Semantic NLP Extortion Note Alignment (98.4% Similarity)
            </span>
            <div style={{
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 8,
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              fontSize: 12,
              color: "var(--fg-2)",
              fontStyle: "italic"
            }}>
              {activeCampaign.sharedArtifacts.ransomPhrases.map((phrase, idx) => (
                <div key={idx}>"{phrase}"</div>
              ))}
            </div>
          </div>

          {/* MITRE ATT&CK TTPs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--purple)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              3. Correlated MITRE ATT&CK Playbook
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {activeCampaign.mitreTTPs.map((ttp, idx) => (
                <span
                  key={idx}
                  style={{
                    background: "rgba(168,85,247,0.15)",
                    border: "1px solid rgba(168,85,247,0.3)",
                    color: "var(--purple)",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "monospace"
                  }}
                >
                  {ttp}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
