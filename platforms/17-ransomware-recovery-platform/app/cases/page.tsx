"use client";

import { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  Users,
  AlertTriangle,
  FileText,
  Lock,
  Tag,
  Hash,
  ArrowRight,
  Database,
  Server,
  Layers,
  Archive
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";
import { RansomwareCase, IncidentSeverity, IncidentStatus, ChainOfCustodyItem } from "@/types/recovery";

export default function CasesManagement() {
  const [cases, setCases] = useState<RansomwareCase[]>(MOCK_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("case-001");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "assets" | "custody" | "tasks">("overview");

  // New Case Form state
  const [newCaseOrg, setNewCaseOrg] = useState("");
  const [newCaseTitle, setNewCaseTitle] = useState("");
  const [newCaseIndustry, setNewCaseIndustry] = useState("Healthcare / Hospital System");
  const [newCaseSeverity, setNewCaseSeverity] = useState<IncidentSeverity>("CRITICAL");
  const [newCaseFamily, setNewCaseFamily] = useState("LockBit 3.0");
  const [newCaseDemand, setNewCaseDemand] = useState(1500000);
  const [newCaseLead, setNewCaseLead] = useState("Elena Rostova, CISSP");

  // Chain of Custody items
  const [custodyItems, setCustodyItems] = useState<ChainOfCustodyItem[]>([
    {
      id: "ev-01",
      evidenceTag: "EVID-2026-8841-RAM-01",
      description: "Volatile memory dump captured from Domain Controller DC01.mercy.local",
      sourceDevice: "DC01 (10.14.2.10)",
      itemType: "RAM_IMAGE",
      md5: "8f14e45fceea167a5a36dedd4bea2543",
      sha256: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
      acquiredBy: "David Kross, GCFA",
      acquisitionTimestamp: "2026-08-23 06:45 UTC",
      storageLocation: "Evidence Locker #4 - Cold Vault (WORM S3)",
      freStatus: "FRE_901_CERTIFIED"
    },
    {
      id: "ev-02",
      evidenceTag: "EVID-2026-8841-DISK-02",
      description: "Raw VHDX virtual disk image of SQL-PROD-01 (Clinical Database)",
      sourceDevice: "HV-NODE-01.mercy.local",
      itemType: "DISK_VHDX",
      md5: "e4d909c290d0fb1ca068ffaddf22cbd0",
      sha256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      acquiredBy: "Elena Rostova, CISSP",
      acquisitionTimestamp: "2026-08-23 07:15 UTC",
      storageLocation: "Immutable S3 Vault (us-east-1-custody-vault)",
      freStatus: "FRE_901_CERTIFIED"
    },
    {
      id: "ev-03",
      evidenceTag: "EVID-2026-8841-NOTE-03",
      description: "Original dropped ransom note Restore-My-Files.txt and payload stub",
      sourceDevice: "APP-IIS-04 (10.14.4.22)",
      itemType: "RANSOM_SAMPLE",
      md5: "a8b645527f09b864583a1310a91a5d38",
      sha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
      acquiredBy: "Marcus Vance, GCIH",
      acquisitionTimestamp: "2026-08-23 07:30 UTC",
      storageLocation: "Sandboxed Threat Lab Repo",
      freStatus: "FRE_901_CERTIFIED"
    }
  ]);

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const handleCreateCase = () => {
    if (!newCaseOrg || !newCaseTitle) return;
    const newCase: RansomwareCase = {
      id: `case-${Date.now().toString().slice(-3)}`,
      caseNumber: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newCaseTitle,
      organization: newCaseOrg,
      industry: newCaseIndustry,
      severity: newCaseSeverity,
      status: "TRIAGE",
      ransomwareFamily: newCaseFamily,
      confidenceScore: 92.0,
      threatActor: "Uncorrelated Threat Group",
      affectedHosts: 12,
      affectedFiles: 35000,
      totalDataSizeGB: 850,
      ransomDemandUSD: Number(newCaseDemand),
      cryptoCurrency: "BTC",
      walletAddress: "bc1q" + Math.random().toString(36).substring(2, 15),
      torNegotiationUrl: "http://darknet-portal.onion",
      deadlineTimestamp: "2026-08-27T18:00:00Z",
      dataExfiltrationLikelihood: "SUSPECTED",
      primaryRecoveryPath: "BACKUP_ONLY",
      reinfectionRisk: "HIGH",
      estimatedRecoveryTimeHours: 14.0,
      assignedLead: newCaseLead,
      leadRole: "Lead Incident Responder",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      summary: `Emergency intake for ${newCaseOrg}. Ransomware deployment detected across primary virtualization cluster.`
    };

    setCases([newCase, ...cases]);
    setSelectedCaseId(newCase.id);
    setShowCreateModal(false);
    setNewCaseOrg("");
    setNewCaseTitle("");
  };

  const filteredCases = cases.filter((c) => {
    const matchesSev = severityFilter === "ALL" || c.severity === severityFilter;
    const matchesSearch =
      c.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ransomwareFamily.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* PAGE HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#3b82f6", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              PILLAR 1: INTAKE & CASE MANAGEMENT
            </span>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(59,130,246,0.15)", color: "#3b82f6", fontWeight: 700 }}>
              FRE 901 CHAIN OF CUSTODY CERTIFIED
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc", marginTop: 4 }}>
            Incident Intake, Organization Registry & Case Vault
          </h1>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ padding: "8px 16px" }}>
          <Plus size={14} />
          <span>New Incident Intake Case</span>
        </button>
      </div>

      {/* WORKSPACE LAYOUT: CASE LIST (LEFT) & CASE WORKSPACE (RIGHT) */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16 }}>
        {/* Left Column: Filterable Case Registry */}
        <div className="card-tactical" style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12, height: "calc(100vh - 180px)", overflowY: "auto" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} color="var(--muted)" style={{ position: "absolute", left: 10, top: 9 }} />
            <input
              type="text"
              placeholder="Search case, org, family..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tool-input"
              style={{ paddingLeft: 30, width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                style={{
                  flex: 1,
                  padding: "4px 6px",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: severityFilter === sev ? "rgba(59,130,246,0.2)" : "var(--surface-2)",
                  color: severityFilter === sev ? "#3b82f6" : "var(--muted)",
                  border: severityFilter === sev ? "1px solid #3b82f6" : "1px solid var(--border)"
                }}
              >
                {sev}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {filteredCases.map((c) => {
              const active = c.id === selectedCaseId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 6,
                    cursor: "pointer",
                    background: active ? "var(--surface-2)" : "transparent",
                    border: active ? "1px solid #3b82f6" : "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    transition: "all 0.12s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 900, fontFamily: "monospace", color: "#3b82f6" }}>
                      {c.caseNumber}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "1px 5px",
                        borderRadius: 3,
                        background: c.severity === "CRITICAL" ? "rgba(244,63,94,0.2)" : "rgba(245,158,11,0.2)",
                        color: c.severity === "CRITICAL" ? "#f43f5e" : "#f59e0b"
                      }}
                    >
                      {c.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>{c.organization}</div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)" }}>{c.ransomwareFamily}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Case Workspace & Sub-views */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Active Case Header Banner */}
          <div className="card-tactical" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: "#3b82f6", fontFamily: "monospace" }}>
                    {activeCase.caseNumber}
                  </span>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 700 }}>
                    STATUS: {activeCase.status}
                  </span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", marginTop: 4 }}>
                  {activeCase.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  {activeCase.organization} · {activeCase.industry} · Lead: <strong style={{ color: "#f8fafc" }}>{activeCase.assignedLead}</strong>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Ransom Demand</span>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#f43f5e", fontFamily: "monospace" }}>
                  ${(activeCase.ransomDemandUSD / 1000000).toFixed(2)}M ({activeCase.cryptoCurrency})
                </div>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div style={{ display: "flex", gap: 8, marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              {[
                { id: "overview", label: "Case Summary & Metrics", icon: FileText },
                { id: "assets", label: "Affected Assets Checklist", icon: Server },
                { id: "custody", label: "FRE 901 Chain of Custody", icon: ShieldCheck },
                { id: "tasks", label: "Analyst Task Assignment", icon: Users }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: active ? "rgba(59,130,246,0.15)" : "var(--surface-2)",
                      color: active ? "#3b82f6" : "var(--muted)",
                      border: active ? "1px solid #3b82f6" : "1px solid var(--border)"
                    }}
                  >
                    <Icon size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUB-VIEW 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 }}>
              <div className="card-tactical" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>INCIDENT SUMMARY & SCOPE</div>
                <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>
                  {activeCase.summary}
                </div>
                <div style={{ padding: 10, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)", marginTop: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4" }}>Darknet Negotiation Portal:</div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--muted)", marginTop: 2, wordBreak: "break-all" }}>
                    {activeCase.torNegotiationUrl}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", marginTop: 8 }}>Bitcoin Wallet:</div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--muted)", marginTop: 2 }}>
                    {activeCase.walletAddress}
                  </div>
                </div>
              </div>

              <div className="card-tactical" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>INTAKE FORENSIC PROFILE</div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Threat Actor Attribution:</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#f43f5e" }}>{activeCase.threatActor}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>AI Attribution Confidence:</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981" }}>{activeCase.confidenceScore}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Data Exfiltration Status:</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#f43f5e" }}>{activeCase.dataExfiltrationLikelihood}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Primary Recovery Path:</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4" }}>{activeCase.primaryRecoveryPath}</span>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: ASSETS CHECKLIST */}
          {activeTab === "assets" && (
            <div className="card-tactical" style={{ padding: "16px 18px" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", marginBottom: 12 }}>
                AFFECTED INFRASTRUCTURE ASSETS (24 HOSTS IDENTIFIED)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {[
                  { host: "DC01.mercy.local", type: "Active Directory DC", status: "CONTAINED", ip: "10.14.2.10", vlan: "Vlan 10 - Corp Core" },
                  { host: "DC02.mercy.local", type: "Secondary AD DC", status: "CONTAINED", ip: "10.14.2.11", vlan: "Vlan 10 - Corp Core" },
                  { host: "SQL-PROD-01.mercy.local", type: "MS-SQL Patient EHR", status: "ENCRYPTED", ip: "10.14.3.40", vlan: "Vlan 30 - DB Subnet" },
                  { host: "PACS-ARCHIVE.mercy.local", type: "PACS DICOM Imaging", status: "ENCRYPTED", ip: "10.14.4.15", vlan: "Vlan 40 - Imaging" },
                  { host: "HV-NODE-01.mercy.local", type: "Hyper-V Cluster Node 1", status: "CONTAINED", ip: "10.14.1.10", vlan: "Vlan 5 - Hypervisors" },
                  { host: "HV-NODE-02.mercy.local", type: "Hyper-V Cluster Node 2", status: "CONTAINED", ip: "10.14.1.11", vlan: "Vlan 5 - Hypervisors" }
                ].map((asset, idx) => (
                  <div key={idx} style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc", fontFamily: "monospace" }}>{asset.host}</div>
                      <div style={{ fontSize: 10.5, color: "var(--muted)" }}>{asset.type} · {asset.ip} ({asset.vlan})</div>
                    </div>
                    <span style={{ fontSize: 9.5, fontWeight: 800, padding: "2px 6px", borderRadius: 3, background: asset.status === "ENCRYPTED" ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.2)", color: asset.status === "ENCRYPTED" ? "#f43f5e" : "#10b981" }}>
                      {asset.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-VIEW 3: FRE 901 CHAIN OF CUSTODY */}
          {activeTab === "custody" && (
            <div className="card-tactical" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                    FEDERAL RULES OF EVIDENCE (FRE 901) EVIDENCE INVENTORY
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    Cryptographic hash validation ensuring legal chain-of-custody admissibility
                  </div>
                </div>
                <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 700 }}>
                  ALL ARTIFACTS VERIFIED INTACT
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Evidence Tag</th>
                      <th>Description</th>
                      <th>Source Device</th>
                      <th>SHA-256 Checksum</th>
                      <th>Acquired By</th>
                      <th>Storage Locker</th>
                      <th>FRE Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {custodyItems.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 800, fontFamily: "monospace", color: "#3b82f6" }}>{item.evidenceTag}</td>
                        <td style={{ fontSize: 11.5 }}>{item.description}</td>
                        <td style={{ fontFamily: "monospace", fontSize: 11 }}>{item.sourceDevice}</td>
                        <td style={{ fontFamily: "monospace", fontSize: 10.5, color: "var(--muted)" }}>
                          {item.sha256.substring(0, 16)}...
                        </td>
                        <td style={{ fontSize: 11 }}>{item.acquiredBy}</td>
                        <td style={{ fontSize: 11, color: "var(--fg-2)" }}>{item.storageLocation}</td>
                        <td>
                          <span style={{ fontSize: 9.5, fontWeight: 800, padding: "2px 6px", borderRadius: 3, background: "rgba(16,185,129,0.2)", color: "#10b981" }}>
                            {item.freStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VIEW 4: ANALYST TASK ASSIGNMENT */}
          {activeTab === "tasks" && (
            <div className="card-tactical" style={{ padding: "16px 18px" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", marginBottom: 12 }}>
                DFIR INCIDENT COMMAND TASK DESK
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { task: "Execute Wanakiwi heap key carver on isolated SCADA node", assigned: "David Kross, GCFA", priority: "CRITICAL", status: "COMPLETED" },
                  { task: "Validate AWS S3 immutable bucket Object Lock retention policies", assigned: "Elena Rostova, CISSP", priority: "HIGH", status: "COMPLETED" },
                  { task: "Carve ransomware payload PE headers and submit to Hybrid-Analysis", assigned: "Marcus Vance, GCIH", priority: "HIGH", status: "IN_PROGRESS" },
                  { task: "Coordinate Tabletop executive update with Legal Counsel", assigned: "Sarah Jenkins, CISM", priority: "MEDIUM", status: "QUEUED" }
                ].map((t, idx) => (
                  <div key={idx} style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>{t.task}</div>
                      <div style={{ fontSize: 10.5, color: "var(--muted)" }}>Assigned: <strong style={{ color: "#3b82f6" }}>{t.assigned}</strong></div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 9.5, fontWeight: 800, padding: "2px 6px", borderRadius: 3, background: t.priority === "CRITICAL" ? "rgba(244,63,94,0.2)" : "rgba(245,158,11,0.2)", color: t.priority === "CRITICAL" ? "#f43f5e" : "#f59e0b" }}>
                        {t.priority}
                      </span>
                      <span style={{ fontSize: 9.5, fontWeight: 800, padding: "2px 6px", borderRadius: 3, background: t.status === "COMPLETED" ? "rgba(16,185,129,0.2)" : "rgba(6,182,212,0.2)", color: t.status === "COMPLETED" ? "#10b981" : "#06b6d4" }}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE CASE MODAL */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20
          }}
        >
          <div
            className="card-tactical"
            style={{
              width: "100%",
              maxWidth: 600,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              background: "var(--surface)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: "#f8fafc" }}>
                Initiate New Ransomware Incident Case
              </span>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Victim Organization:</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Health Systems"
                  value={newCaseOrg}
                  onChange={(e) => setNewCaseOrg(e.target.value)}
                  className="tool-input"
                  style={{ width: "100%", marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Industry Sector:</label>
                <input
                  type="text"
                  placeholder="e.g. Banking & Financial"
                  value={newCaseIndustry}
                  onChange={(e) => setNewCaseIndustry(e.target.value)}
                  className="tool-input"
                  style={{ width: "100%", marginTop: 4 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Incident Headline / Title:</label>
              <input
                type="text"
                placeholder="e.g. ESXi Datastore Intermittent Encryption Attack"
                value={newCaseTitle}
                onChange={(e) => setNewCaseTitle(e.target.value)}
                className="tool-input"
                style={{ width: "100%", marginTop: 4 }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Severity Tier:</label>
                <select
                  value={newCaseSeverity}
                  onChange={(e) => setNewCaseSeverity(e.target.value as any)}
                  className="tool-select"
                  style={{ width: "100%", marginTop: 4 }}
                >
                  <option value="CRITICAL">CRITICAL (Defcon 1)</option>
                  <option value="HIGH">HIGH (Defcon 2)</option>
                  <option value="MEDIUM">MEDIUM (Defcon 3)</option>
                  <option value="LOW">LOW (Defcon 4)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Ransomware Family:</label>
                <input
                  type="text"
                  value={newCaseFamily}
                  onChange={(e) => setNewCaseFamily(e.target.value)}
                  className="tool-input"
                  style={{ width: "100%", marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Ransom Demand ($):</label>
                <input
                  type="number"
                  value={newCaseDemand}
                  onChange={(e) => setNewCaseDemand(Number(e.target.value))}
                  className="tool-input"
                  style={{ width: "100%", marginTop: 4 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Assigned Incident Lead:</label>
              <input
                type="text"
                value={newCaseLead}
                onChange={(e) => setNewCaseLead(e.target.value)}
                className="tool-input"
                style={{ width: "100%", marginTop: 4 }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateCase} className="btn-primary">
                Create & Lock Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
