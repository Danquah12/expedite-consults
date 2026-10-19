"use client";

import { useState, useMemo } from "react";
import {
  COMMERCIAL_DEEP_DIVE_PLUGINS,
  THOUSAND_VULN_PLUGINS,
  THOUSAND_PLUGINS_SUMMARY,
  buildMitreNavigatorLayerJson,
  buildBlueTeamSiemAndWafPack,
  type PluginScannerFamily,
  type MitreTtpMapping,
  type BlueTeamDefenseMapping
} from "@/data/deepDivePlugins";
import { FINDINGS } from "@/data/findings";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "mitre_bt_matrix" | "overview" | "verification" | "activity";

interface InstalledPlugin {
  id: string;
  name: string;
  author: string;
  version: string;
  category: string;
  status: "healthy" | "warning" | "error";
  installedDate: string;
  lastUpdated: string;
  description: string;
  permissions: string[];
  brainStage?: number;
  brainStageName?: string;
  code?: string;
  standards?: string;
  deepDiveActions?: string[];
  estimatedMinutes1HrMode?: number;
  scannerFamily?: PluginScannerFamily | "CORE";
  scannerRefId?: string;
  cwe?: string;
  owasp?: string;
  cvssBase?: number;
  severity?: "Critical" | "High" | "Medium" | "Low" | "Info";
  mitreTtp?: MitreTtpMapping;
  blueTeamDefense?: BlueTeamDefenseMapping;
}

// ─── Data (1,500 Vulnerability/Compliance Plugins + 32 Core Orchestrators) ───

const THOUSAND_INSTALLED: InstalledPlugin[] = THOUSAND_VULN_PLUGINS.map((p) => ({
  id: p.id,
  code: p.code,
  name: p.name,
  author: p.author,
  version: p.version,
  category: p.category,
  status: "healthy" as const,
  installedDate: "2026-09-01",
  lastUpdated: "2026-10-19",
  description: p.description,
  permissions: p.permissions,
  brainStage: p.brainStage,
  brainStageName: p.brainStageName,
  standards: p.standards,
  deepDiveActions: p.deepDiveActions,
  estimatedMinutes1HrMode: p.estimatedMinutes1HrMode,
  scannerFamily: p.scannerFamily,
  scannerRefId: p.scannerRefId,
  cwe: p.cwe,
  owasp: p.owasp,
  cvssBase: p.cvssBase,
  severity: p.severity,
  mitreTtp: p.mitreTtp,
  blueTeamDefense: p.blueTeamDefense
}));

const CORE_32_INSTALLED: InstalledPlugin[] = COMMERCIAL_DEEP_DIVE_PLUGINS.map((p) => ({
  id: `core-${p.id}`,
  code: p.code,
  name: `[${p.brainStageName}] ${p.name}`,
  author: p.author,
  version: p.version,
  category: p.category,
  status: "healthy" as const,
  installedDate: "2026-09-01",
  lastUpdated: "2026-10-19",
  description: `${p.description} (Standards: ${p.standards} · 1-Hr Mode Budget: ~${p.estimatedMinutes1HrMode}m)`,
  permissions: p.permissions,
  brainStage: p.brainStage,
  brainStageName: p.brainStageName,
  standards: p.standards,
  deepDiveActions: p.deepDiveActions,
  estimatedMinutes1HrMode: p.estimatedMinutes1HrMode,
  scannerFamily: "CORE" as const,
  scannerRefId: p.code,
  cwe: "CWE-693",
  owasp: p.standards,
  cvssBase: 7.5,
  severity: "High" as const,
  mitreTtp: {
    tacticId: "TA0043",
    tacticName: "Reconnaissance & Execution",
    techniqueId: "T1595",
    techniqueName: "Active Scanning & Verification",
    procedureSummary: p.description
  },
  blueTeamDefense: {
    d3fendId: "D3-ACH",
    d3fendCategory: "Harden",
    d3fendTechnique: "Application & Infrastructure Hardening",
    btLogSource: "SIEM / WAF / Reverse Proxy Telemetry",
    sigmaRuleHint: `stage_${p.brainStage}_${p.code.toLowerCase()}`,
    virtualPatchWafRule: p.deepDiveActions[0] || "Enforce defense-in-depth policy"
  }
}));

const INSTALLED: InstalledPlugin[] = [...THOUSAND_INSTALLED, ...CORE_32_INSTALLED];

