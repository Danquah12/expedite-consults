"use client";

import React, { useState, useMemo } from "react";
import {
  History,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Users,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  Plus,
  RefreshCw,
  Printer,
  DollarSign
} from "lucide-react";

interface PostMortemFinding {
  id: string;
  category: "INITIAL_ACCESS" | "IDENTITY" | "LATERAL_MOVEMENT" | "BACKUPS" | "DETECTION";
  title: string;
  rootCauseAnalysis: string;
  mitreTechnique: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  impactDescription: string;
  detectionLagMinutes: number;
}

interface RoadmapItem {
  id: string;
  phase: "P0_IMMEDIATE" | "P1_7_DAYS" | "P2_30_DAYS" | "P3_90_DAYS";
  phaseTitle: string;
  title: string;
  description: string;
  category: "Patching" | "Identity & MFA" | "Network Segmentation" | "Immutable Backups" | "Governance & Testing";
  owner: string;
  targetCompletion: string;
  estimatedCostUSD: number;
  riskReductionPct: number;
  status: "COMPLETED" | "IN_PROGRESS" | "QUEUED" | "BLOCKED";
  linkedFindingId: string;
}

const POST_MORTEM_FINDINGS: PostMortemFinding[] = [
  {
    id: "f-01",
    category: "INITIAL_ACCESS",
    title: "Compromised Edge VPN Gateway Credentials (No Geofencing)",
    rootCauseAnalysis: "Adversary used stolen credentials on legacy SSL-VPN portal lacking hardware token FIDO2 MFA and source geofencing.",
    mitreTechnique: "T1078.002 (Valid Domain Accounts)",
    severity: "CRITICAL",
    impactDescription: "Provided unconstrained initial foothold into corporate DMZ subnet within 12 minutes of session initiation.",
    detectionLagMinutes: 42
  },
  {
    id: "f-02",
    category: "IDENTITY",
    title: "Unconstrained Kerberos Delegation & Service Account Overprivilege",
    rootCauseAnalysis: "Service account 'svc_backup_mgmt' possessed Domain Admin rights and unconstrained delegation, enabling DCSync ticket forging.",
    mitreTechnique: "T1003.006 (DCSync) / T1558 (Kerberoasting)",
    severity: "CRITICAL",
    impactDescription: "Permitted rapid enterprise-wide privilege escalation to Golden Ticket persistence.",
    detectionLagMinutes: 18
  },
  {
    id: "f-03",
    category: "LATERAL_MOVEMENT",
    title: "Flat Inter-VLAN Clinical Routing & Open SMB Ports",
    rootCauseAnalysis: "Absence of micro-segmentation between office workstations and SQL clinical database allowed automated PsExec/WMI lateral spread.",
    mitreTechnique: "T1021.002 (SMB/Windows Admin Shares)",
    severity: "HIGH",
    impactDescription: "Accelerated malware propagation across 24 clinical hosts in under 35 minutes.",
    detectionLagMinutes: 24
  },
  {
    id: "f-04",
    category: "BACKUPS",
    title: "Local Volume Shadow Copy Deletion via vssadmin",
    rootCauseAnalysis: "Adversary executed automated shadow copy purge commands on Hyper-V hosts prior to encryption burst; on-host recovery crippled.",
    mitreTechnique: "T1490 (Inhibit System Recovery)",
    severity: "HIGH",
    impactDescription: "Forced full recovery dependency onto secondary S3 immutable cloud tier.",
    detectionLagMinutes: 6
  }
];

