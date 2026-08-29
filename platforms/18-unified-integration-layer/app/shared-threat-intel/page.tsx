"use client";
import { useState } from "react";
import {
  Crosshair,
  Share2,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle,
  RefreshCw,
  Copy,
  Terminal,
  Shield,
  Layers,
  Globe,
  Radio,
  ExternalLink,
  Code
} from "lucide-react";
import { UNIFIED_IOCS, CONNECTED_PLATFORMS } from "@/data/integrationData";
import { UnifiedIOC, IOCType, PlatformId } from "@/types/integration";

export default function SharedThreatIntelPage() {
  const [iocs, setIocs] = useState<UnifiedIOC[]>(UNIFIED_IOCS);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIoc, setSelectedIoc] = useState<UnifiedIOC | null>(UNIFIED_IOCS[0]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [showStixModal, setShowStixModal] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New IOC Form state
  const [newType, setNewType] = useState<IOCType>("SHA256");
  const [newValue, setNewValue] = useState<string>("");
  const [newActor, setNewActor] = useState<string>("LockBit 3.0");
  const [newMalwareFamily, setNewMalwareFamily] = useState<string>("LockBit Black");
  const [newDesc, setNewDesc] = useState<string>("");
  const [newConfidence, setNewConfidence] = useState<number>(95);

  const handleSyncTaxii = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  const handleCreateIoc = (e: React.FormEvent) => {
    e.preventDefault();
    const created: UnifiedIOC = {
      id: `IOC-${Math.floor(100 + Math.random() * 900)}`,
      type: newType,
      value: newValue,
      threatActor: newActor,
      malwareFamily: newMalwareFamily,
      confidenceScore: newConfidence,
      firstSeen: new Date().toISOString().replace("T", " ").substring(0, 19),
      lastSeen: new Date().toISOString().replace("T", " ").substring(0, 19),
      originatingPlatform: "cerberus-re",
      propagatedPlatforms: ["cerberus-re", "aegis-recovery", "axiom-dast", "edr-crowdstrike", "siem-sentinel"],
      syncStatus: "ENFORCED",
      mitreTactics: ["T1071 Application Layer Protocol", "T1059 Command and Scripting Interpreter"],
      description: newDesc
    };

    setIocs([created, ...iocs]);
    setSelectedIoc(created);
    setIsCreateModalOpen(false);
    setNewValue("");
    setNewDesc("");
  };

  const filteredIocs = iocs.filter((ioc) => {
    if (selectedType !== "ALL" && ioc.type !== selectedType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ioc.id.toLowerCase().includes(q) ||
        ioc.value.toLowerCase().includes(q) ||
        ioc.threatActor.toLowerCase().includes(q) ||
        ioc.malwareFamily.toLowerCase().includes(q) ||
        ioc.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStixJson = (ioc: UnifiedIOC) => {
    return {
      type: "bundle",
      id: `bundle--${ioc.id}`,
      spec_version: "2.1",
      objects: [
        {
          type: "indicator",
          spec_version: "2.1",
          id: `indicator--${ioc.id}`,
          created: ioc.firstSeen,
          modified: ioc.lastSeen,
          name: `${ioc.type} associated with ${ioc.threatActor}`,
          description: ioc.description,
          indicator_types: ["malicious-activity"],
          pattern: `[file:hashes.'SHA-256' = '${ioc.value}']`,
          pattern_type: "stix",
          valid_from: ioc.firstSeen,
          confidence: ioc.confidenceScore,
          external_references: ioc.mitreTactics.map((t) => ({
            source_name: "mitre-attack",
            external_id: t.split(" ")[0]
          }))
        }
      ]
    };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px 20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "rgba(6,182,212,0.15)",
            border: "1px solid rgba(6,182,212,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Crosshair size={20} color="#06b6d4" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
              Enterprise IOC & Threat Actor Synchronization Hub
            </h1>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0 0" }}>
              Bi-directional STIX 2.1 / TAXII 2.1 server propagating hashes, C2 endpoints, YARA rules, and Sigma patterns.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={handleSyncTaxii}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              fontWeight: 600,
              fontSize: 12,
              padding: "7px 14px",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
            <span>{isSyncing ? "TAXII 2.1 SYNCING..." : "Force TAXII 2.1 Sync"}</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            <Plus size={14} />
            <span>Broadcast New IOC</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Synchronized IOC Registry", val: "14,890", sub: "SHA256, IPs, Domains, YARA", color: "#10b981" },
          { label: "STIX 2.1 TAXII Feeds", val: "12 Inbound / 8 Out", sub: "100% Schema Validated", color: "#06b6d4" },
          { label: "Active Threat Actors", val: "24 Monitored", sub: "LockBit, APT29, ALPHV, Lazarus", color: "#a855f7" },
          { label: "EDR/SIEM Enforcement", val: "100% Synced", sub: "CrowdStrike & Sentinel live", color: "#f43f5e" }
        ].map((s, i) => (
          <div key={i} className="card-tactical" style={{ padding: "12px 16px" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc", margin: "4px 0" }}>{s.val}</div>
            <div style={{ fontSize: 10.5, color: s.color, fontWeight: 600 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "10px 14px",
        gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, background: "var(--surface-2)", padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)" }}>
          <Search size={14} color="var(--muted)" />
          <input
            placeholder="Search hash, C2 IP, domain, threat actor, or MITRE tactic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#f8fafc",
              fontSize: 12.5,
              width: "100%"
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>IOC TYPE:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="tool-select"
          >
            <option value="ALL">All IOC Types</option>
            <option value="SHA256">SHA256 Hash</option>
            <option value="IP_C2">C2 IP Address</option>
            <option value="DOMAIN">Malicious Domain</option>
            <option value="YARA_RULE">YARA Rule</option>
            <option value="SIGMA_RULE">Sigma Rule</option>
          </select>
        </div>
      </div>

      {/* IOC Grid & Detail View */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        {/* Table List */}
        <div className="card-tactical" style={{ padding: 14, height: 600, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>
              Active Synchronized Indicators ({filteredIocs.length})
            </span>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>
              STIX 2.1 Automated Propagation
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredIocs.map((ioc) => {
              const isSelected = selectedIoc?.id === ioc.id;
              return (
                <div
                  key={ioc.id}
                  onClick={() => setSelectedIoc(ioc)}
                  style={{
                    background: isSelected ? "rgba(6,182,212,0.12)" : "var(--surface-2)",
                    border: `1px solid ${isSelected ? "#06b6d4" : "var(--border)"}`,
                    borderRadius: 6,
                    padding: "10px 12px",
                    cursor: "pointer",
                    transition: "all 0.12s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        background: "rgba(6,182,212,0.15)",
                        color: "#06b6d4",
                        padding: "1px 6px",
                        borderRadius: 4,
                        fontFamily: "monospace"
                      }}>
                        {ioc.type}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: 12.5, color: "#f8fafc" }}>
                        {ioc.threatActor}
                      </span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981" }}>
                      ● {ioc.syncStatus} ({ioc.confidenceScore}%)
                    </span>
                  </div>

                  <div style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "#a855f7",
                    background: "var(--surface-3)",
                    padding: "4px 8px",
                    borderRadius: 4,
                    marginBottom: 6,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {ioc.value}
                  </div>

                  <div style={{ fontSize: 11, color: "var(--fg-2)", marginBottom: 6 }}>
                    {ioc.description}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, color: "var(--muted)" }}>
                    <span>Origin: <strong style={{ color: "#06b6d4" }}>{ioc.originatingPlatform}</strong></span>
                    <span>Propagated to: <strong style={{ color: "#10b981" }}>{ioc.propagatedPlatforms.length} fleets</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* IOC Detail & STIX 2.1 Visualizer */}
        <div className="card-tactical" style={{ padding: 16, height: 600, display: "flex", flexDirection: "column" }}>
          {selectedIoc ? (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Shield size={16} color="#10b981" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                    IOC Intel Specification ({selectedIoc.id})
                  </span>
                </div>
                <button
                  onClick={() => setShowStixModal(true)}
                  style={{
                    background: "rgba(168,85,247,0.15)",
                    border: "1px solid rgba(168,85,247,0.4)",
                    color: "#a855f7",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 4,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <Code size={11} />
                  <span>STIX 2.1 View</span>
                </button>
              </div>

              {/* Attributes Card */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, overflowY: "auto" }}>
                <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, marginBottom: 4 }}>INDICATOR PATTERN</div>
                  <div style={{ fontFamily: "monospace", fontSize: 11.5, color: "#34d399", wordBreak: "break-all" }}>
                    {selectedIoc.value}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ background: "var(--surface-2)", padding: 8, borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>Threat Actor</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>{selectedIoc.threatActor}</div>
                  </div>
                  <div style={{ background: "var(--surface-2)", padding: 8, borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>Malware Family</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>{selectedIoc.malwareFamily}</div>
                  </div>
                </div>

                <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, marginBottom: 6 }}>MITRE ATT&CK TACTICS</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {selectedIoc.mitreTactics.map((t, idx) => (
                      <span key={idx} style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: "rgba(245,158,11,0.12)",
                        color: "#f59e0b",
                        border: "1px solid rgba(245,158,11,0.3)",
                        padding: "2px 6px",
                        borderRadius: 4
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, marginBottom: 6 }}>PROPAGATION STATUS ACROSS FLEET</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {selectedIoc.propagatedPlatforms.map((p, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
                        <span style={{ color: "var(--fg-2)" }}>{p.toUpperCase()}</span>
                        <span style={{ color: "#10b981", fontWeight: 700 }}>✓ ACTIVE & ENFORCED</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)" }}>
              Select an indicator to view details
            </div>
          )}
        </div>
      </div>

      {/* Broadcast New IOC Modal */}
      {isCreateModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(6px)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            width: "100%",
            maxWidth: 540,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 22,
            boxShadow: "0 10px 40px rgba(0,0,0,0.6)"
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "#f8fafc", marginBottom: 14 }}>
              Broadcast Threat Indicator across Ecosystem
            </h3>

            <form onSubmit={handleCreateIoc} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    IOC TYPE
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as IOCType)}
                    className="tool-select"
                    style={{ width: "100%" }}
                  >
                    <option value="SHA256">SHA256 Hash</option>
                    <option value="IP_C2">C2 IP Address</option>
                    <option value="DOMAIN">Malicious Domain</option>
                    <option value="YARA_RULE">YARA Rule</option>
                    <option value="SIGMA_RULE">Sigma Rule</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    CONFIDENCE SCORE (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newConfidence}
                    onChange={(e) => setNewConfidence(Number(e.target.value))}
                    className="tool-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  INDICATOR VALUE / SIGNATURE
                </label>
                <input
                  required
                  placeholder="e.g. e3b0c44298fc1c149afbf4c8996fb924... or 185.220.101.44"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="tool-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    THREAT ACTOR
                  </label>
                  <input
                    value={newActor}
                    onChange={(e) => setNewActor(e.target.value)}
                    className="tool-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    MALWARE FAMILY
                  </label>
                  <input
                    value={newMalwareFamily}
                    onChange={(e) => setNewMalwareFamily(e.target.value)}
                    className="tool-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  ANALYSIS SUMMARY
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Context on infection vector, sandbox detonation, or extraction routine..."
                  className="tool-input"
                  style={{ width: "100%", height: 60 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--fg)",
                    padding: "8px 14px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Broadcast STIX 2.1 Bundle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STIX 2.1 JSON Modal */}
      {showStixModal && selectedIoc && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(6px)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            width: "100%",
            maxWidth: 620,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 20,
            boxShadow: "0 10px 40px rgba(0,0,0,0.6)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
                STIX 2.1 JSON Schema Bundle ({selectedIoc.id})
              </h3>
              <button
                onClick={() => setShowStixModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ maxHeight: 360, overflowY: "auto", background: "#050811", border: "1px solid var(--border)", borderRadius: 6, padding: 12, marginBottom: 14 }}>
              <pre style={{ fontFamily: "monospace", fontSize: 11, color: "#34d399", margin: 0, whiteSpace: "pre-wrap" }}>
                {JSON.stringify(getStixJson(selectedIoc), null, 2)}
              </pre>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowStixModal(false)}
                className="btn-primary"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