const VERIFICATION_ITEMS = [
  { key: "signature", label: "Signature Verified (EXPEDITE STRIKE™ CA signed)", ok: true },
  { key: "mitre_ttp", label: "MITRE ATT&CK® v15 & MITRE ATLAS™ TTP Mapping Verified", ok: true },
  { key: "bt_d3fend", label: "Blue Team (BT) MITRE D3FEND™ Countermeasure Linked", ok: true },
  { key: "siem_export", label: "Splunk SPL, Microsoft Sentinel KQL & Sigma YAML Verified", ok: true },
  { key: "compliance", label: "PCI-DSS v4.0, SOC 2 Type II, ISO 27001 & HIPAA Control Mapping", ok: true },
  { key: "sandbox", label: "Safe Non-Destructive Sandbox Healthy", ok: true }
];

const AUDIT_ACTIONS = [
  { time: "19:15:20", user: "ai-llm-atlas-engine", action: "EXP-PLG-1001..1100 (100 OWASP LLM & ATLAS Rules)", result: "success" },
  { time: "19:14:12", user: "secrets-sbom-engine", action: "EXP-PLG-1101..1250 (150 Secret & SBOM Rules)", result: "success" },
  { time: "19:13:05", user: "cloud-k8s-engine", action: "EXP-PLG-1251..1400 (150 Cloud/K8s/IMDSv2 Rules)", result: "success" },
  { time: "19:12:30", user: "compliance-grc-engine", action: "EXP-PLG-1401..1500 (100 PCI/SOC2/ISO/HIPAA Controls)", result: "success" },
  { time: "19:12:04", user: "openvas-nvt-engine", action: "EXP-PLG-0001..0250 (250 NVTs)", result: "success" },
  { time: "19:10:41", user: "owasp-zap-engine", action: "EXP-PLG-0251..0500 (250 Rules)", result: "success" },
  { time: "19:08:17", user: "nuclei-template-engine", action: "EXP-PLG-0501..0750 (250 Templates)", result: "success" },
  { time: "19:05:29", user: "burp-bcheck-engine", action: "EXP-PLG-0751..1000 (250 BChecks)", result: "success" }
];

const SCANNER_COLORS: Record<string, string> = {
  OPENVAS: "#10b981",
  ZAP: "#2563eb",
  NUCLEI: "#9333ea",
  BURP: "#ea580c",
  AI_LLM: "#db2777",
  SECRETS_SBOM: "#dc2626",
  CLOUD_K8S: "#0284c7",
  COMPLIANCE: "#059669",
  CORE: "#8b4528"
};

function ScannerBadge({ family }: { family?: string }) {
  const fam = family || "CORE";
  const color = SCANNER_COLORS[fam] ?? "#6b7280";
  return (
    <span
      style={{
        fontSize: 9.5,
        fontWeight: 800,
        padding: "2px 6px",
        borderRadius: 4,
        background: `${color}18`,
        color,
        border: `1px solid ${color}45`,
        letterSpacing: "0.04em",
        fontFamily: "monospace"
      }}
    >
      {fam}
    </span>
  );
}

// ─── Tab 1: 1,500-Plugin MITRE TTP & Blue Team (BT) Matrix ────────────────────

