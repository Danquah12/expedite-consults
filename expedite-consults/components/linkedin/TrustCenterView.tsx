"use client"

import React from "react"
import {
  Shield,
  ShieldCheck,
  Lock,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Server,
  Activity,
  Key,
  Globe
} from "lucide-react"

interface TrustCenterViewProps {
  onNavigateTab: (tab: string) => void
}

export function TrustCenterView({ onNavigateTab }: TrustCenterViewProps) {
  const complianceBadges = [
    { name: "SOC 2 Type II", status: "Certified & Audited", desc: "Annual independent audit of security, availability, and confidentiality controls." },
    { name: "FedRAMP High In-Process", status: "GovCloud Enclave", desc: "NIST SP 800-53 Rev 5 compliance with continuous machine-readable OSCAL assertions." },
    { name: "ISO/IEC 27001:2022", status: "Global Certification", desc: "Certified Information Security Management System (ISMS) across all infrastructure." },
    { name: "NIST SP 800-207 Zero Trust", status: "Fully Compliant", desc: "Identity perimeters, least-privilege RBAC, and eBPF micro-segmentation verified." }
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-emerald-950 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="rounded-full bg-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-200 border border-emerald-400/40 flex items-center gap-1.5 w-fit">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              ConnectIn Enterprise Trust Center
            </span>
            <h1 className="text-2xl font-black text-white">
              Platform Security, Compliance &amp; Governance
            </h1>
            <p className="text-xs text-zinc-300 max-w-xl">
              Real-time security telemetry, continuous statutory audit logs, cryptographic standards, and vulnerability disclosure policies.
            </p>
          </div>

          <div className="rounded-xl bg-black/40 p-3 border border-white/15 text-center min-w-[140px] shrink-0">
            <span className="text-[10px] uppercase font-mono text-emerald-400">Platform Uptime</span>
            <p className="text-xl font-black text-white">99.99%</p>
            <span className="text-[10px] text-zinc-400">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Compliance Frameworks Matrix */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-emerald-600" />
          <span>Statutory Certifications &amp; Audits</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {complianceBadges.map((badge, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{badge.name}</h4>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {badge.status}
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Core Platform Security Pillars */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Lock className="h-4 w-4 text-indigo-600" />
          <span>Enterprise Security &amp; Data Safeguards</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800 space-y-1.5">
            <p className="font-bold text-zinc-900 dark:text-zinc-100">🔐 Cryptographic Encryption</p>
            <p className="text-zinc-500">AES-256-GCM data at rest, TLS 1.3 in transit with FIPS 140-3 validated cryptographic HSM modules.</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800 space-y-1.5">
            <p className="font-bold text-zinc-900 dark:text-zinc-100">🛡️ Multi-Tenant MicroVMs</p>
            <p className="text-zinc-500">Sandbox evaluation instances executed in isolated Firecracker MicroVMs with strict memory and eBPF boundaries.</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800 space-y-1.5">
            <p className="font-bold text-zinc-900 dark:text-zinc-100">📑 Vulnerability Disclosure</p>
            <p className="text-zinc-500">Responsible Bug Bounty program with 24-hour response SLA and continuous automated dependency scans.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
