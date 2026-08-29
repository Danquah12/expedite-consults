"use client";

import { useState } from "react";
import {
  Sliders,
  Server,
  Laptop,
  Database,
  HardDrive,
  Clock,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Activity
} from "lucide-react";

interface DeviceProfile {
  id: string;
  name: string;
  role: "Workstation" | "File Server" | "Database Server" | "Backup Server" | "Domain Controller";
  iconName: string;
  meanWritesPerMin: number;
  stdDev: number;
  calculatedThreshold: number; // Mean + 3 * StdDev
  currentWritesPerMin: number;
  timeWindow: "Business Hours (9-5)" | "Off Hours (12-5 AM)" | "Scheduled Backup (2-4 AM)";
  status: "NORMAL" | "ELEVATED" | "SUSPICIOUS_ANOMALY";
}

export default function AdaptiveBaseliningPage() {
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [simulatedSurge, setSimulatedSurge] = useState<number>(0);
  const [timeMode, setTimeMode] = useState<"business" | "offhours" | "backup">("business");

  const [devices, setDevices] = useState<DeviceProfile[]>([
    {
      id: "DEV-01",
      name: "FIN-LAPTOP-042",
      role: "Workstation",
      iconName: "Laptop",
      meanWritesPerMin: 15,
      stdDev: 8,
      calculatedThreshold: 39, // 15 + 3 * 8
      currentWritesPerMin: 18,
      timeWindow: "Business Hours (9-5)",
      status: "NORMAL"
    },
    {
      id: "DEV-02",
      name: "STORAGE-SAN-01",
      role: "File Server",
      iconName: "Server",
      meanWritesPerMin: 850,
      stdDev: 120,
      calculatedThreshold: 1210, // 850 + 3 * 120
      currentWritesPerMin: 920,
      timeWindow: "Business Hours (9-5)",
      status: "NORMAL"
    },
    {
      id: "DEV-03",
      name: "MSSQL-CLUSTER-PROD",
      role: "Database Server",
      iconName: "Database",
      meanWritesPerMin: 3400,
      stdDev: 450,
      calculatedThreshold: 4750, // 3400 + 3 * 450
      currentWritesPerMin: 3600,
      timeWindow: "Business Hours (9-5)",
      status: "NORMAL"
    },
    {
      id: "DEV-04",
      name: "VEEAM-IMMUTABLE-01",
      role: "Backup Server",
      iconName: "HardDrive",
      meanWritesPerMin: 25000,
      stdDev: 3200,
      calculatedThreshold: 34600, // 25000 + 3 * 3200
      currentWritesPerMin: 26500,
      timeWindow: "Scheduled Backup (2-4 AM)",
      status: "NORMAL"
    }
  ]);

  const handleSimulateSurge = (devId: string, surgeAmount: number) => {
    setDevices(prev => prev.map(d => {
      if (d.id === devId) {
        const newWrites = d.meanWritesPerMin + surgeAmount;
        const isAnomaly = newWrites > d.calculatedThreshold;
        return {
          ...d,
          currentWritesPerMin: newWrites,
          status: isAnomaly ? "SUSPICIOUS_ANOMALY" : newWrites > (d.meanWritesPerMin + d.stdDev * 1.5) ? "ELEVATED" : "NORMAL"
        };
      }
      return d;
    }));
  };

  const filteredDevices = selectedRole === "all" ? devices : devices.filter(d => d.role === selectedRole);

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(6,182,212,0.35)"
          }}>
            <Sliders size={20} color="#050811" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>
              Adaptive Device-Tiered Dynamic Baselining Studio
            </h1>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>
              Mathematical Baseline &middot; Threshold = &mu; + 3&sigma; &middot; Time-Aware Sliding Windows &middot; Role-Based Noise Reduction
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border)", padding: "4px 8px", borderRadius: 8 }}>
          <Clock size={13} color="#06b6d4" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>Time Window:</span>
          <select
            value={timeMode}
            onChange={(e) => setTimeMode(e.target.value as any)}
            style={{ background: "transparent", border: "none", color: "#06b6d4", fontSize: 11.5, fontWeight: 700, outline: "none", cursor: "pointer" }}
          >
            <option value="business" style={{ background: "#0a0f1d" }}>Business Hours (09:00 - 17:00)</option>
            <option value="offhours" style={{ background: "#0a0f1d" }}>Off Hours (00:00 - 05:00)</option>
            <option value="backup" style={{ background: "#0a0f1d" }}>Scheduled Backup Window (02:00 - 04:00)</option>
          </select>
        </div>
      </div>

      {/* Baselining Mathematical Formula Card */}
      <div style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(168,85,247,0.08) 100%)", border: "1px solid rgba(6,182,212,0.25)", borderRadius: 10, padding: 18, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#06b6d4", letterSpacing: "0.05em", marginBottom: 4 }}>
            Dynamic Anomaly Equation: Gaussian 3-Sigma Rule
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#f8fafc", fontFamily: "monospace" }}>
            Threshold_Dynamic = &mu; (Historical Mean) + [ 3 &times; &sigma; (Standard Deviation) ]
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Eliminates static threshold false positives (e.g. backup jobs writing 100k files vs finance laptops writing 50 files).
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 800, border: "1px solid rgba(16,185,129,0.3)" }}>
            99.7% Normal Range Enforced
          </span>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["all", "Workstation", "File Server", "Database Server", "Backup Server"].map(role => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            style={{
              padding: "6px 14px",
              background: selectedRole === role ? "rgba(6,182,212,0.2)" : "var(--surface)",
              border: `1px solid ${selectedRole === role ? "#06b6d4" : "var(--border)"}`,
              color: selectedRole === role ? "#06b6d4" : "var(--muted)",
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {role.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Device Baselining Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
        {filteredDevices.map(dev => {
          const isAnomaly = dev.status === "SUSPICIOUS_ANOMALY";
          const progressPercent = Math.min(100, (dev.currentWritesPerMin / dev.calculatedThreshold) * 100);

          return (
            <div
              key={dev.id}
              style={{
                background: "var(--surface)",
                border: `1px solid ${isAnomaly ? "#f43f5e" : "var(--border)"}`,
                borderRadius: 10,
                padding: 20,
                boxShadow: isAnomaly ? "0 0 20px rgba(244,63,94,0.2)" : "none"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: "#f8fafc" }}>{dev.name}</span>
                    <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "var(--surface-2)", color: "var(--muted)", fontWeight: 700 }}>
                      {dev.role}
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>Device ID: {dev.id} &middot; Window: {dev.timeWindow}</div>
                </div>

                <span style={{
                  fontSize: 10.5,
                  padding: "3px 8px",
                  borderRadius: 4,
                  fontWeight: 800,
                  background: isAnomaly ? "rgba(244,63,94,0.15)" : "rgba(16,185,129,0.15)",
                  color: isAnomaly ? "#f43f5e" : "#10b981",
                  border: `1px solid ${isAnomaly ? "rgba(244,63,94,0.3)" : "rgba(16,185,129,0.3)"}`
                }}>
                  {dev.status}
                </span>
              </div>

              {/* Statistical Specs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, background: "var(--surface-2)", padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>Historical Mean (&mu;)</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#cbd5e1", fontFamily: "monospace" }}>{dev.meanWritesPerMin.toLocaleString()} /min</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>Std Deviation (&sigma;)</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#a855f7", fontFamily: "monospace" }}>&plusmn;{dev.stdDev.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>Dynamic Cutoff (&mu;+3&sigma;)</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#10b981", fontFamily: "monospace" }}>{dev.calculatedThreshold.toLocaleString()} /min</div>
                </div>
              </div>

              {/* Progress Bar of Current Activity */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
                  <span style={{ color: "var(--muted)" }}>Live Activity vs. Cutoff:</span>
                  <span style={{ fontWeight: 800, color: isAnomaly ? "#f43f5e" : "#10b981", fontFamily: "monospace" }}>
                    {dev.currentWritesPerMin.toLocaleString()} writes/min ({progressPercent.toFixed(1)}%)
                  </span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    width: `${progressPercent}%`,
                    height: "100%",
                    background: isAnomaly ? "#f43f5e" : progressPercent > 70 ? "#f59e0b" : "#10b981",
                    transition: "width 0.3s ease"
                  }} />
                </div>
              </div>

              {/* Interactive Simulation Controls */}
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => handleSimulateSurge(dev.id, dev.stdDev * 1)}
                  style={{ flex: 1, padding: "5px 0", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--fg)", fontSize: 10.5, fontWeight: 600, borderRadius: 5, cursor: "pointer" }}
                >
                  +1&sigma; Normal Load
                </button>
                <button
                  onClick={() => handleSimulateSurge(dev.id, dev.stdDev * 2)}
                  style={{ flex: 1, padding: "5px 0", background: "var(--surface-2)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", fontSize: 10.5, fontWeight: 600, borderRadius: 5, cursor: "pointer" }}
                >
                  +2&sigma; Heavy Batch
                </button>
                <button
                  onClick={() => handleSimulateSurge(dev.id, dev.stdDev * 5)}
                  style={{ flex: 1, padding: "5px 0", background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.4)", color: "#f43f5e", fontSize: 10.5, fontWeight: 700, borderRadius: 5, cursor: "pointer" }}
                >
                  +5&sigma; Ransomware Surge!
                </button>
                <button
                  onClick={() => handleSimulateSurge(dev.id, 0)}
                  style={{ padding: "5px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 5, cursor: "pointer" }}
                  title="Reset to baseline"
                >
                  <RefreshCw size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
