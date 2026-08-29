"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  PieChart,
  Sliders,
  CheckCircle2,
  Building,
  Layers,
  ArrowRight,
  Printer,
  Sparkles,
  Info,
  Scale,
  Activity
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";

export default function CostEstimatorPage() {
  // Interactive Parameters
  const [downtimeHours, setDowntimeHours] = useState<number>(18.5);
  const [hourlyBurnRate, setHourlyBurnRate] = useState<number>(145000);
  const [affectedRecords, setAffectedRecords] = useState<number>(47000);
  const [forensicSpecialistHours, setForensicSpecialistHours] = useState<number>(120);
  const [containmentLatencyMinutes, setContainmentLatencyMinutes] = useState<number>(12); // Aegis Automated = 12m vs Manual = 240m
  const [insuranceDeductible, setInsuranceDeductible] = useState<number>(250000);
  const [insuranceCoverageCap, setInsuranceCoverageCap] = useState<number>(5000000);
  const [ransomDemandUSD, setRansomDemandUSD] = useState<number>(1800000);

  // Financial Calculations
  const operationalDowntimeLoss = downtimeHours * hourlyBurnRate;
  const forensicInvestigationCost = forensicSpecialistHours * 485 + 50000; // $485/hr + $50k emergency retainer
  const legalAndRegulatoryFines = affectedRecords * 18.5 + 150000; // HIPAA per-record + legal counsel retainer
  const recoveryInfraCost = 85000 + (downtimeHours * 1800); // Cloud surge compute + storage provisioning
  const reputationAndChurnLoss = affectedRecords * 12.0; // Estimated 12-month patient/client attrition

  const totalGrossIncidentCost = operationalDowntimeLoss + forensicInvestigationCost + legalAndRegulatoryFines + recoveryInfraCost + reputationAndChurnLoss;

  // Manual Delay Benchmark (What if manual 48-hour response happened?)
  const delayedDowntimeHours = 48.0;
  const delayedGrossCost = (delayedDowntimeHours * hourlyBurnRate) + (240 * 485 + 75000) + (affectedRecords * 2 * 18.5 + 250000) + 210000 + (affectedRecords * 2 * 15.0);

  const proactiveSavings = Math.max(0, delayedGrossCost - totalGrossIncidentCost);

  // Insurance Net Out-of-Pocket
  const insurableCost = operationalDowntimeLoss + forensicInvestigationCost + recoveryInfraCost;
  const insurancePayout = Math.min(Math.max(0, insurableCost - insuranceDeductible), insuranceCoverageCap);
  const netOutOfPocketCost = Math.max(0, totalGrossIncidentCost - insurancePayout);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Banner Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(16,185,129,0.06) 50%, rgba(14,21,38,0.95) 100%)",
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
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.4)",
              borderRadius: 8,
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <DollarSign size={18} color="var(--amber)" />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--amber)", letterSpacing: "0.08em" }}>
                STAGE 6: FINANCIAL QUANTIFICATION
              </span>
            </div>
            <span className="badge-sev badge-high">REAL-TIME LOSS CALCULATOR</span>
            <span className="badge-sev badge-success">ROI & SLA BENCHMARK</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", marginBottom: 6 }}>
            Cost-of-Incident & Financial Loss Quantifier
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 840, lineHeight: 1.5 }}>
            Enterprise financial impact model quantifying operational downtime ($145k/hr), DFIR investigation fees, regulatory/HIPAA disclosure liabilities, cloud surge compute, and business reputation churn. Compare automated Aegis containment ROI vs manual delayed response.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => window.print()}
            className="btn-secondary"
            style={{ padding: "10px 16px", fontSize: 12 }}
          >
            <Printer size={15} />
            Export Executive Board Brief
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        <div className="card-tactical" style={{ padding: 18, borderLeft: "3px solid var(--rose)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Total Gross Incident Loss</span>
            <AlertTriangle size={16} color="var(--rose)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--rose)" }}>
            ${(totalGrossIncidentCost / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>
            Full direct & indirect financial liability
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 18, borderLeft: "3px solid var(--primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Aegis Proactive Savings</span>
            <TrendingUp size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--primary)" }}>
            ${(proactiveSavings / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>
            Saved vs 48-hour manual containment
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 18, borderLeft: "3px solid var(--cyan)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Estimated Insurance Payout</span>
            <ShieldCheck size={16} color="var(--cyan)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--cyan)" }}>
            ${(insurancePayout / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>
            Net deductible: ${(insuranceDeductible / 1000).toFixed(0)}k
          </div>
        </div>

        <div className="card-tactical" style={{ padding: 18, borderLeft: "3px solid var(--amber)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Net Out-of-Pocket Cost</span>
            <DollarSign size={16} color="var(--amber)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--amber)" }}>
            ${(netOutOfPocketCost / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>
            Post-cyber insurance indemnification
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Parameters (Left) + Cost Breakdown & Waterfall (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 20 }}>
        
        {/* Left Column: Cost Drivers & Sliders */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Sliders size={17} color="var(--primary)" />
            <h2 style={{ fontSize: 14.5, fontWeight: 800, color: "var(--fg)" }}>
              Incident Cost Driver Inputs
            </h2>
          </div>

          {/* Slider 1: Total Downtime Hours */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "var(--fg-2)", fontWeight: 600 }}>Incident Outage Duration</span>
              <span style={{ fontWeight: 800, color: "var(--primary)" }}>{downtimeHours} Hours</span>
            </div>
            <input
              type="range"
              min="1"
              max="72"
              step="0.5"
              value={downtimeHours}
              onChange={(e) => setDowntimeHours(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--primary)", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)" }}>
              <span>1 hr (Rapid)</span>
              <span>18.5h (Current Case)</span>
              <span>72h (Severe)</span>
            </div>
          </div>

          {/* Slider 2: Hourly Burn Rate */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "var(--fg-2)", fontWeight: 600 }}>Hourly Downtime Burn Rate</span>
              <span style={{ fontWeight: 800, color: "var(--amber)" }}>${hourlyBurnRate.toLocaleString()} / hr</span>
            </div>
            <input
              type="range"
              min="20000"
              max="500000"
              step="5000"
              value={hourlyBurnRate}
              onChange={(e) => setHourlyBurnRate(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--amber)", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)" }}>
              <span>$20k/hr (Mid-Market)</span>
              <span>$145k/hr (Regional Health)</span>
              <span>$500k/hr (Enterprise Tier 1)</span>
            </div>
          </div>

          {/* Slider 3: Affected Records / Patients */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "var(--fg-2)", fontWeight: 600 }}>Compromised Records (HIPAA / PII)</span>
              <span style={{ fontWeight: 800, color: "var(--rose)" }}>{affectedRecords.toLocaleString()} Records</span>
            </div>
            <input
              type="range"
              min="1000"
              max="250000"
              step="1000"
              value={affectedRecords}
              onChange={(e) => setAffectedRecords(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--rose)", cursor: "pointer" }}
            />
          </div>

          {/* Slider 4: Forensic Specialist Hours */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "var(--fg-2)", fontWeight: 600 }}>External DFIR Investigation Effort</span>
              <span style={{ fontWeight: 800, color: "var(--cyan)" }}>{forensicSpecialistHours} Hours</span>
            </div>
            <input
              type="range"
              min="20"
              max="400"
              step="10"
              value={forensicSpecialistHours}
              onChange={(e) => setForensicSpecialistHours(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--cyan)", cursor: "pointer" }}
            />
          </div>

          {/* Insurance Policy Settings */}
          <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: 8, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--fg)", textTransform: "uppercase" }}>
              Cyber Insurance Policy Parameters
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
              <span style={{ color: "var(--muted)" }}>Deductible:</span>
              <span style={{ fontWeight: 700, color: "var(--fg)" }}>${insuranceDeductible.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
              <span style={{ color: "var(--muted)" }}>Policy Aggregate Limit:</span>
              <span style={{ fontWeight: 700, color: "var(--primary)" }}>${(insuranceCoverageCap / 1000000).toFixed(1)}M</span>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Breakdown Table & Comparative ROI Model */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Detailed Cost Component Breakdown Table */}
          <div className="card-tactical" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 14.5, fontWeight: 800, color: "var(--fg)" }}>
                Componentized Financial Loss Breakdown
              </h2>
              <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
                AUDITED AGAINST NIST SP 800-61
              </span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Cost Category</th>
                  <th>Calculation Driver</th>
                  <th>Estimated Gross Amount</th>
                  <th>% of Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--fg)" }}>Operational Downtime Loss</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>Lost clinical procedures, cancelled surgeries, billing delays</div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 11 }}>{downtimeHours} hrs × ${hourlyBurnRate.toLocaleString()}/hr</td>
                  <td style={{ fontWeight: 800, color: "var(--amber)" }}>${operationalDowntimeLoss.toLocaleString()}</td>
                  <td style={{ fontFamily: "monospace" }}>{Math.round((operationalDowntimeLoss / totalGrossIncidentCost) * 100)}%</td>
                </tr>
                <tr>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--fg)" }}>External DFIR Investigation</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>Host memory forensics, malware reverse engineering, root-cause</div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 11 }}>{forensicSpecialistHours} hrs @ $485/hr + retainer</td>
                  <td style={{ fontWeight: 800, color: "var(--cyan)" }}>${forensicInvestigationCost.toLocaleString()}</td>
                  <td style={{ fontFamily: "monospace" }}>{Math.round((forensicInvestigationCost / totalGrossIncidentCost) * 100)}%</td>
                </tr>
                <tr>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--fg)" }}>Legal, Notification & Regulatory Fines</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>HIPAA OCR breach notification, SEC 4-day filing, class counsel</div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 11 }}>{affectedRecords.toLocaleString()} records + counsel</td>
                  <td style={{ fontWeight: 800, color: "var(--rose)" }}>${Math.round(legalAndRegulatoryFines).toLocaleString()}</td>
                  <td style={{ fontFamily: "monospace" }}>{Math.round((legalAndRegulatoryFines / totalGrossIncidentCost) * 100)}%</td>
                </tr>
                <tr>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--fg)" }}>Recovery Compute & Storage Surge</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>AWS S3 egress bandwidth, ephemeral staging sandboxes, SAN IOPS</div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 11 }}>Cloud burst provisioning + SAN IOPS</td>
                  <td style={{ fontWeight: 800, color: "var(--fg)" }}>${Math.round(recoveryInfraCost).toLocaleString()}</td>
                  <td style={{ fontFamily: "monospace" }}>{Math.round((recoveryInfraCost / totalGrossIncidentCost) * 100)}%</td>
                </tr>
                <tr>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--fg)" }}>Patient / Client Churn & Reputation</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>12-month downstream customer defection and brand recovery</div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 11 }}>Attrition formula @ $12/record</td>
                  <td style={{ fontWeight: 800, color: "var(--purple)" }}>${reputationAndChurnLoss.toLocaleString()}</td>
                  <td style={{ fontFamily: "monospace" }}>{Math.round((reputationAndChurnLoss / totalGrossIncidentCost) * 100)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Proactive Containment vs Delayed Response Comparison */}
          <div className="card-tactical" style={{ padding: 18, background: "rgba(14,21,38,0.75)", border: "1px solid var(--primary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Scale size={18} color="var(--primary)" />
              <h2 style={{ fontSize: 14.5, fontWeight: 800, color: "var(--fg)" }}>
                Containment ROI Model: Automated Aegis vs 48-Hour Delayed Response
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", marginBottom: 4 }}>
                  Automated Aegis Response (Active)
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)" }}>
                  ${(totalGrossIncidentCost / 1000000).toFixed(2)}M
                </div>
                <div style={{ fontSize: 11.5, color: "var(--fg-2)", marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span>• Containment Latency: <strong>12 Minutes</strong></span>
                  <span>• Total Outage Duration: <strong>18.5 Hours</strong></span>
                  <span>• Encrypted Hosts: <strong>24 Hosts</strong></span>
                </div>
              </div>

              <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--rose)", textTransform: "uppercase", marginBottom: 4 }}>
                  Unassisted Manual Response (Industry Avg)
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "var(--rose)" }}>
                  ${(delayedGrossCost / 1000000).toFixed(2)}M
                </div>
                <div style={{ fontSize: 11.5, color: "var(--fg-2)", marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span>• Containment Latency: <strong>240 Minutes (4h)</strong></span>
                  <span>• Total Outage Duration: <strong>48.0 Hours</strong></span>
                  <span>• Encrypted Hosts: <strong>88+ Hosts (Full Spread)</strong></span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(16,185,129,0.15)", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--fg)" }}>
                Total Verified Financial Benefit of Aegis Platform:
              </span>
              <span style={{ fontSize: 16, fontWeight: 900, color: "var(--primary)" }}>
                +${(proactiveSavings / 1000000).toFixed(2)}M SAVED
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
