"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  ArrowUp,
  ArrowDown,
  Activity,
  Layers,
  Server,
  Database,
  Building,
  HeartPulse,
  Flame,
  FileSpreadsheet
} from "lucide-react";
import { MOCK_CASES, MOCK_DIGITAL_TWIN } from "@/data/recoveryData";

interface ImpactAsset {
  id: string;
  name: string;
  tier: "TIER_0" | "TIER_1" | "TIER_2" | "TIER_3";
  serviceCategory: "IDENTITY" | "CLINICAL_EHR" | "FINANCIAL" | "IMAGING" | "PORTAL" | "WORKSTATION";
  hourlyFinancialLossUSD: number;
  clinicalSafetyCritical: boolean;
  recoveryDependencyCount: number;
  estimatedRTOHours: number;
  status: "ENCRYPTED" | "IN_RESTORE" | "RECOVERED";
  priorityRank: number;
}

const INITIAL_ASSETS: ImpactAsset[] = [
  {
    id: "asset-001",
    name: "Primary Domain Controller (DC01)",
    tier: "TIER_0",
    serviceCategory: "IDENTITY",
    hourlyFinancialLossUSD: 85000,
    clinicalSafetyCritical: true,
    recoveryDependencyCount: 0,
    estimatedRTOHours: 2.0,
    status: "RECOVERED",
    priorityRank: 1
  },
  {
    id: "asset-002",
    name: "Epic EHR Database (SQL-CLINICAL-01)",
    tier: "TIER_0",
    serviceCategory: "CLINICAL_EHR",
    hourlyFinancialLossUSD: 240000,
    clinicalSafetyCritical: true,
    recoveryDependencyCount: 1,
    estimatedRTOHours: 4.5,
    status: "IN_RESTORE",
    priorityRank: 2
  },
  {
    id: "asset-003",
    name: "PACS Medical Imaging SAN Storage",
    tier: "TIER_1",
    serviceCategory: "IMAGING",
    hourlyFinancialLossUSD: 120000,
    clinicalSafetyCritical: true,
    recoveryDependencyCount: 1,
    estimatedRTOHours: 6.0,
    status: "ENCRYPTED",
    priorityRank: 3
  },
  {
    id: "asset-004",
    name: "Claims & Patient Billing Engine",
    tier: "TIER_1",
    serviceCategory: "FINANCIAL",
    hourlyFinancialLossUSD: 95000,
    clinicalSafetyCritical: false,
    recoveryDependencyCount: 2,
    estimatedRTOHours: 5.0,
    status: "ENCRYPTED",
    priorityRank: 4
  },
  {
    id: "asset-005",
    name: "Patient Appointment & Telehealth Portal",
    tier: "TIER_2",
    serviceCategory: "PORTAL",
    hourlyFinancialLossUSD: 35000,
    clinicalSafetyCritical: false,
    recoveryDependencyCount: 2,
    estimatedRTOHours: 3.5,
    status: "ENCRYPTED",
    priorityRank: 5
  },
  {
    id: "asset-006",
    name: "ICU Clinical Nursing Workstations (Subnet 14)",
    tier: "TIER_3",
    serviceCategory: "WORKSTATION",
    hourlyFinancialLossUSD: 18000,
    clinicalSafetyCritical: true,
    recoveryDependencyCount: 3,
    estimatedRTOHours: 8.0,
    status: "ENCRYPTED",
    priorityRank: 6
  }
];

