"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Clock,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Download,
  Filter,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  Building,
  RefreshCw,
  FileSpreadsheet,
  Check,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight
} from "lucide-react";

interface BenchmarkMetric {
  id: string;
  key: string;
  name: string;
  currentIncidentValue: number;
  unit: string;
  orgHistoricalValue: number;
  industryBaselineValue: number;
  slaTarget: number;
  betterIs: "LOWER" | "HIGHER";
  description: string;
  category: "TIMING" | "DATA_INTEGRITY" | "RISK";
}

const BENCHMARK_METRICS: BenchmarkMetric[] = [
  {
    id: "m-01",
    key: "MTTD",
    name: "Mean Time to Detect (MTTD)",
    currentIncidentValue: 14.2,
    unit: "mins",
    orgHistoricalValue: 228.0, // 3.8 hours
    industryBaselineValue: 12240.0, // 204 hours (8.5 days)
    slaTarget: 30.0,
    betterIs: "LOWER",
    description: "Time elapsed from initial stager execution to first automated high-fidelity alarm.",
    category: "TIMING"
  },
  {
    id: "m-02",
    key: "MTTI",
    name: "Mean Time to Identify / Triage (MTTI)",
    currentIncidentValue: 8.5,
    unit: "mins",
    orgHistoricalValue: 90.0,
    industryBaselineValue: 1080.0, // 18 hrs
    slaTarget: 15.0,
    betterIs: "LOWER",
    description: "Time to attribute ransomware variant (LockBit 3.0), cipher key mode, and compromised blast-radius hosts.",
    category: "TIMING"
  },
  {
    id: "m-03",
    key: "MTTC",
    name: "Mean Time to Contain (MTTC)",
    currentIncidentValue: 22.0,
    unit: "mins",
    orgHistoricalValue: 384.0, // 6.4 hrs
    industryBaselineValue: 4380.0, // 73 hrs
    slaTarget: 45.0,
    betterIs: "LOWER",
    description: "Time to micro-segment active subnets and quarantine infected hosts at firewall & EDR layers.",
    category: "TIMING"
  },
  {
    id: "m-04",
    key: "MTTR",
    name: "Mean Time to Restore (MTTR)",
    currentIncidentValue: 4.8,
    unit: "hours",
    orgHistoricalValue: 28.5,
    industryBaselineValue: 504.0, // 21 days
    slaTarget: 12.0,
    betterIs: "LOWER",
    description: "Total time to restore Tier-0 EHR databases and operational services from immutable snapshots.",
    category: "TIMING"
  },
  {
    id: "m-05",
    key: "RECOVERY_RATE",
    name: "Clean File Recovery Rate",
    currentIncidentValue: 98.2,
    unit: "%",
    orgHistoricalValue: 74.0,
    industryBaselineValue: 62.5,
    slaTarget: 95.0,
    betterIs: "HIGHER",
    description: "Percentage of encrypted production files successfully restored without ransom payment.",
    category: "DATA_INTEGRITY"
  },
  {
    id: "m-06",
    key: "REINFECTION_RATE",
    name: "Post-Recovery Reinfection Rate",
    currentIncidentValue: 0.0,
    unit: "%",
    orgHistoricalValue: 8.5,
    industryBaselineValue: 14.2,
    slaTarget: 0.0,
    betterIs: "LOWER",
    description: "Rate of re-encryption or persistent backdoor reactivation within 30 days of production reconnect.",
    category: "RISK"
  },
  {
    id: "m-07",
    key: "RPO_VARIANCE",
    name: "Actual Data Loss (RPO Delta)",
    currentIncidentValue: 12.0,
    unit: "mins",
    orgHistoricalValue: 180.0, // 3 hrs
    industryBaselineValue: 1440.0, // 24 hrs
    slaTarget: 60.0,
    betterIs: "LOWER",
    description: "Time delta between last clean immutable snapshot and ransomware deployment timestamp.",
    category: "DATA_INTEGRITY"
  }
];

