"use client";

import React, { useState } from "react";
import {
  Flame,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  Terminal,
  Activity,
  Zap,
  Lock,
  Download,
  Bug,
  Layers,
  Eye,
  Radio
} from "lucide-react";
import { MOCK_CASES, MOCK_REINFECTION_FINDINGS } from "@/data/recoveryData";
import { ReinfectionFinding } from "@/types/recovery";

export default function ReinfectionRiskPage() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [findings, setFindings] = useState<ReinfectionFinding[]>(MOCK_REINFECTION_FINDINGS);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [selectedFinding, setSelectedFinding] = useState<ReinfectionFinding | null>(null);
  const [logs, setLogs] = useState<string[]>([
    "[00:15:02] [HUNTER-ENGINE] Initializing deep persistence hunter v4.2...",
    "[00:15:05] [HUNTER-T1053] Scanning DC01.mercy.local TaskCache registry -> DETECTED 'WindowsUpdateCheck_Svc'",
    "[00:15:10] [HUNTER-T1505] Inspecting IIS wwwroot directories on APP-IIS-04 -> WEBSHELL detected",
    "[00:15:15] [HUNTER-T1071] Analyzing outbound DNS queries on HYPERV-NODE-02 -> Active C2 TXT tunnel detected",
    "[00:15:20] [HUNTER-ENGINE] Scan completed: 3 residual persistence vectors flagged for containment."
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeCase = MOCK_CASES.find(c => c.id === selectedCaseId) || MOCK_CASES[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTriggerScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] [HUNTER-ENGINE] >>> Initiating comprehensive host persistence scan across 24 restored nodes...`,
      ...prev
    ]);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setLogs(logPrev => [
            `[${new Date().toLocaleTimeString()}] [HUNTER-ENGINE] Scan finished. 24 hosts validated. All dormant artifacts mapped to MITRE ATT&CK matrix.`,
            ...logPrev
          ]);
          showToast("Persistence Hunter scan finished successfully. 100% telemetry correlated.");
          return 100;
        }
        return prev + 25;
      });
    }, 450);
  };

  const handleRemediate = (id: string, actionName: string) => {
    setFindings(prev =>
      prev.map(f => (f.id === id ? { ...f, status: "CLEARED" } : f))
    );
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] [REMEDIATION] Successfully executed: ${actionName} on finding ${id}`,
      ...prev
    ]);
    showToast(`Remediation executed: Finding ${id} cleared and quarantined.`);
    if (selectedFinding && selectedFinding.id === id) {
      setSelectedFinding(prev => (prev ? { ...prev, status: "CLEARED" } : null));
    }
  };

  const handleQuarantineHost = (hostName: string) => {
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] [CONTAINMENT] Host ${hostName} isolated into Zero-Trust sandbox VLAN. Inter-VLAN routing severed.`,
      ...prev
    ]);
    showToast(`Host ${hostName} isolated into quarantine sandbox.`);
  };

  const filteredFindings = findings.filter(f => {
    const matchesCat = activeCategory === "ALL" || f.category === activeCategory;
    const matchesSearch =
      f.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.mitreTechnique.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const criticalCount = findings.filter(f => f.severity === "CRITICAL" && f.status !== "CLEARED").length;
  const activeCount = findings.filter(f => f.status === "ACTIVE" || f.status === "QUARANTINED").length;
  const clearedCount = findings.filter(f => f.status === "CLEARED").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast Notification */}
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

      {/* Page Title & Case Context Header */}
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
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Flame size={22} color="#f43f5e" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--fg)" }}>
                Reinfection Risk & Host Persistence Hunter
              </h1>
              <span className="badge-sev badge-critical">PILLAR 4 · VALIDATE</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Continuous deep-inspection of restored systems for dormant adversary footholds, rogue tasks, webshells & C2 beacons.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="tool-select"
            style={{ fontWeight: 600 }}
          >
            {MOCK_CASES.map(c => (
              <option key={c.id} value={c.id}>
                {c.caseNumber}: {c.organization}
              </option>
            ))}
          </select>

          <button
            onClick={handleTriggerScan}
            disabled={isScanning}
            className="btn-primary"
            style={{
              background: isScanning ? "var(--surface-3)" : "var(--primary)",
              cursor: isScanning ? "not-allowed" : "pointer"
            }}
          >
            <RefreshCw size={14} className={isScanning ? "animate-spin" : ""} />
            <span>{isScanning ? `Hunting... ${scanProgress}%` : "Run Deep Persistence Scan"}</span>
          </button>
        </div>
      </div>

      {/* Threat Summary KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #f43f5e" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Critical Footholds
            </span>
            <AlertTriangle size={16} color="#f43f5e" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f43f5e", marginTop: 6 }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Unchecked dormant scheduled tasks & webshells
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Active Vectors Flagged
            </span>
            <Radio size={16} color="#f59e0b" className="animate-pulse" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b", marginTop: 6 }}>
            {activeCount}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Requiring immediate remediation action
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #10b981" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Eradicated Artifacts
            </span>
            <ShieldCheck size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981", marginTop: 6 }}>
            {clearedCount}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Purged & verified by cryptographic hash
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #06b6d4" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Reinfection Risk Index
            </span>
            <Activity size={16} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: activeCase.reinfectionRisk === "CRITICAL" ? "#f43f5e" : activeCase.reinfectionRisk === "HIGH" ? "#f59e0b" : "#10b981", marginTop: 6 }}>
            {activeCase.reinfectionRisk}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Target: Clean (Zero Active Artifacts)
          </div>
        </div>
      </div>

      {/* Main Grid: Persistence Findings & Live Telemetry Terminal */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        {/* Left Column: Filterable Findings Table */}
        <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Filter Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {[
                { key: "ALL", label: "All Findings" },
                { key: "PERSISTENCE", label: "Scheduled Tasks" },
                { key: "WEBSHELL", label: "Webshells" },
                { key: "C2_BEACON", label: "C2 Beacons" },
                { key: "CREDENTIAL_COMPROMISE", label: "AD Accounts" }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 5,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: activeCategory === tab.key ? "rgba(16, 185, 129, 0.2)" : "var(--surface-2)",
                    color: activeCategory === tab.key ? "#10b981" : "var(--muted)",
                    border: activeCategory === tab.key ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid var(--border)"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <Search size={13} color="var(--muted)" style={{ position: "absolute", left: 9, top: 9 }} />
              <input
                type="text"
                placeholder="Search host, CVE, MITRE..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="tool-input"
                style={{ paddingLeft: 28, width: 190 }}
              />
            </div>
          </div>

          {/* Findings Table */}
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Host & IP</th>
                  <th>Category</th>
                  <th>MITRE TTP</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFindings.map(finding => {
                  const isCritical = finding.severity === "CRITICAL";
                  const isCleared = finding.status === "CLEARED";
                  const isQuarantined = finding.status === "QUARANTINED";

                  return (
                    <tr
                      key={finding.id}
                      style={{
                        background: selectedFinding?.id === finding.id ? "rgba(16, 185, 129, 0.08)" : undefined,
                        cursor: "pointer"
                      }}
                      onClick={() => setSelectedFinding(finding)}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--fg)", fontSize: 12 }}>
                          {finding.hostName}
                        </div>
                        <div style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "monospace" }}>
                          {finding.ipAddress}
                        </div>
                      </td>

                      <td>
                        <span style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "var(--surface-3)",
                          color: "#06b6d4"
                        }}>
                          {finding.category}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: 11, fontFamily: "monospace", color: "#f59e0b", fontWeight: 600 }}>
                          {finding.mitreTechnique}
                        </div>
                      </td>

                      <td>
                        <span className={`badge-sev ${isCritical ? "badge-critical" : "badge-high"}`}>
                          {finding.severity}
                        </span>
                      </td>

                      <td>
                        <span className={`badge-sev ${isCleared ? "badge-success" : isQuarantined ? "badge-critical" : "badge-high"}`}>
                          {finding.status}
                        </span>
                      </td>

                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {!isCleared ? (
                            <button
                              onClick={() => handleRemediate(finding.id, finding.remediationAction)}
                              style={{
                                background: "rgba(16, 185, 129, 0.15)",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                                color: "#10b981",
                                padding: "4px 8px",
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4
                              }}
                            >
                              <Zap size={11} />
                              <span>Remediate</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                              <CheckCircle2 size={12} /> Clean
                            </span>
                          )}

                          <button
                            onClick={() => handleQuarantineHost(finding.hostName)}
                            title="Isolate Host"
                            style={{
                              background: "rgba(244, 63, 94, 0.1)",
                              border: "1px solid rgba(244, 63, 94, 0.3)",
                              color: "#f43f5e",
                              padding: "4px 6px",
                              borderRadius: 4,
                              cursor: "pointer"
                            }}
                          >
                            <Lock size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Finding Inspector / Deep Forensics Detail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {selectedFinding ? (
            <div className="card-tactical" style={{ padding: 18, border: "1px solid rgba(16, 185, 129, 0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Bug size={16} color="#f43f5e" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>
                    Persistence Artifact Inspector
                  </span>
                </div>
                <span className={`badge-sev ${selectedFinding.status === "CLEARED" ? "badge-success" : "badge-critical"}`}>
                  {selectedFinding.status}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Host & IP Target
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)", marginTop: 2 }}>
                    {selectedFinding.hostName} ({selectedFinding.ipAddress})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Threat Vector Description
                  </div>
                  <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 2, lineHeight: 1.5, background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
                    {selectedFinding.description}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    MITRE ATT&CK Matrix Mapping
                  </div>
                  <div style={{ fontSize: 12, color: "#06b6d4", fontWeight: 700, marginTop: 2, fontFamily: "monospace" }}>
                    {selectedFinding.mitreTechnique}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Recommended Sanitization Action
                  </div>
                  <div style={{ fontSize: 12, color: "#10b981", marginTop: 2, fontFamily: "monospace", background: "rgba(16,185,129,0.06)", padding: 8, borderRadius: 6, border: "1px solid rgba(16,185,129,0.2)" }}>
                    {selectedFinding.remediationAction}
                  </div>
                </div>

                {selectedFinding.status !== "CLEARED" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <button
                      onClick={() => handleRemediate(selectedFinding.id, selectedFinding.remediationAction)}
                      className="btn-primary"
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      <Zap size={13} />
                      <span>Execute Auto-Eradication</span>
                    </button>
                    <button
                      onClick={() => handleQuarantineHost(selectedFinding.hostName)}
                      className="btn-secondary"
                    >
                      <Lock size={13} color="#f43f5e" />
                      <span>Quarantine</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card-tactical" style={{ padding: 24, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 220 }}>
              <Eye size={28} color="var(--muted)" style={{ opacity: 0.5, marginBottom: 8 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>
                Select an artifact from the table
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, maxWidth: 220 }}>
                Inspect decoded payload, registry paths, and trigger automated eradication routines.
              </div>
            </div>
          )}

          {/* Live Hunter Scan Log Terminal */}
          <div className="card-tactical" style={{ padding: 14, background: "#050810", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Terminal size={13} color="#10b981" />
                <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981", fontFamily: "monospace" }}>
                  AEGIS HUNTER TELEMETRY FEED
                </span>
              </div>
              <span style={{ fontSize: 9.5, color: "var(--muted)", fontFamily: "monospace" }}>
                LIVE STREAM
              </span>
            </div>

            <div style={{
              height: 140,
              overflowY: "auto",
              fontFamily: "monospace",
              fontSize: 11,
              lineHeight: 1.6,
              color: "#cbd5e1",
              display: "flex",
              flexDirection: "column",
              gap: 4
            }}>
              {logs.map((log, i) => (
                <div key={i} style={{ color: log.includes("DETECTED") || log.includes("WEBSHELL") ? "#f43f5e" : log.includes("Successfully") || log.includes("Clean") ? "#10b981" : "#94a3b8" }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MITRE ATT&CK Persistence Matrix Reference Banner */}
      <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Layers size={20} color="#06b6d4" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>
              MITRE ATT&CK Enterprise Matrix (TA0003: Persistence & TA0011: C2)
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              Monitored techniques: T1053 (Scheduled Task), T1543 (Create/Modify System Process), T1505.003 (Webshell), T1071 (Application Layer Protocol C2), T1078 (Valid Accounts).
            </div>
          </div>
        </div>

        <button
          onClick={() => showToast("Exported MITRE ATT&CK persistence vector matrix to STIX 2.1 format.")}
          className="btn-secondary"
        >
          <Download size={13} color="#06b6d4" />
          <span>Export STIX 2.1 Matrix</span>
        </button>
      </div>
    </div>
  );
}
