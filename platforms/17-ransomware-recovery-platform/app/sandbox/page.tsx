"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Box,
  Play,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  HardDrive,
  Cpu,
  Layers,
  Zap,
  Lock
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";

interface SandboxVM {
  id: string;
  name: string;
  sourceHost: string;
  vmdkSizeGB: number;
  ipQuarantine: string;
  status: "READY" | "RUNNING_REHEARSAL" | "VALIDATED_CLEAN" | "FAILED";
  cowOverlayMB: number;
  dbccCheckStatus: "PASSED" | "UNTESTED" | "CORRUPTED";
}

const MOCK_SANDBOX_VMS: SandboxVM[] = [
  {
    id: "vm-1",
    name: "CLONE-DC01-TEST",
    sourceHost: "DC01.mercy.local",
    vmdkSizeGB: 120,
    ipQuarantine: "192.168.99.10",
    status: "VALIDATED_CLEAN",
    cowOverlayMB: 420,
    dbccCheckStatus: "PASSED"
  },
  {
    id: "vm-2",
    name: "CLONE-SQL-CLINICAL",
    sourceHost: "SQL-PROD-01.mercy.local",
    vmdkSizeGB: 500,
    ipQuarantine: "192.168.99.20",
    status: "READY",
    cowOverlayMB: 1200,
    dbccCheckStatus: "UNTESTED"
  },
  {
    id: "vm-3",
    name: "CLONE-PACS-ARCHIVE",
    sourceHost: "PACS-SAN-01.mercy.local",
    vmdkSizeGB: 850,
    ipQuarantine: "192.168.99.30",
    status: "READY",
    cowOverlayMB: 840,
    dbccCheckStatus: "UNTESTED"
  }
];

