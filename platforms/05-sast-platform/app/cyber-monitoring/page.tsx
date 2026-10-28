"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Sparkles,
  CheckCircle2,
  Filter,
  Play,
  Download,
  Code2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { openAskNoctisPopup } from "@/components/DeveloperAssistAgent";
import { loadActiveScanSession } from "@/lib/live-sast-scanner";
import {
  CYBER_VULN_KPI_SUMMARY,
  OPEN_RISK_INSTANCES,
  OPEN_DEPLOYMENT_INSTANCES,
  ANTIVIRUS_PERFORMANCE_KPIS,
  MONITORED_HOSTS_BY_OS,
  ACTIVITY_DETECTION_TIMELINE,
  MOST_RECENT_DETECTIONS,
  XTRIKE_FLEET_OVERVIEW,
  XTRIKE_TOP_ALERTERS,
  XTRIKE_HONEYCOMB_HOSTS,
  XTRIKE_DISTRO_ACCORDION_GROUPS,
  XTRIKE_OMD_RUNTIME_SPEC,
  type DeploymentEnvironmentBar,
  type RecentDetectionRecord,
  type XtrikeHexHostCell,
  type XtrikeDistroReleaseRow,
} from "@/lib/cyber-monitoring-data";

type ActiveTab = "all" | "vuln-kpi" | "antivirus-kpi" | "fleet-live" | "omd-install";

