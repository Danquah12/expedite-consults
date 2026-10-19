"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  Shield,
  Layers,
  Network,
  Target,
  FileCode2,
  ClipboardList,
  Compass,
  ArrowRight,
  CheckCircle2,
  Search,
  RefreshCw,
} from "lucide-react";

const studios = [
  {
    href: "/threat-model",
    kicker: "STRIDE COMPLIANCE MATRIX",
    badge: "10 Controls",
    title: "Interactive STRIDE Checklist & Compliance Desk",
    desc: "Audit Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege controls mapped directly to SOC 2, ISO 27001, NIST CSF, and PCI-DSS.",
    icon: ClipboardList,
    metrics: ["SOC 2 & ISO 27001", "Live Control Toggle", "Audit Export"],
    category: "stride",
  },
  {
    href: "/attack-chain",
    kicker: "GRAPH BLAST RADIUS",
    badge: "4 Pivot Nodes",
    title: "Cross-Platform Attack Chain & RAG Correlator",
    desc: "Interactive multi-hop architecture graph connecting Client Portal, API Gateway, Auth Service, and PostgreSQL Crown Jewels with cross-platform SAST/API/Container telemetry.",
    icon: Network,
    metrics: ["4 Architecture Nodes", "Cross-Platform RAG", "Kill-Chain Replay"],
    category: "trees",
  },
  {
    href: "/stride-analyzer",
    kicker: "TAXONOMY ENGINE",
    badge: "42 Threats",
    title: "STRIDE Risk Identification & Taxonomy Studio",
    desc: "Automated decomposition of microservices, trust boundaries, and data stores into categorized STRIDE threat vectors with severity scoring and mitigation SLAs.",
    icon: Shield,
    metrics: ["6 STRIDE Vectors", "Trust Boundaries", "Risk Scoring"],
    category: "stride",
  },
  {
    href: "/dfd-studio",
    kicker: "ARCHITECTURE CANVAS",
    badge: "DFD v4.2",
    title: "Interactive Data Flow Diagram (DFD) Studio",
    desc: "Inspect external entities, processes, data stores, and trust boundaries. Automatically flags unencrypted cross-boundary flows and missing mTLS sidecar policies.",
    icon: Layers,
    metrics: ["mTLS Verification", "Boundary Audit", "Data Store Tagging"],
    category: "dfd",
  },
  {
    href: "/attack-trees",
    kicker: "ADVERSARY SIMULATION",
    badge: "3 Paths",
    title: "Attack Tree Decision Simulator & Choke-Points",
    desc: "Calculates minimum-cost adversary paths from initial phishing or public endpoint exploitation to crown-jewel database exfiltration, highlighting high-leverage choke-points.",
    icon: Target,
    metrics: ["Attacker Cost Model", "Choke-Point Finder", "Path Pruning"],
    category: "trees",
  },
  {
    href: "/mitre-capec-bridge",
    kicker: "THREAT INTEL MAPPING",
    badge: "14 Actors",
    title: "MITRE ATT&CK & CAPEC Adversary Pattern Bridge",
    desc: "Aligns architectural weaknesses with MITRE CAPEC attack patterns (CAPEC-66, CAPEC-122) and ATT&CK techniques (T1190, T1078) with exportable SIEM detection rules.",
    icon: Compass,
    metrics: ["CAPEC-66 / T1190", "14 Threat Actors", "SIEM Sigma Rules"],
    category: "mitre",
  },
];

const strideCatalog = [
  { id: "STRIDE-S", name: "Spoofing Identity (OAuth 2.0 / SAML / mTLS Pinning)", ref: "CAPEC-151 · SOC 2 CC6.1", status: "Verified Control" },
  { id: "STRIDE-T", name: "Tampering with Data (Prepared Statements & KMS AES-GCM)", ref: "CAPEC-66 · PCI-DSS 6.4", status: "1 Drift Alert" },
  { id: "STRIDE-R", name: "Repudiation (Immutable WORM CloudTrail & Signed Audit Ledger)", ref: "CAPEC-93 · SOC 2 CC7.2", status: "1 Drift Alert" },
  { id: "STRIDE-I", name: "Information Disclosure (HashiCorp Vault & Strict CORS / IMDSv2)", ref: "CAPEC-116 · NIST PR.DS-5", status: "1 Drift Alert" },
  { id: "STRIDE-D", name: "Denial of Service (Gateway Token-Bucket & Socket Quotas)", ref: "CAPEC-125 · ISO A.12.1.3", status: "Active Guardrail" },
  { id: "STRIDE-E", name: "Elevation of Privilege (RBAC Tenancy & K8s ClusterRole Audit)", ref: "CAPEC-122 · SOC 2 CC6.3", status: "Verified Control" },
];

