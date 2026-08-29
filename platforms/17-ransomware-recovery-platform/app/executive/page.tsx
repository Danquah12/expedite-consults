"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PieChart,
  DollarSign,
  AlertOctagon,
  ShieldAlert,
  Clock,
  Download,
  FileSpreadsheet,
  Building2,
  TrendingDown,
  Scale,
  Users,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Printer,
  ChevronRight,
  Share2,
  Lock,
  HardDrive
} from "lucide-react";
import { MOCK_CASES, MOCK_BACKUP_SOURCES } from "@/data/recoveryData";

export default function ExecutiveDashboard() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [hoursDowntime, setHoursDowntime] = useState(18.5);
  const [hourlyLossRate, setHourlyLossRate] = useState(145000); // $145,000 / hr
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [negotiationStance, setNegotiationStance] = useState<"REFUSE_PAYMENT" | "ENGAGED_DELAY" | "OFFER_SETTLEMENT">("REFUSE_PAYMENT");

  const currentCase = MOCK_CASES.find((c) => c.id === selectedCaseId) || MOCK_CASES[0];

  // Dynamic calculation
  const totalFinancialLoss = Math.round(hoursDowntime * hourlyLossRate);
  const ransomDemand = currentCase.ransomDemandUSD;
  const estimatedRecoverySavings = ransomDemand + 500000;

  // Compliance countdowns
  const hipaaDeadlineHours = 72 - 18;
  const gdprDeadlineHours = 72 - 18;
  const secDisclosureHours = 96 - 18;

  const handleExportPdf = () => {
    setPdfGenerating(true);
    setTimeout(() => {
      setPdfGenerating(false);
      setShowPdfModal(true);
    }, 900);
  };

  const businessServices = [
    { service: "Emergency Dept EHR (Epic)", tier: "Tier 0", hourlyLoss: "$65,000/hr", recoverability: 98, status: "RESTORING", eta: "4.5 hrs", owner: "Chief Medical Info Officer" },
    { service: "PACS Medical Imaging SAN", tier: "Tier 1", hourlyLoss: "$32,000/hr", recoverability: 94, status: "QUEUED", eta: "8.0 hrs", owner: "Radiology Director" },
    { service: "Patient Billing & MS-SQL", tier: "Tier 1", hourlyLoss: "$28,000/hr", recoverability: 92, status: "RESTORED", eta: "Done", owner: "VP of Revenue Cycle" },
    { service: "Outpatient Telehealth Web", tier: "Tier 2", hourlyLoss: "$12,000/hr", recoverability: 100, status: "STANDBY", eta: "2.0 hrs", owner: "Clinical Tech Lead" },
    { service: "Corporate Email & Identity", tier: "Tier 0", hourlyLoss: "$8,000/hr", recoverability: 100, status: "RESTORED", eta: "Done", owner: "CISO / Identity Ops" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* PAGE HEADER & CONTROLS */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#f43f5e", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              C-SUITE & BOARDROOM BRIEFING
            </span>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(244,63,94,0.15)", color: "#f43f5e", fontWeight: 700 }}>
              CONFIDENTIAL · ATTORNEY-CLIENT PRIVILEGE
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc", marginTop: 4 }}>
            Executive Ransomware Impact & Financial Ledger
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="tool-select"
            style={{ fontSize: 12, fontWeight: 600 }}
          >
            {MOCK_CASES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.organization} ({c.caseNumber})
              </option>
            ))}
          </select>

          <button onClick={handleExportPdf} className="btn-primary" style={{ padding: "8px 16px" }}>
            <Download size={14} />
            <span>{pdfGenerating ? "Generating Briefing..." : "Export Board Briefing (PDF)"}</span>
          </button>
        </div>
      </div>

      {/* TOP EXECUTIVE METRIC ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {/* Cumulative Loss */}
        <div className="card-tactical" style={{ padding: "16px 18px", borderLeft: "4px solid #f43f5e" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Cumulative Downtime Loss
            </span>
            <DollarSign size={16} color="#f43f5e" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#f43f5e", marginTop: 8, fontFamily: "monospace" }}>
            ${(totalFinancialLoss / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Accruing at <span style={{ color: "#f8fafc", fontWeight: 700 }}>${(hourlyLossRate / 1000).toFixed(0)}k / hour</span>
          </div>
        </div>

        {/* Legal & Regulatory Exposure */}
        <div className="card-tactical" style={{ padding: "16px 18px", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Regulatory Exposure
            </span>
            <Scale size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#f59e0b", marginTop: 8 }}>
            $4.2M <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>potential</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            HIPAA OCR Tier 4 + GDPR Article 83
          </div>
        </div>

        {/* Ransom Negotiation Stance */}
        <div className="card-tactical" style={{ padding: "16px 18px", borderLeft: "4px solid #10b981" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Extortion Stance
            </span>
            <Lock size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 8 }}>
            ZERO-PAYMENT
          </div>
          <div style={{ fontSize: 11, color: "#10b981", marginTop: 4 }}>
            $1.8M Ransom Demand Rejected
          </div>
        </div>

        {/* Business Recovery Countdown */}
        <div className="card-tactical" style={{ padding: "16px 18px", borderLeft: "4px solid #06b6d4" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Restoration Confidence
            </span>
            <Clock size={16} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#06b6d4", marginTop: 8, fontFamily: "monospace" }}>
            96.8%
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Full RTO estimated in <span style={{ color: "#06b6d4", fontWeight: 700 }}>18.5 hours</span>
          </div>
        </div>
      </div>

      {/* REGULATORY COMPLIANCE TIMELINES & NEGOTIATION WAR ROOM */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        {/* Compliance Clocks */}
        <div className="card-tactical" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                REGULATORY & LEGAL DISCLOSURE DEADLINES
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                Statutory breach notification obligations under federal and international statutes
              </div>
            </div>
            <Scale size={15} color="#f59e0b" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
            <div style={{ padding: "12px 14px", borderRadius: 6, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>HHS / HIPAA Breach Notification Rule</div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)" }}>Notice to HHS Secretary & impacted individuals (60-day max, 72h internal triage)</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: "#10b981", fontFamily: "monospace" }}>{hipaaDeadlineHours}h REMAINING</span>
                  <div style={{ fontSize: 9, color: "var(--muted)" }}>Status: In Counsel Review</div>
                </div>
              </div>
              <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
                <div style={{ width: "75%", height: "100%", background: "#10b981", borderRadius: 3 }} />
              </div>
            </div>

            <div style={{ padding: "12px 14px", borderRadius: 6, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>GDPR Article 33 (Data Protection Authority)</div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)" }}>Mandatory 72-hour notification to Lead Supervisory Authority</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: "#f59e0b", fontFamily: "monospace" }}>{gdprDeadlineHours}h REMAINING</span>
                  <div style={{ fontSize: 9, color: "var(--muted)" }}>Status: DPO Draft Completed</div>
                </div>
              </div>
              <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
                <div style={{ width: "75%", height: "100%", background: "#f59e0b", borderRadius: 3 }} />
              </div>
            </div>

            <div style={{ padding: "12px 14px", borderRadius: 6, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>SEC Form 8-K Item 1.05 Cybersecurity Event</div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)" }}>4 business day disclosure requirement upon determination of material impact</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: "#06b6d4", fontFamily: "monospace" }}>{secDisclosureHours}h REMAINING</span>
                  <div style={{ fontSize: 9, color: "var(--muted)" }}>Status: Materiality Committee Active</div>
                </div>
              </div>
              <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
                <div style={{ width: "81%", height: "100%", background: "#06b6d4", borderRadius: 3 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Negotiation & Extortion Status */}
        <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>EXTORTION & NEGOTIATION WAR ROOM</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Dark Web portal monitoring & affiliate communications</div>
            </div>
            <ShieldAlert size={15} color="#f43f5e" />
          </div>

          <div style={{ padding: "10px 12px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#f43f5e" }}>ATTACKER DEMAND: 28.5 BTC ($1,800,000)</span>
              <span style={{ fontSize: 9, padding: "2px 5px", background: "rgba(244,63,94,0.2)", borderRadius: 3, color: "#f43f5e", fontWeight: 700 }}>
                COUNTDOWN: 53h 45m
              </span>
            </div>
            <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 4 }}>
              Adversary threatened public release of 1.8 TB patient billing archives on Tor leak mirror if payment is not confirmed.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>EXECUTIVE DECISION STANCE:</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {[
                { id: "REFUSE_PAYMENT", label: "Zero-Payment (Backups)", color: "#10b981" },
                { id: "ENGAGED_DELAY", label: "Tactical Delay", color: "#f59e0b" },
                { id: "OFFER_SETTLEMENT", label: "OFAC Sanctions Check", color: "#8493a8" }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setNegotiationStance(s.id as any)}
                  style={{
                    padding: "8px 6px",
                    borderRadius: 6,
                    fontSize: 10.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: negotiationStance === s.id ? "rgba(16,185,129,0.15)" : "var(--surface-2)",
                    color: negotiationStance === s.id ? s.color : "var(--muted)",
                    border: negotiationStance === s.id ? `1px solid ${s.color}` : "1px solid var(--border)",
                    textAlign: "center"
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: 10, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)", fontSize: 11, color: "var(--fg-2)" }}>
            <span style={{ fontWeight: 700, color: "#10b981" }}>Legal Counsel Note: </span>
            OFAC FinCEN advisory strictly prohibits payments to sanctioned entities. Independent backup restore verified viable; no ransom payment recommended.
          </div>
        </div>
      </div>

      {/* SERVICE RESTORATION MATRIX */}
      <div className="card-tactical" style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
              CRITICAL BUSINESS & CLINICAL SERVICES IMPACT
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              Revenue loss, technical recovery status, and executive service ownership
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981" }}>
            TOTAL RECOVERABILITY: 96.8%
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Tier</th>
                <th>Hourly Loss</th>
                <th>Data Feasibility</th>
                <th>Restore Status</th>
                <th>Est. Ready</th>
                <th>Executive Lead</th>
              </tr>
            </thead>
            <tbody>
              {businessServices.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: "#f8fafc" }}>{row.service}</td>
                  <td>
                    <span style={{ fontSize: 9.5, padding: "2px 6px", borderRadius: 3, background: "rgba(255,255,255,0.06)", fontFamily: "monospace" }}>
                      {row.tier}
                    </span>
                  </td>
                  <td style={{ color: "#f43f5e", fontWeight: 700, fontFamily: "monospace" }}>{row.hourlyLoss}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981", fontFamily: "monospace" }}>{row.recoverability}%</span>
                      <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
                        <div style={{ width: `${row.recoverability}%`, height: "100%", background: "#10b981", borderRadius: 2 }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: row.status === "RESTORED" ? "rgba(16,185,129,0.2)" : row.status === "RESTORING" ? "rgba(6,182,212,0.2)" : "rgba(245,158,11,0.2)",
                        color: row.status === "RESTORED" ? "#10b981" : row.status === "RESTORING" ? "#06b6d4" : "#f59e0b"
                      }}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td style={{ fontFamily: "monospace", color: "var(--fg-2)" }}>{row.eta}</td>
                  <td style={{ color: "var(--muted)", fontSize: 11.5 }}>{row.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF EXPORT MODAL */}
      {showPdfModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20
          }}
        >
          <div
            className="card-tactical"
            style={{
              width: "100%",
              maxWidth: 650,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              background: "var(--surface)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.8)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle size={18} color="#10b981" />
                <span style={{ fontSize: 14, fontWeight: 900, color: "#f8fafc" }}>
                  Board-Ready Incident Briefing Prepared
                </span>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.6 }}>
              <p><strong>Document ID:</strong> AEGIS-EXEC-BRIEF-2026-8841-V1</p>
              <p><strong>Prepared for:</strong> Mercy General Health System Board of Directors & C-Suite</p>
              <p><strong>Key Highlights Included:</strong></p>
              <ul style={{ paddingLeft: 18, marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                <li>Zero-Payment recommendation supported by 98.5% immutable S3 backup integrity.</li>
                <li>Estimated RTO of 18.5 hours with $2.68M accrued financial downtime impact.</li>
                <li>Attribution confidence: 97.4% LockBit 3.0 (FIN12 affiliate).</li>
                <li>Statutory regulatory disclosure deadlines (HIPAA, GDPR, SEC) tracked and within safe margins.</li>
              </ul>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={() => setShowPdfModal(false)} className="btn-secondary">
                Close
              </button>
              <button
                onClick={() => {
                  alert("Executive Briefing PDF downloaded: AEGIS_BOARD_BRIEF_INC-2026-8841.pdf");
                  setShowPdfModal(false);
                }}
                className="btn-primary"
              >
                <Download size={14} />
                <span>Download Executive PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
