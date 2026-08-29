"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Lock,
  Unlock,
  Radio,
  ExternalLink,
  Laptop,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Terminal,
  Zap,
  Clock,
  Trash2,
  Sliders,
  Info
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";

export interface VendorRiskItem {
  id: string;
  vendorName: string;
  serviceType: string;
  riskRating: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  activeVpnSessions: number;
  privilegedServiceAccounts: string[];
  remoteToolsDetected: string[];
  softwareCves: string[];
  blastPathToTier0: string;
  status: "ACTIVE" | "REVOKED" | "QUARANTINED";
  lastActive: string;
}

const VENDOR_RISK_DATA: VendorRiskItem[] = [
  {
    id: "ven-1",
    vendorName: "Apex Medical Billing Integrators (MSP)",
    serviceType: "Revenue Cycle & EHR Sync",
    riskRating: "CRITICAL",
    activeVpnSessions: 3,
    privilegedServiceAccounts: ["svc_apex_sync (Domain Admins)", "svc_backup_mgmt (Alias)"],
    remoteToolsDetected: ["ScreenConnect 23.9.7", "AnyDesk Remote"],
    softwareCves: ["CVE-2024-1709 (ScreenConnect Auth Bypass)", "CVE-2023-34362 (MOVEit Transfer)"],
    blastPathToTier0: "CONTRACTOR-VDI ➔ svc_backup_mgmt ➔ DC01.mercy.local ➔ SQL-CLINICAL",
    status: "ACTIVE",
    lastActive: "12 min ago"
  },
  {
    id: "ven-2",
    vendorName: "CoolTech Facility & HVAC Building IoT",
    serviceType: "Physical Plant SCADA Gateway",
    riskRating: "HIGH",
    activeVpnSessions: 2,
    privilegedServiceAccounts: ["svc_hvac_bacnet (Local Administrator)"],
    remoteToolsDetected: ["TeamViewer v15.48"],
    softwareCves: ["CVE-2024-21887 (Ivanti Connect Secure RCE)"],
    blastPathToTier0: "HVAC-CONTROLLER ➔ SCADA-VLAN ➔ Hyper-V Host Cluster",
    status: "ACTIVE",
    lastActive: "45 min ago"
  },
  {
    id: "ven-3",
    vendorName: "RadiologyCloud PACS Diagnostics SaaS",
    serviceType: "Offsite DICOM Image Relay",
    riskRating: "MEDIUM",
    activeVpnSessions: 5,
    privilegedServiceAccounts: ["svc_pacs_relay (Service User)"],
    remoteToolsDetected: ["LogMeIn Pro"],
    softwareCves: ["CVE-2023-4966 (CitrixBleed Session Hijack)"],
    blastPathToTier0: "PACS-STORAGE-SAN ➔ DICOM Port 104 ➔ Secondary File Storage",
    status: "ACTIVE",
    lastActive: "2 hours ago"
  },
  {
    id: "ven-4",
    vendorName: "SecureClean Janitorial Biometric Systems",
    serviceType: "Physical Badge & Timeclock",
    riskRating: "LOW",
    activeVpnSessions: 1,
    privilegedServiceAccounts: ["svc_badge_reader (Unprivileged)"],
    remoteToolsDetected: ["RustDesk 1.2"],
    softwareCves: [],
    blastPathToTier0: "Isolated Biometric VLAN (No Route to Production AD)",
    status: "ACTIVE",
    lastActive: "1 day ago"
  },
  {
    id: "ven-5",
    vendorName: "GlobalLab Pathology Diagnostics",
    serviceType: "Lab Result LIMS Integration",
    riskRating: "HIGH",
    activeVpnSessions: 3,
    privilegedServiceAccounts: ["svc_lims_api (Database Reader)"],
    remoteToolsDetected: ["AnyDesk Remote"],
    softwareCves: ["CVE-2023-3519 (NetScaler ADC RCE)"],
    blastPathToTier0: "LIMS-GATEWAY ➔ SQL-CLINICAL Port 1433",
    status: "ACTIVE",
    lastActive: "18 min ago"
  }
];

