"use client";

import { FileCode2, CheckCircle2 } from "lucide-react";

const guardrails = [
  {
    id: "POL-OPA-01",
    framework: "OPA Rego · Kubernetes Admission",
    title: "Deny Privileged Pods & Wildcard ServiceAccount ClusterRoles",
    target: "STRIDE-E2 (Elevation of Privilege)",
    snippet: `package axiom.stride.elevation\ndeny[msg] {\n  input.request.kind.kind == "ClusterRoleBinding"\n  input.request.object.roleRef.name == "cluster-admin"\n  msg := "STRIDE-E2 Violation: Wildcard cluster-admin binding blocked"\n}`,
  },
  {
    id: "POL-TF-02",
    framework: "Terraform Sentinel · AWS KMS & S3",
    title: "Enforce S3 WORM Object Lock & KMS Customer-Managed Key",
    target: "STRIDE-R1 (Repudiation) & STRIDE-T2 (Tampering)",
    snippet: `resource "aws_s3_bucket_object_lock_configuration" "audit_worm" {\n  bucket = aws_s3_bucket.audit_ledger.id\n  rule {\n    default_retention { mode = "COMPLIANCE" days = 365 }\n  }\n}`,
  },
];

export default function CountermeasurePlannerPage() {
  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2 max-w-3xl">
        <div className="desk-kicker">AXIOM THREAT DESK &middot; COUNTERMEASURE &amp; GUARDRAIL STUDIO</div>
        <h1 className="text-3xl sm:text-4xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
          Automated Security Countermeasure &amp; Policy Guardrails
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          Deterministic policy-as-code artifacts generated directly from STRIDE findings for Open Policy Agent (OPA), Terraform, and Envoy service mesh.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {guardrails.map((g) => (
          <div key={g.id} className="card-surface p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <span className="desk-kicker">{g.framework}</span>
              <span className="badge-resolved px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Enforced
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold font-editorial" style={{ color: "var(--foreground)" }}>
                {g.title}
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Mitigates: <strong>{g.target}</strong>
              </p>
            </div>
            <pre
              className="p-4 rounded-xl text-xs font-mono overflow-x-auto"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            >
              {g.snippet}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
