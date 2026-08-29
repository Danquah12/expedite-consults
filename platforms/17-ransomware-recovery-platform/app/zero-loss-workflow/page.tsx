"use client";

import { useState } from "react";
import {
  ShieldCheck,
  FileCheck,
  Copy,
  Key,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Play,
  RotateCcw,
  ArrowRight,
  Eye,
  Check,
  X
} from "lucide-react";

export default function ZeroLossWorkflowPage() {
  const [activeStep, setActiveStep] = useState<number>(4); // Completed
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const workflowSteps = [
    { step: 1, name: "Encrypted File Ingest", desc: "Identify corrupted target (Never edit original in place)", icon: FileText, status: "DONE" },
    { step: 2, name: "Immutable Copy Creation", desc: "SHA-256 sealed replica created in forensic sandbox", icon: Copy, status: "DONE" },
    { step: 3, name: "Candidate Decryption", desc: "Execute AES-256-CTR / ChaCha20 key restoration", icon: Key, status: "DONE" },
    { step: 4, name: "Application Render Validation", desc: "Verify magic headers, ZIP XML schemas & render output", icon: Eye, status: "DONE" },
    { step: 5, name: "Atomic Production Swap", desc: "Clean verified file safely replaces encrypted payload", icon: ShieldCheck, status: "DONE" }
  ];

  const validationChecks = [
    { file: "Financial_Q3_Budget.xlsx", ext: "XLSX", magic: "50 4B 03 04 (PK ZIP)", xmlValid: true, appRender: "PASS (OpenXML Sheet Valid)", entropyBefore: 7.96, entropyAfter: 4.12, status: "VALIDATED" },
    { file: "Clinical_Trial_Patient_Data.pdf", ext: "PDF", magic: "25 50 44 46 (%PDF-1.7)", xmlValid: true, appRender: "PASS (xref & Pages Valid)", entropyBefore: 7.98, entropyAfter: 4.45, status: "VALIDATED" },
    { file: "Corporate_M&A_Agreement.docx", ext: "DOCX", magic: "50 4B 03 04 (PK ZIP)", xmlValid: true, appRender: "PASS (document.xml Rendered)", entropyBefore: 7.94, entropyAfter: 3.98, status: "VALIDATED" },
    { file: "Executive_Board_Photo.png", ext: "PNG", magic: "89 50 4E 47 (.PNG)", xmlValid: true, appRender: "PASS (RGBA Rasterized)", entropyBefore: 7.99, entropyAfter: 7.10, status: "VALIDATED" }
  ];

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "linear-gradient(135deg, #10b981 0%, #38bdf8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(16,185,129,0.35)"
          }}>
            <ShieldCheck size={20} color="#050811" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>
              Zero-Loss Safe Recovery 5-Step Workflow Workbench
            </h1>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>
              Non-Destructive Forensic Rule &middot; Original &rarr; Copy &rarr; Attempt &rarr; Render Validate &rarr; Atomic Replace
            </div>
          </div>
        </div>

        <span style={{ fontSize: 11.5, padding: "4px 12px", borderRadius: 6, background: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 800, border: "1px solid rgba(16,185,129,0.3)" }}>
          &check; ZERO-CORRUPTION GUARANTEE ACTIVE
        </span>
      </div>

      {/* 5-Step Workflow Visualizer */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {workflowSteps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 14,
                  position: "relative"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#10b981",
                    color: "#050811",
                    fontSize: 11,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {s.step}
                  </div>
                  <CheckCircle2 size={15} color="#10b981" />
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc", marginBottom: 4 }}>{s.name}</div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Format Application Render Validation Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#f8fafc", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <FileCheck size={16} color="#10b981" /> File Integrity &amp; Application Render Verification Matrix
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)", textAlign: "left" }}>
                <th style={{ padding: "10px 12px" }}>FILE NAME</th>
                <th style={{ padding: "10px 12px" }}>FORMAT</th>
                <th style={{ padding: "10px 12px" }}>MAGIC BYTE VERIFICATION</th>
                <th style={{ padding: "10px 12px" }}>APPLICATION RENDER TEST</th>
                <th style={{ padding: "10px 12px" }}>ENTROPY DROP (H(X))</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>VERDICT</th>
              </tr>
            </thead>
            <tbody>
              {validationChecks.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "12px", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={14} color="#06b6d4" />
                    {row.file}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--surface-2)", color: "#06b6d4", fontWeight: 800 }}>
                      {row.ext}
                    </span>
                  </td>
                  <td style={{ padding: "12px", fontFamily: "monospace", color: "#cbd5e1" }}>{row.magic}</td>
                  <td style={{ padding: "12px", color: "#10b981", fontWeight: 700 }}>{row.appRender}</td>
                  <td style={{ padding: "12px", fontFamily: "monospace" }}>
                    <span style={{ color: "#f43f5e" }}>{row.entropyBefore}</span> &rarr; <span style={{ color: "#10b981" }}>{row.entropyAfter}</span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <span style={{ fontSize: 10.5, padding: "3px 8px", borderRadius: 4, background: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 800, border: "1px solid rgba(16,185,129,0.3)" }}>
                      &check; SAFE TO REPLACE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