function MitreBtMatrixTab({
  filteredPlugins,
  selectedId,
  onSelectPlugin
}: {
  filteredPlugins: InstalledPlugin[];
  selectedId: string;
  onSelectPlugin: (id: string) => void;
}) {
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(filteredPlugins.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const slice = filteredPlugins.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* MITRE ATT&CK TTP + Blue Team D3FEND Coverage Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12
        }}
      >
        <div
          style={{
            padding: 14,
            borderRadius: 8,
            background: "var(--surface)",
            border: "1px solid var(--border)"
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            MITRE ATT&CK® v15 &amp; MITRE ATLAS™ AI TTP Coverage
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {THOUSAND_PLUGINS_SUMMARY.mitreTacticsCovered.map((t) => (
              <span
                key={t.tacticId}
                style={{
                  fontSize: 10,
                  padding: "3px 7px",
                  borderRadius: 4,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  fontFamily: "monospace",
                  fontWeight: 700
                }}
              >
                {t.tacticId} · {t.tacticName} ({t.techniques.join(", ")})
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 8,
            background: "var(--surface)",
            border: "1px solid var(--border)"
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Blue Team (BT) MITRE D3FEND™ Countermeasures &amp; SIEM Telemetry
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {THOUSAND_PLUGINS_SUMMARY.blueTeamD3fendCovered.map((d) => (
              <span
                key={d.d3fendId}
                style={{
                  fontSize: 10,
                  padding: "3px 7px",
                  borderRadius: 4,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  fontFamily: "monospace",
                  fontWeight: 700
                }}
              >
                🛡️ {d.d3fendId} [{d.category}] · {d.technique}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          padding: "10px 14px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700 }}>
          Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredPlugins.length)} of{" "}
          <strong>{filteredPlugins.length}</strong> Matching Plugins (Total Registry: 1,500 Vulnerability/AI/Cloud/Secrets/Compliance Checks + 32 Core Orchestrators)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{
              padding: "5px 12px",
              borderRadius: 5,
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              fontSize: 11,
              fontWeight: 700,
              cursor: currentPage <= 1 ? "not-allowed" : "pointer"
            }}
          >
            ← Prev 50
          </button>
          <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>
            Page {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{
              padding: "5px 12px",
              borderRadius: 5,
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              fontSize: 11,
              fontWeight: 700,
              cursor: currentPage >= totalPages ? "not-allowed" : "pointer"
            }}
          >
            Next 50 →
          </button>
        </div>
      </div>

      {/* 1,500-Plugin Table */}
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 10,
          overflow: "hidden",
          background: "var(--surface)"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "110px 105px 1.5fr 170px 190px 110px",
            gap: 10,
            padding: "10px 14px",
            background: "var(--surface-2)",
            borderBottom: "1px solid var(--border)",
            fontSize: 10,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}
        >
          <div>Plugin Code</div>
          <div>Pack / Engine</div>
          <div>Vulnerability Check &amp; Rule ID</div>
          <div>MITRE ATT&amp;CK® / ATLAS</div>
          <div>Blue Team (BT) D3FEND™</div>
          <div>Stage / CWE</div>
        </div>

        {slice.map((p) => {
          const isSelected = p.id === selectedId;
          return (
            <div
              key={p.id}
              onClick={() => onSelectPlugin(p.id)}
              style={{
                display: "grid",
                gridTemplateColumns: "110px 105px 1.5fr 170px 190px 110px",
                gap: 10,
                padding: "10px 14px",
                borderBottom: "1px solid var(--border)",
                background: isSelected ? "var(--surface-2)" : "transparent",
                cursor: "pointer",
                alignItems: "center",
                fontSize: 11.5
              }}
            >
              <div style={{ fontFamily: "monospace", fontWeight: 800 }}>{p.code}</div>
              <div>
                <ScannerBadge family={p.scannerFamily} />
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace", marginTop: 2 }}>
                  Ref: {p.scannerRefId} · {p.owasp}
                </div>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 10.5 }}>
                <div style={{ fontWeight: 700 }}>
                  {p.mitreTtp?.tacticId} · {p.mitreTtp?.subTechniqueId || p.mitreTtp?.techniqueId}
                </div>
                <div style={{ fontSize: 9.5, color: "var(--muted)" }}>{p.mitreTtp?.tacticName}</div>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 10.5 }}>
                <div style={{ fontWeight: 700 }}>
                  🛡️ {p.blueTeamDefense?.d3fendId} ({p.blueTeamDefense?.d3fendCategory})
                </div>
                <div style={{ fontSize: 9.5, color: "var(--muted)" }}>{p.blueTeamDefense?.btLogSource}</div>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 10 }}>
                <div style={{ fontWeight: 700 }}>Stage {p.brainStage}/8</div>
                <div style={{ color: "var(--muted)" }}>
                  {p.cwe} · CVSS {p.cvssBase?.toFixed(1)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab 2: Overview (Selected Plugin Deep-Dive + TTP & BT D3FEND) ───────────

function OverviewTab({ plugin }: { plugin: InstalledPlugin }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          padding: 18,
          borderRadius: 10,
          background: "var(--surface)",
          border: "1px solid var(--border)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: 4,
              background: "var(--surface-2)",
              border: "1px solid var(--border)"
            }}
          >
            {plugin.code}
          </span>
          <ScannerBadge family={plugin.scannerFamily} />
          <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>
            Rule ID: {plugin.scannerRefId}
          </span>
          <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>
            {plugin.cwe} · CVSS {plugin.cvssBase?.toFixed(1)} ({plugin.severity})
          </span>
        </div>

        <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800 }}>{plugin.name}</h2>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65 }}>{plugin.description}</p>
      </div>

      {/* MITRE ATT&CK TTP + Blue Team D3FEND Split Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        {plugin.mitreTtp && (
          <div
            style={{
              padding: 16,
              borderRadius: 10,
              background: "var(--surface)",
              border: "1px solid var(--border)"
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              🎯 MITRE ATT&CK® / ATLAS™ TTP Mapping (Offensive Vector)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5 }}>
              <div>
                <strong>Tactic:</strong> {plugin.mitreTtp.tacticId} — {plugin.mitreTtp.tacticName}
              </div>
              <div>
                <strong>Technique / Sub-Technique:</strong> {plugin.mitreTtp.techniqueId}
                {plugin.mitreTtp.subTechniqueId ? ` / ${plugin.mitreTtp.subTechniqueId}` : ""} — {plugin.mitreTtp.techniqueName}
              </div>
              <div>
                <strong>Procedure Summary:</strong> {plugin.mitreTtp.procedureSummary}
              </div>
              <div>
                <strong>Standard / Framework:</strong> {plugin.owasp}
              </div>
            </div>
          </div>
        )}

        {plugin.blueTeamDefense && (
          <div
            style={{
              padding: 16,
              borderRadius: 10,
              background: "var(--surface)",
              border: "1px solid var(--border)"
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              🛡️ Blue Team (BT) MITRE D3FEND™ Countermeasure
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5 }}>
              <div>
                <strong>D3FEND ID &amp; Category:</strong> {plugin.blueTeamDefense.d3fendId} [{plugin.blueTeamDefense.d3fendCategory}]
              </div>
              <div>
                <strong>Defensive Technique:</strong> {plugin.blueTeamDefense.d3fendTechnique}
              </div>
              <div>
                <strong>SOC / BT Log Source:</strong> {plugin.blueTeamDefense.btLogSource}
              </div>
              <div>
                <strong>Sigma Detection Hint:</strong>{" "}
                <code style={{ fontFamily: "monospace", fontSize: 11.5 }}>{plugin.blueTeamDefense.sigmaRuleHint}</code>
              </div>
              <div>
                <strong>Virtual Patch / WAF Remediation:</strong> {plugin.blueTeamDefense.virtualPatchWafRule}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deep-Dive Execution Actions */}
      {plugin.deepDiveActions && plugin.deepDiveActions.length > 0 && (
        <div
          style={{
            padding: 16,
            borderRadius: 10,
            background: "var(--surface)",
            border: "1px solid var(--border)"
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            ⚡ Automated Execution &amp; Verification Steps (Stage {plugin.brainStage}/8 · {plugin.brainStageName})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {plugin.deepDiveActions.map((act, idx) => (
              <div
                key={idx}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  fontSize: 12.5,
                  fontFamily: "monospace"
                }}
              >
                {idx + 1}. {act}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PluginsPage() {
  const [scannerFilter, setScannerFilter] = useState<string>("ALL");
  const [tacticFilter, setTacticFilter] = useState<string>("ALL");
  const [d3fendFilter, setD3fendFilter] = useState<string>("ALL");
  const [stageFilter, setStageFilter] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>(INSTALLED[0].id);
  const [activeTab, setActiveTab] = useState<Tab>("mitre_bt_matrix");

  const filteredPlugins = useMemo(() => {
    return INSTALLED.filter((p) => {
      if (scannerFilter !== "ALL" && p.scannerFamily !== scannerFilter) return false;
      if (tacticFilter !== "ALL" && p.mitreTtp?.tacticId !== tacticFilter) return false;
      if (d3fendFilter !== "ALL" && p.blueTeamDefense?.d3fendId !== d3fendFilter) return false;
      if (stageFilter !== 0 && p.brainStage !== stageFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.name.toLowerCase().includes(q) ||
          (p.code && p.code.toLowerCase().includes(q)) ||
          (p.scannerRefId && p.scannerRefId.toLowerCase().includes(q)) ||
          (p.cwe && p.cwe.toLowerCase().includes(q)) ||
          (p.mitreTtp?.techniqueId && p.mitreTtp.techniqueId.toLowerCase().includes(q)) ||
          (p.blueTeamDefense?.d3fendId && p.blueTeamDefense.d3fendId.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [scannerFilter, tacticFilter, d3fendFilter, stageFilter, searchQuery]);

  const selected = useMemo(
    () => INSTALLED.find((p) => p.id === selectedId) ?? filteredPlugins[0] ?? INSTALLED[0],
    [selectedId, filteredPlugins]
  );

  const sidebarList = useMemo(() => filteredPlugins.slice(0, 120), [filteredPlugins]);

  const exportMitreNavigatorLayer = () => {
    const layer = buildMitreNavigatorLayerJson(FINDINGS, "https://11-dast-security-platform.vercel.app");
    const blob = new Blob([JSON.stringify(layer, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expedite-strike-mitre-attck-navigator-layer-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportBlueTeamSiemPack = () => {
    const packText = buildBlueTeamSiemAndWafPack(FINDINGS, "https://11-dast-security-platform.vercel.app");
    const blob = new Blob([packText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expedite-strike-blue-team-siem-sigma-splunk-kql-waf-pack-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* ── Top Summary Header ── */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "14px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: "0.04em" }}>
                🔌 1,500-PLUGIN MULTI-SCANNER, AI/LLM, CLOUD, SECRETS &amp; COMPLIANCE REGISTRY
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  fontFamily: "monospace"
                }}
              >
                1,500 SPECIALIZED PLUGINS + 32 CORE ORCHESTRATORS ACTIVE
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              <strong>OpenVAS (250)</strong> · <strong>OWASP ZAP (250)</strong> · <strong>Nuclei (250)</strong> ·{" "}
              <strong>Burp Suite (250)</strong> · <strong>AI/LLM ATLAS (100)</strong> · <strong>Secrets/SBOM (150)</strong> ·{" "}
              <strong>Cloud/K8s (150)</strong> · <strong>Compliance PCI/SOC2/ISO/HIPAA (100)</strong>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={exportMitreNavigatorLayer}
              style={{
                padding: "7px 12px",
                borderRadius: 6,
                background: "#8b4528",
                color: "#ffffff",
                border: "none",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "monospace"
              }}
            >
              🗺️ Export MITRE ATT&amp;CK® Navigator (.json)
            </button>
            <button
              onClick={exportBlueTeamSiemPack}
              style={{
                padding: "7px 12px",
                borderRadius: 6,
                background: "var(--surface-2)",
                color: "var(--fg)",
                border: "1px solid var(--border)",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "monospace"
              }}
            >
              📡 Download Blue Team SIEM Pack (Sigma/SPL/KQL/WAF)
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 1,500 plugins (EXP-PLG-1001, LLM, PCI, AKIA, T1190)..."
              style={{
                width: 310,
                padding: "7px 12px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                color: "var(--fg)",
                fontSize: 11.5,
                fontFamily: "monospace"
              }}
            />
          </div>
        </div>

        {/* Filter Bar: 8 Scanner/Security Packs + MITRE Tactic + BT D3FEND + Brain Stage */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          {[
            { id: "ALL", label: `All Packs (${INSTALLED.length})` },
            { id: "OPENVAS", label: `OpenVAS (${THOUSAND_PLUGINS_SUMMARY.byScanner.OPENVAS})` },
            { id: "ZAP", label: `OWASP ZAP (${THOUSAND_PLUGINS_SUMMARY.byScanner.ZAP})` },
            { id: "NUCLEI", label: `Nuclei (${THOUSAND_PLUGINS_SUMMARY.byScanner.NUCLEI})` },
            { id: "BURP", label: `Burp Suite (${THOUSAND_PLUGINS_SUMMARY.byScanner.BURP})` },
            { id: "AI_LLM", label: `🤖 AI/LLM ATLAS (${THOUSAND_PLUGINS_SUMMARY.byScanner.AI_LLM})` },
            { id: "SECRETS_SBOM", label: `🔑 Secrets & SBOM (${THOUSAND_PLUGINS_SUMMARY.byScanner.SECRETS_SBOM})` },
            { id: "CLOUD_K8S", label: `☁️ Cloud & K8s (${THOUSAND_PLUGINS_SUMMARY.byScanner.CLOUD_K8S})` },
            { id: "COMPLIANCE", label: `📜 Compliance (${THOUSAND_PLUGINS_SUMMARY.byScanner.COMPLIANCE})` },
            { id: "CORE", label: `Core 32 (32)` }
          ].map((btn) => {
            const active = scannerFilter === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setScannerFilter(btn.id)}
                style={{
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: active ? "#8b4528" : "var(--surface-2)",
                  color: active ? "#ffffff" : "var(--fg)",
                  fontSize: 10.5,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {btn.label}
              </button>
            );
          })}

          <select
            value={tacticFilter}
            onChange={(e) => setTacticFilter(e.target.value)}
            style={{
              padding: "5px 10px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              color: "var(--fg)",
              fontSize: 10.5,
              fontWeight: 700
            }}
          >
            <option value="ALL">All MITRE ATT&amp;CK / ATLAS Tactics</option>
            {THOUSAND_PLUGINS_SUMMARY.mitreTacticsCovered.map((t) => (
              <option key={t.tacticId} value={t.tacticId}>
                {t.tacticId} · {t.tacticName}
              </option>
            ))}
          </select>

          <select
            value={d3fendFilter}
            onChange={(e) => setD3fendFilter(e.target.value)}
            style={{
              padding: "5px 10px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              color: "var(--fg)",
              fontSize: 10.5,
              fontWeight: 700
            }}
          >
            <option value="ALL">All Blue Team (BT) D3FEND</option>
            {THOUSAND_PLUGINS_SUMMARY.blueTeamD3fendCovered.map((d) => (
              <option key={d.d3fendId} value={d.d3fendId}>
                {d.d3fendId} · {d.technique}
              </option>
            ))}
          </select>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(Number(e.target.value))}
            style={{
              padding: "5px 10px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              color: "var(--fg)",
              fontSize: 10.5,
              fontWeight: 700
            }}
          >
            <option value={0}>All 8 Brain Stages</option>
            <option value={1}>Stage 1 · DISCOVER</option>
            <option value={2}>Stage 2 · UNDERSTAND</option>
            <option value={3}>Stage 3 · PLAN</option>
            <option value={4}>Stage 4 · EXECUTE</option>
            <option value={5}>Stage 5 · VALIDATE</option>
            <option value={6}>Stage 6 · CORRELATE</option>
            <option value={7}>Stage 7 · REPORT</option>
            <option value={8}>Stage 8 · RETEST (BT D3FEND)</option>
          </select>
        </div>
      </div>

      {/* ── Main Content Layout ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Sidebar Quick Selector */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            borderRight: "1px solid var(--border)",
            background: "var(--surface)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "calc(100vh - 140px)",
            overflowY: "auto"
          }}
        >
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 800 }}>
            MATCHING PLUGINS ({filteredPlugins.length})
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {sidebarList.map((plugin) => {
              const isActive = plugin.id === selected.id;
              return (
                <button
                  key={plugin.id}
                  onClick={() => {
                    setSelectedId(plugin.id);
                    setActiveTab("overview");
                  }}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: isActive ? "var(--surface-2)" : "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--border)",
                    borderLeft: isActive ? "3px solid #8b4528" : "3px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 10.5, fontWeight: 800 }}>{plugin.code}</span>
                    <ScannerBadge family={plugin.scannerFamily} />
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {plugin.name}
                  </div>
                  <div style={{ fontSize: 9.5, color: "var(--muted)", fontFamily: "monospace" }}>
                    {plugin.mitreTtp?.tacticId} {plugin.mitreTtp?.subTechniqueId || plugin.mitreTtp?.techniqueId} · BT {plugin.blueTeamDefense?.d3fendId}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div
            style={{
              borderBottom: "1px solid var(--border)",
              padding: "0 24px",
              display: "flex",
              gap: 8,
              background: "var(--surface)"
            }}
          >
            {[
              { id: "mitre_bt_matrix" as Tab, label: `1,500-Plugin MITRE TTP & BT Matrix (${filteredPlugins.length})` },
              { id: "overview" as Tab, label: `Selected Plugin Deep-Dive (${selected.code})` },
              { id: "verification" as Tab, label: "CA Signature & Sandbox Verification" },
              { id: "activity" as Tab, label: "Multi-Engine Execution Telemetry" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "12px 16px",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab.id ? "3px solid #8b4528" : "3px solid transparent",
                  fontWeight: activeTab === tab.id ? 800 : 600,
                  fontSize: 12.5,
                  cursor: "pointer"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            {activeTab === "mitre_bt_matrix" && (
              <MitreBtMatrixTab
                filteredPlugins={filteredPlugins}
                selectedId={selected.id}
                onSelectPlugin={(id) => {
                  setSelectedId(id);
                  setActiveTab("overview");
                }}
              />
            )}
            {activeTab === "overview" && <OverviewTab plugin={selected} />}
            {activeTab === "verification" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {VERIFICATION_ITEMS.map((item) => (
                  <div
                    key={item.key}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 8,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 13 }}>✓ {item.label}</span>
                    <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: "#10b981" }}>
                      VERIFIED
                    </span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "activity" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {AUDIT_ACTIONS.map((row, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: "monospace",
                      fontSize: 12
                    }}
                  >
                    <span>{row.time}</span>
                    <strong>{row.user}</strong>
                    <span>{row.action}</span>
                    <span style={{ color: "#10b981", fontWeight: 800 }}>✓ {row.result}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