export default function ImpactAssessmentPage() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [assets, setAssets] = useState<ImpactAsset[]>(INITIAL_ASSETS);
  const [strategyMode, setStrategyMode] = useState<"CLINICAL_SAFETY" | "MAX_REVENUE" | "FASTEST_RTO">("CLINICAL_SAFETY");
  const [elapsedSeconds, setElapsedSeconds] = useState(64800); // 18 hours outage

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalHourlyLoss = assets
    .filter((a) => a.status !== "RECOVERED")
    .reduce((acc, curr) => acc + curr.hourlyFinancialLossUSD, 0);

  const cumulativeFinancialLoss = (totalHourlyLoss / 3600) * elapsedSeconds;

  const reorderQueue = (direction: "UP" | "DOWN", index: number) => {
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= assets.length) return;

    const newAssets = [...assets];
    const temp = newAssets[index];
    newAssets[index] = newAssets[targetIdx];
    newAssets[targetIdx] = temp;

    const reRanked = newAssets.map((item, idx) => ({
      ...item,
      priorityRank: idx + 1
    }));
    setAssets(reRanked);
  };

  const applyOptimizationStrategy = (mode: "CLINICAL_SAFETY" | "MAX_REVENUE" | "FASTEST_RTO") => {
    setStrategyMode(mode);
    const sorted = [...assets].sort((a, b) => {
      if (mode === "CLINICAL_SAFETY") {
        if (a.clinicalSafetyCritical !== b.clinicalSafetyCritical) {
          return a.clinicalSafetyCritical ? -1 : 1;
        }
        return b.hourlyFinancialLossUSD - a.hourlyFinancialLossUSD;
      } else if (mode === "MAX_REVENUE") {
        return b.hourlyFinancialLossUSD - a.hourlyFinancialLossUSD;
      } else {
        return a.estimatedRTOHours - b.estimatedRTOHours;
      }
    });

    setAssets(sorted.map((item, idx) => ({ ...item, priorityRank: idx + 1 })));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(14,21,38,0.95) 0%, rgba(22,32,56,0.95) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <AlertTriangle size={18} color="#f59e0b" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.01em" }}>
              Business Impact & Recovery Priority Queue
            </h1>
            <span className="badge-sev badge-high">Pillar 2: Analyze & Preserve</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 840, lineHeight: 1.5 }}>
            Classify encrypted assets by business criticality (Tier 0 to Tier 3), compute continuous financial downtime losses,
            and dynamically orchestrate the optimal restoration sequence to minimize patient harm and revenue leakage.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            background: "rgba(244,63,94,0.15)",
            border: "1px solid rgba(244,63,94,0.4)",
            borderRadius: 8,
            padding: "8px 14px",
            textAlign: "right"
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#f43f5e", textTransform: "uppercase" }}>
              Downtime Run-Rate
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#f43f5e" }}>
              ${(totalHourlyLoss / 1000).toFixed(0)}k / hour
            </div>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Cumulative Outage Loss
            </span>
            <DollarSign size={15} color="#f43f5e" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#f43f5e", fontFamily: "monospace" }}>
            ${(cumulativeFinancialLoss).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Elapsed Outage: {(elapsedSeconds / 3600).toFixed(1)} Hours
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Tier-0 Critical Core
            </span>
            <HeartPulse size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981" }}>
            1 / 2 Restored
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            DC01 Online · SQL-CLINICAL in Progress
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Regulatory Fine Exposure
            </span>
            <ShieldAlert size={15} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b" }}>
            $1.75M HIPAA Risk
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Breach Notice Clock: 68h Remaining
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Optimization Strategy
            </span>
            <Sliders size={15} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#06b6d4" }}>
            {strategyMode.replace(/_/g, " ")}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Critical Life Safety Prioritized
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Queue & Tier Criticality Matrix */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 20 }}>
        {/* Left: Dynamic Recovery Priority Queue */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
                Restoration Sequence Queue
              </h3>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                Algorithmically ordered based on dependency graph and clinical impact
              </div>
            </div>

            {/* Strategy Toggles */}
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => applyOptimizationStrategy("CLINICAL_SAFETY")}
                style={{
                  background: strategyMode === "CLINICAL_SAFETY" ? "rgba(16,185,129,0.2)" : "var(--surface-2)",
                  color: strategyMode === "CLINICAL_SAFETY" ? "#10b981" : "var(--muted)",
                  border: strategyMode === "CLINICAL_SAFETY" ? "1px solid #10b981" : "1px solid var(--border)",
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 10.5,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Life Safety
              </button>
              <button
                onClick={() => applyOptimizationStrategy("MAX_REVENUE")}
                style={{
                  background: strategyMode === "MAX_REVENUE" ? "rgba(245,158,11,0.2)" : "var(--surface-2)",
                  color: strategyMode === "MAX_REVENUE" ? "#f59e0b" : "var(--muted)",
                  border: strategyMode === "MAX_REVENUE" ? "1px solid #f59e0b" : "1px solid var(--border)",
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 10.5,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Max Revenue
              </button>
              <button
                onClick={() => applyOptimizationStrategy("FASTEST_RTO")}
                style={{
                  background: strategyMode === "FASTEST_RTO" ? "rgba(6,182,212,0.2)" : "var(--surface-2)",
                  color: strategyMode === "FASTEST_RTO" ? "#06b6d4" : "var(--muted)",
                  border: strategyMode === "FASTEST_RTO" ? "1px solid #06b6d4" : "1px solid var(--border)",
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 10.5,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Fastest RTO
              </button>
            </div>
          </div>

          {/* Queue Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {assets.map((asset, idx) => {
              const isRecovered = asset.status === "RECOVERED";
              const isRestoring = asset.status === "IN_RESTORE";

              return (
                <div
                  key={asset.id}
                  style={{
                    background: isRecovered ? "rgba(16,185,129,0.06)" : isRestoring ? "rgba(6,182,212,0.08)" : "var(--surface-2)",
                    border: isRecovered ? "1px solid rgba(16,185,129,0.3)" : isRestoring ? "1px solid rgba(6,182,212,0.4)" : "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14
                  }}
                >
                  {/* Rank Badge */}
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: isRecovered ? "#10b981" : isRestoring ? "#06b6d4" : "var(--surface-3)",
                    color: isRecovered || isRestoring ? "#070b12" : "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 12
                  }}>
                    #{asset.priorityRank}
                  </div>

                  {/* Asset Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, color: "#f8fafc", fontSize: 13 }}>
                        {asset.name}
                      </span>
                      <span className={`badge-sev ${
                        asset.tier === "TIER_0" ? "badge-critical" : asset.tier === "TIER_1" ? "badge-high" : "badge-medium"
                      }`}>
                        {asset.tier}
                      </span>
                      {asset.clinicalSafetyCritical && (
                        <span className="badge-sev badge-critical" style={{ fontSize: 9 }}>
                          LIFE-CRITICAL
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      Est. RTO: <strong style={{ color: "var(--fg-2)" }}>{asset.estimatedRTOHours}h</strong> · Loss: <span style={{ color: "#f43f5e", fontWeight: 700 }}>${(asset.hourlyFinancialLossUSD / 1000).toFixed(0)}k/hr</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    <span style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: isRecovered ? "#10b981" : isRestoring ? "#06b6d4" : "#f43f5e",
                      background: isRecovered ? "rgba(16,185,129,0.15)" : isRestoring ? "rgba(6,182,212,0.15)" : "rgba(244,63,94,0.15)",
                      padding: "3px 8px",
                      borderRadius: 4
                    }}>
                      {asset.status}
                    </span>
                  </div>

                  {/* Manual Re-order buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <button
                      onClick={() => reorderQueue("UP", idx)}
                      disabled={idx === 0}
                      style={{
                        background: "none",
                        border: "none",
                        color: idx === 0 ? "rgba(255,255,255,0.1)" : "var(--muted)",
                        cursor: idx === 0 ? "default" : "pointer"
                      }}
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      onClick={() => reorderQueue("DOWN", idx)}
                      disabled={idx === assets.length - 1}
                      style={{
                        background: "none",
                        border: "none",
                        color: idx === assets.length - 1 ? "rgba(255,255,255,0.1)" : "var(--muted)",
                        cursor: idx === assets.length - 1 ? "default" : "pointer"
                      }}
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Criticality Tier Breakdown & Governance Rules */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "#f8fafc", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              Business Criticality Tier Standards
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{
                background: "rgba(244,63,94,0.08)",
                borderLeft: "3px solid #f43f5e",
                padding: "10px 12px",
                borderRadius: "0 6px 6px 0"
              }}>
                <div style={{ fontWeight: 800, color: "#f43f5e", fontSize: 12 }}>
                  TIER 0 — MISSION CRITICAL IDENTITY & CORE
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>
                  Active Directory DC, Clinical EHR (Epic/Cerner). RTO Target: &lt; 4 Hours. Zero tolerance for extended downtime.
                </div>
              </div>

              <div style={{
                background: "rgba(245,158,11,0.08)",
                borderLeft: "3px solid #f59e0b",
                padding: "10px 12px",
                borderRadius: "0 6px 6px 0"
              }}>
                <div style={{ fontWeight: 800, color: "#f59e0b", fontSize: 12 }}>
                  TIER 1 — REVENUE & OPERATIONAL CORE
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>
                  PACS Imaging Archive, SWIFT Clearing, Patient Billing SQL. RTO Target: &lt; 8 Hours.
                </div>
              </div>

              <div style={{
                background: "rgba(6,182,212,0.08)",
                borderLeft: "3px solid #06b6d4",
                padding: "10px 12px",
                borderRadius: "0 6px 6px 0"
              }}>
                <div style={{ fontWeight: 800, color: "#06b6d4", fontSize: 12 }}>
                  TIER 2 — ANCILLARY & WEB FARMS
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>
                  Patient Portals, Public Web, Scheduling. RTO Target: &lt; 24 Hours.
                </div>
              </div>

              <div style={{
                background: "rgba(148,163,184,0.08)",
                borderLeft: "3px solid #94a3b8",
                padding: "10px 12px",
                borderRadius: "0 6px 6px 0"
              }}>
                <div style={{ fontWeight: 800, color: "#94a3b8", fontSize: 12 }}>
                  TIER 3 — WORKSTATIONS & PERIPHERALS
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>
                  Clinical Laptops, Lab Terminals, Admin PCs. RTO Target: &lt; 72 Hours.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
