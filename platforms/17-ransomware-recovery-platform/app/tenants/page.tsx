"use client";

import React, { useState } from "react";
import {
  Building,
  Key,
  ShieldCheck,
  Users,
  Lock,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Plus,
  Layers,
  Database,
  Globe,
  Trash2,
  Activity,
  Sparkles
} from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  code: string;
  tier: "ENTERPRISE_PLUS" | "MSSP_MANAGED" | "GOV_ENCLAVE" | "COMMERCIAL";
  status: "ACTIVE_INCIDENT" | "HEALTHY_MONITORED" | "ISOLATED_QUARANTINE";
  industry: string;
  activeIncidentsCount: number;
  dataResidencyRegion: string;
  cmekKeyId: string;
  cmekStatus: "HSM_PROTECTED" | "ROTATING" | "ACTIVE";
  retentionDays: number;
  userCount: number;
  totalStorageTB: number;
}

const INITIAL_TENANTS: Tenant[] = [
  {
    id: "ten-001",
    name: "Mercy General Health System",
    code: "MERCY-HEALTH-US",
    tier: "ENTERPRISE_PLUS",
    status: "ACTIVE_INCIDENT",
    industry: "Healthcare & Life Sciences",
    activeIncidentsCount: 1,
    dataResidencyRegion: "US-East (N. Virginia - HIPAA Aligned)",
    cmekKeyId: "arn:aws:kms:us-east-1:748920194829:key/aegis-mercy-cmek-v2",
    cmekStatus: "HSM_PROTECTED",
    retentionDays: 365,
    userCount: 42,
    totalStorageTB: 84.5
  },
  {
    id: "ten-002",
    name: "Apex Global Financial Group",
    code: "APEX-FIN-GLOBAL",
    tier: "ENTERPRISE_PLUS",
    status: "ACTIVE_INCIDENT",
    industry: "Banking & Capital Markets",
    activeIncidentsCount: 1,
    dataResidencyRegion: "US-East (New York - NYDFS 500 Aligned)",
    cmekKeyId: "arn:aws:kms:us-east-1:993820194112:key/aegis-apex-cmek-v4",
    cmekStatus: "HSM_PROTECTED",
    retentionDays: 730,
    userCount: 88,
    totalStorageTB: 240.0
  },
  {
    id: "ten-003",
    name: "Precision Dynamics Aerospace",
    code: "PRECISION-AERO-DEF",
    tier: "GOV_ENCLAVE",
    status: "ACTIVE_INCIDENT",
    industry: "Defense & Aerospace (ITAR)",
    activeIncidentsCount: 1,
    dataResidencyRegion: "AWS GovCloud (US-East - FedRAMP High)",
    cmekKeyId: "arn:aws-us-gov:kms:us-gov-east-1:102938475612:key/cmek-gov-aero",
    cmekStatus: "HSM_PROTECTED",
    retentionDays: 1825,
    userCount: 26,
    totalStorageTB: 65.2
  },
  {
    id: "ten-004",
    name: "Heritage Energy Pipeline Operations",
    code: "HERITAGE-ENERGY-OT",
    tier: "MSSP_MANAGED",
    status: "HEALTHY_MONITORED",
    industry: "Energy / Oil & Gas Infrastructure",
    activeIncidentsCount: 0,
    dataResidencyRegion: "US-Central (Texas - NERC-CIP Aligned)",
    cmekKeyId: "arn:aws:kms:us-east-2:554433221100:key/cmek-heritage-v1",
    cmekStatus: "ACTIVE",
    retentionDays: 180,
    userCount: 18,
    totalStorageTB: 32.0
  },
  {
    id: "ten-005",
    name: "Vanguard Life Sciences BioTech",
    code: "VANGUARD-BIO-EU",
    tier: "ENTERPRISE_PLUS",
    status: "HEALTHY_MONITORED",
    industry: "Pharmaceuticals & Genomics",
    activeIncidentsCount: 0,
    dataResidencyRegion: "EU-West (Frankfurt - GDPR Article 28 Compliant)",
    cmekKeyId: "arn:aws:kms:eu-central-1:443322119988:key/cmek-vanguard-gdpr",
    cmekStatus: "HSM_PROTECTED",
    retentionDays: 1095,
    userCount: 34,
    totalStorageTB: 110.8
  }
];

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [selectedTenantId, setSelectedTenantId] = useState<string>("ten-001");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewTenantModal, setShowNewTenantModal] = useState(false);
  const [isRotatingKey, setIsRotatingKey] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantIndustry, setNewTenantIndustry] = useState("Healthcare");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedTenant = tenants.find(t => t.id === selectedTenantId) || tenants[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRotateKey = () => {
    setIsRotatingKey(true);
    setTimeout(() => {
      setTenants(prev =>
        prev.map(t => (t.id === selectedTenantId ? { ...t, cmekStatus: "HSM_PROTECTED" } : t))
      );
      setIsRotatingKey(false);
      showToast(`CMEK Hardware Key rotated for ${selectedTenant.name}. Hardware HSM re-wrapped.`);
    }, 1200);
  };

  const handleAddTenant = () => {
    if (!newTenantName) return;
    const newT: Tenant = {
      id: `ten-${Date.now().toString().slice(-3)}`,
      name: newTenantName,
      code: `${newTenantName.toUpperCase().replace(/\s+/g, "-")}-ORG`,
      tier: "ENTERPRISE_PLUS",
      status: "HEALTHY_MONITORED",
      industry: newTenantIndustry,
      activeIncidentsCount: 0,
      dataResidencyRegion: "US-East (N. Virginia)",
      cmekKeyId: `arn:aws:kms:us-east-1:100000000000:key/cmek-${newTenantName.toLowerCase().slice(0, 6)}`,
      cmekStatus: "HSM_PROTECTED",
      retentionDays: 365,
      userCount: 12,
      totalStorageTB: 15.0
    };
    setTenants(prev => [...prev, newT]);
    setSelectedTenantId(newT.id);
    setShowNewTenantModal(false);
    setNewTenantName("");
    showToast(`Tenant ${newTenantName} provisioned with dedicated CMEK isolation.`);
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          top: 70,
          right: 24,
          zIndex: 100,
          background: "rgba(16, 185, 129, 0.95)",
          color: "#04100c",
          padding: "10px 18px",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 13,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        padding: "16px 20px",
        borderRadius: 8,
        border: "1px solid var(--border)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 8,
            background: "rgba(6, 182, 212, 0.15)",
            border: "1px solid rgba(6, 182, 212, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Building size={22} color="#06b6d4" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--fg)" }}>
                Multi-Tenant Isolation & Customer RBAC Management
              </h1>
              <span className="badge-sev badge-medium">PILLAR 5 · ISOLATE</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              MSSP enterprise manager: Customer tenant separation, row-level access control, CMEK key management & audit streams.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setShowNewTenantModal(true)}
            className="btn-primary"
          >
            <Plus size={14} />
            <span>Onboard New Tenant</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #06b6d4" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Active Customer Tenants
            </span>
            <Building size={16} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#06b6d4", marginTop: 6 }}>
            {tenants.length}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Zero cross-tenant data leakage
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #f43f5e" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Active Incidents
            </span>
            <AlertTriangle size={16} color="#f43f5e" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f43f5e", marginTop: 6 }}>
            {tenants.reduce((acc, t) => acc + t.activeIncidentsCount, 0)}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Isolated forensic quarantine sandboxes
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #10b981" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              CMEK Key Health
            </span>
            <Key size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981", marginTop: 6 }}>
            100% HSM
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            FIPS 140-3 Level 3 Hardware Backed
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #a855f7" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Protected Storage
            </span>
            <Database size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#a855f7", marginTop: 6 }}>
            {tenants.reduce((acc, t) => acc + t.totalStorageTB, 0).toFixed(1)} TB
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Encrypted with AES-256-GCM CMEK
          </div>
        </div>
      </div>

      {/* Main Multi-Tenant View: Tenant List & Detail Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 16 }}>
        {/* Left Column: Tenant Directory */}
        <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>
              Tenant Enclaves Directory
            </span>
            <div style={{ position: "relative" }}>
              <Search size={12} color="var(--muted)" style={{ position: "absolute", left: 8, top: 8 }} />
              <input
                type="text"
                placeholder="Filter tenant..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="tool-input"
                style={{ paddingLeft: 26, width: 140, fontSize: 11 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredTenants.map(tenant => {
              const isSelected = tenant.id === selectedTenantId;
              const hasIncident = tenant.activeIncidentsCount > 0;

              return (
                <div
                  key={tenant.id}
                  onClick={() => setSelectedTenantId(tenant.id)}
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    cursor: "pointer",
                    background: isSelected ? "rgba(6, 182, 212, 0.12)" : "var(--surface-2)",
                    border: isSelected ? "1px solid rgba(6, 182, 212, 0.4)" : "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    transition: "all 0.12s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: isSelected ? "#06b6d4" : "var(--fg)" }}>
                      {tenant.name}
                    </span>
                    <span className={`badge-sev ${hasIncident ? "badge-critical" : "badge-success"}`}>
                      {tenant.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
                    <span>{tenant.industry}</span>
                    <span style={{ fontFamily: "monospace", color: "#10b981" }}>{tenant.totalStorageTB} TB</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Tenant CMEK & RBAC Details */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--fg)" }}>
                  {selectedTenant.name}
                </h2>
                <span className="badge-sev badge-medium">{selectedTenant.tier}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", marginTop: 2 }}>
                Code: {selectedTenant.code} · Data Region: {selectedTenant.dataResidencyRegion}
              </div>
            </div>

            <button
              onClick={() => showToast(`Switched active context to ${selectedTenant.name}.`)}
              className="btn-primary"
              style={{ fontSize: 12, padding: "6px 12px" }}
            >
              <Globe size={13} />
              <span>Switch Enclave</span>
            </button>
          </div>

          {/* CMEK Encryption Key Card */}
          <div style={{
            padding: 14,
            borderRadius: 6,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Key size={16} color="#10b981" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>
                  Customer-Managed Encryption Key (CMEK)
                </span>
              </div>
              <span className="badge-sev badge-success">
                {selectedTenant.cmekStatus}
              </span>
            </div>

            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", wordBreak: "break-all", background: "var(--surface-3)", padding: "6px 10px", borderRadius: 4 }}>
              {selectedTenant.cmekKeyId}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                Hardware Security Module (HSM): Dedicated AWS CloudHSM Partition
              </span>

              <button
                onClick={handleRotateKey}
                disabled={isRotatingKey}
                className="btn-secondary"
                style={{ fontSize: 11, padding: "4px 10px" }}
              >
                <RefreshCw size={11} className={isRotatingKey ? "animate-spin" : ""} />
                <span>{isRotatingKey ? "Rotating HSM..." : "Rotate Key"}</span>
              </button>
            </div>
          </div>

          {/* Tenant RBAC Policy Matrix */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--fg)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Tenant Role-Based Access Control (RBAC) Matrix
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { role: "Incident Commander (Lead)", access: "Full Decryption & Policy Execution", users: 2, badge: "Full Access" },
                { role: "Forensics DFIR Analyst", access: "Read Evidence / Memory Dumps / Export IOCs", users: 14, badge: "Forensics" },
                { role: "Customer Legal Counsel", access: "Read-Only Reports & Dual Sign-Off", users: 4, badge: "Governance" },
                { role: "External Auditor (KPMG)", access: "Sanitized Compliance Logs Only", users: 1, badge: "Auditor" }
              ].map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 12
                  }}
                >
                  <div>
                    <strong style={{ color: "var(--fg)" }}>{r.role}</strong>
                    <div style={{ fontSize: 10.5, color: "var(--muted)" }}>{r.access}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{r.users} Users</span>
                    <span className="badge-sev badge-low">{r.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Shredding Action */}
          <div style={{
            padding: 12,
            borderRadius: 6,
            background: "rgba(244, 63, 94, 0.06)",
            border: "1px solid rgba(244, 63, 94, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f43f5e" }}>
                Emergency Cryptographic Shredding
              </div>
              <div style={{ fontSize: 10.5, color: "var(--muted)" }}>
                Instantly destroys customer KMS key, rendering all encrypted enclaves irrevocably inaccessible.
              </div>
            </div>

            <button
              onClick={() => showToast("Simulated Cryptographic Shredding triggered. CMEK key permanently revoked.")}
              style={{
                background: "rgba(244, 63, 94, 0.15)",
                border: "1px solid rgba(244, 63, 94, 0.4)",
                color: "#f43f5e",
                padding: "6px 12px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Simulate Shred
            </button>
          </div>
        </div>
      </div>

      {/* Onboard Tenant Modal */}
      {showNewTenantModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          padding: 20
        }}>
          <div className="card-tactical" style={{ width: 500, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Building size={18} color="#06b6d4" />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
                  Onboard Customer Tenant Enclave
                </h3>
              </div>
              <button
                onClick={() => setShowNewTenantModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Organization Name:
              </label>
              <input
                type="text"
                placeholder="e.g. St. Jude Health Network"
                value={newTenantName}
                onChange={e => setNewTenantName(e.target.value)}
                className="tool-input"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Industry Sector:
              </label>
              <select
                value={newTenantIndustry}
                onChange={e => setNewTenantIndustry(e.target.value)}
                className="tool-select"
              >
                <option value="Healthcare & Hospital Networks">Healthcare & Hospital Networks</option>
                <option value="Banking & Financial Services">Banking & Financial Services</option>
                <option value="Defense & Critical Infrastructure">Defense & Critical Infrastructure</option>
                <option value="Energy & Utilities (SCADA)">Energy & Utilities (SCADA)</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <button
                onClick={() => setShowNewTenantModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTenant}
                className="btn-primary"
              >
                <CheckCircle2 size={13} />
                <span>Provision Isolated Enclave</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
