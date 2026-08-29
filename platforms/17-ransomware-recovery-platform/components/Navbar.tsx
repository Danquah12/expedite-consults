"use client";
import Link from "next/link";
import {
  ShieldAlert,
  Activity,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  FileDown,
  Building,
  CheckCircle2,
  Lock,
  Unlock,
  Radio,
  Layers,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import { MOCK_CASES } from "@/data/recoveryData";

export function Navbar() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [isolated, setIsolated] = useState(false);
  const activeCase = MOCK_CASES.find(c => c.id === selectedCaseId) || MOCK_CASES[0];

  return (
    <header style={{
      height: 54,
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 16px",
      zIndex: 50,
      position: "sticky",
      top: 0
    }}>
      {/* Brand & Identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(16,185,129,0.3)"
          }}>
            <ShieldAlert size={18} color="#070b12" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", color: "#f8fafc" }}>
                AEGIS <span style={{ color: "#10b981" }}>RECOVERY</span>
              </span>
              <span style={{
                fontSize: 9,
                fontWeight: 800,
                padding: "1px 5px",
                borderRadius: 4,
                background: "rgba(16,185,129,0.15)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.3)",
                fontFamily: "monospace"
              }}>
                PRODUCT 2 · STANDALONE
              </span>
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>
              Ransomware Recovery Intelligence & Safe Orchestration
            </div>
          </div>
        </Link>

        {/* Vertical Divider */}
        <div style={{ width: 1, height: 26, background: "var(--border)" }} />

        {/* Active Incident Case Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Building size={14} color="#06b6d4" />
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 6,
              outline: "none",
              cursor: "pointer"
            }}
          >
            {MOCK_CASES.map(c => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} — {c.organization} ({c.ransomwareFamily})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center Active Threat Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(244,63,94,0.12)",
          border: "1px solid rgba(244,63,94,0.3)",
          padding: "4px 10px",
          borderRadius: 6,
          fontSize: 11.5,
          color: "#f43f5e",
          fontWeight: 700
        }}>
          <Radio size={13} className="animate-pulse" />
          <span>STATUS: {activeCase.status} ({activeCase.severity})</span>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.25)",
          padding: "4px 10px",
          borderRadius: 6,
          fontSize: 11.5,
          color: "#10b981",
          fontWeight: 600
        }}>
          <HardDrive size={13} />
          <span>RECOVERY PATH: {activeCase.primaryRecoveryPath.replace(/_/g, " ")}</span>
        </div>
      </div>

      {/* Right Controls & Emergency Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        

        <button
          onClick={() => setIsolated(!isolated)}
          style={{
            background: isolated ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.15)",
            border: isolated ? "1px solid #f43f5e" : "1px solid rgba(16,185,129,0.4)",
            color: isolated ? "#f43f5e" : "#10b981",
            padding: "5px 12px",
            borderRadius: 6,
            fontSize: 11.5,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.15s ease"
          }}
        >
          {isolated ? <Lock size={13} /> : <Unlock size={13} />}
          <span>{isolated ? "ENCLAVE ISOLATED" : "ISOLATE ENCLAVE"}</span>
        </button>

        <Link
          href="/reports"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
            padding: "5px 12px",
            borderRadius: 6,
            fontSize: 11.5,
            fontWeight: 600,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <FileDown size={13} color="#06b6d4" />
          <span>IR Report</span>
        </Link>
      </div>
    </header>
  );
}
