"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  Flame,
  Radio,
  Sliders,
  Server,
  Terminal,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Search,
  Lock,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu,
  HardDrive,
  Eye,
  Crosshair,
  FileWarning,
  Hash,
  Database
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";
import { EarlyWarningEvent } from "@/types/recovery";

// Rich initial telemetry stream events
const INITIAL_EVENTS: EarlyWarningEvent[] = [
  {
    id: "ew-001",
    timestamp: "2026-08-24T00:32:15Z",
    type: "VSS_DELETE_ATTEMPT",
    host: "DC01.mercy.local",
    ipAddress: "10.14.2.10",
    processName: "vssadmin.exe",
    pid: 8944,
    parentProcess: "cmd.exe",
    parentPid: 4120,
    userAccount: "NT AUTHORITY\\SYSTEM",
    severity: "CRITICAL",
    details: "Kernel hook blocked shadow copy deletion: vssadmin delete shadows /all /quiet",
    commandLine: "vssadmin.exe delete shadows /all /quiet",
    riskScoreContribution: 42,
    status: "INTERCEPTED"
  },
  {
    id: "ew-002",
    timestamp: "2026-08-24T00:32:02Z",
    type: "FILE_BURST",
    host: "FS-CLINICAL-02.mercy.local",
    ipAddress: "10.14.4.18",
    processName: "svchost_updater.exe",
    pid: 6112,
    parentProcess: "powershell.exe",
    parentPid: 5310,
    userAccount: "mercy\\svc_backup_mgmt",
    severity: "CRITICAL",
    details: "Rapid file modification burst detected: 5,420 files/min (.lockbit header append)",
    fileRatePerMin: 5420,
    entropyValue: 7.984,
    riskScoreContribution: 38,
    status: "ACTIVE_ALERT"
  },
  {
    id: "ew-003",
    timestamp: "2026-08-24T00:31:48Z",
    type: "ENTROPY_SPIKE",
    host: "SQL-BILLING-01.mercy.local",
    ipAddress: "10.14.3.22",
    processName: "sqlwriter_proxy.exe",
    pid: 7720,
    parentProcess: "wmic.exe",
    parentPid: 2012,
    userAccount: "mercy\\administrator",
    severity: "HIGH",
    details: "Shannon entropy jumped from 3.24 to 7.992 in C:\\Data\\MDF\\ across 84 files",
    entropyValue: 7.992,
    fileRatePerMin: 1840,
    riskScoreContribution: 28,
    status: "ACTIVE_ALERT"
  },
  {
    id: "ew-004",
    timestamp: "2026-08-24T00:31:12Z",
    type: "SMB_MASS_CONNECT",
    host: "WORKSTATION-RAD-19.mercy.local",
    ipAddress: "10.14.8.94",
    processName: "rundll32.exe",
    pid: 3410,
    parentProcess: "explorer.exe",
    parentPid: 1104,
    userAccount: "mercy\\j.miller",
    severity: "HIGH",
    details: "Mass SMB IPC$ & ADMIN$ connection burst across 64 internal subnets in 12s",
    commandLine: "rundll32.exe \\\\10.14.2.10\\ADMIN$\\stage.dll,DllRegisterServer",
    riskScoreContribution: 22,
    status: "INVESTIGATING"
  },
  {
    id: "ew-005",
    timestamp: "2026-08-24T00:30:45Z",
    type: "CANARY_TOUCH",
    host: "NAS-CORP-01.mercy.local",
    ipAddress: "10.14.5.10",
    processName: "powershell.exe",
    pid: 9028,
    parentProcess: "cmd.exe",
    parentPid: 8812,
    userAccount: "mercy\\svc_backup_mgmt",
    severity: "CRITICAL",
    details: "Sub-500ms unauthorized write tripwire triggered on honeypot ~$2026_Executive_Payroll.xlsx",
    riskScoreContribution: 35,
    status: "INTERCEPTED"
  },
  {
    id: "ew-006",
    timestamp: "2026-08-24T00:29:50Z",
    type: "ENCRYPTION_HEURISTIC",
    host: "PACS-ARCHIVE-04.mercy.local",
    ipAddress: "10.14.6.40",
    processName: "dcm_service.exe",
    pid: 5124,
    parentProcess: "services.exe",
    parentPid: 800,
    userAccount: "mercy\\pacs_svc",
    severity: "MEDIUM",
    details: "High I/O read-rename loop detected on DICOM image repositories: 1,200 IOPS",
    fileRatePerMin: 1200,
    entropyValue: 6.84,
    riskScoreContribution: 15,
    status: "CONTAINED"
  }
];