const INITIAL_ROADMAP: RoadmapItem[] = [
  {
    id: "rd-01",
    phase: "P0_IMMEDIATE",
    phaseTitle: "P0: Immediate Containment (0 - 24 Hours)",
    title: "Enforce Enterprise Kerberos KRBTGT Double-Roll",
    description: "Invalidate all existing Golden Tickets and Kerberos TGTs by cycling KRBTGT password twice with full replication check.",
    category: "Identity & MFA",
    owner: "SecOps IAM Lead (Sarah Jenkins)",
    targetCompletion: "Day 1 (Completed)",
    estimatedCostUSD: 0,
    riskReductionPct: 35,
    status: "COMPLETED",
    linkedFindingId: "f-02"
  },
  {
    id: "rd-02",
    phase: "P0_IMMEDIATE",
    phaseTitle: "P0: Immediate Containment (0 - 24 Hours)",
    title: "Emergency Port 445 / 3389 Inter-VLAN Block",
    description: "Sever all lateral SMB and RDP routing between User Workstation and Server VLANs at core Palo Alto firewall.",
    category: "Network Segmentation",
    owner: "NetOps Director (Dave Chen)",
    targetCompletion: "Day 1 (Completed)",
    estimatedCostUSD: 2500,
    riskReductionPct: 25,
    status: "COMPLETED",
    linkedFindingId: "f-03"
  },
  {
    id: "rd-03",
    phase: "P1_7_DAYS",
    phaseTitle: "P1: 7-Day Hardening & Inoculation",
    title: "Emergency CVE-2024-3400 & Citrix Gateway Patching",
    description: "Deploy latest vendor security hotfixes to all 6 perimeter VPN gateways and rotate SSL certificates.",
    category: "Patching",
    owner: "Infra Security (Marcus Vance)",
    targetCompletion: "Day 3 (In Progress)",
    estimatedCostUSD: 8000,
    riskReductionPct: 20,
    status: "IN_PROGRESS",
    linkedFindingId: "f-01"
  },
  {
    id: "rd-04",
    phase: "P1_7_DAYS",
    phaseTitle: "P1: 7-Day Hardening & Inoculation",
    title: "Enterprise Windows LAPS 2.0 Deployment",
    description: "Automate unique, randomized 24-character local administrator passwords across 100% of endpoints backed by Azure AD.",
    category: "Identity & MFA",
    owner: "Endpoint Engineering (Elena Rostova)",
    targetCompletion: "Day 6",
    estimatedCostUSD: 12000,
    riskReductionPct: 18,
    status: "IN_PROGRESS",
    linkedFindingId: "f-02"
  },
  {
    id: "rd-05",
    phase: "P2_30_DAYS",
    phaseTitle: "P2: 30-Day Architectural Resilience",
    title: "AWS S3 Object Lock Compliance Mode Enforcement",
    description: "Migrate all secondary PACS imaging and clinical databases to strict immutable WORM buckets with 90-day retention lock.",
    category: "Immutable Backups",
    owner: "Cloud Storage Lead (Alex Thorne)",
    targetCompletion: "Day 21",
    estimatedCostUSD: 45000,
    riskReductionPct: 30,
    status: "QUEUED",
    linkedFindingId: "f-04"
  },
  {
    id: "rd-06",
    phase: "P2_30_DAYS",
    phaseTitle: "P2: 30-Day Architectural Resilience",
    title: "Zero-Trust Microsegmentation for Epic EHR Clusters",
    description: "Deploy host-based micro-firewall policies (Illumio / NSX) restricting EHR database communication exclusively to verified app servers.",
    category: "Network Segmentation",
    owner: "NetOps Security Team",
    targetCompletion: "Day 28",
    estimatedCostUSD: 65000,
    riskReductionPct: 22,
    status: "QUEUED",
    linkedFindingId: "f-03"
  },
  {
    id: "rd-07",
    phase: "P3_90_DAYS",
    phaseTitle: "P3: 90-Day Strategic Transformation",
    title: "Continuous Sandbox Auto-Restore Verification Engine",
    description: "Implement automated daily boot and database DBCC CHECKDB integrity tests for all Tier-0 infrastructure in air-gapped testbed.",
    category: "Governance & Testing",
    owner: "DR Operations Lead",
    targetCompletion: "Day 75",
    estimatedCostUSD: 35000,
    riskReductionPct: 15,
    status: "QUEUED",
    linkedFindingId: "f-04"
  },
  {
    id: "rd-08",
    phase: "P3_90_DAYS",
    phaseTitle: "P3: 90-Day Strategic Transformation",
    title: "Adversary Emulation & Quarterly Ransomware Tabletop",
    description: "Retain external red-team to execute full cyber kill chain simulations mimicking FIN12 and BlackCat TTPs against production defenses.",
    category: "Governance & Testing",
    owner: "CISO Office",
    targetCompletion: "Day 90",
    estimatedCostUSD: 50000,
    riskReductionPct: 12,
    status: "QUEUED",
    linkedFindingId: "f-01"
  }
];