export default function HomePage() {
  const [deskQuery, setDeskQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filteredStudios = studios.filter((s) => {
    const matchFilter = selectedFilter === "all" || s.category === selectedFilter;
    const matchQuery =
      !deskQuery ||
      s.title.toLowerCase().includes(deskQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(deskQuery.toLowerCase()) ||
      s.kicker.toLowerCase().includes(deskQuery.toLowerCase());
    return matchFilter && matchQuery;
  });

  return (
    <div className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* XTRIKE Desk Note Editorial Masthead Section */}
      <section className="space-y-6">
        <div className="space-y-2 max-w-3xl">
          <div className="desk-kicker">XTRIKE SECURITY DESK &middot; PLATFORM 15</div>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight font-editorial"
            style={{ color: "var(--foreground)" }}
          >
            XTRIKE Desk Note
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--muted)" }}>
            Live Data Flow Diagrams and STRIDE architecture invariants stay current. The six threat modeling studios below form the deterministic design verification desk. A STRIDE score measures boundary controls—it is an architectural proof, not a speculative checklist.
          </p>
        </div>

        {/* Action Strip (Matching "Turn off notifications" / "Run API Scan" in the reference design) */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/threat-model"
            className="px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
            style={{
              background: "var(--surface)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              boxShadow: "0 1px 2px rgba(31, 27, 24, 0.05)",
            }}
          >
            Launch STRIDE Checklist &amp; DFD Desk
          </Link>
          <p className="text-xs max-w-xl leading-relaxed" style={{ color: "var(--muted)" }}>
            Each architectural data flow is evaluated against all six STRIDE categories. Open the STRIDE Checklist or inspect the multi-hop Attack Chain to bind compensating controls to `DFD v4.2`.
          </p>
        </div>

        {/* Search the desk */}
        <div className="space-y-2 pt-2">
          <label
            className="block text-xs font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Search the desk
          </label>
          <div className="relative">
            <Search
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--subtle)" }}
            />
            <input
              type="text"
              value={deskQuery}
              onChange={(e) => setDeskQuery(e.target.value)}
              placeholder="STRIDE category, trust boundary, DFD node, CAPEC-66, MITRE T1190, or SOC 2 control..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                boxShadow: "0 1px 2px rgba(31, 27, 24, 0.03)",
              }}
            />
          </div>
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            Last model &middot; Architecture `DFD v4.2` (42 threats mapped, 91% mitigated). Open a studio, or inspect an attack tree choke-point.
          </div>
        </div>

        {/* Filter Pill Strip + Breaking Ticker (Matching the Desk Note reference image) */}
        <div
          className="pt-4 border-t space-y-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "Front page", count: "6 hot" },
              { id: "stride", label: "STRIDE Studios", count: "42" },
              { id: "dfd", label: "DFD Canvas", count: "v4.2" },
              { id: "trees", label: "Attack Trees & Chains", count: "4 Nodes" },
              { id: "mitre", label: "MITRE & CAPEC", count: "14 Actors" },
            ].map((pill) => {
              const active = selectedFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedFilter(pill.id)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  style={{
                    background: active ? "var(--accent)" : "var(--surface)",
                    color: active ? "#fbf8f3" : "var(--foreground)",
                    border: active
                      ? "1px solid #72361d"
                      : "1px solid var(--border)",
                    boxShadow: "0 1px 2px rgba(31, 27, 24, 0.04)",
                  }}
                >
                  <span>{pill.label}</span>
                  {pill.count && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: active ? "#fbf8f3" : "var(--accent-soft)",
                        color: "var(--accent)",
                      }}
                    >
                      {pill.count}
                    </span>
                  )}
                </button>
              );
            })}

            <Link
              href="/countermeasure-planner"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold"
              style={{
                background: "var(--surface)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
            >
              <span>Policy Guardrails</span>
            </Link>
          </div>

          {/* Breaking / Verified Threat Model Ticker Strip */}
          <div
            className="flex items-center rounded-lg overflow-hidden border text-xs"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <span
              className="px-3 py-2 font-bold uppercase tracking-wider shrink-0"
              style={{
                background: "var(--accent)",
                color: "#fbf8f3",
                fontSize: "0.68rem",
              }}
            >
              BREAKING
            </span>
            <div
              className="px-3.5 py-2 flex items-center gap-6 overflow-x-auto whitespace-nowrap"
              style={{ color: "var(--muted)" }}
            >
              <span>
                <strong style={{ color: "var(--foreground)" }}>STRIDE-T2 (Tampering)</strong> &middot; Unencrypted local config keys detected on `API Gateway &rarr; Postgres` flow
              </span>
              <span>
                <strong style={{ color: "var(--foreground)" }}>STRIDE-I2 (Disclosure)</strong> &middot; Wildcard `Access-Control-Allow-Origin: *` flagged across Public VPC boundary
              </span>
              <span>
                <strong style={{ color: "var(--foreground)" }}>CAPEC-66 (Choke-Point)</strong> &middot; Envoy mTLS + KMS MFA condition prunes 3 downstream attack paths
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* The Reading / Main Editorial Container Card */}
      <section className="card-surface p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="desk-kicker">THE READING &middot; STRIDE &amp; NIST SP 800-53 REV. 5</div>
            <h2
              className="text-2xl sm:text-3xl font-bold font-editorial"
              style={{ color: "var(--foreground)" }}
            >
              The architecture first: STRIDE studios &amp; attack trees
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Data Flow Diagram boundary checks, multi-hop exploit chain simulations, MITRE CAPEC adversary mappings, and OPA/Terraform policy guardrails. Each studio below opens a dedicated verification desk.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs" style={{ color: "var(--muted)" }}>
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ background: "var(--foreground)" }}
              />
              <strong style={{ color: "var(--foreground)" }}>Live</strong>
              <span>42 STRIDE threats indexed &middot; 4 architecture nodes linked &middot; 91.0% mitigation coverage.</span>
            </div>
          </div>

          <Link
            href="/attack-chain"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0"
            style={{
              background: "var(--surface)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              boxShadow: "0 1px 2px rgba(31, 27, 24, 0.04)",
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Open Attack Chain Simulator</span>
          </Link>
        </div>

        {/* 3-Column Editorial Workbench Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudios.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.href}
                href={s.href}
                className="flex flex-col justify-between p-5 rounded-xl transition-all card-hover"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="space-y-3">
                  <div
                    className="flex items-center justify-between gap-2 border-b pb-2.5"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span className="desk-kicker">{s.kicker}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                      }}
                    >
                      {s.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        color: "var(--accent)",
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3
                      className="text-lg font-bold leading-snug font-editorial"
                      style={{ color: "var(--foreground)" }}
                    >
                      {s.title}
                    </h3>
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                    {s.desc}
                  </p>
                </div>

                <div
                  className="pt-4 mt-4 border-t flex flex-wrap items-center justify-between gap-2"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {s.metrics.map((m) => (
                      <span
                        key={m}
                        className="text-[11px] px-2 py-0.5 rounded font-medium"
                        style={{
                          background: "var(--surface)",
                          color: "var(--muted)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* STRIDE & MITRE CAPEC Coverage Matrix */}
      <section className="card-surface p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="desk-kicker">REFERENCE CATALOG &middot; STRIDE &amp; MITRE CAPEC</div>
            <h2 className="text-2xl font-bold mt-1 font-editorial" style={{ color: "var(--foreground)" }}>
              STRIDE Threat Taxonomy &amp; Guardrail Coverage
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Mapped to MITRE CAPEC, SOC 2 Trust Services Criteria, ISO 27001, and PCI-DSS 4.0 controls.
            </p>
          </div>
          <Link
            href="/threat-model"
            className="text-xs font-bold inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl"
            style={{
              background: "var(--accent)",
              color: "#fbf8f3",
            }}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Open Interactive STRIDE Matrix</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {strideCatalog.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl flex items-center justify-between gap-3"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="text-xs font-mono font-bold px-2.5 py-1 rounded shrink-0"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                  }}
                >
                  {item.id}
                </span>
                <div className="truncate">
                  <div
                    className="text-xs font-semibold truncate"
                    style={{ color: "var(--foreground)" }}
                  >
                    {item.name}
                  </div>
                  <div className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                    {item.ref}
                  </div>
                </div>
              </div>
              <span
                className={`${
                  item.status.includes("Alert") ? "badge-high" : "badge-resolved"
                } text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0`}
              >
                <CheckCircle2 className="w-3 h-3" />
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