export default function SupplyChainRiskPage() {
  const [vendors, setVendors] = useState<VendorRiskItem[]>(VENDOR_RISK_DATA);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<string>("ALL");
  const [revocationFeedback, setRevocationFeedback] = useState<string | null>(null);

  const handleRevokeVendor = (vendorId: string, vendorName: string) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          return { ...v, status: "REVOKED", activeVpnSessions: 0 };
        }
        return v;
      })
    );

    setRevocationFeedback(`1-Click Revocation Executed: Terminated active VPN sessions and locked credentials for "${vendorName}".`);
    setTimeout(() => setRevocationFeedback(null), 4000);
  };

  const handleBulkQuarantine = () => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.riskRating === "CRITICAL" || v.riskRating === "HIGH") {
          return { ...v, status: "QUARANTINED", activeVpnSessions: 0 };
        }
        return v;
      })
    );

    setRevocationFeedback("Bulk Quarantine: Severed all high-risk remote access tools across 3 vendors.");
    setTimeout(() => setRevocationFeedback(null), 4000);
  };

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch = v.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.softwareCves.some((cve) => cve.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRating = ratingFilter === "ALL" || v.riskRating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  const totalActiveVpnSessions = vendors.reduce((acc, v) => acc + v.activeVpnSessions, 0);
  const criticalVendorsCount = vendors.filter((v) => v.riskRating === "CRITICAL").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Banner Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(244,63,94,0.08) 0%, rgba(245,158,11,0.06) 50%, rgba(14,21,38,0.95) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              background: "rgba(244,63,94,0.15)",
              border: "1px solid rgba(244,63,94,0.4)",
              borderRadius: 8,
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <Briefcase size={18} color="var(--rose)" />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--rose)", letterSpacing: "0.08em" }}>
                STAGE 1: SUPPLY-CHAIN & THIRD-PARTY RISK
              </span>
            </div>
            <span className="badge-sev badge-critical">VENDOR ATTACK VECTOR</span>
            <span className="badge-sev badge-medium">1-CLICK REVOCATION</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", marginBottom: 6 }}>
            Third-Party & Supply-Chain Ransomware Risk Assessor
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 840, lineHeight: 1.5 }}>
            Continuous inspection of external vendor access: Live VPN sessions, privileged third-party service accounts, remote access tools (ScreenConnect, AnyDesk, TeamViewer), and upstream software dependency CVEs.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleBulkQuarantine}
            className="btn-primary"
            style={{ background: "var(--rose)", color: "#fff", padding: "10px 18px", fontSize: 13 }}
          >
            <ShieldAlert size={16} />
            Bulk Isolate High-Risk Vendors
          </button>
        </div>
      </div>

      {/* Revocation Alert Banner */}
      {revocationFeedback && (
        <div style={{
          background: "rgba(16,185,129,0.15)",
          border: "1.5px solid var(--primary)",
          borderRadius: 8,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 12.5,
          color: "var(--primary)",
          fontWeight: 700
        }}>
          <CheckCircle2 size={18} />
          <span>{revocationFeedback}</span>
        </div>
      )}

      {/* KPI Counters Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div className="card-tactical" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Active Vendor VPN Sessions</span>
            <Radio size={16} color="var(--amber)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--amber)" }}>
            {totalActiveVpnSessions} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>Concurrent</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Across 5 registered third parties
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 16, borderLeft: "3px solid var(--rose)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Critical Risk Vendors</span>
            <ShieldAlert size={16} color="var(--rose)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--rose)" }}>
            {criticalVendorsCount} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>Vendors</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Direct path to Tier-0 Active Directory
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 16, borderLeft: "3px solid var(--cyan)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Remote Access Tools</span>
            <Laptop size={16} color="var(--cyan)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--cyan)" }}>
            5 <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>Agents Detected</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            ScreenConnect, AnyDesk, TeamViewer
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 16, borderLeft: "3px solid var(--primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Revocation SLA Response</span>
            <Zap size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--primary)" }}>
            &lt; 3.2s
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Instant Kerberos & VPN Token Kill
          </div>
        </div>
      </div>

      {/* Vendor Risk Table & Controls */}
      <div className="card-tactical" style={{ padding: 20 }}>
        
        {/* Search & Filter Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Search size={16} color="var(--muted)" />
            <input
              type="text"
              placeholder="Search vendor name, service, or CVE (e.g. ScreenConnect)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "8px 12px",
                color: "var(--fg)",
                fontSize: 12.5,
                width: 320,
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((rating) => (
              <button
                key={rating}
                onClick={() => setRatingFilter(rating)}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 10px",
                  borderRadius: 4,
                  border: "1px solid var(--border)",
                  background: ratingFilter === rating ? "rgba(16,185,129,0.2)" : "var(--surface-2)",
                  color: ratingFilter === rating ? "var(--primary)" : "var(--fg-2)",
                  cursor: "pointer"
                }}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Table */}
        <table className="data-table">
          <thead>
            <tr>
              <th>Vendor & Service</th>
              <th>Risk Level</th>
              <th>Active Sessions</th>
              <th>Privileged Accounts</th>
              <th>Remote Tools & CVEs</th>
              <th>Blast Path to Tier-0</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => {
              const isRevoked = vendor.status === "REVOKED";
              const isQuarantined = vendor.status === "QUARANTINED";

              return (
                <tr key={vendor.id} style={{ opacity: isRevoked ? 0.6 : 1 }}>
                  <td>
                    <div style={{ fontWeight: 800, color: "var(--fg)", fontSize: 13 }}>
                      {vendor.vendorName}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      {vendor.serviceType} • Last active: {vendor.lastActive}
                    </div>
                  </td>

                  <td>
                    <span className={`badge-sev ${vendor.riskRating === "CRITICAL" ? "badge-critical" : vendor.riskRating === "HIGH" ? "badge-high" : "badge-medium"}`}>
                      {vendor.riskRating}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontFamily: "monospace", fontWeight: 700, color: vendor.activeVpnSessions > 0 ? "var(--amber)" : "var(--muted)" }}>
                      {vendor.activeVpnSessions} VPN
                    </div>
                  </td>

                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {vendor.privilegedServiceAccounts.map((acc, aIdx) => (
                        <span key={aIdx} style={{ fontSize: 11, fontFamily: "monospace", color: acc.includes("Domain Admins") ? "var(--rose)" : "var(--fg-2)" }}>
                          • {acc}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {vendor.remoteToolsDetected.map((tool, tIdx) => (
                          <span key={tIdx} style={{ fontSize: 10, background: "rgba(6,182,212,0.15)", color: "var(--cyan)", padding: "1px 5px", borderRadius: 3, border: "1px solid rgba(6,182,212,0.3)" }}>
                            {tool}
                          </span>
                        ))}
                      </div>

                      {vendor.softwareCves.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {vendor.softwareCves.map((cve, cIdx) => (
                            <span key={cIdx} style={{ fontSize: 10, background: "rgba(244,63,94,0.15)", color: "var(--rose)", padding: "1px 5px", borderRadius: 3, border: "1px solid rgba(244,63,94,0.3)" }}>
                              ⚠ {cve.split(" ")[0]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: 11, color: "var(--fg-2)", fontFamily: "monospace", maxWidth: 220, lineHeight: 1.3 }}>
                      {vendor.blastPathToTier0}
                    </div>
                  </td>

                  <td>
                    {isRevoked ? (
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--rose)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Lock size={13} /> REVOKED
                      </span>
                    ) : isQuarantined ? (
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--amber)", display: "flex", alignItems: "center", gap: 4 }}>
                        <ShieldAlert size={13} /> QUARANTINED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRevokeVendor(vendor.id, vendor.vendorName)}
                        className="btn-secondary"
                        style={{
                          fontSize: 11,
                          padding: "5px 10px",
                          borderColor: "rgba(244,63,94,0.4)",
                          color: "var(--rose)",
                          whiteSpace: "nowrap"
                        }}
                      >
                        1-Click Revoke
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

      </div>

    </div>
  );
}
