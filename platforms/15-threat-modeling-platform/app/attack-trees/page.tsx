"use client";

import Link from "next/link";
import { Target, ArrowRight } from "lucide-react";

const attackPaths = [
  {
    id: "PATH-01",
    goal: "Exfiltrate Customer_PII_DB Records",
    steps: "Public Portal -> API Gateway (BOLA / SQLi) -> Direct TCP 5432 -> Dump PostgreSQL",
    cost: "$200 / 45m",
    chokePoint: "Enforce Prepared Statements (T-1) + Envoy mTLS Sidecar on Postgres",
    status: "Choke-Point Identified",
  },
  {
    id: "PATH-02",
    goal: "Forge Admin OIDC Session Token",
    steps: "Phishing / Credential Stuffing -> Auth Service Weak Secret -> Role Escalation (E-1)",
    cost: "$450 / 2.0h",
    chokePoint: "Pin RS256 JWKS Hardware Key + Enforce FIDO2 MFA (S-1)",
    status: "Mitigated",
  },
  {
    id: "PATH-03",
    goal: "Tamper with CloudTrail Audit Logs",
    steps: "Compromised CI Runner -> Assume Admin Role -> Modify S3 Audit Bucket (R-1)",
    cost: "$600 / 3.5h",
    chokePoint: "Enable S3 Object Lock (WORM Compliance Mode) + Separate KMS Key",
    status: "Choke-Point Identified",
  },
];

export default function AttackTreesPage() {
  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2 max-w-3xl">
        <div className="desk-kicker">AXIOM THREAT DESK &middot; ATTACK TREE SIMULATOR</div>
        <h1 className="text-3xl sm:text-4xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
          Attack Tree Decision Simulator &amp; Choke-Point Analysis
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          Evaluates multi-stage adversary paths by attacker cost and time-to-compromise, identifying single architectural choke-points that prune entire exploit trees.
        </p>
      </div>

      <div className="space-y-4">
        {attackPaths.map((p) => (
          <div key={p.id} className="card-surface p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold" style={{ background: "var(--accent)", color: "#fbf8f3" }}>
                  {p.id}
                </span>
                <h2 className="text-lg font-bold font-editorial" style={{ color: "var(--foreground)" }}>
                  {p.goal}
                </h2>
              </div>
              <span className={`${p.status === "Mitigated" ? "badge-resolved" : "badge-high"} px-3 py-0.5 rounded-full text-xs font-bold`}>
                {p.status} &middot; {p.cost}
              </span>
            </div>
            <div className="p-3.5 rounded-xl font-mono text-xs" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
              {p.steps}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs" style={{ color: "var(--muted)" }}>
              <span>
                <strong style={{ color: "var(--foreground)" }}>Recommended Choke-Point:</strong> {p.chokePoint}
              </span>
              <Link href="/attack-chain" className="inline-flex items-center gap-1 font-bold" style={{ color: "var(--accent)" }}>
                <span>Simulate in Attack Chain</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
