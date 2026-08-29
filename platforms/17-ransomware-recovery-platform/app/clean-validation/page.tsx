"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Lock,
  Unlock,
  FileCheck,
  Download,
  Key,
  Network,
  Cpu,
  UserCheck,
  Sparkles,
  ChevronRight,
  Printer,
  FileText
} from "lucide-react";
import { MOCK_CASES, MOCK_CLEAN_VALIDATION_CHECKS } from "@/data/recoveryData";
import { CleanValidationCheck } from "@/types/recovery";

export default function CleanValidationPage() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [systems, setSystems] = useState<CleanValidationCheck[]>(MOCK_CLEAN_VALIDATION_CHECKS);
  const [selectedSystemId, setSelectedSystemId] = useState<string>("chk-001");
  const [isValidating, setIsValidating] = useState(false);
  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [cisoPin, setCisoPin] = useState("");
  const [medDirectorPin, setMedDirectorPin] = useState("");
  const [cisoSigned, setCisoSigned] = useState(false);
  const [medDirectorSigned, setMedDirectorSigned] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeCase = MOCK_CASES.find(c => c.id === selectedCaseId) || MOCK_CASES[0];
  const activeSystem = systems.find(s => s.id === selectedSystemId) || systems[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRunValidation = (sysId: string) => {
    setIsValidating(true);
    setTimeout(() => {
      setSystems(prev =>
        prev.map(s => {
          if (s.id === sysId) {
            const updatedChecks = s.checks.map((c, i) =>
              i < 5 ? { ...c, passed: true } : c
            );
            return {
              ...s,
              checks: updatedChecks,
              overallStatus: updatedChecks.every(c => c.passed) ? "APPROVED_FOR_PROD" : "REQUIRES_REMEDIATION"
            };
          }
          return s;
        })
      );
      setIsValidating(false);
      showToast(`Automated 5-point technical validation passed for ${activeSystem.systemName}. Awaiting Dual Sign-Off.`);
    }, 1200);
  };

  const handleExecuteSignOff = () => {
    if (!cisoPin || !medDirectorPin) {
      alert("Both CISO and Medical Director / Officer authorization PINs are required for dual custody sign-off.");
      return;
    }

    setSystems(prev =>
      prev.map(s => {
        if (s.id === selectedSystemId) {
          const allPassedChecks = s.checks.map(c => ({ ...c, passed: true }));
          return {
            ...s,
            checks: allPassedChecks,
            overallStatus: "APPROVED_FOR_PROD",
            certifiedBy: "Elena Rostova (CISO) & Dr. Arthur Vance (Chief Medical Officer)",
            timestamp: new Date().toISOString()
          };
        }
        return s;
      })
    );

    setShowSignOffModal(false);
    setCisoPin("");
    setMedDirectorPin("");
    setCisoSigned(false);
    setMedDirectorSigned(false);
    showToast(`Dual Custody Authorization complete! ${activeSystem.systemName} is APPROVED for production reconnect.`);
  };

  const approvedCount = systems.filter(s => s.overallStatus === "APPROVED_FOR_PROD").length;
  const remediationCount = systems.filter(s => s.overallStatus === "REQUIRES_REMEDIATION").length;
  const blockedCount = systems.filter(s => s.overallStatus === "BLOCKED").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          top: 70,
          right: 24,
          zIndex: 100,
          background: "rgba(16, 185, 129, 0.95)",
          color: "#04100c",
          padding: "10px 18px",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 13,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        padding: "16px 20px",
        borderRadius: 8,
        border: "1px solid var(--border)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 8,
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <CheckCircle size={22} color="#10b981" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--fg)" }}>
                Clean Recovery Validation & Production Gatekeeper
              </h1>
              <span className="badge-sev badge-success">PILLAR 4 · VALIDATE</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              6-Point security gatekeeper preventing reinfection before reconnecting restored hosts to live production.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="tool-select"
            style={{ fontWeight: 600 }}
          >
            {MOCK_CASES.map(c => (
              <option key={c.id} value={c.id}>
                {c.caseNumber}: {c.organization}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowCertModal(true)}
            className="btn-secondary"
          >
            <FileCheck size={14} color="#06b6d4" />
            <span>Sanitization Certificate</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #10b981" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Production Approved
            </span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981", marginTop: 6 }}>
            {approvedCount} / {systems.length}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Passed 6 of 6 Security Gates
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Requires Remediation
            </span>
            <AlertTriangle size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b", marginTop: 6 }}>
            {remediationCount}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Awaiting Dual Sign-Off or Config fix
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #f43f5e" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Reinfection Blocked
            </span>
            <XCircle size={16} color="#f43f5e" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f43f5e", marginTop: 6 }}>
            {blockedCount}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Active threat vector quarantined
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 18px", borderLeft: "4px solid #06b6d4" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Gatekeeper Protocol
            </span>
            <ShieldCheck size={16} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#06b6d4", marginTop: 6 }}>
            6-Point NIST
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Strict Dual-Sign-Off Mandate
          </div>
        </div>
      </div>

      {/* Main Gatekeeper Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.9fr", gap: 16 }}>
        {/* Left Column: Systems List */}
        <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>
              Target Recovery Enclave Nodes
            </span>
            <span style={{ fontSize: 10.5, color: "var(--muted)" }}>
              {systems.length} Monitored Hosts
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {systems.map(sys => {
              const isSelected = sys.id === selectedSystemId;
              const passedCount = sys.checks.filter(c => c.passed).length;
              const isApproved = sys.overallStatus === "APPROVED_FOR_PROD";
              const isBlocked = sys.overallStatus === "BLOCKED";

              return (
                <div
                  key={sys.id}
                  onClick={() => setSelectedSystemId(sys.id)}
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    cursor: "pointer",
                    background: isSelected ? "rgba(16,185,129,0.12)" : "var(--surface-2)",
                    border: isSelected ? "1px solid rgba(16,185,129,0.4)" : "1px solid var(--border)",
                    transition: "all 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: isSelected ? "#10b981" : "var(--fg)" }}>
                      {sys.systemName}
                    </span>
                    <span className={`badge-sev ${isApproved ? "badge-success" : isBlocked ? "badge-critical" : "badge-high"}`}>
                      {sys.overallStatus.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
                    <span style={{ fontFamily: "monospace" }}>{sys.ipAddress}</span>
                    <span style={{ fontWeight: 600, color: passedCount === 6 ? "#10b981" : "#f59e0b" }}>
                      {passedCount} of 6 Gates Passed
                    </span>
                  </div>

                  {/* Micro progress bar */}
                  <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginTop: 2 }}>
                    <div style={{
                      width: `${(passedCount / 6) * 100}%`,
                      height: "100%",
                      background: passedCount === 6 ? "#10b981" : isBlocked ? "#f43f5e" : "#f59e0b",
                      transition: "width 0.3s ease"
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: 6-Point Security Gatekeeper Inspector */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
                  {activeSystem.systemName}
                </h2>
                <span className={`badge-sev ${activeSystem.overallStatus === "APPROVED_FOR_PROD" ? "badge-success" : "badge-high"}`}>
                  {activeSystem.overallStatus.replace(/_/g, " ")}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", marginTop: 2 }}>
                IP: {activeSystem.ipAddress} · Certified: {activeSystem.certifiedBy}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => handleRunValidation(activeSystem.id)}
                disabled={isValidating}
                className="btn-primary"
                style={{
                  background: isValidating ? "var(--surface-3)" : "var(--primary)",
                  cursor: isValidating ? "not-allowed" : "pointer"
                }}
              >
                <RefreshCw size={13} className={isValidating ? "animate-spin" : ""} />
                <span>{isValidating ? "Verifying..." : "Run 5-Point Auto-Test"}</span>
              </button>

              <button
                onClick={() => setShowSignOffModal(true)}
                className="btn-secondary"
                style={{ border: "1px solid rgba(16, 185, 129, 0.4)" }}
              >
                <Key size={13} color="#10b981" />
                <span>Dual Sign-Off</span>
              </button>
            </div>
          </div>

          {/* 6 Gates Accordion/Checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeSystem.checks.map((chk, idx) => {
              const isPassed = chk.passed;
              const icons = [Cpu, Lock, Network, Key, ShieldCheck, UserCheck];
              const Icon = icons[idx] || CheckCircle;

              return (
                <div
                  key={idx}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 6,
                    background: isPassed ? "rgba(16, 185, 129, 0.05)" : "rgba(244, 63, 94, 0.05)",
                    border: isPassed ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(244, 63, 94, 0.3)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: isPassed ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    <Icon size={16} color={isPassed ? "#10b981" : "#f43f5e"} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>
                        {chk.name}
                      </span>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: isPassed ? "#10b981" : "#f43f5e",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}>
                        {isPassed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {isPassed ? "PASSED & VERIFIED" : "ACTION REQUIRED"}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 4, lineHeight: 1.4 }}>
                      {chk.details}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Production Reconnect Banner */}
          <div style={{
            padding: 14,
            borderRadius: 6,
            background: activeSystem.overallStatus === "APPROVED_FOR_PROD" ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.1)",
            border: activeSystem.overallStatus === "APPROVED_FOR_PROD" ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(244, 63, 94, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {activeSystem.overallStatus === "APPROVED_FOR_PROD" ? (
                <Unlock size={20} color="#10b981" />
              ) : (
                <Lock size={20} color="#f43f5e" />
              )}
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: activeSystem.overallStatus === "APPROVED_FOR_PROD" ? "#10b981" : "#f43f5e" }}>
                  {activeSystem.overallStatus === "APPROVED_FOR_PROD" ? "PRODUCTION RECONNECT AUTHORIZED" : "PRODUCTION RECONNECT BLOCKED"}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {activeSystem.overallStatus === "APPROVED_FOR_PROD"
                    ? "Cryptographic clearance verified. Core routing can be re-enabled safely."
                    : "Host is quarantined. Requires 6/6 gate clearance and dual executive sign-off."}
                </div>
              </div>
            </div>

            {activeSystem.overallStatus === "APPROVED_FOR_PROD" && (
              <button
                onClick={() => showToast(`Initiating production network rejoin for ${activeSystem.systemName}...`)}
                className="btn-primary"
                style={{ padding: "6px 14px", fontSize: 12 }}
              >
                <Network size={13} />
                <span>Reintegrate Host</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dual-Custody Sign-Off Modal */}
      {showSignOffModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          padding: 20
        }}>
          <div className="card-tactical" style={{ width: 520, padding: 24, display: "flex", flexDirection: "column", gap: 18, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Key size={18} color="#10b981" />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
                  Dual-Custody Executive Gatekeeper Sign-Off
                </h3>
              </div>
              <button
                onClick={() => setShowSignOffModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16 }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>
              Production reintegration for <strong>{activeSystem.systemName}</strong> requires independent cryptographic authorization from both the <strong>Chief Information Security Officer (CISO)</strong> and the <strong>Chief Medical Officer / Operational Director</strong>.
            </div>

            {/* Officer 1: CISO */}
            <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>
                  Officer 1: Elena Rostova, CISSP (CISO)
                </span>
                <span style={{ fontSize: 10.5, color: "var(--muted)" }}>Security Clearance: Alpha</span>
              </div>
              <input
                type="password"
                placeholder="Enter CISO 6-digit Cryptographic PIN..."
                value={cisoPin}
                onChange={e => setCisoPin(e.target.value)}
                className="tool-input"
              />
            </div>

            {/* Officer 2: Medical Director */}
            <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#06b6d4" }}>
                  Officer 2: Dr. Arthur Vance (Chief Medical Officer)
                </span>
                <span style={{ fontSize: 10.5, color: "var(--muted)" }}>Clinical Operations Lead</span>
              </div>
              <input
                type="password"
                placeholder="Enter Medical Director 6-digit Authorization PIN..."
                value={medDirectorPin}
                onChange={e => setMedDirectorPin(e.target.value)}
                className="tool-input"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <button
                onClick={() => setShowSignOffModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteSignOff}
                className="btn-primary"
              >
                <CheckCircle size={14} />
                <span>Authorize & Stamp Production Clearance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sanitization Certificate Modal */}
      {showCertModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          padding: 20
        }}>
          <div className="card-tactical" style={{ width: 620, padding: 28, display: "flex", flexDirection: "column", gap: 18, background: "#0c1322", border: "1px solid #10b981" }}>
            <div style={{ textAlign: "center", borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.15em", color: "#10b981", textTransform: "uppercase" }}>
                AEGIS CYBER RECOVERY FORENSICS
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", marginTop: 4 }}>
                OFFICIAL CERTIFICATE OF HOST SANITIZATION
              </h2>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                Certificate ID: CERT-2026-AEGIS-8841-CLEAN · NIST CSF 2.0 & HIPAA § 164.308
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 12, color: "var(--fg-2)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "var(--surface)", padding: 12, borderRadius: 6, border: "1px solid var(--border)" }}>
                <div><strong>Incident:</strong> {activeCase.caseNumber}</div>
                <div><strong>Target Host:</strong> {activeSystem.systemName}</div>
                <div><strong>Ransomware Variant:</strong> {activeCase.ransomwareFamily}</div>
                <div><strong>Status:</strong> 100% CLEAN & PURGED</div>
              </div>

              <div style={{ fontSize: 11, lineHeight: 1.6, color: "var(--muted)" }}>
                This is to certify that the above host has undergone exhaustive YARA binary scanning, memory-space persistence hunting, Active Directory Kerberos credential purging, and 24-hour sandbox netflow baselining. No remnant threat actor persistence was detected.
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg)" }}>Elena Rostova, CISSP</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>CISO & DFIR Incident Commander</div>
                  <div style={{ fontSize: 9.5, color: "#10b981", fontFamily: "monospace" }}>SIG: 0x98f4e2a1b90c67d8f43210aa</div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg)" }}>Dr. Arthur Vance</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>Chief Medical Officer</div>
                  <div style={{ fontSize: 9.5, color: "#10b981", fontFamily: "monospace" }}>SIG: 0x33445566778899aabbccddeeff</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
              <button
                onClick={() => setShowCertModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showToast("Certificate PDF generated and downloaded.");
                  setShowCertModal(false);
                }}
                className="btn-primary"
              >
                <Download size={13} />
                <span>Export Official PDF Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