export default function RecoveryBenchmarkPage() {
  const [metrics, setMetrics] = useState<BenchmarkMetric[]>(BENCHMARK_METRICS);
  const [industrySector, setIndustrySector] = useState<string>("HEALTHCARE");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [simulatedHosts, setSimulatedHosts] = useState<number>(24);
  const [hourlyDowntimeCost, setHourlyDowntimeCost] = useState<number>(45000);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered metrics
  const filteredMetrics = useMemo(() => {
    return metrics.filter(m => selectedCategory === "ALL" || m.category === selectedCategory);
  }, [metrics, selectedCategory]);

  // Total financial downtime savings calculation
  const financialSavings = useMemo(() => {
    // mttr comparison
    const mttrCurrent = 4.8;
    const mttrIndustry = 504.0;
    const mttrOrg = 28.5;

    const savedHoursVsIndustry = mttrIndustry - mttrCurrent;
    const savedHoursVsOrg = mttrOrg - mttrCurrent;

    const savedDollarsVsIndustry = Math.round(savedHoursVsIndustry * hourlyDowntimeCost);
    const savedDollarsVsOrg = Math.round(savedHoursVsOrg * hourlyDowntimeCost);

    return {
      savedHoursVsIndustry,
      savedHoursVsOrg,
      savedDollarsVsIndustry,
      savedDollarsVsOrg
    };
  }, [hourlyDowntimeCost]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div style={{ padding: "24px 28px", minHeight: "calc(100vh - 54px)", background: "var(--bg)", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast Notification */}
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
              RECOVERY PERFORMANCE & SLA BENCHMARKING ENGINE
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              Case INC-2026-8841 vs Historical & Peer Baselines
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", color: "var(--fg)", margin: 0 }}>
            Recovery Performance & Operational SLA Benchmarks
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 4, maxWidth: 880 }}>
            Benchmarks incident operational speed (MTTD, MTTI, MTTC, MTTR), recovery completeness (98.2%), and zero-reinfection efficacy against organizational historical performance and industry peer baselines.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={industrySector}
            onChange={(e) => setIndustrySector(e.target.value)}
            className="tool-select"
            style={{ fontWeight: 600 }}
          >
            <option value="HEALTHCARE">Healthcare & Clinical Systems (HHS Baseline)</option>
            <option value="FINANCIAL">Banking & Financial Services (FFIEC Baseline)</option>
            <option value="ENERGY">Energy & Critical Infrastructure (NERC-CIP)</option>
            <option value="MANUFACTURING">Manufacturing & Supply Chain Baseline</option>
            <option value="PUBLIC_SECTOR">State & Local Government Baseline</option>
          </select>

          <button
            onClick={() => {
              const exportData = {
                metadata: {
                  title: "Recovery Performance SLA Benchmark Report",
                  industrySector,
                  incidentId: "INC-2026-8841",
                  generatedAt: new Date().toISOString()
                },
                metrics: BENCHMARK_METRICS,
                financialSavings
              };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `Aegis-Recovery-Benchmark-INC-2026-8841.json`;
              a.click();
              triggerToast("Recovery SLA Benchmark dossier exported.");
            }}
            className="btn-primary"
          >
            <Download size={14} />
            Export Benchmark Dossier
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {/* MTTR Metric */}
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Mean Time to Restore (MTTR)</span>
            <Clock size={16} color="var(--primary)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: "var(--primary)" }}>4.8 hrs</span>
            <span style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 700 }}>99.0% Faster</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
            Industry Baseline: <strong style={{ color: "var(--fg)" }}>21.0 Days (504 hrs)</strong>
          </div>
        </div>

        {/* File Recovery Rate */}
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--cyan)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Clean Recovery Rate</span>
            <CheckCircle2 size={16} color="var(--cyan)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: "var(--cyan)" }}>98.2%</span>
            <span style={{ fontSize: 11.5, color: "var(--cyan)", fontWeight: 700 }}>$0 Ransom</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
            Industry Average: <strong style={{ color: "var(--fg)" }}>62.5% Data Salvaged</strong>
          </div>
        </div>

        {/* Reinfection Efficacy */}
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--purple)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Reinfection Rate</span>
            <ShieldCheck size={16} color="var(--purple)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: "var(--fg)" }}>0.0%</span>
            <span style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 700 }}>Certified Clean</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
            Industry Baseline: <strong style={{ color: "var(--rose)" }}>14.2% Re-attack within 30d</strong>
          </div>
        </div>

        {/* Downtime Savings Counter */}
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--amber)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Downtime Cost Averted</span>
            <DollarSign size={16} color="var(--amber)" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: "var(--amber)" }}>
              ${(financialSavings.savedDollarsVsOrg / 1000).toFixed(0)}k
            </span>
            <span style={{ fontSize: 11, color: "var(--fg-2)" }}>vs Prev. Org Avg</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
            Savings vs Industry: <strong style={{ color: "var(--fg)" }}>${(financialSavings.savedDollarsVsIndustry / 1000000).toFixed(2)}M</strong>
          </div>
        </div>
      </div>

      {/* Main Comparison Benchmarking Table */}
      <div className="card-tactical" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>METRIC CATEGORY:</span>
            {["ALL", "TIMING", "DATA_INTEGRITY", "RISK"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? "var(--primary)" : "var(--surface-2)",
                  color: selectedCategory === cat ? "#04100c" : "var(--fg-2)",
                  border: selectedCategory === cat ? "none" : "1px solid var(--border)",
                  padding: "5px 12px",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {cat.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "var(--muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)" }} /> Current Incident
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--cyan)" }} /> Org Historical
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--amber)" }} /> Industry Baseline
            </span>
          </div>
        </div>

        {/* Benchmark Comparison Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredMetrics.map((metric) => {
            const isBetterThanOrg =
              metric.betterIs === "LOWER"
                ? metric.currentIncidentValue <= metric.orgHistoricalValue
                : metric.currentIncidentValue >= metric.orgHistoricalValue;

            const isBetterThanIndustry =
              metric.betterIs === "LOWER"
                ? metric.currentIncidentValue <= metric.industryBaselineValue
                : metric.currentIncidentValue >= metric.industryBaselineValue;

            return (
              <div
                key={metric.id}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                        {metric.key}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                        {metric.name}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                      {metric.description}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: "rgba(16,185,129,0.15)",
                      color: "var(--primary)",
                      border: "1px solid rgba(16,185,129,0.3)"
                    }}>
                      SLA Target: {metric.slaTarget} {metric.unit} (PASSED)
                    </span>
                  </div>
                </div>

                {/* Metric 3-Way Values & Visual Comparison Bar */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, paddingTop: 4 }}>
                  {/* Current */}
                  <div style={{ background: "var(--surface-3)", padding: "10px 14px", borderRadius: 6, border: "1px solid rgba(16,185,129,0.3)" }}>
                    <div style={{ fontSize: 10.5, color: "var(--primary)", fontWeight: 800, textTransform: "uppercase" }}>
                      Current Aegis Incident
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "var(--fg)", marginTop: 2 }}>
                      {metric.currentIncidentValue} <span style={{ fontSize: 12, color: "var(--muted)" }}>{metric.unit}</span>
                    </div>
                  </div>

                  {/* Previous Org Avg */}
                  <div style={{ background: "var(--surface-3)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 10.5, color: "var(--cyan)", fontWeight: 800, textTransform: "uppercase" }}>
                      Org Historical Avg
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "var(--fg)", marginTop: 2 }}>
                      {metric.orgHistoricalValue} <span style={{ fontSize: 12, color: "var(--muted)" }}>{metric.unit}</span>
                    </div>
                  </div>

                  {/* Industry Baseline */}
                  <div style={{ background: "var(--surface-3)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 10.5, color: "var(--amber)", fontWeight: 800, textTransform: "uppercase" }}>
                      Industry Peer Baseline
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "var(--fg)", marginTop: 2 }}>
                      {metric.industryBaselineValue} <span style={{ fontSize: 12, color: "var(--muted)" }}>{metric.unit}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive What-If Downtime Cost Calculator */}
      <div className="card-tactical" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={16} color="var(--primary)" />
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)", margin: 0 }}>
            Interactive Business Interruption & Downtime Cost Calculator
          </h2>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--fg-2)", margin: 0 }}>
          Simulate business interruption cost avoidance across different hourly impact assumptions and affected host cluster scales.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 4 }}>
          {/* Slider 1: Hourly Downtime Cost */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>Hourly Outage Cost ($/hr):</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)" }}>${hourlyDowntimeCost.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="250000"
              step="5000"
              value={hourlyDowntimeCost}
              onChange={(e) => setHourlyDowntimeCost(Number(e.target.value))}
              style={{ cursor: "pointer", accentColor: "var(--primary)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)" }}>
              <span>$10k/hr (Mid-Market)</span>
              <span>$100k/hr (Regional Health)</span>
              <span>$250k/hr (Global FinTech)</span>
            </div>
          </div>

          {/* Slider 2: Number of Encrypted Hosts */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>Affected Host Scope:</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--cyan)" }}>{simulatedHosts} Virtualized Hosts</span>
            </div>
            <input
              type="range"
              min="5"
              max="250"
              step="5"
              value={simulatedHosts}
              onChange={(e) => setSimulatedHosts(Number(e.target.value))}
              style={{ cursor: "pointer", accentColor: "var(--cyan)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)" }}>
              <span>5 Hosts (Isolated Subnet)</span>
              <span>50 Hosts (Clinical Cluster)</span>
              <span>250 Hosts (Enterprise-wide)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
