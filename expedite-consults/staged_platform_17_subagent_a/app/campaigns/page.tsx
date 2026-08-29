"use client";

import { useState } from "react";
import {
  Layers,
  Search,
  Crosshair,
  Building2,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Globe,
  DollarSign,
  Lock,
  ExternalLink,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu
} from "lucide-react";
import { CampaignNexus } from "@/types/recovery";

export default function CampaignCorrelator() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("camp-01");
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("ALL");

  const campaigns: CampaignNexus[] = [
    {
      id: "camp-01",
      campaignCode: "NEXUS-2026-LB3-AFF31",
      threatActor: "FIN12 / LockBit Affiliate Gang #31",
      ransomwareVariant: "LockBit 3.0 (Black)",
      firstObserved: "2026-06-12",
      activeAffiliateCluster: "Cluster-Bravo (Eastern European Core)",
      targetedSectors: ["Healthcare", "Critical Infrastructure", "Pharma"],
      totalDemandedUSD: 14200000,
      correlatedTenants: ["Mercy General Health System", "Apex Regional Health", "St. Jude Clinics", "BioGen Labs"],
      sharedWallets: ["bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", "bc1q8841p93kkfhx0wlh2938491028374a"],
      sharedTorMirrors: ["http://lockbitaptc2xnk7b5yvh7y5vxsq.onion"],
      sharedExtensions: [".lockbit", ".lb3_black"],
      confidenceScore: 98.4
    },
    {
      id: "camp-02",
      campaignCode: "NEXUS-2026-ALPHV-UNC3944",
      threatActor: "Scattered Spider (UNC3944 Affiliate)",
      ransomwareVariant: "BlackCat / ALPHV (Rust)",
      firstObserved: "2026-07-04",
      activeAffiliateCluster: "Cluster-Echo (Social Engineering / SIM Swap)",
      targetedSectors: ["Banking & Financial", "Hospitality", "Telecom"],
      totalDemandedUSD: 28500000,
      correlatedTenants: ["Apex Global Financial Group", "Meridian Trust Bank", "Solaris Telecom"],
      sharedWallets: ["888tNkZrPN6JsEkgFjhx7739YvBkd7993kKlhZ904"],
      sharedTorMirrors: ["http://alphvchat7xnk27b5yvhlkdjfk.onion"],
      sharedExtensions: [".crypted", ".alphv"],
      confidenceScore: 96.2
    },
    {
      id: "camp-03",
      campaignCode: "NEXUS-2026-ROYAL-DEV0569",
      threatActor: "DEV-0569 (Zeon Syndicate)",
      ransomwareVariant: "Royal Ransomware v2",
      firstObserved: "2026-05-18",
      activeAffiliateCluster: "Cluster-Foxtrot (Callback Phishing / SCADA)",
      targetedSectors: ["Defense & Aerospace", "Manufacturing", "Energy"],
      totalDemandedUSD: 8900000,
      correlatedTenants: ["Precision Dynamics Aerospace", "Vanguard Defense Works"],
      sharedWallets: ["bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"],
      sharedTorMirrors: ["http://royal7xnk27b5yvhlkdjfk.onion"],
      sharedExtensions: [".royal_u", ".royal"],
      confidenceScore: 91.8
    }
  ];

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.threatActor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.campaignCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ransomwareVariant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === "ALL" || c.targetedSectors.some((s) => s.includes(sectorFilter));
    return matchesSearch && matchesSector;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* PAGE HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#10b981", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              PILLAR 1: MULTI-TENANT CAMPAIGN NEXUS
            </span>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 700 }}>
              MSSP CROSS-TENANT CORRELATION
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc", marginTop: 4 }}>
            Adversary Campaign Correlator & Threat Actor Nexus
          </h1>
        </div>

        <button
          onClick={() => alert("Pushed campaign correlation IOCs to all 12 managed client tenant enclaves.")}
          className="btn-primary"
          style={{ padding: "8px 16px" }}
        >
          <Share2 size={14} />
          <span>Broadcast Nexus IOCs to All Tenants</span>
        </button>
      </div>

      {/* TOP AGGREGATE STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Tracked Campaigns
            </span>
            <Layers size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981", marginTop: 8 }}>
            3 Active <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Clusters</span>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
            9 Correlated Tenant Victims
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Total Demand Value
            </span>
            <DollarSign size={15} color="#f43f5e" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f43f5e", marginTop: 8, fontFamily: "monospace" }}>
            $51.6M USD
          </div>
          <div style={{ fontSize: 10.5, color: "#10b981", marginTop: 4 }}>
            Zero Ransom Paid Across Fleet
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Cross-Tenant Wallets
            </span>
            <Crosshair size={15} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b", marginTop: 8 }}>
            4 Shared Wallets
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
            Linked to 1 Affiliate Master
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Cluster Confidence
            </span>
            <ShieldCheck size={15} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#06b6d4", marginTop: 8, fontFamily: "monospace" }}>
            98.4%
          </div>
          <div style={{ fontSize: 10.5, color: "#06b6d4", marginTop: 4 }}>
            Merkle Fingerprint Verified
          </div>
        </div>
      </div>

      {/* CAMPAIGN LIST (LEFT) & NEXUS PROFILE (RIGHT) */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 }}>
        {/* Left Column: Filterable Campaign Registry */}
        <div className="card-tactical" style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <Search size={14} color="var(--muted)" style={{ position: "absolute", left: 10, top: 9 }} />
            <input
              type="text"
              placeholder="Search threat group, code, variant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tool-input"
              style={{ paddingLeft: 30, width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {["ALL", "Healthcare", "Banking", "Defense"].map((sec) => (
              <button
                key={sec}
                onClick={() => setSectorFilter(sec)}
                style={{
                  flex: 1,
                  padding: "4px 6px",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: sectorFilter === sec ? "rgba(16,185,129,0.2)" : "var(--surface-2)",
                  color: sectorFilter === sec ? "#10b981" : "var(--muted)",
                  border: sectorFilter === sec ? "1px solid #10b981" : "1px solid var(--border)"
                }}
              >
                {sec}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {filteredCampaigns.map((camp) => {
              const active = camp.id === selectedCampaignId;
              return (
                <div
                  key={camp.id}
                  onClick={() => setSelectedCampaignId(camp.id)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 6,
                    cursor: "pointer",
                    background: active ? "var(--surface-2)" : "transparent",
                    border: active ? "1px solid #10b981" : "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    transition: "all 0.12s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 900, fontFamily: "monospace", color: "#10b981" }}>
                      {camp.campaignCode}
                    </span>
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: "#06b6d4", fontFamily: "monospace" }}>
                      {camp.confidenceScore}% Match
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#f8fafc" }}>{camp.threatActor}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{camp.ransomwareVariant}</div>
                  <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 2 }}>
                    Impacted: {camp.correlatedTenants.length} Client Organizations
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Campaign Nexus Intelligence */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Active Campaign Detail Banner */}
          <div className="card-tactical" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#10b981", fontFamily: "monospace" }}>
                  {activeCampaign.campaignCode}
                </span>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", marginTop: 4 }}>
                  {activeCampaign.threatActor}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  Affiliate Sub-Cluster: <strong style={{ color: "#06b6d4" }}>{activeCampaign.activeAffiliateCluster}</strong> · First Seen: {activeCampaign.firstObserved}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Campaign Extortion Total</span>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#f43f5e", fontFamily: "monospace" }}>
                  ${(activeCampaign.totalDemandedUSD / 1000000).toFixed(1)}M USD
                </div>
              </div>
            </div>

            {/* Targeted Sectors */}
            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
              {activeCampaign.targetedSectors.map((sec, idx) => (
                <span key={idx} style={{ fontSize: 10, padding: "2px 8px", background: "rgba(255,255,255,0.06)", borderRadius: 4, color: "#f8fafc" }}>
                  🎯 Sector: {sec}
                </span>
              ))}
            </div>
          </div>

          {/* Correlated Tenants & Shared Infrastructure Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {/* Impacted Tenant Organizations */}
            <div className="card-tactical" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                CORRELATED CLIENT TENANTS ({activeCampaign.correlatedTenants.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activeCampaign.correlatedTenants.map((t, idx) => (
                  <div key={idx} style={{ padding: "8px 10px", background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Building2 size={14} color="#06b6d4" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>{t}</span>
                    </div>
                    <span style={{ fontSize: 9.5, padding: "2px 6px", background: "rgba(16,185,129,0.2)", color: "#10b981", borderRadius: 3, fontWeight: 700 }}>
                      PROTECTED
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shared Cryptographic IOCs & Wallets */}
            <div className="card-tactical" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                SHARED CROSS-TENANT INFRASTRUCTURE
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div>
                  <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Common Bitcoin Wallets:</span>
                  {activeCampaign.sharedWallets.map((w, idx) => (
                    <div key={idx} style={{ padding: "6px 8px", background: "var(--surface-2)", borderRadius: 4, marginTop: 4, fontFamily: "monospace", fontSize: 11, color: "#f59e0b" }}>
                      {w}
                    </div>
                  ))}
                </div>

                <div>
                  <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Common Tor Negotiation Mirrors:</span>
                  {activeCampaign.sharedTorMirrors.map((m, idx) => (
                    <div key={idx} style={{ padding: "6px 8px", background: "var(--surface-2)", borderRadius: 4, marginTop: 4, fontFamily: "monospace", fontSize: 11, color: "#06b6d4", wordBreak: "break-all" }}>
                      {m}
                    </div>
                  ))}
                </div>

                <div>
                  <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Shared File Extensions:</span>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    {activeCampaign.sharedExtensions.map((ext, idx) => (
                      <span key={idx} style={{ padding: "3px 8px", background: "rgba(16,185,129,0.15)", borderRadius: 4, fontFamily: "monospace", fontSize: 11, color: "#10b981", fontWeight: 700 }}>
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