export default function LessonsLearnedPage() {
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>(INITIAL_ROADMAP);
  const [selectedPhase, setSelectedPhase] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showExecutiveModal, setShowExecutiveModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered Roadmap
  const filteredRoadmap = useMemo(() => {
    return roadmap.filter(item => {
      const matchPhase = selectedPhase === "ALL" || item.phase === selectedPhase;
      const matchCategory = selectedCategory === "ALL" || item.category === selectedCategory;
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.owner.toLowerCase().includes(searchQuery.toLowerCase());
      return matchPhase && matchCategory && matchSearch;
    });
  }, [roadmap, selectedPhase, selectedCategory, searchQuery]);

  // Real-time roadmap stats
  const metrics = useMemo(() => {
    const total = roadmap.length;
    const completed = roadmap.filter(r => r.status === "COMPLETED").length;
    const inProgress = roadmap.filter(r => r.status === "IN_PROGRESS").length;
    const queued = roadmap.filter(r => r.status === "QUEUED").length;
    const totalBudget = roadmap.reduce((acc, r) => acc + r.estimatedCostUSD, 0);
    const completedBudget = roadmap.filter(r => r.status === "COMPLETED").reduce((acc, r) => acc + r.estimatedCostUSD, 0);
    const progressPct = Math.round((completed / (total || 1)) * 100);

    return {
      total,
      completed,
      inProgress,
      queued,
      totalBudget,
      completedBudget,
      progressPct
    };
  }, [roadmap]);

  const toggleTaskStatus = (id: string) => {
    setRoadmap(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        let next: RoadmapItem["status"] = "COMPLETED";
        if (item.status === "COMPLETED") next = "IN_PROGRESS";
        else if (item.status === "IN_PROGRESS") next = "QUEUED";
        else next = "COMPLETED";
        return { ...item, status: next };
      })
    );
    setToastMessage("Roadmap milestone status updated.");
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
              POST-INCIDENT SYNTHESIS & ROADMAP ENGINE
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              Case INC-2026-8841 (Mercy General Health) · LockBit 3.0 Post-Mortem
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", color: "var(--fg)", margin: 0 }}>
            Automated Lessons-Learned & Strategic Security Roadmap
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 4, maxWidth: 880 }}>
            Synthesizes root-cause control failures and detection gaps from active incident telemetry, converting tactical post-mortem lessons into an executable, cost-modeled 4-phase security remediation roadmap.
          </p>
        </div>

        {/* Header Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setShowExecutiveModal(true)}
            className="btn-secondary"
          >
            <History size={14} color="var(--cyan)" />
            View Executive Post-Mortem
          </button>

          <button
            onClick={() => {
              const exportData = {
                incident: "INC-2026-8841",
                postMortemFindings: POST_MORTEM_FINDINGS,
                remediationRoadmap: roadmap,
                metrics
              };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `Aegis-Lessons-Learned-Roadmap-INC-2026-8841.json`;
              a.click();
              setToastMessage("Roadmap & Post-Mortem exported for Jira / ServiceNow ingestion.");
              setTimeout(() => setToastMessage(null), 3000);
            }}
            className="btn-primary"
          >
            <Download size={14} />
            Export Jira / ServiceNow Tasks
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {/* Progress Card */}
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Roadmap Execution</span>
            <CheckCircle2 size={16} color="var(--primary)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: "var(--fg)" }}>{metrics.progressPct}%</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>({metrics.completed} / {metrics.total} Done)</span>
          </div>
          <div style={{ width: "100%", height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${metrics.progressPct}%`, height: "100%", background: "var(--primary)", transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* Investment Budget */}
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--cyan)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Total Hardening Budget</span>
            <DollarSign size={16} color="var(--cyan)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: "var(--fg)" }}>${(metrics.totalBudget / 1000).toFixed(0)}k</span>
            <span style={{ fontSize: 11.5, color: "var(--cyan)", fontWeight: 700 }}>Projected Capex</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
            Committed: ${(metrics.completedBudget / 1000).toFixed(1)}k · 8 Strategic Initiatives
          </div>
        </div>

        {/* Risk Mitigation */}
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--amber)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Ransomware Recurrence Risk</span>
            <TrendingUp size={16} color="var(--amber)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: "var(--amber)" }}>-84%</span>
            <span style={{ fontSize: 12, color: "var(--fg-2)" }}>Risk Reduction</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
            Post-remediation posture closes 100% of identified entry vectors
          </div>
        </div>

        {/* Post-Mortem Control Failures */}
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--rose)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Synthesized Root Causes</span>
            <ShieldAlert size={16} color="var(--rose)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: "var(--fg)" }}>{POST_MORTEM_FINDINGS.length}</span>
            <span style={{ fontSize: 11.5, color: "var(--rose)", fontWeight: 700 }}>Control Gaps Found</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
            2 Critical (Initial Access & Identity) · 2 High (Segmentation & Backups)
          </div>
        </div>
      </div>

      {/* Post-Mortem Synthesized Findings Carousel / Grid */}
      <div className="card-tactical" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={16} color="var(--primary)" />
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)", margin: 0, letterSpacing: "-0.01em" }}>
              Incident Root-Cause Control Failures & Detection Gaps
            </h2>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
            CORRELATED FROM AEGIS KILL CHAIN TELEMETRY
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          {POST_MORTEM_FINDINGS.map((finding) => (
            <div
              key={finding.id}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                borderTop: finding.severity === "CRITICAL" ? "3px solid var(--rose)" : "3px solid var(--amber)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: finding.severity === "CRITICAL" ? "rgba(244,63,94,0.15)" : "rgba(245,158,11,0.15)",
                  color: finding.severity === "CRITICAL" ? "var(--rose)" : "var(--amber)",
                  fontFamily: "monospace"
                }}>
                  {finding.severity} · {finding.category}
                </span>
                <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                  {finding.mitreTechnique}
                </span>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>
                {finding.title}
              </div>

              <div style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.45 }}>
                {finding.rootCauseAnalysis}
              </div>

              <div style={{
                marginTop: "auto",
                paddingTop: 8,
                borderTop: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 10.5,
                color: "var(--muted)"
              }}>
                <span>Detection Lag: <strong style={{ color: "var(--rose)" }}>{finding.detectionLagMinutes} min</strong></span>
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>Linked to Roadmap P0/P1</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Remediation Roadmap Engine & Interactive Gantt / Task Board */}
      <div className="card-tactical" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Filter Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>PHASE:</span>
            {["ALL", "P0_IMMEDIATE", "P1_7_DAYS", "P2_30_DAYS", "P3_90_DAYS"].map(ph => (
              <button
                key={ph}
                onClick={() => setSelectedPhase(ph)}
                style={{
                  background: selectedPhase === ph ? "var(--primary)" : "var(--surface-2)",
                  color: selectedPhase === ph ? "#04100c" : "var(--fg-2)",
                  border: selectedPhase === ph ? "none" : "1px solid var(--border)",
                  padding: "5px 12px",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {ph === "ALL" ? "All Phases" : ph.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: 9, color: "var(--muted)" }} />
              <input
                type="text"
                placeholder="Search remediation tasks, owners, CVEs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tool-input"
                style={{ paddingLeft: 30, width: 280 }}
              />
            </div>
          </div>
        </div>

        {/* Roadmap Items List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredRoadmap.map((item) => (
            <div
              key={item.id}
              style={{
                background: "var(--surface-2)",
                border: `1px solid ${item.status === "COMPLETED" ? "rgba(16,185,129,0.3)" : item.status === "IN_PROGRESS" ? "rgba(6,182,212,0.4)" : "var(--border)"}`,
                borderRadius: 8,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
                transition: "all 0.15s ease"
              }}
            >
              {/* Left Details */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 320 }}>
                <button
                  onClick={() => toggleTaskStatus(item.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    marginTop: 2
                  }}
                  title="Click to toggle status"
                >
                  {item.status === "COMPLETED" ? (
                    <CheckCircle2 size={20} color="var(--primary)" />
                  ) : item.status === "IN_PROGRESS" ? (
                    <Clock size={20} color="var(--cyan)" />
                  ) : (
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid var(--muted)" }} />
                  )}
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--fg-2)",
                      border: "1px solid var(--border)",
                      fontFamily: "monospace"
                    }}>
                      {item.phaseTitle.split(":")[0]}
                    </span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--cyan)" }}>
                      {item.category}
                    </span>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--fg)" }}>
                      {item.title}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.45 }}>
                    {item.description}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                    <span>Owner: <strong style={{ color: "var(--fg)" }}>{item.owner}</strong></span>
                    <span>Target: <strong style={{ color: "var(--fg)" }}>{item.targetCompletion}</strong></span>
                    <span>Estimated Capex: <strong style={{ color: "var(--fg)" }}>${item.estimatedCostUSD.toLocaleString()}</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Stats & Status Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 2
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)" }}>
                    +{item.riskReductionPct}% Risk Defense
                  </span>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>
                    Validated against TTPs
                  </span>
                </div>

                <button
                  onClick={() => toggleTaskStatus(item.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                    border: "none",
                    background:
                      item.status === "COMPLETED"
                        ? "rgba(16,185,129,0.18)"
                        : item.status === "IN_PROGRESS"
                        ? "rgba(6,182,212,0.18)"
                        : "rgba(255,255,255,0.06)",
                    color:
                      item.status === "COMPLETED"
                        ? "var(--primary)"
                        : item.status === "IN_PROGRESS"
                        ? "var(--cyan)"
                        : "var(--muted)",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor:
                      item.status === "COMPLETED"
                        ? "rgba(16,185,129,0.4)"
                        : item.status === "IN_PROGRESS"
                        ? "rgba(6,182,212,0.4)"
                        : "var(--border)"
                  }}
                >
                  {item.status.replace(/_/g, " ")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Executive Briefing Modal */}
      {showExecutiveModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          padding: 20
        }}>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            width: "100%",
            maxWidth: 780,
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(6,182,212,0.15)",
                  color: "var(--cyan)",
                  padding: "3px 8px",
                  borderRadius: 4,
                  fontSize: 10.5,
                  fontWeight: 800,
                  marginBottom: 6
                }}>
                  <History size={13} />
                  EXECUTIVE POST-MORTEM SYNTHESIS BRIEFING
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--fg)", margin: 0 }}>
                  Board & Executive Post-Incident Briefing (INC-2026-8841)
                </h2>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  Prepared for: Board of Directors & Risk Committee · Lead: Elena Rostova, CISSP
                </div>
              </div>

              <button
                onClick={() => setShowExecutiveModal(false)}
                style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Briefing Narrative */}
            <div style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              fontSize: 12.5,
              color: "var(--fg-2)",
              lineHeight: 1.6
            }}>
              <div>
                <strong style={{ color: "var(--fg)" }}>Incident Overview:</strong> On August 23, 2026, Mercy General Health System detected an unauthorized intrusion attributed to FIN12 deploying LockBit 3.0. 24 virtualized endpoints were affected before micro-segmentation successfully isolated patient diagnostic networks.
              </div>
              <div>
                <strong style={{ color: "var(--fg)" }}>Root-Cause Finding:</strong> Initial ingress was achieved via an unpatched perimeter VPN gateway without FIDO2 hardware MFA. Overprivileged service account permissions enabled Kerberos ticket manipulation.
              </div>
              <div>
                <strong style={{ color: "var(--fg)" }}>Zero-Ransom Resolution:</strong> S3 WORM immutable backups remained uncompromised. 100% of clinical data was recovered in 18.5 hours with zero ransom paid and zero recorded data leakage.
              </div>
              <div>
                <strong style={{ color: "var(--fg)" }}>Remediation Commitment:</strong> An 8-point strategic roadmap totaling $217,500 has been initiated to achieve zero-trust architecture and secure preferred cyber insurance terms.
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <button
                onClick={() => window.print()}
                className="btn-secondary"
              >
                <Printer size={14} />
                Print Executive Summary
              </button>
              <button
                onClick={() => setShowExecutiveModal(false)}
                className="btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