export default function CyberMonitoringPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [selectedEnv, setSelectedEnv] = useState<DeploymentEnvironmentBar | null>(
    OPEN_DEPLOYMENT_INSTANCES[0]
  );
  const [selectedDetection, setSelectedDetection] = useState<RecentDetectionRecord | null>(
    MOST_RECENT_DETECTIONS[0]
  );
  const [selectedHexHost, setSelectedHexHost] = useState<XtrikeHexHostCell | null>(
    XTRIKE_HONEYCOMB_HOSTS[1]
  );
  const [showMonitorTip, setShowMonitorTip] = useState(true);
  const [monitorTipStep, setMonitorTipStep] = useState(0);
  const [showOverviewTooltip, setShowOverviewTooltip] = useState(true);
  const [showNextActionModal, setShowNextActionModal] = useState(false);
  const [selectedNextOption, setSelectedNextOption] = useState("Ask a question");
  const [checklistState, setChecklistState] = useState<boolean[]>([false, false, false]);
  const [liveScanCount, setLiveScanCount] = useState<number | null>(null);
  const [liveScanRepo, setLiveScanRepo] = useState<string | null>(null);

  // Accordion & OMD Installer state
  const [openDistros, setOpenDistros] = useState<Record<string, boolean>>({
    ubuntu: true,
    debian: false,
    sles: false,
    redhat: false,
  });
  const [selectedReleaseRow, setSelectedReleaseRow] = useState<XtrikeDistroReleaseRow>(
    XTRIKE_DISTRO_ACCORDION_GROUPS[0].releases[0]
  );
  const [visibleHashKey, setVisibleHashKey] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("monitoring");
  const [omdSiteRunning, setOmdSiteRunning] = useState(true);
  const [copiedCmdKey, setCopiedCmdKey] = useState<string | null>(null);

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmdKey(key);
    setTimeout(() => setCopiedCmdKey(null), 2000);
  };

  useEffect(() => {
    const syncLiveScan = () => {
      const session = loadActiveScanSession();
      if (session && Array.isArray(session.sastFindings)) {
        setLiveScanCount(session.sastFindings.length);
        setLiveScanRepo(session.repoUrl || "Active Scan Repository");
      } else {
        setLiveScanCount(null);
        setLiveScanRepo(null);
      }
    };
    syncLiveScan();
    window.addEventListener("xtrike-scan-updated", syncLiveScan);
    window.addEventListener("xtrike-scan-cleared", syncLiveScan);
    return () => {
      window.removeEventListener("xtrike-scan-updated", syncLiveScan);
      window.removeEventListener("xtrike-scan-cleared", syncLiveScan);
    };
  }, []);

  const completedSteps = checklistState.filter(Boolean).length;
  const checklistPct = Math.round((completedSteps / checklistState.length) * 100);

  const monitorTips = [
    {
      title: "1, 2, Monitor!",
      body: "Jump directly into the action with the navigation bar. Every KPI card, deployment bar, detection row, and honeycomb host is wired to Ask Noctis.",
    },
    {
      title: "Overview Status & Event Console",
      body: "The Overview shows the status of all monitored objects (710 Hosts, 15,808 Services) and 1,001 Events from syslog, SNMP traps, and log files.",
    },
    {
      title: "OMD Site Provisioning & SAST Testing",
      body: "Download the Ubuntu / Debian / SLES / RHEL monitoring package below and run sudo omd create monitoring & sudo omd start monitoring.",
    },
  ];

  return (
    <div style={{ maxWidth: 1380, margin: "0 auto", padding: "28px 20px 80px" }}>
      {/* SECTION 0: Actionable Insights Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1d2630 0%, #263240 60%, #1a242f 100%)",
          borderRadius: 18,
          border: "1px solid #334155",
          padding: "28px 30px",
          color: "#f8fafc",
          marginBottom: 24,
          boxShadow: "0 18px 42px rgba(15, 23, 42, 0.22)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 28,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 12px",
                borderRadius: 999,
                background: "rgba(16, 185, 129, 0.14)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#34d399",
                fontSize: 11.5,
                fontWeight: 800,
                marginBottom: 12,
              }}
            >
              <span>★ XTRIKE Cyber KPI, Live Fleet Monitor &amp; Hybrid SAST Observability</span>
            </div>

            <h1
              style={{
                fontSize: 30,
                fontWeight: 900,
                lineHeight: 1.18,
                color: "#ffffff",
                marginBottom: 8,
              }}
            >
              Actionable insights from day one. Every feature included.
            </h1>
            <div
              style={{
                fontSize: 16.5,
                fontWeight: 700,
                color: "#94a3b8",
                marginBottom: 14,
              }}
            >
              Cyber Vulnerability KPIs · Antivirus Performance · Live Host/Service Monitor &amp; OMD 2.5.0p17 Setup
            </div>
            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.6,
                color: "#cbd5e1",
                marginBottom: 18,
              }}
            >
              Pre-configured SAST, CVE, EDR, and infrastructure thresholds apply the moment you deploy — correlating static AST taint paths across your repositories with live AWS Production, Fargate, Kubernetes nodes, and endpoint detections.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 20, fontSize: 12.5, color: "#e2e8f0", fontWeight: 700 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={15} color="#10b981" /> Zero-wait baselines
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={15} color="#10b981" /> 710 Monitored Hosts &amp; 15,808 Services
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={15} color="#10b981" /> Synced with Ask Noctis Pop-up
              </span>
            </div>

            {/* Recognition Badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              {[
                { title: "Leader", ribbon: "SPRING 2026", accent: "#f97316" },
                { title: "High Performer", ribbon: "SPRING 2026", accent: "#ef4444" },
                { title: "Best Relationship", ribbon: "SPRING 2026", accent: "#10b981" },
              ].map((b) => (
                <div
                  key={b.title}
                  style={{
                    background: "#ffffff",
                    color: "#0f172a",
                    borderRadius: "8px 8px 16px 16px",
                    padding: "8px 14px 10px",
                    minWidth: 112,
                    textAlign: "center",
                    borderBottom: `4px solid ${b.accent}`,
                    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                  }}
                >
                  <div style={{ fontSize: 8.5, fontWeight: 900, color: "#64748b", letterSpacing: 0.6 }}>
                    {b.ribbon} · ENTERPRISE
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 900, marginTop: 3 }}>{b.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Action Card */}
          <div
            style={{
              background: "#f8fafc",
              color: "#0f172a",
              borderRadius: 14,
              padding: "22px 24px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 6 }}>
              XTRIKE Live Telemetry &amp; Noctis AI Command Bridge
            </div>
            <p style={{ fontSize: 12.5, color: "#475569", marginBottom: 14, lineHeight: 1.5 }}>
              Inspect open vulnerabilities (<code>16.8K</code>), endpoint detections (<code>213</code>), live host/service alerts (<code>710 hosts</code>), or provision an OMD monitoring site (<code>v2.5.0p17</code>).
            </p>

            {liveScanCount !== null && (
              <div
                style={{
                  background: "#ecfdf5",
                  border: "1px solid #6ee7b7",
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginBottom: 12,
                  fontSize: 12,
                  color: "#065f46",
                  fontWeight: 700,
                }}
              >
                ● Active SAST Scan Connected: <strong>{liveScanCount} findings</strong> from <code>{liveScanRepo}</code>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <button
                type="button"
                onClick={() =>
                  openAskNoctisPopup(
                    "Summarize the XTRIKE Cyber Monitoring KPIs, Antivirus Performance score (53/100), Top Alerters, and OMD 2.5.0p17 site installation steps"
                  )
                }
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  borderRadius: 8,
                  background: "#10b981",
                  color: "#052e16",
                  border: "none",
                  fontWeight: 900,
                  fontSize: 12.5,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Sparkles size={15} />
                <span>Ask Noctis in Pop-up: Full Cyber KPI &amp; Fleet Audit</span>
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Link
                  href="/scan"
                  style={{
                    padding: "9px 12px",
                    borderRadius: 8,
                    background: "#0f172a",
                    color: "#f8fafc",
                    textDecoration: "none",
                    fontWeight: 800,
                    fontSize: 11.5,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Code2 size={14} />
                  <span>Open SAST Scanner</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowNextActionModal(true)}
                  style={{
                    padding: "9px 12px",
                    borderRadius: 8,
                    background: "transparent",
                    color: "#0f766e",
                    border: "1.5px solid #10b981",
                    fontWeight: 800,
                    fontSize: 11.5,
                    cursor: "pointer",
                  }}
                >
                  What to Do Next? Modal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard View Switcher Pills */}
        <div
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: "1px solid rgba(148, 163, 184, 0.2)",
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              { id: "all", label: "All 4 Modules (Unified View)" },
              { id: "vuln-kpi", label: "1. Cyber Vulnerability & Deployment KPI" },
              { id: "antivirus-kpi", label: "2. Antivirus & Threat Hunting KPI" },
              { id: "fleet-live", label: "3. Live Host & Service Monitor" },
              { id: "omd-install", label: "4. Package Download & OMD Site Setup (v2.5.0p17)" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as ActiveTab)}
                style={{
                  padding: "8px 13px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  border: activeTab === t.id ? "1px solid #10b981" : "1px solid #475569",
                  background: activeTab === t.id ? "#10b981" : "rgba(30, 41, 59, 0.8)",
                  color: activeTab === t.id ? "#052e16" : "#e2e8f0",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================================
          DASHBOARD 1: KPI DASHBOARD FOR CYBER MONITORING AND MANAGEMENT
         ===================================================================== */}
      {(activeTab === "all" || activeTab === "vuln-kpi") && (
        <section
          style={{
            background: "#283342",
            borderRadius: 18,
            border: "1px solid #3b495e",
            padding: "26px 28px",
            color: "#f8fafc",
            marginBottom: 28,
            boxShadow: "0 16px 38px rgba(15, 23, 42, 0.2)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#ffffff", letterSpacing: -0.3 }}>
                KPI dashboard for cyber monitoring and management
              </h2>
              <p style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4 }}>
                Security evaluation for cyber monitoring to threat intelligence covering open vulnerability count, open CVE count, open remediation, open risk instances, and open deployment instances.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                openAskNoctisPopup(
                  "Analyze the Cyber Vulnerability KPI Dashboard (16.8K open vulnerabilities, 6.4K CVEs, 1.3K remediations) and prioritize AWS Production vs Fargate Demo"
                )
              }
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                background: "#0ea5e9",
                color: "#ffffff",
                border: "none",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Sparkles size={14} />
              <span>Ask Noctis About Vulnerability KPIs</span>
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
              marginBottom: 26,
            }}
          >
            {[
              {
                label: "Open vulnerability count",
                value: CYBER_VULN_KPI_SUMMARY.openVulnerabilityDisplay,
                sub: liveScanCount ? `+ ${liveScanCount} in active SAST scan` : "Across 8 monitored deployment environments",
                query: "Explain the 16.8K open vulnerability count and how XTRIKE SAST reduces critical/high exposure",
              },
              {
                label: "Open CVE count",
                value: CYBER_VULN_KPI_SUMMARY.openCveDisplay,
                sub: "Correlated NVD, GHSA & OSV advisories",
                query: "Explain the 6.4K open CVE count and how CWE-to-CVE correlation integrity is enforced",
              },
              {
                label: "Open remediation",
                value: CYBER_VULN_KPI_SUMMARY.openRemediationDisplay,
                sub: "AST-verified pull requests & patch queues",
                query: "Show how the 1.3K open remediations are validated using AST diffs and regression tests",
              },
            ].map((card) => (
              <div
                key={card.label}
                onClick={() => openAskNoctisPopup(card.query)}
                style={{
                  background: "#384454",
                  borderRadius: 12,
                  padding: "24px 20px",
                  textAlign: "center",
                  border: "1px solid #4a596d",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9", marginBottom: 10 }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 42, fontWeight: 900, color: "#00a8e8", lineHeight: 1.05 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>{card.sub}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
              gap: 22,
            }}
          >
            <div
              style={{
                background: "#232d3b",
                border: "1px dashed #64748b",
                borderRadius: 12,
                padding: "20px 22px",
              }}
            >
              <div
                style={{
                  width: 180,
                  height: 5,
                  background: "#10b981",
                  margin: "-20px auto 14px",
                  borderRadius: 999,
                }}
              />
              <h3 style={{ textAlign: "center", fontSize: 16, fontWeight: 800, color: "#ffffff", marginBottom: 14 }}>
                Open risk instances
              </h3>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", flexWrap: "wrap", gap: 16 }}>
                <svg width="260" height="230" viewBox="0 0 260 230">
                  <g transform="translate(130, 115)">
                    {(() => {
                      let cumulativePct = 0;
                      const radius = 68;
                      const circumference = 2 * Math.PI * radius;
                      return OPEN_RISK_INSTANCES.map((slice) => {
                        const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
                        const strokeDashoffset = -((cumulativePct / 100) * circumference);
                        cumulativePct += slice.percentage;
                        return (
                          <circle
                            key={slice.severity}
                            r={radius}
                            cx={0}
                            cy={0}
                            fill="transparent"
                            stroke={slice.color}
                            strokeWidth={28}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90)"
                          />
                        );
                      });
                    })()}
                    <circle r={52} cx={0} cy={0} fill="#232d3b" />
                    <text x="0" y="-4" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="900">
                      16.1K
                    </text>
                    <text x="0" y="14" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
                      Risk Instances
                    </text>
                  </g>
                </svg>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 170 }}>
                  {OPEN_RISK_INSTANCES.map((item) => (
                    <div
                      key={item.severity}
                      onClick={() =>
                        openAskNoctisPopup(
                          `Show remediation priorities for ${item.severity} risk instances (${item.displayCount})`
                        )
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "6px 10px",
                        borderRadius: 8,
                        background: "#2c3849",
                        borderLeft: `4px solid ${item.color}`,
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: "#e2e8f0" }}>
                        {item.severity}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: "#ffffff" }}>
                        {item.displayCount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#232d3b",
                border: "1px dashed #64748b",
                borderRadius: 12,
                padding: "20px 22px",
              }}
            >
              <div
                style={{
                  width: 180,
                  height: 5,
                  background: "#f97316",
                  margin: "-20px auto 14px",
                  borderRadius: 999,
                }}
              />
              <h3 style={{ textAlign: "center", fontSize: 16, fontWeight: 800, color: "#ffffff", marginBottom: 14 }}>
                Open deployment instances
              </h3>

              <div
                style={{
                  height: 195,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "10px 8px 0 28px",
                  borderBottom: "1px solid #475569",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 6,
                    bottom: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    fontSize: 10,
                    color: "#94a3b8",
                  }}
                >
                  <span>90</span>
                  <span>60</span>
                  <span>30</span>
                  <span>0</span>
                </div>

                {OPEN_DEPLOYMENT_INSTANCES.map((env) => {
                  const scale = 2.4;
                  const isSelected = selectedEnv?.environment === env.environment;
                  return (
                    <div
                      key={env.environment}
                      onClick={() => setSelectedEnv(env)}
                      title={`${env.environment}: ${env.total} vulnerabilities`}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          display: "flex",
                          flexDirection: "column-reverse",
                          borderRadius: "4px 4px 0 0",
                          overflow: "hidden",
                          outline: isSelected ? "2px solid #38bdf8" : "none",
                        }}
                      >
                        {env.critical > 0 && (
                          <div style={{ height: env.critical * scale, background: "#b43c12" }} />
                        )}
                        {env.high > 0 && (
                          <div style={{ height: env.high * scale, background: "#ed7d31" }} />
                        )}
                        {env.medium > 0 && (
                          <div style={{ height: env.medium * scale, background: "#f4a582" }} />
                        )}
                        {env.low > 0 && (
                          <div style={{ height: env.low * scale, background: "#f9cfb6" }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingLeft: 28,
                  marginTop: 8,
                  gap: 4,
                }}
              >
                {OPEN_DEPLOYMENT_INSTANCES.map((env) => (
                  <div
                    key={env.environment}
                    onClick={() => setSelectedEnv(env)}
                    style={{
                      flex: 1,
                      fontSize: 9.5,
                      color: selectedEnv?.environment === env.environment ? "#38bdf8" : "#cbd5e1",
                      fontWeight: selectedEnv?.environment === env.environment ? 800 : 600,
                      textAlign: "center",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {env.shortLabel}
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 14,
                  marginTop: 12,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {[
                  { label: "Critical", color: "#b43c12" },
                  { label: "High", color: "#ed7d31" },
                  { label: "Medium", color: "#f4a582" },
                  { label: "Low", color: "#f9cfb6" },
                  { label: "Info", color: "#e2e8f0" },
                ].map((l) => (
                  <span key={l.label} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 9, height: 9, background: l.color, display: "inline-block" }} />
                    {l.label}
                  </span>
                ))}
              </div>

              {selectedEnv && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: "#313e50",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8,
                    fontSize: 11.5,
                  }}
                >
                  <div>
                    <strong>{selectedEnv.environment}</strong> ({selectedEnv.clusterOwner}) —{" "}
                    <span style={{ color: "#fca5a5" }}>Crit: {selectedEnv.critical}</span> ·{" "}
                    <span style={{ color: "#fdba74" }}>High: {selectedEnv.high}</span> ·{" "}
                    <span>Med: {selectedEnv.medium}</span> · CWEs:{" "}
                    <code>{selectedEnv.linkedCwes.join(", ")}</code>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      openAskNoctisPopup(
                        `Inspect deployment environment ${selectedEnv.environment} (${selectedEnv.total} open vulnerabilities, linked CWEs: ${selectedEnv.linkedCwes.join(", ")}) and provide remediation steps`
                      )
                    }
                    style={{
                      background: "#f97316",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 6,
                      padding: "4px 10px",
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Ask Noctis
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          DASHBOARD 2: KPI DASHBOARD FOR CYBER MONITORING ANTIVIRUS PERFORMANCE
         ===================================================================== */}
      {(activeTab === "all" || activeTab === "antivirus-kpi") && (
        <section
          style={{
            background: "#283342",
            borderRadius: 18,
            border: "1px solid #3b495e",
            padding: "26px 28px",
            color: "#f8fafc",
            marginBottom: 28,
            boxShadow: "0 16px 38px rgba(15, 23, 42, 0.2)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#ffffff", letterSpacing: -0.3 }}>
                KPI dashboard for cyber monitoring antivirus performance
              </h2>
              <p style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4 }}>
                Cyber monitoring KPI dashboard for data security &amp; endpoint performance covering detections, attacks prevented, leads on hunting, hunting leads stock, remedied detections, and current score.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                openAskNoctisPopup(
                  "Analyze the Antivirus & Endpoint Performance KPIs (213 detections, 32 attacks prevented, 26 hunting leads, score 53/100) and explain how to raise the score above 85/100"
                )
              }
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                background: "#10b981",
                color: "#052e16",
                border: "none",
                fontSize: 12,
                fontWeight: 900,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Sparkles size={14} />
              <span>Ask Noctis About Endpoint &amp; Hunting KPIs</span>
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
              gap: 14,
              marginBottom: 26,
            }}
          >
            {ANTIVIRUS_PERFORMANCE_KPIS.map((kpi) => (
              <div
                key={kpi.id}
                onClick={() =>
                  openAskNoctisPopup(`Analyze KPI "${kpi.label}" (${kpi.value}): ${kpi.description}`)
                }
                style={{
                  background: "#384454",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid #4a596d",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    background: kpi.accentColor,
                    padding: "10px 8px",
                    fontSize: 12.5,
                    fontWeight: 900,
                    color: "#ffffff",
                  }}
                >
                  {kpi.label}
                </div>
                <div style={{ padding: "18px 12px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 }}>
                    {kpi.subLabel && (
                      <span style={{ fontSize: 11.5, color: "#cbd5e1", fontWeight: 600 }}>
                        {kpi.subLabel}
                      </span>
                    )}
                    <span style={{ fontSize: 28, fontWeight: 900, color: "#ffffff" }}>
                      {kpi.value}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: 18,
            }}
          >
            <div
              style={{
                background: "#232d3b",
                border: "1px dashed #64748b",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "#0284c7",
                  padding: "10px 14px",
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#ffffff",
                }}
              >
                Hosts - Hosts
              </div>
              <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <svg width="210" height="190" viewBox="0 0 210 190">
                  <g transform="translate(105, 95)">
                    {(() => {
                      let cumPct = 0;
                      const r = 58;
                      const circ = 2 * Math.PI * r;
                      return MONITORED_HOSTS_BY_OS.breakdown.map((os) => {
                        const dash = `${(os.percentage / 100) * circ} ${circ}`;
                        const offset = -((cumPct / 100) * circ);
                        cumPct += os.percentage;
                        return (
                          <circle
                            key={os.os}
                            r={r}
                            cx={0}
                            cy={0}
                            fill="transparent"
                            stroke={os.color}
                            strokeWidth={22}
                            strokeDasharray={dash}
                            strokeDashoffset={offset}
                            transform="rotate(-90)"
                          />
                        );
                      });
                    })()}
                    <circle r={44} cx={0} cy={0} fill="#232d3b" />
                    <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontSize="19" fontWeight="900">
                      {MONITORED_HOSTS_BY_OS.totalHosts.toLocaleString()}
                    </text>
                  </g>
                </svg>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 6 }}>
                  {MONITORED_HOSTS_BY_OS.breakdown.map((item) => (
                    <span
                      key={item.os}
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: "#2e3b4e",
                        color: "#e2e8f0",
                        fontWeight: 700,
                        borderLeft: `3px solid ${item.color}`,
                      }}
                    >
                      {item.os}: <strong>{item.count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#232d3b",
                border: "1px dashed #64748b",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "#10b981",
                  padding: "10px 14px",
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#ffffff",
                }}
              >
                Activity - Detection
              </div>
              <div style={{ padding: "18px 16px" }}>
                <svg width="100%" height="190" viewBox="0 0 360 190">
                  {[
                    { y: 25, label: "900" },
                    { y: 70, label: "600" },
                    { y: 115, label: "300" },
                    { y: 155, label: "0" },
                  ].map((g) => (
                    <g key={g.label}>
                      <text x="24" y={g.y + 3} textAnchor="end" fill="#94a3b8" fontSize="9.5">
                        {g.label}
                      </text>
                      <line x1="32" y1={g.y} x2="348" y2={g.y} stroke="#334155" strokeDasharray="3 3" />
                    </g>
                  ))}

                  <polyline
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="2.5"
                    points={ACTIVITY_DETECTION_TIMELINE.map((pt, i) => {
                      const x = 36 + i * 19;
                      const y = 155 - Math.min(140, (pt.linux / 1120) * 138);
                      return `${x},${y}`;
                    }).join(" ")}
                  />
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    points={ACTIVITY_DETECTION_TIMELINE.map((pt, i) => {
                      const x = 36 + i * 19;
                      const y = 155 - (pt.windows / 1120) * 138;
                      return `${x},${y}`;
                    }).join(" ")}
                  />
                  <polyline
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2"
                    points={ACTIVITY_DETECTION_TIMELINE.map((pt, i) => {
                      const x = 36 + i * 19;
                      const y = 155 - (pt.mac / 1120) * 138;
                      return `${x},${y}`;
                    }).join(" ")}
                  />

                  {ACTIVITY_DETECTION_TIMELINE.filter((_, idx) => idx % 2 === 0).map((pt, idx) => (
                    <text
                      key={pt.year}
                      x={36 + idx * 38}
                      y={174}
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="8.5"
                    >
                      {pt.year}
                    </text>
                  ))}
                </svg>

                <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 11.5, fontWeight: 800 }}>
                  <span style={{ color: "#0ea5e9" }}>● Linux (Peak: 1,120)</span>
                  <span style={{ color: "#10b981" }}>● Windows</span>
                  <span style={{ color: "#f97316" }}>● Mac</span>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#232d3b",
                border: "1px dashed #64748b",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "#f97316",
                  padding: "10px 14px",
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#ffffff",
                }}
              >
                Most recent detections
              </div>
              <div style={{ padding: "12px 12px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #475569", color: "#cbd5e1" }}>
                      <th style={{ padding: "6px 4px", textAlign: "center" }}>Severity</th>
                      <th style={{ padding: "6px 4px", textAlign: "left" }}>Tactic &amp; tec...</th>
                      <th style={{ padding: "6px 4px", textAlign: "left" }}>Time</th>
                      <th style={{ padding: "6px 4px", textAlign: "left" }}>Host ID</th>
                      <th style={{ padding: "6px 4px", textAlign: "left" }}>Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOST_RECENT_DETECTIONS.map((det) => (
                      <tr
                        key={det.id}
                        onClick={() => setSelectedDetection(det)}
                        style={{
                          borderBottom: "1px solid #334155",
                          background: selectedDetection?.id === det.id ? "rgba(14, 165, 233, 0.14)" : "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <td style={{ padding: "10px 4px", textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: 18,
                              height: 16,
                              background: det.severity === "Critical" ? "#ef4444" : "#f97316",
                              clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                            }}
                          />
                        </td>
                        <td style={{ padding: "10px 4px" }}>
                          <div style={{ fontWeight: 800, color: "#fb923c" }}>! {det.tactic}</div>
                          <div style={{ fontSize: 10, color: "#94a3b8" }}>{det.mitreId}</div>
                        </td>
                        <td style={{ padding: "10px 4px", color: "#e2e8f0", fontSize: 10.5 }}>
                          {det.timestamp}
                        </td>
                        <td style={{ padding: "10px 4px", color: "#cbd5e1", fontFamily: "monospace" }}>
                          {det.hostId}
                        </td>
                        <td style={{ padding: "10px 4px" }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openAskNoctisPopup(
                                `Investigate detection ${det.id} (${det.tactic} ${det.mitreId}: ${det.techniqueName}) on host ${det.fullHostName} (${det.processOrPath}) linked to SAST finding ${det.linkedSastFindingId}`
                              );
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#38bdf8",
                              textDecoration: "underline",
                              fontSize: 10.5,
                              fontWeight: 700,
                              cursor: "pointer",
                              padding: 0,
                              textAlign: "left",
                            }}
                          >
                            See detections
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {selectedDetection && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "#2e3b4e",
                      fontSize: 11,
                      color: "#e2e8f0",
                    }}
                  >
                    <div>
                      <strong>{selectedDetection.id}</strong> · Host: <code>{selectedDetection.fullHostName}</code>
                    </div>
                    <div style={{ color: "#93c5fd", marginTop: 2 }}>
                      Sink: <code>{selectedDetection.processOrPath}</code> (SAST: <strong>{selectedDetection.linkedSastFindingId}</strong>)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          DASHBOARD 3: XTRIKE LIVE HOST & SERVICE MONITOR
         ===================================================================== */}
      {(activeTab === "all" || activeTab === "fleet-live") && (
        <section
          style={{
            background: "#12161b",
            borderRadius: 18,
            border: "1px solid #2b3440",
            padding: "22px 24px",
            color: "#e2e8f0",
            marginBottom: 28,
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.38)",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              paddingBottom: 16,
              borderBottom: "1px solid #262f3a",
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#10b981",
                  color: "#052e16",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                }}
              >
                ↑
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: "#94a3b8" }}>
                  Monitor &gt; Overview &gt; <span style={{ textDecoration: "underline", color: "#e2e8f0" }}>Main dashboard</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#ffffff" }}>
                  XTRIKE Live Fleet Monitor · Main Dashboard
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setShowMonitorTip(true)}
                style={{
                  background: "#1e2630",
                  border: "1px solid #10b981",
                  color: "#10b981",
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Filter size={13} />
                <span>Filter / 1,2, Monitor!</span>
              </button>
              <button
                type="button"
                onClick={() => setShowOverviewTooltip((prev) => !prev)}
                style={{
                  background: "#1e2630",
                  border: "1px solid #475569",
                  color: "#e2e8f0",
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {showOverviewTooltip ? "Hide Overview Popover" : "Show Overview Popover"}
              </button>
              <button
                type="button"
                onClick={() => setShowNextActionModal(true)}
                style={{
                  background: "#1e2630",
                  border: "1px solid #38bdf8",
                  color: "#38bdf8",
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                What Next? Dialog
              </button>
              <button
                type="button"
                onClick={() =>
                  openAskNoctisPopup(
                    "Audit the XTRIKE Live Fleet Monitor (710 hosts, 2 down, 15,808 services, 77 critical, 37 warning) and diagnose the Top Alerters"
                  )
                }
                style={{
                  background: "#10b981",
                  border: "none",
                  color: "#052e16",
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Sparkles size={13} />
                <span>Ask Noctis</span>
              </button>
            </div>
          </div>

          {showMonitorTip && (
            <div
              style={{
                background: "#ffffff",
                color: "#0f172a",
                borderRadius: 10,
                padding: "14px 18px",
                marginBottom: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 3 }}>
                  {monitorTips[monitorTipStep].title}
                </div>
                <div style={{ fontSize: 12.5, color: "#475569" }}>
                  {monitorTips[monitorTipStep].body}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowMonitorTip(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    fontSize: 11.5,
                    cursor: "pointer",
                  }}
                >
                  Hide these tips
                </button>
                <button
                  type="button"
                  onClick={() => setMonitorTipStep((prev) => (prev + 1) % monitorTips.length)}
                  style={{
                    background: "#10b981",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 270px", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Row 1: Host statistics + Total host problems */}
              <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
                <div style={{ background: "#1b2129", border: "1px solid #2b3440", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#cbd5e1", textAlign: "center", marginBottom: 10 }}>
                    Host statistics
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <svg width="96" height="96" viewBox="0 0 100 100">
                      <polygon
                        points="50,6 90,28 90,72 50,94 10,72 10,28"
                        fill="rgba(16, 185, 129, 0.14)"
                        stroke="#10b981"
                        strokeWidth="2.5"
                      />
                      <polygon
                        points="50,36 62,43 62,57 50,64 38,57 38,43"
                        fill="rgba(239, 68, 68, 0.45)"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <div style={{ fontSize: 11.5, lineHeight: 1.7, textAlign: "right", flex: 1 }}>
                      <div><strong>{XTRIKE_FLEET_OVERVIEW.hosts.up}</strong> <span style={{ color: "#10b981" }}>| Up</span></div>
                      <div><strong>{XTRIKE_FLEET_OVERVIEW.hosts.inDowntime}</strong> <span style={{ color: "#38bdf8" }}>| In downtime</span></div>
                      <div><strong>{XTRIKE_FLEET_OVERVIEW.hosts.unreachable}</strong> <span style={{ color: "#f97316" }}>| Unreachable</span></div>
                      <div><strong>{XTRIKE_FLEET_OVERVIEW.hosts.down}</strong> <span style={{ color: "#ef4444" }}>| Down</span></div>
                      <div style={{ borderTop: "1px solid #334155", marginTop: 4, paddingTop: 2 }}>
                        <strong>{XTRIKE_FLEET_OVERVIEW.hosts.total}</strong> | Total
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#1b2129", border: "1px solid #2b3440", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#cbd5e1", textAlign: "center", marginBottom: 8 }}>
                    Total host problems
                  </div>
                  <svg width="100%" height="105" viewBox="0 0 560 105" preserveAspectRatio="none">
                    <rect x="28" y="10" width="520" height="72" fill="rgba(185, 28, 28, 0.28)" stroke="#ef4444" strokeWidth="1.5" />
                    <line x1="28" y1="46" x2="548" y2="46" stroke="#334155" strokeDasharray="3 3" />
                    <text x="20" y="16" textAnchor="end" fill="#94a3b8" fontSize="9.5">2</text>
                    <text x="20" y="49" textAnchor="end" fill="#94a3b8" fontSize="9.5">1</text>
                    <text x="20" y="82" textAnchor="end" fill="#94a3b8" fontSize="9.5">0</text>
                    {["Tue 20:00", "Wed 00:00", "Wed 04:00", "Wed 08:00", "Wed 12:00", "Wed 16:00"].map((t, i) => (
                      <text key={t} x={60 + i * 90} y="98" textAnchor="middle" fill="#94a3b8" fontSize="9">
                        {t}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Row 2: Service statistics + Total service problems */}
              <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
                <div style={{ background: "#1b2129", border: "1px solid #2b3440", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#cbd5e1", textAlign: "center", marginBottom: 10 }}>
                    Service statistics
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <svg width="96" height="96" viewBox="0 0 100 100">
                      <polygon
                        points="50,6 90,28 90,72 50,94 10,72 10,28"
                        fill="rgba(16, 185, 129, 0.14)"
                        stroke="#10b981"
                        strokeWidth="2.5"
                      />
                      <polygon
                        points="50,32 66,41 66,59 50,68 34,59 34,41"
                        fill="rgba(245, 158, 11, 0.45)"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <div style={{ fontSize: 11, lineHeight: 1.55, textAlign: "right", flex: 1 }}>
                      <div><strong>{XTRIKE_FLEET_OVERVIEW.services.ok}</strong> <span style={{ color: "#10b981" }}>| OK</span></div>
                      <div><strong>{XTRIKE_FLEET_OVERVIEW.services.inDowntime}</strong> <span style={{ color: "#38bdf8" }}>| In downtime</span></div>
                      <div><strong>{XTRIKE_FLEET_OVERVIEW.services.onDownHost}</strong> <span style={{ color: "#0ea5e9" }}>| On down host</span></div>
                      <div><strong>{XTRIKE_FLEET_OVERVIEW.services.warning}</strong> <span style={{ color: "#f59e0b" }}>| Warning</span></div>
                      <div><strong>{XTRIKE_FLEET_OVERVIEW.services.unknown}</strong> <span style={{ color: "#f97316" }}>| Unknown</span></div>
                      <div><strong>{XTRIKE_FLEET_OVERVIEW.services.critical}</strong> <span style={{ color: "#ef4444" }}>| Critical</span></div>
                      <div style={{ borderTop: "1px solid #334155", marginTop: 3, paddingTop: 2 }}>
                        <strong>{XTRIKE_FLEET_OVERVIEW.services.total}</strong> | Total
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#1b2129", border: "1px solid #2b3440", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#cbd5e1", textAlign: "center", marginBottom: 8 }}>
                    Total service problems
                  </div>
                  <svg width="100%" height="110" viewBox="0 0 560 110" preserveAspectRatio="none">
                    <rect x="28" y="14" width="520" height="44" fill="rgba(185, 28, 28, 0.32)" stroke="#ef4444" strokeWidth="1.5" />
                    <rect x="28" y="58" width="520" height="28" fill="rgba(217, 119, 6, 0.34)" stroke="#f59e0b" strokeWidth="1.2" />
                    <text x="22" y="18" textAnchor="end" fill="#94a3b8" fontSize="9">120</text>
                    <text x="22" y="46" textAnchor="end" fill="#94a3b8" fontSize="9">80</text>
                    <text x="22" y="66" textAnchor="end" fill="#94a3b8" fontSize="9">40</text>
                    <text x="22" y="86" textAnchor="end" fill="#94a3b8" fontSize="9">0</text>
                    {["Tue 20:00", "Wed 00:00", "Wed 04:00", "Wed 08:00", "Wed 12:00", "Wed 16:00"].map((t, i) => (
                      <text key={t} x={60 + i * 90} y="102" textAnchor="middle" fill="#94a3b8" fontSize="9">
                        {t}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Row 3: Problem notifications + Percentage of total service problems */}
              <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
                <div style={{ background: "#1b2129", border: "1px solid #2b3440", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#cbd5e1", textAlign: "center", marginBottom: 8 }}>
                    Problem notifications
                  </div>
                  <svg width="100%" height="95" viewBox="0 0 230 95">
                    <line x1="28" y1="20" x2="218" y2="20" stroke="#334155" />
                    <line x1="28" y1="48" x2="218" y2="48" stroke="#334155" />
                    <line x1="28" y1="74" x2="218" y2="74" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="3 3" />
                    <text x="22" y="23" textAnchor="end" fill="#94a3b8" fontSize="9">1</text>
                    <text x="22" y="51" textAnchor="end" fill="#94a3b8" fontSize="9">0.50</text>
                    <text x="22" y="77" textAnchor="end" fill="#94a3b8" fontSize="9">0</text>
                  </svg>
                </div>

                <div style={{ background: "#1b2129", border: "1px solid #2b3440", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#cbd5e1", textAlign: "center", marginBottom: 8 }}>
                    Percentage of total service problems
                  </div>
                  <svg width="100%" height="95" viewBox="0 0 560 95" preserveAspectRatio="none">
                    <polyline
                      fill="rgba(14, 165, 233, 0.16)"
                      stroke="#0ea5e9"
                      strokeWidth="2"
                      points="28,74 48,74 52,12 56,12 60,56 120,58 185,52 190,62 260,62 264,50 268,62 420,62 424,52 428,62 548,62 548,78 28,78"
                    />
                    <text x="24" y="20" textAnchor="end" fill="#94a3b8" fontSize="8.5">2.5%</text>
                    <text x="24" y="46" textAnchor="end" fill="#94a3b8" fontSize="8.5">1.5%</text>
                    <text x="24" y="72" textAnchor="end" fill="#94a3b8" fontSize="8.5">0.5%</text>
                  </svg>
                </div>
              </div>

              {/* Row 4: Host overview Honeycomb Hex-Grid + Top alerters */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 16 }}>
                <div style={{ background: "#1b2129", border: "1px solid #2b3440", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#cbd5e1", textAlign: "center", marginBottom: 10 }}>
                    Host overview (Click any honeycomb cell to inspect host)
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(12, 1fr)",
                      gap: 5,
                      padding: "6px 4px",
                    }}
                  >
                    {XTRIKE_HONEYCOMB_HOSTS.map((h) => {
                      const borderColor =
                        h.state === "DOWN" ? "#ef4444" : h.state === "WARN" ? "#f59e0b" : "#1f4f3f";
                      const bgColor =
                        h.state === "DOWN"
                          ? "rgba(239, 68, 68, 0.35)"
                          : h.state === "WARN"
                          ? "rgba(245, 158, 11, 0.25)"
                          : "rgba(16, 185, 129, 0.08)";
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => setSelectedHexHost(h)}
                          title={`${h.hostname} [${h.state}]`}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 5,
                            border: `1.5px solid ${borderColor}`,
                            background: bgColor,
                            cursor: "pointer",
                            outline: selectedHexHost?.id === h.id ? "2px solid #38bdf8" : "none",
                          }}
                        />
                      );
                    })}
                  </div>

                  {selectedHexHost && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: "9px 12px",
                        borderRadius: 8,
                        background: "#252e3a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        fontSize: 11,
                      }}
                    >
                      <div>
                        <strong>{selectedHexHost.hostname}</strong> [{selectedHexHost.state}] · CPU:{" "}
                        {selectedHexHost.cpuLoad} · Mem: {selectedHexHost.memoryUsed} · Crit Services:{" "}
                        <span style={{ color: "#f87171" }}>{selectedHexHost.servicesCrit}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          openAskNoctisPopup(
                            `Diagnose host ${selectedHexHost.hostname} (State: ${selectedHexHost.state}, CPU: ${selectedHexHost.cpuLoad}, Memory: ${selectedHexHost.memoryUsed}, Critical services: ${selectedHexHost.servicesCrit})`
                          )
                        }
                        style={{
                          background: "#10b981",
                          color: "#052e16",
                          border: "none",
                          borderRadius: 5,
                          padding: "4px 9px",
                          fontWeight: 900,
                          fontSize: 10.5,
                          cursor: "pointer",
                        }}
                      >
                        Ask Noctis
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ background: "#1b2129", border: "1px solid #2b3440", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#cbd5e1", textAlign: "center", marginBottom: 10 }}>
                    Top alerters (last 7 days)
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                        <th style={{ padding: "5px 6px", textAlign: "right" }}>Problems</th>
                        <th style={{ padding: "5px 6px", textAlign: "left" }}>Host</th>
                        <th style={{ padding: "5px 6px", textAlign: "left" }}>Service</th>
                        <th style={{ padding: "5px 6px", textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {XTRIKE_TOP_ALERTERS.map((row, idx) => (
                        <tr key={`${row.host}-${idx}`} style={{ borderBottom: "1px solid #262f3a" }}>
                          <td style={{ padding: "7px 6px", textAlign: "right", fontWeight: 900, color: "#f8fafc" }}>
                            {row.problems}
                          </td>
                          <td
                            style={{
                              padding: "7px 6px",
                              color: "#cbd5e1",
                              maxWidth: 190,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={row.host}
                          >
                            {row.host}
                          </td>
                          <td style={{ padding: "7px 6px", color: row.state === "CRIT" ? "#f87171" : "#fbbf24" }}>
                            {row.service}
                          </td>
                          <td style={{ padding: "7px 6px", textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={() =>
                                openAskNoctisPopup(
                                  `Analyze Top Alerter on host "${row.host}" service "${row.service}" (${row.problems} problems, state ${row.state}: ${row.outputSummary}, correlated ${row.correlatedCwe}) and provide remediation`
                                )
                              }
                              style={{
                                background: "#263240",
                                border: "1px solid #3b495e",
                                color: "#38bdf8",
                                borderRadius: 5,
                                padding: "2px 8px",
                                fontSize: 10,
                                fontWeight: 800,
                                cursor: "pointer",
                              }}
                            >
                              Ask Noctis
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
              <div
                style={{
                  background: "#0d3b2e",
                  border: "1px solid #10b981",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 900, color: "#ffffff", marginBottom: 4 }}>
                  Deploy XTRIKE Monitor
                </div>
                <div style={{ fontSize: 11, color: "#a7f3d0", marginBottom: 10 }}>
                  All features included. Synced with XTRIKE SAST.
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("omd-install")}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: 6,
                    background: "#a7f3d0",
                    color: "#052e16",
                    border: "none",
                    fontWeight: 900,
                    fontSize: 11.5,
                    cursor: "pointer",
                  }}
                >
                  Install OMD Site v2.5.0p17 →
                </button>
              </div>

              {/* Overview Counters + Floating Popover */}
              <div style={{ background: "#1b2129", border: "1px solid #2b3440", borderRadius: 10, padding: 14, position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#e2e8f0" }}>▾ Overview</span>
                  <button
                    type="button"
                    onClick={() => setShowOverviewTooltip((prev) => !prev)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    ⋯
                  </button>
                </div>

                {showOverviewTooltip && (
                  <div
                    style={{
                      position: "absolute",
                      right: "104%",
                      top: 0,
                      width: 265,
                      background: "#ffffff",
                      color: "#0f172a",
                      borderRadius: 10,
                      padding: "14px 16px",
                      boxShadow: "0 16px 38px rgba(0,0,0,0.45)",
                      zIndex: 25,
                      fontSize: 11.5,
                      lineHeight: 1.5,
                    }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 6 }}>Overview</div>
                    <p style={{ marginBottom: 8, color: "#334155" }}>
                      The overview shows the status of all monitored objects.
                    </p>
                    <p style={{ marginBottom: 8, color: "#334155" }}>
                      You can see the total number of hosts and services you are monitoring in the left column.
                    </p>
                    <p style={{ marginBottom: 12, color: "#334155" }}>
                      The third row shows Events, which only are relevant for you, if you are monitoring of messages for example syslog, SNMP traps and log files.
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => setShowOverviewTooltip(false)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#94a3b8",
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        ⊗ Hide these tips
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOverviewTooltip(false);
                          setShowNextActionModal(true);
                        }}
                        style={{
                          background: "#10b981",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 5,
                          padding: "5px 12px",
                          fontSize: 11.5,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
                  <div style={{ background: "#252e3a", padding: 8, borderRadius: 6 }}>
                    <div style={{ color: "#94a3b8" }}>Hosts</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#ffffff" }}>710</div>
                  </div>
                  <div style={{ background: "#252e3a", padding: 8, borderRadius: 6 }}>
                    <div style={{ color: "#94a3b8" }}>Unhandled p.</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#f59e0b" }}>1</div>
                  </div>
                  <div style={{ background: "#252e3a", padding: 8, borderRadius: 6 }}>
                    <div style={{ color: "#94a3b8" }}>Services</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#ffffff" }}>15808</div>
                  </div>
                  <div style={{ background: "#252e3a", padding: 8, borderRadius: 6 }}>
                    <div style={{ color: "#94a3b8" }}>Unhandled p.</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#f59e0b" }}>112</div>
                  </div>
                  <div style={{ background: "#252e3a", padding: 8, borderRadius: 6 }}>
                    <div style={{ color: "#94a3b8" }}>Events</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#ffffff" }}>1001</div>
                  </div>
                  <div style={{ background: "#252e3a", padding: 8, borderRadius: 6 }}>
                    <div style={{ color: "#94a3b8" }}>Unhandled p.</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#f59e0b" }}>4</div>
                  </div>
                </div>
              </div>

              {/* Getting Started Checklist */}
              <div
                style={{
                  background: "#ffffff",
                  color: "#0f172a",
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: "0 12px 28px rgba(0,0,0,0.35)",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 4 }}>Getting Started</div>
                <div style={{ fontSize: 11.5, color: "#475569", marginBottom: 10 }}>
                  Here are a few things to do first.
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 800 }}>{checklistPct}%</span>
                  <div style={{ flex: 1, height: 7, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${checklistPct}%`, height: "100%", background: "#10b981" }} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    {
                      label: "Introduction to the user interface",
                      query: "Give me an interactive walkthrough of the XTRIKE Cyber KPI & Live Fleet Monitoring interface",
                    },
                    {
                      label: "Identifying Issues in Kubernetes",
                      query: "Diagnose the EKS Kubernetes node memory alert on node eks i-0d7cb370c8eea26c9.eu-central-1.compute.internal (292 problems)",
                    },
                    {
                      label: "Correlating SAST with Host Alerts",
                      query: "Show how SAST findings F-001 (SQLi), F-002 (Python exec), and F-003 (SSRF) map to live endpoint detections",
                    },
                  ].map((item, idx) => (
                    <label
                      key={item.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checklistState[idx]}
                        onChange={() => {
                          const next = [...checklistState];
                          next[idx] = !next[idx];
                          setChecklistState(next);
                          if (next[idx]) {
                            openAskNoctisPopup(item.query);
                          }
                        }}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Centered Modal: "What would you like to do next?" */}
          {showNextActionModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.65)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 85,
                padding: 16,
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  color: "#0f172a",
                  borderRadius: 14,
                  width: 420,
                  maxWidth: "100%",
                  padding: "24px 26px",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
                  position: "relative",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowNextActionModal(false)}
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: "#10b981",
                      color: "#052e16",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 13,
                    }}
                  >
                    ↑
                  </span>
                  <span style={{ fontWeight: 900, fontSize: 15, color: "#10b981" }}>XTRIKE MONITOR</span>
                </div>

                <div style={{ fontSize: 12.5, color: "#475569", marginBottom: 4 }}>
                  Thank you for exploring the XTRIKE live monitoring environment!
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 900, marginBottom: 12 }}>
                  What would you like to do next?
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>
                  Answer required
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    "Ask a question (Open Ask Noctis Pop-up)",
                    "Install OMD Monitoring Package (v2.5.0p17)",
                    "Run a Hybrid SAST Repository Scan",
                    "Inspect 6-Stage Proof Validation Engine",
                    "Nothing, I am just looking around",
                  ].map((option) => (
                    <label
                      key={option}
                      onClick={() => {
                        setSelectedNextOption(option);
                        if (option.startsWith("Ask a question")) {
                          setShowNextActionModal(false);
                          openAskNoctisPopup(
                            "I am exploring the XTRIKE monitoring environment. What can you tell me about the 710 monitored hosts, 15,808 services, and how to provision an OMD 2.5.0p17 site?"
                          );
                        } else if (option.startsWith("Install OMD")) {
                          setShowNextActionModal(false);
                          setActiveTab("omd-install");
                        } else if (option.startsWith("Nothing")) {
                          setShowNextActionModal(false);
                        }
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        borderRadius: 8,
                        background: selectedNextOption === option ? "#ecfdf5" : "#f1f5f9",
                        border: selectedNextOption === option ? "1px solid #10b981" : "1px solid #e2e8f0",
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="xtrike-next"
                        checked={selectedNextOption === option}
                        onChange={() => setSelectedNextOption(option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          DASHBOARD 4: UBUNTU / DEBIAN / SLES / RHEL ACCORDION + OMD SITE SETUP
          (Exact match to Screenshot media_1793214219744_7148c1d8.png + Steps 3.1-3.4)
         ===================================================================== */}
      {(activeTab === "all" || activeTab === "omd-install") && (
        <section
          style={{
            background: "#fbf8f3",
            borderRadius: 18,
            border: "1px solid var(--border)",
            padding: "28px 30px",
            color: "#1f1b18",
            boxShadow: "0 12px 32px rgba(31, 27, 24, 0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 10px",
                  borderRadius: 4,
                  background: "#f4e5dc",
                  border: "1px solid var(--border)",
                  color: "#8b4528",
                  fontSize: 11,
                  fontWeight: 800,
                  marginBottom: 8,
                }}
              >
                <Download size={13} />
                <span>XTRIKE OMD DISTRIBUTION v2.5.0p17 &middot; PACKAGE DOWNLOAD &amp; SITE INSTALLER</span>
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: "#1f1b18" }}>
                Download, Install &amp; Provision OMD Monitoring Site ({XTRIKE_OMD_RUNTIME_SPEC.version})
              </h2>
              <p style={{ fontSize: 13.5, color: "#5c5349", marginTop: 4 }}>
                Select your Linux distribution below to copy the <code>wget</code> command, inspect the SHA-256 hash, download the signed package bundle, and provision your monitoring site.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                openAskNoctisPopup(
                  `Explain the installation steps for ${selectedReleaseRow.filename} (SHA-256: ${selectedReleaseRow.sha256}), sudo apt install ./${selectedReleaseRow.filename}, and sudo omd create ${siteName}`
                )
              }
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                background: "#10b981",
                color: "#052e16",
                border: "none",
                fontSize: 12.5,
                fontWeight: 900,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <Sparkles size={14} />
              <span>Ask Noctis About OMD Site Setup</span>
            </button>
          </div>

          {/* Collapsible Distribution Accordion (Ubuntu / Debian / SLES / Red Hat) matching Screenshot media_1793214219744_7148c1d8.png */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 26 }}>
            {XTRIKE_DISTRO_ACCORDION_GROUPS.map((group) => {
              const isOpen = Boolean(openDistros[group.id]);
              return (
                <div
                  key={group.id}
                  style={{
                    borderRadius: 8,
                    overflow: "hidden",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                  }}
                >
                  {/* Dark Slate Accordion Header Bar */}
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDistros((prev) => ({ ...prev, [group.id]: !prev[group.id] }))
                    }
                    style={{
                      width: "100%",
                      background: "#2c3843",
                      color: "#ffffff",
                      padding: "11px 18px",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <span>{group.distroName}</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  {/* Release Rows */}
                  {isOpen && (
                    <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                      {group.releases.map((rel) => {
                        const rowKey = `${group.id}-${rel.codename}`;
                        const isHashShown = visibleHashKey === rowKey;
                        const isSelected = selectedReleaseRow.filename === rel.filename;
                        return (
                          <div key={rowKey} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div
                              onClick={() => setSelectedReleaseRow(rel)}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "150px 1fr auto",
                                alignItems: "center",
                                gap: 12,
                                cursor: "pointer",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 14,
                                  color: isSelected ? "#8b4528" : "#334155",
                                  fontWeight: isSelected ? 900 : 600,
                                }}
                              >
                                {rel.releaseVersion}
                              </div>

                              {/* Dark Command Bar with [copy] and [hash] buttons */}
                              <div
                                style={{
                                  background: "#1c2228",
                                  color: "#e2e8f0",
                                  borderRadius: 4,
                                  padding: "8px 12px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 10,
                                  fontFamily: "monospace",
                                  fontSize: 12,
                                  overflowX: "auto",
                                }}
                              >
                                <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  <span style={{ color: "#a855f7", marginRight: 6 }}>$</span>
                                  <span style={{ color: "#84cc16" }}>wget</span>{" "}
                                  <span>{rel.wgetCommand.replace(/^wget\s+/, "")}</span>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyText(rowKey, rel.wgetCommand);
                                    }}
                                    style={{
                                      background: "#ffffff",
                                      color: "#0f172a",
                                      border: "none",
                                      borderRadius: 3,
                                      padding: "3px 9px",
                                      fontSize: 11.5,
                                      fontWeight: 700,
                                      cursor: "pointer",
                                    }}
                                  >
                                    {copiedCmdKey === rowKey ? "copied" : "copy"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setVisibleHashKey(isHashShown ? null : rowKey);
                                    }}
                                    style={{
                                      background: "#0080ff",
                                      color: "#ffffff",
                                      border: "none",
                                      borderRadius: 3,
                                      padding: "3px 9px",
                                      fontSize: 11.5,
                                      fontWeight: 700,
                                      cursor: "pointer",
                                    }}
                                  >
                                    hash
                                  </button>
                                </div>
                              </div>

                              {/* Download Icon Button */}
                              <a
                                href={`/api/xtrike-package?distro=${group.id}&release=${rel.codename}`}
                                download
                                onClick={() => setSelectedReleaseRow(rel)}
                                title={`Download ${rel.filename}`}
                                style={{
                                  width: 38,
                                  height: 36,
                                  borderRadius: 4,
                                  background: "#2c3843",
                                  color: "#ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  textDecoration: "none",
                                }}
                              >
                                <Download size={16} />
                              </a>
                            </div>

                            {isHashShown && (
                              <div
                                style={{
                                  marginLeft: 162,
                                  background: "#0f172a",
                                  color: "#34d399",
                                  padding: "7px 12px",
                                  borderRadius: 4,
                                  fontFamily: "monospace",
                                  fontSize: 11.5,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <span>SHA-256: {rel.sha256}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(`${rowKey}-sha`, rel.sha256)}
                                  style={{
                                    background: "#334155",
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: 3,
                                    padding: "2px 8px",
                                    fontSize: 10.5,
                                    cursor: "pointer",
                                  }}
                                >
                                  {copiedCmdKey === `${rowKey}-sha` ? "Copied" : "Copy SHA-256"}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Step 3.1 to 3.4 Interactive Installation & OMD Site Provisioning Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#f3eee4", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 6 }}>
                  3.1 Pull Package ({selectedReleaseRow.releaseVersion}) &amp; 3.2 GnuPG Signature Verification
                </div>
                <p style={{ fontSize: 12, color: "#5c5349", marginBottom: 8 }}>
                  Selected package: <code>{selectedReleaseRow.filename}</code>
                </p>
                <div
                  style={{
                    background: "#1c2228",
                    color: "#e2e8f0",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontFamily: "monospace",
                    fontSize: 11.5,
                    marginBottom: 10,
                    overflowX: "auto",
                  }}
                >
                  <div>$ {selectedReleaseRow.wgetCommand}</div>
                  <div style={{ color: "#34d399", marginTop: 4 }}>
                    SHA-256: {selectedReleaseRow.sha256}
                  </div>
                </div>

                <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 6 }}>
                  3.3 Install Package &amp; Verify OMD Distribution Version
                </div>
                <div
                  style={{
                    background: "#1c2228",
                    color: "#e2e8f0",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontFamily: "monospace",
                    fontSize: 11.5,
                    lineHeight: 1.6,
                  }}
                >
                  <div>$ {selectedReleaseRow.aptInstallCommand}</div>
                  <div style={{ color: "#38bdf8", marginTop: 6 }}>$ omd version</div>
                  <div style={{ color: "#34d399" }}>{XTRIKE_OMD_RUNTIME_SPEC.omdVersionOutput}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#f3eee4", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>
                    3.4 Create &amp; Start Monitoring Site (<code>sudo omd create {siteName}</code>)
                  </div>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value || "monitoring")}
                    style={{
                      width: 120,
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      fontSize: 11.5,
                      fontFamily: "monospace",
                    }}
                    aria-label="OMD site name"
                  />
                </div>

                <div
                  style={{
                    background: "#1c2228",
                    color: "#e2e8f0",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontFamily: "monospace",
                    fontSize: 11.2,
                    lineHeight: 1.55,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ color: "#38bdf8" }}>$ sudo omd create {siteName}</div>
                  <div>Adding /opt/omd/sites/{siteName}/tmp to /etc/fstab.</div>
                  <div>Creating temporary filesystem /omd/sites/{siteName}/tmp...OK</div>
                  <div>Restarting Apache...OK</div>
                  <div style={{ color: "#34d399" }}>
                    Created new site {siteName} with version {XTRIKE_OMD_RUNTIME_SPEC.version}.xtrike.
                  </div>
                  <div style={{ marginTop: 4 }}>
                    Default Web UI: <strong>http://your_server/{siteName}/</strong> (admin user: <code>cmkadmin</code>)
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>
                    Start site daemons (<code>sudo omd start {siteName}</code>):
                  </span>
                  <button
                    type="button"
                    onClick={() => setOmdSiteRunning((prev) => !prev)}
                    style={{
                      background: omdSiteRunning ? "#10b981" : "#8b4528",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 6,
                      padding: "4px 10px",
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {omdSiteRunning ? "All 9 OMD Daemons Running" : "Start OMD Daemons"}
                  </button>
                </div>

                <div
                  style={{
                    background: "#1c2228",
                    color: "#e2e8f0",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontFamily: "monospace",
                    fontSize: 11.2,
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ color: "#38bdf8", marginBottom: 4 }}>$ sudo omd start {siteName}</div>
                  {XTRIKE_OMD_RUNTIME_SPEC.daemons.map((d) => (
                    <div key={d}>
                      {d === "Crontab" ? "Initializing Crontab" : `Starting ${d}`}...
                      <span style={{ color: omdSiteRunning ? "#34d399" : "#f59e0b", fontWeight: 800 }}>
                        {omdSiteRunning ? "OK" : "STOPPED"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