export default function EarlyWarningPage() {
  const [events, setEvents] = useState<EarlyWarningEvent[]>(INITIAL_EVENTS);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(65);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EarlyWarningEvent | null>(INITIAL_EVENTS[1]);
  const [isolationModalHost, setIsolationModalHost] = useState<EarlyWarningEvent | null>(null);
  const [isolatedHosts, setIsolatedHosts] = useState<Set<string>>(new Set(["PACS-ARCHIVE-04.mercy.local"]));
  const [killedPids, setKilledPids] = useState<Set<number>>(new Set([5124]));
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Periodic simulated live telemetry tick
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      setEvents((prev) => {
        const jitter = Math.floor(Math.random() * 300) - 150;
        return prev.map((ev, idx) => {
          if (idx === 1 && ev.fileRatePerMin) {
            return {
              ...ev,
              fileRatePerMin: Math.max(3800, Math.min(6800, ev.fileRatePerMin + jitter))
            };
          }
          return ev;
        });
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Compute live behavioral risk score
  const computedRiskScore = useMemo(() => {
    const activeAlerts = events.filter((e) => !isolatedHosts.has(e.host) && !killedPids.has(e.pid));
    if (activeAlerts.length === 0) return 12;
    const maxContribution = Math.max(...activeAlerts.map((e) => e.riskScoreContribution));
    const countBonus = Math.min(30, activeAlerts.length * 6);
    return Math.min(98, maxContribution * 1.5 + countBonus);
  }, [events, isolatedHosts, killedPids]);

  const isThresholdBreached = computedRiskScore >= alertThreshold;

  // Filtered event list
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchType = filterType === "ALL" || ev.type === filterType;
      const matchSev = filterSeverity === "ALL" || ev.severity === filterSeverity;
      const matchSearch =
        searchQuery === "" ||
        ev.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.processName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.ipAddress.includes(searchQuery);
      return matchType && matchSev && matchSearch;
    });
  }, [events, filterType, filterSeverity, searchQuery]);

  // Handle 1-click Kill & Isolate
  const handleKillAndIsolate = (event: EarlyWarningEvent) => {
    setKilledPids((prev) => new Set([...prev, event.pid]));
    setIsolatedHosts((prev) => new Set([...prev, event.host]));
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, status: "CONTAINED" } : e))
    );
    setIsolationModalHost(null);
    setActionSuccessMsg(
      `CONTAINMENT EXECUTED: Process PID ${event.pid} (${event.processName}) terminated & Host ${event.host} (${event.ipAddress}) quarantined from network.`
    );
    setTimeout(() => setActionSuccessMsg(null), 6000);
  };

  return (
    <div style={{ padding: "20px 24px", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header Breadcrumbs & Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
            <span style={{ color: "#10b981", fontWeight: 700 }}>STAGE 2: PREVENT</span>
            <span>/</span>
            <span>PRE-ENCRYPTION EARLY WARNING</span>
            <span>/</span>
            <span style={{ color: "var(--fg)" }}>EVENT STREAM INTERCEPTOR</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", color: "#f8fafc" }}>
              Pre-Encryption Early Warning Engine
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
              KERNEL HEURISTICS ACTIVE
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            Sub-second kernel minifilter interceptor detecting mass entropy spikes, shadow copy deletions, and encryption bursts before payloads lock storage.
          </p>
        </div>

        {/* Live Stream Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: isLiveStreaming ? "rgba(16,185,129,0.15)" : "var(--surface-2)",
              border: isLiveStreaming ? "1px solid #10b981" : "1px solid var(--border)",
              color: isLiveStreaming ? "#10b981" : "var(--muted)",
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {isLiveStreaming ? <Pause size={14} /> : <Play size={14} />}
            <span>{isLiveStreaming ? "LIVE INTERCEPTING" : "STREAM PAUSED"}</span>
          </button>

          <button
            onClick={() => {
              setEvents(INITIAL_EVENTS);
              setIsolatedHosts(new Set());
              setKilledPids(new Set());
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <RotateCcw size={14} />
            <span>Reset Telemetry</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessMsg && (
        <div
          style={{
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.4)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#10b981",
            fontSize: 13,
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} />
          <span style={{ flex: 1 }}>{actionSuccessMsg}</span>
          <button
            onClick={() => setActionSuccessMsg(null)}
            style={{ background: "transparent", border: "none", color: "#10b981", cursor: "pointer" }}
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* Top Behavioral Risk Score & Dynamic Threshold Banner */}
      <div
        className="card-tactical"
        style={{
          padding: "18px 20px",
          marginBottom: 20,
          background: isThresholdBreached
            ? "linear-gradient(135deg, rgba(244,63,94,0.12) 0%, rgba(14,21,38,0.95) 70%)"
            : "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(14,21,38,0.95) 70%)",
          border: isThresholdBreached ? "1px solid rgba(244,63,94,0.4)" : "1px solid var(--border)"
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 280px", gap: 24, alignItems: "center" }}>
          {/* Risk Score Dial */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: isThresholdBreached ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.15)",
                border: `3px solid ${isThresholdBreached ? "#f43f5e" : "#10b981"}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isThresholdBreached ? "0 0 25px rgba(244,63,94,0.35)" : "0 0 15px rgba(16,185,129,0.2)"
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 900, color: isThresholdBreached ? "#f43f5e" : "#10b981" }}>
                {Math.round(computedRiskScore)}
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                RISK / 100
              </span>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                BEHAVIORAL RISK POSTURE
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: isThresholdBreached ? "#f43f5e" : "#10b981", marginTop: 2 }}>
                {isThresholdBreached ? "CRITICAL THREAT BREACH" : "NOMINAL TELEMETRY"}
              </div>
              <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>
                Heuristic burst activity on 4 active nodes
              </div>
            </div>
          </div>

          {/* Dynamic Alert Threshold Slider & Formula */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>
                <Sliders size={14} color="#06b6d4" />
                <span>DYNAMIC CONTAINMENT THRESHOLD:</span>
                <span style={{ color: "#06b6d4", fontFamily: "monospace", fontSize: 13 }}>{alertThreshold} / 100</span>
              </div>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                Auto-Quarantine triggers when Risk Score ≥ Threshold
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              style={{
                width: "100%",
                height: 6,
                accentColor: isThresholdBreached ? "#f43f5e" : "#10b981",
                cursor: "pointer"
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)", marginTop: 4, fontFamily: "monospace" }}>
              <span>20 (Ultra-Sensitive / Zero-Trust)</span>
              <span>50 (Balanced SOC)</span>
              <span>80 (High Confidence Only)</span>
            </div>
          </div>

          {/* Automated Containment Recommendation Banner */}
          <div
            style={{
              background: isThresholdBreached ? "rgba(244,63,94,0.18)" : "rgba(16,185,129,0.1)",
              border: isThresholdBreached ? "1px solid #f43f5e" : "1px solid rgba(16,185,129,0.3)",
              borderRadius: 8,
              padding: "12px 14px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <ShieldAlert size={16} color={isThresholdBreached ? "#f43f5e" : "#10b981"} />
              <span style={{ fontSize: 11, fontWeight: 800, color: isThresholdBreached ? "#f43f5e" : "#10b981" }}>
                {isThresholdBreached ? "AUTO-CONTAINMENT RECOMMENDED" : "SURVEILLANCE MODE"}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "var(--fg-2)", lineHeight: 1.4, margin: 0 }}>
              {isThresholdBreached
                ? "Heuristic confidence exceeds 85%. Threat actor actively encrypting files on FS-CLINICAL-02."
                : "Continuous behavioral baseline. Minifilter intercepts standby for abnormal burst deviations."}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Core Real-Time Interceptor Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {/* Metric 1: File Modification Bursts */}
        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              File Modification Burst
            </span>
            <Flame size={16} color="#f43f5e" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f43f5e", marginTop: 6, fontFamily: "monospace" }}>
            5,420 <span style={{ fontSize: 12, color: "var(--muted)" }}>files/min</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            Normal baseline: &lt; 120 files/min
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 10.5, color: "#f43f5e" }}>
            <TrendingUp size={12} />
            <span>4,410% above standard deviation</span>
          </div>
        </div>

        {/* Metric 2: VSS Admin Delete Volume Intercept */}
        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              VSS Shadow Tampering
            </span>
            <ShieldAlert size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b", marginTop: 6, fontFamily: "monospace" }}>
            3 Intercepted <span style={{ fontSize: 12, color: "var(--muted)" }}>/ 0 Succeeded</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            Kernel hook blocked vssadmin & wmic calls
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 10.5, color: "#10b981" }}>
            <CheckCircle2 size={12} />
            <span>100% Shadow Copy Preservation</span>
          </div>
        </div>

        {/* Metric 3: Entropy Spike Alerts */}
        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Shannon Entropy Spike
            </span>
            <Hash size={16} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#06b6d4", marginTop: 6, fontFamily: "monospace" }}>
            7.992 <span style={{ fontSize: 12, color: "var(--muted)" }}>/ 8.0 Max</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            High-entropy cipher signature (ChaCha20)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 10.5, color: "#06b6d4" }}>
            <Activity size={12} />
            <span>Uncompressed ciphertext detected</span>
          </div>
        </div>

        {/* Metric 4: Mass SMB Connection Bursts */}
        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Mass SMB Pipe Bursts
            </span>
            <Layers size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#a855f7", marginTop: 6, fontFamily: "monospace" }}>
            64 Targets <span style={{ fontSize: 12, color: "var(--muted)" }}>in 12s</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 4 }}>
            ADMIN$ IPC enumeration detected
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 10.5, color: "#f43f5e" }}>
            <Zap size={12} />
            <span>Lateral worm propagation halted</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Telemetry Stream Interceptor Table (Left) + Detailed Packet Inspector Drawer (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 20 }}>
        {/* Left: Interceptor Stream Table */}
        <div className="card-tactical" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Radio size={16} color="#10b981" className={isLiveStreaming ? "animate-pulse" : ""} />
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#f8fafc" }}>
                Live Heuristic Event Stream Interceptor
              </h2>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "var(--surface-3)",
                  color: "var(--muted)"
                }}
              >
                {filteredEvents.length} INTERCEPTS
              </span>
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="tool-select"
                style={{ fontSize: 11.5, padding: "4px 8px" }}
              >
                <option value="ALL">All Heuristic Types</option>
                <option value="VSS_DELETE_ATTEMPT">VSS Shadow Deletes</option>
                <option value="FILE_BURST">File Modification Bursts</option>
                <option value="ENTROPY_SPIKE">Entropy Spikes</option>
                <option value="SMB_MASS_CONNECT">SMB Lateral Bursts</option>
                <option value="CANARY_TOUCH">Canary Decoys</option>
                <option value="ENCRYPTION_HEURISTIC">Encryption Heuristics</option>
              </select>

              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="tool-select"
                style={{ fontSize: 11.5, padding: "4px 8px" }}
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical Only</option>
                <option value="HIGH">High Only</option>
                <option value="MEDIUM">Medium Only</option>
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <Search size={14} color="var(--muted)" style={{ position: "absolute", left: 10, top: 10 }} />
            <input
              type="text"
              placeholder="Search by Host, IP, PID, Process Name, or Heuristic detail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tool-input"
              style={{ width: "100%", paddingLeft: 32, fontSize: 12 }}
            />
          </div>

          {/* Event Stream Table */}
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Severity</th>
                  <th>Host / IP</th>
                  <th>Process / PID</th>
                  <th>Heuristic Signature</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((ev) => {
                  const isIsolated = isolatedHosts.has(ev.host);
                  const isKilled = killedPids.has(ev.pid);
                  const isSelected = selectedEvent?.id === ev.id;

                  return (
                    <tr
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      style={{
                        cursor: "pointer",
                        background: isSelected ? "rgba(16,185,129,0.08)" : undefined,
                        borderLeft: isSelected ? "3px solid #10b981" : "3px solid transparent"
                      }}
                    >
                      <td style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)" }}>
                        {ev.timestamp.split("T")[1].replace("Z", "")} UTC
                      </td>
                      <td>
                        <span
                          className={`badge-sev ${
                            ev.severity === "CRITICAL"
                              ? "badge-critical"
                              : ev.severity === "HIGH"
                              ? "badge-high"
                              : "badge-medium"
                          }`}
                        >
                          {ev.severity}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: isIsolated ? "#f43f5e" : "#f8fafc", fontSize: 12 }}>
                          {ev.host}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                          {ev.ipAddress}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontWeight: 600, color: isKilled ? "var(--muted)" : "#06b6d4" }}>
                            {ev.processName}
                          </span>
                          <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                            (PID {ev.pid})
                          </span>
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted)" }}>
                          User: {ev.userAccount}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 11.5, color: "var(--fg)", fontWeight: 500 }}>
                          {ev.details}
                        </div>
                        {ev.fileRatePerMin && (
                          <div style={{ fontSize: 10.5, color: "#f43f5e", fontFamily: "monospace", marginTop: 2 }}>
                            Rate: {ev.fileRatePerMin} files/min | Entropy: {ev.entropyValue}
                          </div>
                        )}
                      </td>
                      <td>
                        {isIsolated || isKilled ? (
                          <span className="badge-sev badge-success">
                            CONTAINED
                          </span>
                        ) : (
                          <span
                            className={`badge-sev ${
                              ev.status === "ACTIVE_ALERT"
                                ? "badge-critical"
                                : ev.status === "INTERCEPTED"
                                ? "badge-high"
                                : "badge-medium"
                            }`}
                          >
                            {ev.status.replace("_", " ")}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsolationModalHost(ev);
                          }}
                          disabled={isIsolated && isKilled}
                          style={{
                            background: isIsolated ? "rgba(255,255,255,0.05)" : "rgba(244,63,94,0.15)",
                            border: isIsolated ? "1px solid var(--border)" : "1px solid rgba(244,63,94,0.4)",
                            color: isIsolated ? "var(--muted)" : "#f43f5e",
                            padding: "4px 10px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: isIsolated ? "not-allowed" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4
                          }}
                        >
                          <Zap size={11} />
                          <span>{isIsolated ? "Quarantined" : "Kill & Isolate"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Heuristic Inspector & Live Process Containment Drawer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {selectedEvent ? (
            <div className="card-tactical" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                  <Eye size={15} color="#06b6d4" />
                  <span>Heuristic Forensics Inspector</span>
                </div>
                <span className="badge-sev badge-critical">
                  +{selectedEvent.riskScoreContribution} RISK
                </span>
              </div>

              {/* Process & Execution Details */}
              <div style={{ background: "var(--surface-2)", borderRadius: 6, padding: "12px", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                  Target Endpoint
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>
                  {selectedEvent.host}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
                  IP: {selectedEvent.ipAddress} | User: {selectedEvent.userAccount}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <div style={{ background: "var(--surface-2)", borderRadius: 6, padding: "10px" }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Process Name
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#06b6d4", marginTop: 2 }}>
                    {selectedEvent.processName}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                    PID: {selectedEvent.pid}
                  </div>
                </div>

                <div style={{ background: "var(--surface-2)", borderRadius: 6, padding: "10px" }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Parent Process
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>
                    {selectedEvent.parentProcess}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                    PPID: {selectedEvent.parentPid}
                  </div>
                </div>
              </div>

              {/* Command Line Payload */}
              <div style={{ background: "var(--surface-2)", borderRadius: 6, padding: "10px", marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
                  Intercepted Command / Argument
                </div>
                <pre
                  style={{
                    background: "#070b12",
                    padding: "8px 10px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontFamily: "monospace",
                    color: "#f43f5e",
                    overflowX: "auto",
                    margin: 0
                  }}
                >
                  {selectedEvent.commandLine || selectedEvent.details}
                </pre>
              </div>

              {/* Live Heuristic Metrics */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "var(--muted)" }}>Burst Rate:</span>
                  <span style={{ color: selectedEvent.fileRatePerMin ? "#f43f5e" : "var(--fg)", fontFamily: "monospace", fontWeight: 700 }}>
                    {selectedEvent.fileRatePerMin ? `${selectedEvent.fileRatePerMin} files/min` : "N/A"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "var(--muted)" }}>Shannon Entropy:</span>
                  <span style={{ color: selectedEvent.entropyValue ? "#06b6d4" : "var(--fg)", fontFamily: "monospace", fontWeight: 700 }}>
                    {selectedEvent.entropyValue ? `${selectedEvent.entropyValue} (Extreme)` : "N/A"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "var(--muted)" }}>Mitre ATT&CK:</span>
                  <span style={{ color: "#f59e0b", fontWeight: 600 }}>
                    {selectedEvent.type === "VSS_DELETE_ATTEMPT"
                      ? "T1490 (Inhibit Recovery)"
                      : selectedEvent.type === "FILE_BURST"
                      ? "T1486 (Data Encrypted)"
                      : selectedEvent.type === "SMB_MASS_CONNECT"
                      ? "T1021.002 (SMB/Windows Admin Shares)"
                      : "T1059 (Command & Scripting)"}
                  </span>
                </div>
              </div>

              {/* 1-Click Action Button */}
              <button
                onClick={() => setIsolationModalHost(selectedEvent)}
                disabled={isolatedHosts.has(selectedEvent.host)}
                style={{
                  width: "100%",
                  background: isolatedHosts.has(selectedEvent.host)
                    ? "rgba(255,255,255,0.05)"
                    : "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
                  color: "#fff",
                  fontWeight: 800,
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "none",
                  cursor: isolatedHosts.has(selectedEvent.host) ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 13,
                  boxShadow: isolatedHosts.has(selectedEvent.host) ? "none" : "0 0 15px rgba(244,63,94,0.4)"
                }}
              >
                <Zap size={16} />
                <span>
                  {isolatedHosts.has(selectedEvent.host)
                    ? "HOST ALREADY ISOLATED"
                    : `KILL PID ${selectedEvent.pid} & ISOLATE HOST`}
                </span>
              </button>
            </div>
          ) : (
            <div className="card-tactical" style={{ padding: "24px", textAlign: "center", color: "var(--muted)" }}>
              Select an event from the intercept stream to inspect raw telemetry.
            </div>
          )}

          {/* Automated Defense Playbook Status */}
          <div className="card-tactical" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Terminal size={15} color="#10b981" />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>
                Proactive Defense Micro-Rules
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "var(--fg-2)" }}>VSS Shadow Deletion Blocking:</span>
                <span style={{ color: "#10b981", fontWeight: 700 }}>ACTIVE (Minifilter)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "var(--fg-2)" }}>Entropy Burst Throttling:</span>
                <span style={{ color: "#10b981", fontWeight: 700 }}>ACTIVE (&gt;7.8 H)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "var(--fg-2)" }}>Canary Tripwire Webhook:</span>
                <span style={{ color: "#10b981", fontWeight: 700 }}>CONNECTED (24 Shares)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "var(--fg-2)" }}>Memory Forensics Preservation:</span>
                <span style={{ color: "#06b6d4", fontWeight: 700 }}>AUTO-DUMP ON KILL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & Execution Modal for 1-Click Kill Process & Isolate Host */}
      {isolationModalHost && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(7,11,18,0.85)",
            backdropFilter: "blur(6px)",
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
              maxWidth: 540,
              width: "100%",
              padding: "24px",
              background: "var(--surface)",
              border: "1px solid #f43f5e",
              boxShadow: "0 0 40px rgba(244,63,94,0.3)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "rgba(244,63,94,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Zap size={20} color="#f43f5e" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
                  CONFIRM EMERGENCY CONTAINMENT
                </h3>
                <div style={{ fontSize: 11, color: "#f43f5e", fontWeight: 700 }}>
                  Target: {isolationModalHost.host} (PID {isolationModalHost.pid})
                </div>
              </div>
            </div>

            <p style={{ fontSize: 12.5, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 16 }}>
              Executing this action will immediately invoke the following emergency ransomware containment sequence:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--fg)" }}>
                <CheckCircle2 size={15} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                <span>
                  <strong>Terminate Rogue Process:</strong> Force-kill PID {isolationModalHost.pid} ({isolationModalHost.processName}) and revoke process tokens.
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--fg)" }}>
                <CheckCircle2 size={15} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                <span>
                  <strong>Network Micro-Isolation:</strong> Sever all outbound & lateral TCP/UDP sockets on {isolationModalHost.ipAddress} (preserve Aegis agent channel).
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--fg)" }}>
                <CheckCircle2 size={15} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                <span>
                  <strong>Evidence Volatiles Dump:</strong> Trigger instant RAM snapshot and process memory dump to WORM evidence vault before process teardown.
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setIsolationModalHost(null)}
                className="btn-secondary"
                style={{ fontSize: 12 }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleKillAndIsolate(isolationModalHost)}
                style={{
                  background: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
                  color: "#fff",
                  fontWeight: 800,
                  padding: "8px 18px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <Zap size={14} />
                <span>CONFIRM & EXECUTE CONTAINMENT</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
