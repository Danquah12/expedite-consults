"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Cloud,
  Layers,
  ExternalLink,
  ChevronDown,
  Shield,
  Activity,
  Zap,
  Server,
  Terminal,
  Radio,
  Search,
  Sliders,
  Play
} from "lucide-react";
import { CLOUD_ACCOUNTS } from "@/data/cloudData";

export function Navbar() {
  const [selectedAcc, setSelectedAcc] = useState("acc-aws-01");

  const activeAccount = CLOUD_ACCOUNTS.find(a => a.id === selectedAcc) || CLOUD_ACCOUNTS[0];

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
      {/* Left Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, #f59e0b 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(245,158,11,0.35)"
          }}>
            <Cloud size={18} color="#060913" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", color: "#f8fafc" }}>
                AXIOM <span style={{ color: "#f59e0b" }}>CLOUD</span>
              </span>
              <span style={{
                fontSize: 9,
                fontWeight: 800,
                padding: "1px 5px",
                borderRadius: 4,
                background: "rgba(245,158,11,0.15)",
                color: "#f59e0b",
                border: "1px solid rgba(245,158,11,0.3)",
                fontFamily: "monospace"
              }}>
                PLATFORM 19 &middot; ENTERPRISE
              </span>
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>
              Multi-Cloud PenTest &amp; Attack Path Intelligence
            </div>
          </div>
        </Link>

        <div style={{ width: 1, height: 26, background: "var(--border)" }} />

        {/* Cloud Account Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Server size={14} color="#06b6d4" />
          <select
            value={selectedAcc}
            onChange={(e) => setSelectedAcc(e.target.value)}
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
            {CLOUD_ACCOUNTS.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.provider}: {acc.name} ({acc.accountId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center Live Telemetry */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
          fontWeight: 700
        }}>
          <Radio size={13} />
          <span>STATUS: {activeAccount.status} ({activeAccount.complianceScore}% CIS COMPLIANT)</span>
        </div>

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
          <Zap size={13} />
          <span>CRITICAL ATTACK PATHS: {activeAccount.criticalIssues} ACTIVE</span>
        </div>
      </div>

      {/* Right Navigation Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        

        <Link
          href="/pentest"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#060913",
            padding: "5px 12px",
            borderRadius: 6,
            fontSize: 11.5,
            fontWeight: 800,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 0 12px rgba(245,158,11,0.4)"
          }}
        >
          <Play size={13} fill="#060913" />
          <span>Run PenTest Drill</span>
        </Link>
      </div>
    </header>
  );
}