export default function SandboxPage() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [vms, setVms] = useState<SandboxVM[]>(MOCK_SANDBOX_VMS);
  const [selectedVm, setSelectedVm] = useState<SandboxVM>(MOCK_SANDBOX_VMS[1]);
  const [isRehearsing, setIsRehearsing] = useState(false);
  const [rehearsalStep, setRehearsalStep] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[00:01:10 UTC] Quarantine Enclave active on vSwitch-Quarantine-99 (VLAN 9999).",
    "[00:01:12 UTC] DNS sinkhole loaded: 127.0.0.1 mapped to all external FQDNs.",
    "[00:01:15 UTC] Read-Only base images write-locked with CoW differential overlay."
  ]);

  const activeCase = MOCK_CASES.find((c) => c.id === selectedCaseId) || MOCK_CASES[0];

  const runRehearsal = () => {
    setIsRehearsing(true);
    setRehearsalStep(1);
    setTerminalLogs((prev) => [
      `[!] Launching full rehearsal test on ${selectedVm.name}...`,
      `[1/5] Mounting Copy-on-Write disk snapshot into isolated hypervisor slot...`,
      ...prev
    ]);

    const steps = [
      `[2/5] Initializing isolated boot on ${selectedVm.ipQuarantine} (No external egress allowed)...`,
      `[3/5] Applying recovery image patch and decryptor validation payload...`,
      `[4/5] Executing database consistency check (DBCC CHECKDB) on PatientDB...`,
      `[5/5] Fast-forwarding system clock by 7 days to test for dormant ransomware trigger logic...`,
      `[*] REHEARSAL SUCCESSFUL: DB consistency 100% verified, 0 malware detonations.`
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setRehearsalStep(idx + 2);
        setTerminalLogs((prev) => [step, ...prev]);

        if (idx === steps.length - 1) {
          setIsRehearsing(false);
          setVms((prev) =>
            prev.map((v) =>
              v.id === selectedVm.id
                ? { ...v, status: "VALIDATED_CLEAN", dbccCheckStatus: "PASSED" }
                : v
            )
          );
        }
      }, (idx + 1) * 800);
    });
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
              background: "rgba(6,182,212,0.15)",
              border: "1px solid rgba(6,182,212,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Box size={18} color="#06b6d4" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.01em" }}>
              Forensic Recovery Sandbox & Rehearsal Enclave
            </h1>
            <span className="badge-sev badge-medium">Pillar 3: Recover & Orchestrate</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 840, lineHeight: 1.5 }}>
            Isolated rehearsal sandbox running on an air-gapped virtual switch. Clone encrypted VM images with Copy-on-Write overlays,
            rehearse complete database restore procedures, and advance system clocks without touching original evidence.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={runRehearsal}
            disabled={isRehearsing}
            className="btn-primary"
          >
            <Play size={14} className={isRehearsing ? "animate-spin" : ""} />
            {isRehearsing ? `Rehearsing (Step ${rehearsalStep}/5)...` : "Run Rehearsal Test"}
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Enclave Network
            </span>
            <Lock size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#10b981" }}>
            vSwitch-Quarantine-99
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Air-Gapped · Egress Blackholed
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Active VM Clones
            </span>
            <Server size={15} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#06b6d4" }}>
            {vms.length} Rehearsal Clones
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Copy-on-Write Differential
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Evidence Integrity
            </span>
            <ShieldCheck size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#10b981" }}>
            100% Write-Blocked
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Master Images Untouched
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              DB Consistency Status
            </span>
            <CheckCircle2 size={15} color="#a855f7" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#a855f7" }}>
            DBCC CHECKDB OK
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            0 Allocation Page Errors
          </div>
        </div>
      </div>

      {/* Main Layout: VM Clones & Terminal Telemetry */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20 }}>
        {/* Left: VM Clone Roster */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
              Quarantine Enclave VM Clones
            </h3>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              Isolated vSwitch Topology
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {vms.map((vm) => {
              const isSelected = selectedVm.id === vm.id;
              const isClean = vm.status === "VALIDATED_CLEAN";

              return (
                <div
                  key={vm.id}
                  onClick={() => setSelectedVm(vm)}
                  style={{
                    background: isSelected ? "var(--surface-3)" : "var(--surface-2)",
                    border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "14px 16px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, color: "#f8fafc", fontSize: 13 }}>
                        {vm.name}
                      </span>
                      <span className={`badge-sev ${isClean ? "badge-success" : "badge-medium"}`}>
                        {vm.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      Host: <code>{vm.sourceHost}</code> · IP: <code style={{ color: "#06b6d4" }}>{vm.ipQuarantine}</code> · Size: {vm.vmdkSizeGB} GB
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: vm.dbccCheckStatus === "PASSED" ? "#10b981" : "var(--muted)" }}>
                      DBCC: {vm.dbccCheckStatus}
                    </div>
                    <div style={{ fontSize: 9.5, color: "var(--muted)" }}>
                      CoW Delta: {vm.cowOverlayMB} MB
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Sandbox Live Execution & Detonation Monitor */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Rehearsal Stage Stepper */}
          <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "#f8fafc", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
              5-Step Safe Rehearsal Pipeline
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11.5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: rehearsalStep >= 1 ? "#10b981" : "var(--muted)" }}>
                <CheckCircle2 size={13} color={rehearsalStep >= 1 ? "#10b981" : "var(--muted)"} />
                <span>1. Mount Copy-on-Write Differential Overlay</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: rehearsalStep >= 2 ? "#10b981" : "var(--muted)" }}>
                <CheckCircle2 size={13} color={rehearsalStep >= 2 ? "#10b981" : "var(--muted)"} />
                <span>2. Boot on Air-Gapped vSwitch with DNS Sinkhole</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: rehearsalStep >= 3 ? "#10b981" : "var(--muted)" }}>
                <CheckCircle2 size={13} color={rehearsalStep >= 3 ? "#10b981" : "var(--muted)"} />
                <span>3. Apply Restoration Payload & Key Verification</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: rehearsalStep >= 4 ? "#10b981" : "var(--muted)" }}>
                <CheckCircle2 size={13} color={rehearsalStep >= 4 ? "#10b981" : "var(--muted)"} />
                <span>4. Database Consistency Validation (DBCC CHECKDB)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: rehearsalStep >= 5 ? "#10b981" : "var(--muted)" }}>
                <CheckCircle2 size={13} color={rehearsalStep >= 5 ? "#10b981" : "var(--muted)"} />
                <span>5. System Clock Advance Detonation Test (+7 Days)</span>
              </div>
            </div>
          </div>

          {/* Sandbox Terminal Console */}
          <div className="card-tactical" style={{ padding: 18, background: "#050811" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Terminal size={14} color="#10b981" />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#f8fafc", fontFamily: "monospace" }}>
                  QUARANTINE ENCLAVE TELEMETRY STREAM
                </span>
              </div>
            </div>

            <div style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#10b981",
              lineHeight: 1.6,
              maxHeight: 140,
              overflowY: "auto"
            }}>
              {terminalLogs.map((log, idx) => (
                <div key={idx} style={{ color: log.includes("!") ? "#f59e0b" : log.includes("SUCCESS") ? "#10b981" : "#94a3b8" }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
