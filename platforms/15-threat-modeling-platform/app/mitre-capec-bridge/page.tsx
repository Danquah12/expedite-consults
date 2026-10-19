"use client";

import { Compass, CheckCircle2 } from "lucide-react";

const mappings = [
  { capec: "CAPEC-66", technique: "T1190 · Exploit Public-Facing Application", stride: "Tampering (T-1)", nist: "SI-10 · Input Validation", status: "Rule Exported" },
  { capec: "CAPEC-122", technique: "T1078 · Valid Accounts / Privilege Abuse", stride: "Elevation of Privilege (E-1)", nist: "AC-3 · Access Enforcement", status: "Rule Exported" },
  { capec: "CAPEC-151", technique: "T1556 · Modify Authentication Process", stride: "Spoofing (S-1)", nist: "IA-2(1) · Multi-Factor Auth", status: "Rule Exported" },
  { capec: "CAPEC-116", technique: "T1552 · Unsecured Credentials in Files", stride: "Information Disclosure (I-1)", nist: "SC-28 · Protection at Rest", status: "Rule Exported" },
  { capec: "CAPEC-93", technique: "T1562.008 · Disable Cloud Logs", stride: "Repudiation (R-1)", nist: "AU-9 · Protection of Audit Info", status: "Rule Exported" },
];

export default function MitreCapecBridgePage() {
  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2 max-w-3xl">
        <div className="desk-kicker">AXIOM THREAT DESK &middot; MITRE ATT&amp;CK &amp; CAPEC BRIDGE</div>
        <h1 className="text-3xl sm:text-4xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
          MITRE ATT&amp;CK &amp; CAPEC Adversary Pattern Matrix
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          Cross-walk between STRIDE design findings, MITRE CAPEC common attack patterns, ATT&amp;CK adversary techniques, and NIST SP 800-53 Rev. 5 controls.
        </p>
      </div>

      <div className="card-surface p-6 space-y-3">
        {mappings.map((m) => (
          <div
            key={m.capec}
            className="p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ background: "var(--background)", border: "1px solid var(--border)" }}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                  {m.capec}
                </span>
                <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                  {m.technique}
                </span>
              </div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                STRIDE Vector: <strong>{m.stride}</strong> &middot; Control: <span className="font-mono">{m.nist}</span>
              </div>
            </div>
            <span className="badge-resolved px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {m.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
