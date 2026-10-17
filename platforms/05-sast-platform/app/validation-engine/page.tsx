"use client";

import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  GitCommit,
  Layers,
  Terminal,
  Cpu,
  Sliders,
  Network,
  FileCheck2,
  Play,
} from "lucide-react";
import {
  ATTACK_SURFACE_COMPLETENESS,
  BENCHMARK_SUITE_SUMMARY,
  CANONICAL_VALIDATION_FINDINGS,
  COUNTEREXAMPLE_RECORDS,
  DETERMINISTIC_VS_AI_MATRIX,
  EXECUTABLE_SECURITY_CONTRACTS,
  HYBRID_PROOF_TECHNIQUES,
  KNOWLEDGE_GRAPH_EDGES,
  MUTATION_TESTING_SUMMARY,
  MULTI_VULN_ATTACK_CHAINS,
  PIPELINE_ARCHITECTURE_STAGES,
  PRIORITY_VALIDATOR_SPECS,
  SECURITY_CLAIMS_LEDGER,
  SECURITY_INVARIANTS,
  SELF_TESTING_QUALITY_GATES,
  SIXTEEN_ADVANCED_CAPABILITIES,
  TEN_SPECIALIZED_MODULES,
  TEST_SELECTION_OPTIMIZER_QUEUE,
  VALIDATION_SCORECARD,
  OWASP_CWE_NVD_CATALOG,
  ValidationStatus,
} from "@/lib/validation-engine";

type StudioTab =
  | "pipeline"
  | "claims"
  | "invariants"
  | "optimizer"
  | "catalog"
  | "roadmap";

const STATUS_BADGE: Record<
  ValidationStatus,
  { label: string; color: string; bg: string }
> = {
  confirmed: {
    label: "CONFIRMED",
    color: "#e5484d",
    bg: "rgba(229, 72, 77, 0.14)",
  },
  not_reproduced: {
    label: "NOT REPRODUCED · MITIGATED",
    color: "#46a36e",
    bg: "rgba(70, 163, 110, 0.14)",
  },
  inconclusive: {
    label: "INCONCLUSIVE",
    color: "#d6a847",
    bg: "rgba(214, 168, 71, 0.14)",
  },
  blocked: {
    label: "BLOCKED (COMMIT GATE)",
    color: "#e2853b",
    bg: "rgba(226, 133, 59, 0.14)",
  },
  not_applicable: {
    label: "NOT APPLICABLE",
    color: "#9aa0ab",
    bg: "rgba(154, 160, 171, 0.14)",
  },
};

export default function ValidationEnginePage() {
  const [activeTab, setActiveTab] = useState<StudioTab>("pipeline");
  const [langFilter, setLangFilter] = useState<string>("All");
  const [selectedFindingId, setSelectedFindingId] = useState<string>("VAL-101");
  const [selectedStage, setSelectedStage] = useState<string>("E");
  const [primaryObjective, setPrimaryObjective] = useState<string>(
    "Prove exploitability with reliable, reproducible evidence"
  );
  const [targetEnv, setTargetEnv] = useState<string>(
    "Multiple languages and application types"
  );

  const filteredFindings = CANONICAL_VALIDATION_FINDINGS.filter(
    (f) => langFilter === "All" || f.language === langFilter
  );

  const selectedFinding =
    filteredFindings.find((f) => f.findingId === selectedFindingId) ||
    filteredFindings[0] ||
    CANONICAL_VALIDATION_FINDINGS[0];

  const activeStageObj =
    PIPELINE_ARCHITECTURE_STAGES.find((s) => s.code === selectedStage) ||
    PIPELINE_ARCHITECTURE_STAGES[5];

  return (
    <div style={{ maxWidth: 1380, margin: "0 auto", padding: "36px 20px 80px 20px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 10px",
              borderRadius: 6,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
              fontSize: 11,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            <ShieldCheck size={13} color="#7aa2f7" />
            <span>PROOF-DRIVEN SAST VALIDATION &amp; CLAIM VERIFICATION ENGINE</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--foreground)" }}>
            Finding Validation &amp; Hybrid Proof Engine
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--muted)", maxWidth: 820, marginTop: 4 }}>
            Do not ask the AI whether a vulnerability looks exploitable. Gather static and runtime evidence, execute controlled validators bound to exact build commits, and independently verify 6-point proof contracts.
          </p>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 11.5,
          }}
        >
          <div style={{ color: "var(--muted)", fontWeight: 600 }}>Python Stack</div>
          <div style={{ color: "var(--foreground)", fontWeight: 700, marginTop: 2 }}>
            FastAPI &middot; Pydantic &middot; SARIF 2.1.0 &middot; Z3 &middot; httpx &middot; Playwright &middot; OTel
          </div>
        </div>
      </div>

      {/* Security Validation Scorecard */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
            Security Validation Scorecard (Runtime-Confirmed is a Subset of Total SAST Findings)
          </div>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            Untested findings are never labeled safe &middot; Independent discoveries tracked separately
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>SAST Findings (Total)</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--foreground)", marginTop: 2 }}>
              {VALIDATION_SCORECARD.sastFindingsTotal}
            </div>
            <div style={{ fontSize: 11, color: "var(--subtle)" }}>Ingested via SARIF 2.1.0</div>
          </div>

          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Runtime Confirmed</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#e5484d", marginTop: 2 }}>
              {VALIDATION_SCORECARD.runtimeConfirmed}
            </div>
            <div style={{ fontSize: 11, color: "var(--subtle)" }}>6/6 Proof Contract satisfied</div>
          </div>

          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Safely Mitigated</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#46a36e", marginTop: 2 }}>
              {VALIDATION_SCORECARD.safelyMitigated}
            </div>
            <div style={{ fontSize: 11, color: "var(--subtle)" }}>Guard / parameterization proven</div>
          </div>

          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Inconclusive</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#d6a847", marginTop: 2 }}>
              {VALIDATION_SCORECARD.inconclusive}
            </div>
            <div style={{ fontSize: 11, color: "var(--subtle)" }}>Missing prereqs or partial trace</div>
          </div>

          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Not Yet Validated</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--foreground-muted)", marginTop: 2 }}>
              {VALIDATION_SCORECARD.notYetValidated}
            </div>
            <div style={{ fontSize: 11, color: "#e2853b" }}>Untested (Never labeled safe)</div>
          </div>

          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Independent Discoveries</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#7aa2f7", marginTop: 2 }}>
              +{VALIDATION_SCORECARD.independentDiscoveries}
            </div>
            <div style={{ fontSize: 11, color: "var(--subtle)" }}>Found via Security Invariants</div>
          </div>
        </div>

        {/* 7 KPI Metrics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 10,
            paddingTop: 12,
            borderTop: "1px solid var(--border)",
          }}
        >
          {VALIDATION_SCORECARD.kpis.map((kpi) => (
            <div key={kpi.label}>
              <div style={{ fontSize: 10.5, color: "var(--muted)" }}>{kpi.label}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--foreground)" }}>{kpi.value}</div>
              <div style={{ fontSize: 10, color: "var(--subtle)" }}>{kpi.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Technique Hybrid Proof Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {HYBRID_PROOF_TECHNIQUES.map((tech) => (
          <div
            key={tech.step}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: "#7aa2f7" }}>
                TECHNIQUE {tech.step}
              </span>
              <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                {tech.engine}
              </span>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
              {tech.title}
            </div>
            <p style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.45, marginBottom: 8 }}>
              {tech.role}
            </p>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#46a36e" }}>{tech.metric}</div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 20,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 12,
        }}
      >
        {[
          { id: "pipeline", label: "1. A–F Pipeline & Proof Contracts", icon: Layers },
          { id: "claims", label: "2. Claim Verifier & Counterexamples (Z3)", icon: FileCheck2 },
          { id: "invariants", label: "3. Security Invariants, Contracts & Chains", icon: Network },
          { id: "optimizer", label: "4. Test Optimizer, 10 Modules & Quality Gates", icon: Sliders },
          { id: "catalog", label: "5. OWASP Top 10 · CWE · NVD Catalog", icon: ShieldCheck },
          { id: "roadmap", label: "6. Prioritized Plan Builder & Governance", icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudioTab)}
              style={{
                background: active ? "rgba(122, 162, 247, 0.14)" : "var(--surface)",
                border: `1px solid ${active ? "#7aa2f7" : "var(--border)"}`,
                color: active ? "#7aa2f7" : "var(--foreground-muted)",
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: A-F PIPELINE & PROOF CONTRACTS */}
      {activeTab === "pipeline" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Interactive Stages A -> F */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", marginBottom: 10 }}>
              Target Architecture (Stages A &rarr; F) &middot; Click a stage to inspect its contract
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: 8, marginBottom: 14 }}>
              {PIPELINE_ARCHITECTURE_STAGES.map((stg) => {
                const isSelected = stg.code === selectedStage;
                return (
                  <button
                    key={stg.code}
                    onClick={() => setSelectedStage(stg.code)}
                    style={{
                      textAlign: "left",
                      background: isSelected ? "var(--surface-2)" : "var(--background)",
                      border: `1px solid ${isSelected ? "#7aa2f7" : "var(--border)"}`,
                      borderRadius: 10,
                      padding: 10,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, color: "#7aa2f7" }}>
                      <span>STAGE {stg.code}</span>
                      <span style={{ color: stg.deterministic ? "#46a36e" : "var(--muted)", fontSize: 9.5 }}>
                        {stg.deterministic ? "DETERMINISTIC" : "AI-ASSISTED"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--foreground)", marginTop: 4 }}>
                      {stg.title}
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>{stg.tech}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, fontSize: 12.5 }}>
              <strong style={{ color: "#7aa2f7" }}>Stage {activeStageObj.code} — {activeStageObj.title}: </strong>
              <span style={{ color: "var(--foreground-muted)" }}>{activeStageObj.description}</span>
            </div>
          </div>

          {/* Language Adapter Filter */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
              Canonical Finding Queue (Priority 1–5 Validators &middot; Multi-Language AST Adapters)
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["All", "Python", "Java", "TypeScript", "Go", "C#"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLangFilter(lang)}
                  style={{
                    background: langFilter === lang ? "rgba(122, 162, 247, 0.14)" : "var(--surface)",
                    border: `1px solid ${langFilter === lang ? "#7aa2f7" : "var(--border)"}`,
                    color: langFilter === lang ? "#7aa2f7" : "var(--muted)",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Master-Detail Finding Inspector */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16 }}>
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredFindings.map((f) => {
                const isSelected = f.findingId === selectedFinding.findingId;
                const badge = STATUS_BADGE[f.status];
                return (
                  <button
                    key={f.findingId}
                    onClick={() => setSelectedFindingId(f.findingId)}
                    style={{
                      textAlign: "left",
                      background: isSelected ? "var(--surface-2)" : "var(--surface)",
                      border: `1px solid ${isSelected ? "#7aa2f7" : "var(--border)"}`,
                      borderRadius: 12,
                      padding: 14,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#7aa2f7", fontFamily: "monospace" }}>
                        {f.findingId} &middot; P{f.validatorPriority} &middot; {f.cwe}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: 4,
                          background: badge.bg,
                          color: badge.color,
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
                      {f.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", marginBottom: 6 }}>
                      {f.language} ({f.framework}) &middot; {f.filePath}:{f.startLine}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--subtle)" }}>
                      <span>Scanner: {f.scanner}</span>
                      <span>Evidence Confidence: {Math.round(f.evidenceConfidence * 100)}%</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right column: Canonical Finding + 5-Step Lifecycle + 6-Point Proof Contract */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Top identity & commit_sha lock */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#7aa2f7", fontWeight: 700 }}>
                    {selectedFinding.validatorName} (Priority {selectedFinding.validatorPriority})
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--foreground)", marginTop: 2 }}>
                    {selectedFinding.findingId}: {selectedFinding.title}
                  </h2>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", fontFamily: "monospace", marginTop: 2 }}>
                    {selectedFinding.repository} &middot; {selectedFinding.filePath}:{selectedFinding.startLine}–{selectedFinding.endLine}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10.5, color: "var(--muted)" }}>
                    Commit Lock:{" "}
                    <span
                      style={{
                        fontFamily: "monospace",
                        color:
                          selectedFinding.commitSha === selectedFinding.buildCommitSha
                            ? "#46a36e"
                            : "#e2853b",
                        fontWeight: 700,
                      }}
                    >
                      {selectedFinding.commitSha.slice(0, 8)}{" "}
                      {selectedFinding.commitSha === selectedFinding.buildCommitSha ? "==" : "!="}{" "}
                      {selectedFinding.buildCommitSha.slice(0, 8)}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: STATUS_BADGE[selectedFinding.status].color, marginTop: 4 }}>
                    Status: {selectedFinding.status.toUpperCase()} &middot; Confidence: {Math.round(selectedFinding.evidenceConfidence * 100)}%
                  </div>
                </div>
              </div>

              {/* Canonical Data Flow & Preserved SARIF */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
                <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, fontSize: 11.5 }}>
                  <div style={{ fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
                    Canonical Data-Flow &amp; Runtime Context
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 3 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Source:</strong> {selectedFinding.sourceExpr}
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 3 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Call Chain:</strong>{" "}
                    {selectedFinding.intermediateCalls.join(" → ")}
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 3 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Sink:</strong> {selectedFinding.sinkExpr}
                  </div>
                  <div style={{ color: "var(--muted)" }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Endpoint:</strong>{" "}
                    <span style={{ fontFamily: "monospace" }}>
                      {selectedFinding.httpMethod} {selectedFinding.endpoint}
                    </span>
                  </div>
                </div>

                <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, fontSize: 11.5 }}>
                  <div style={{ fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
                    Preserved Original Scanner Record (SARIF {selectedFinding.rawSarifRecord.schemaVersion})
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
                    <div>driver: {selectedFinding.rawSarifRecord.toolDriver}</div>
                    <div>ruleId: {selectedFinding.rawSarifRecord.ruleId}</div>
                    <div>loc: {selectedFinding.rawSarifRecord.physicalLocation}</div>
                    <div>codeFlows: {selectedFinding.rawSarifRecord.codeFlowsCount} preserved</div>
                  </div>
                </div>
              </div>

              {/* 5-Step Lifecycle */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
                  Validator Execution Lifecycle (1. Preflight &rarr; 2. Assess &rarr; 3. Plan &rarr; 4. Execute &rarr; 5. Verify)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Object.values(selectedFinding.lifecycle).map((st) => (
                    <div
                      key={st.label}
                      style={{
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 11.5,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--foreground)" }}>
                        <span>
                          {st.label} — <span style={{ color: "#7aa2f7" }}>{st.summary}</span>
                        </span>
                        <span style={{ fontFamily: "monospace", color: "var(--muted)" }}>{st.durationMs} ms</span>
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>{st.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6-Point Independent Evidence Verifier Proof Contract */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
                  Independent Evidence Verifier &middot; 6-Point Proof Contract
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {selectedFinding.proofContract.map((req) => (
                    <div
                      key={req.requirement}
                      style={{
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: 10,
                        fontSize: 11.5,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: "var(--foreground)" }}>{req.requirement}</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: req.satisfied ? "#46a36e" : "var(--muted)",
                          }}
                        >
                          {req.satisfied ? "SATISFIED" : "NOT MET"} &middot; {req.sourceType}
                        </span>
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--subtle)", marginBottom: 3 }}>{req.question}</div>
                      <div style={{ fontSize: 11, color: "var(--foreground-muted)" }}>{req.evidenceSummary}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remediation & Regression Test */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
                    Suggested Remediation Patch
                  </div>
                  <pre
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 10.5,
                      color: "var(--foreground)",
                      overflowX: "auto",
                    }}
                  >
                    {selectedFinding.suggestedFix}
                  </pre>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
                    Automated Regression Test
                  </div>
                  <pre
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 10.5,
                      color: "#46a36e",
                      overflowX: "auto",
                    }}
                  >
                    {selectedFinding.regressionTest}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY CLAIM VERIFIER & COUNTEREXAMPLES */}
      {activeTab === "claims" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Security Claim Verification Engine */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
              Security Claim Verification Engine
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
              Every claim made by static analysis, runtime probes, or the LLM is represented as an explicit testable claim with required proof and a record of what could not be established.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SECURITY_CLAIMS_LEDGER.map((clm) => (
                <div
                  key={clm.claimId}
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#7aa2f7", marginRight: 8 }}>
                        {clm.claimId} &middot; {clm.findingRef}
                      </span>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--foreground)" }}>
                        Claim: &ldquo;{clm.claimType}&rdquo;
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background:
                          clm.verdict === "ESTABLISHED"
                            ? "rgba(70, 163, 110, 0.14)"
                            : "rgba(122, 162, 247, 0.14)",
                        color: clm.verdict === "ESTABLISHED" ? "#46a36e" : "#7aa2f7",
                      }}
                    >
                      {clm.verdict}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 4 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Required Proof:</strong> {clm.requiredProof}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 4 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Observed Evidence:</strong> {clm.observedEvidence}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--subtle)" }}>
                    <strong>Unestablished / Boundaries Recorded:</strong> {clm.unestablishedNotes}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Counterexample & Z3 Constraint Solver */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
              Counterexample Engine, Symbolic Z3 Constraints &amp; Test Minimization
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
              Produces structured Source &rarr; Execution Path &rarr; Z3 Constraint &rarr; Sensitive Operation &rarr; Delta-Minimized Counterexample traces, and distinguishes formal counterexamples from reachability approximations.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {COUNTEREXAMPLE_RECORDS.map((cx) => (
                <div
                  key={cx.findingId}
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--foreground)" }}>
                      {cx.findingId} ({cx.cwe}) — {cx.title}
                    </span>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: "#7aa2f7" }}>
                      {cx.proofLevel} &middot; Minimized {cx.unminimizedLength}B &rarr; {cx.minimizedLength}B
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11.5 }}>
                    <div style={{ background: "var(--surface)", padding: 10, borderRadius: 8, border: "1px solid var(--border)" }}>
                      <div style={{ fontWeight: 700, color: "var(--foreground-muted)" }}>1. Source &amp; 2. Execution Path</div>
                      <div style={{ color: "var(--muted)", marginTop: 2 }}>{cx.sourceStage}</div>
                      <div style={{ color: "var(--muted)", marginTop: 4 }}>{cx.executionPathStage}</div>
                    </div>
                    <div style={{ background: "var(--surface)", padding: 10, borderRadius: 8, border: "1px solid var(--border)" }}>
                      <div style={{ fontWeight: 700, color: "var(--foreground-muted)" }}>3. Z3 Path Constraint &amp; 4. Minimized Proof</div>
                      <div style={{ fontFamily: "monospace", fontSize: 10.5, color: "#7aa2f7", marginTop: 2 }}>
                        {cx.pathConstraintZ3}
                      </div>
                      <div style={{ color: "var(--foreground)", marginTop: 4 }}>{cx.minimizedCounterexample}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#46a36e", marginTop: 8 }}>
                    <strong>Differential Build Verification:</strong> {cx.differentialOutcome}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY INVARIANTS, CONTRACTS & ATTACK CHAINS */}
      {activeTab === "invariants" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Given / When / Expected Security Contracts */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
              Automatic Test Generation from Security Contracts (Given / When / Expected / Evidence)
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
              Define formal security properties that generate controlled runtime tests even when SAST reports zero findings.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 12 }}>
              {EXECUTABLE_SECURITY_CONTRACTS.map((ctr) => (
                <div
                  key={ctr.contractId}
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 14,
                    fontSize: 11.5,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontWeight: 800, color: "var(--foreground)" }}>
                      {ctr.contractId}: {ctr.property}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: ctr.executionStatus === "VIOLATION DETECTED" ? "#e5484d" : "#46a36e",
                      }}
                    >
                      {ctr.executionStatus}
                    </span>
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 3 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Given:</strong> {ctr.given}
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 3 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>When:</strong> {ctr.when}
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 3 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Expected:</strong> {ctr.expected}
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 6 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Evidence Required:</strong> {ctr.evidenceRequired}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 10.5, color: "#7aa2f7" }}>
                    Generated: {ctr.generatedTestName} &rarr; {ctr.observedOutcome}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Invariant Engine */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
              Security-Invariant Engine &amp; SAST-Independent Discovery Mode
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
              Separates scanner-originated findings from vulnerabilities discovered independently via property and state-machine testing.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 10 }}>
              {SECURITY_INVARIANTS.map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 11.5,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, color: "#7aa2f7" }}>
                      {inv.id} &middot; {inv.category}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: inv.status === "VIOLATION PROVEN" ? "#e5484d" : "#46a36e",
                      }}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>{inv.property}</div>
                  <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 4 }}>{inv.evidenceSummary}</div>
                  <div style={{ fontSize: 10.5, color: "var(--subtle)" }}>
                    Origin: <strong style={{ color: "var(--foreground-muted)" }}>{inv.origin}</strong> ({inv.evaluatedRoutes} routes)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Vulnerability Attack Chains & Attack-Surface Completeness */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--foreground)", marginBottom: 10 }}>
                Multi-Vulnerability Attack-Chain Correlation
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MULTI_VULN_ATTACK_CHAINS.map((ch) => (
                  <div key={ch.chainId} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 800, color: "#e5484d", marginBottom: 4 }}>
                      <span>{ch.chainId}</span>
                      <span>{ch.combinedSeverity}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>{ch.title}</div>
                    {ch.steps.map((s) => (
                      <div key={s.step} style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
                        <strong style={{ color: "#7aa2f7" }}>Step {s.step} ({s.findingRef}):</strong> {s.label}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--foreground)", marginBottom: 10 }}>
                Attack-Surface Completeness &amp; Dependency Reachability
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12, textAlign: "center" }}>
                <div style={{ background: "var(--background)", padding: 8, borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--foreground)" }}>{ATTACK_SURFACE_COMPLETENESS.sourceDefinedRoutes}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>Source Routes</div>
                </div>
                <div style={{ background: "var(--background)", padding: 8, borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--foreground)" }}>{ATTACK_SURFACE_COMPLETENESS.openApiDocumentedRoutes}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>OpenAPI Spec</div>
                </div>
                <div style={{ background: "var(--background)", padding: 8, borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--foreground)" }}>{ATTACK_SURFACE_COMPLETENESS.reverseProxyExposedRoutes}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>Proxy Exposed</div>
                </div>
                <div style={{ background: "var(--background)", padding: 8, borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--foreground)" }}>{ATTACK_SURFACE_COMPLETENESS.runtimeObservedRoutes}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>OTel Observed</div>
                </div>
              </div>
              {ATTACK_SURFACE_COMPLETENESS.dependencyReachability.map((dep) => (
                <div key={dep.package} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, fontSize: 11, marginTop: 8 }}>
                  <div style={{ fontWeight: 700, color: "var(--foreground)" }}>
                    {dep.package} ({dep.advisory}) &middot;{" "}
                    <span style={{ color: dep.callGraphReachable ? "#e5484d" : "#46a36e" }}>
                      {dep.verdict}
                    </span>
                  </div>
                  <div style={{ color: "var(--muted)", fontFamily: "monospace", marginTop: 2 }}>
                    Sink: {dep.vulnerableMethod}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEST OPTIMIZER, 10 SPECIALIZED MODULES & QUALITY GATES */}
      {activeTab === "optimizer" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* 7-Factor Test-Selection Optimizer */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
              7-Factor Test-Selection Optimizer
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
              Ranks candidate tests by applicability, expected information gain, impact, execution cost, state risk, prerequisites, and whether static analysis already resolves the claim.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TEST_SELECTION_OPTIMIZER_QUEUE.map((item) => (
                <div
                  key={item.rank}
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 11.5,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, color: "var(--foreground)" }}>
                      Rank #{item.rank}: {item.findingRef} &rarr;{" "}
                      <span style={{ color: "#7aa2f7" }}>{item.selectedAction}</span>
                    </span>
                    <span style={{ fontFamily: "monospace", color: "var(--muted)" }}>
                      Prob: {item.applicabilityProb} &middot; InfoGain: {item.infoGain} &middot; Cost: {item.costMs}
                    </span>
                  </div>
                  <div style={{ color: "var(--muted)" }}>{item.decisionReason}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 10 Pluggable Specialized Analyzer Modules */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 12 }}>
              10 Pluggable Specialized Analyzer Modules
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 10 }}>
              {TEN_SPECIALIZED_MODULES.map((mod) => (
                <div key={mod.id} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, fontSize: 11.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, color: "#7aa2f7" }}>{mod.id}</span>
                    <span style={{ fontSize: 10, color: "#46a36e", fontWeight: 700 }}>{mod.status}</span>
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>{mod.name}</div>
                  <div style={{ color: "var(--muted)", fontSize: 11 }}>{mod.capability}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Mutation Testing & 6 Self-Testing Release Gates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
                Security Mutation Testing ({MUTATION_TESTING_SUMMARY.mutationScore} Score)
              </h3>
              <p style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 10 }}>
                Seeds temporary defects into disposable fixtures to verify validator sensitivity ({MUTATION_TESTING_SUMMARY.mutantsDetectedAndProven}/{MUTATION_TESTING_SUMMARY.mutantsSeeded} mutants killed).
              </p>
              {MUTATION_TESTING_SUMMARY.recentMutants.map((m) => (
                <div key={m.mutantId} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, fontSize: 11, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--foreground)" }}>
                    <span>{m.mutantId}: {m.operator}</span>
                    <span style={{ color: "#46a36e" }}>{m.status}</span>
                  </div>
                  <div style={{ color: "var(--muted)", marginTop: 2 }}>{m.description}</div>
                  <div style={{ color: "#7aa2f7", marginTop: 2 }}>Caught by: {m.detectedBy}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--foreground)", marginBottom: 10 }}>
                6 Automated Self-Testing Release Gates
              </h3>
              {SELF_TESTING_QUALITY_GATES.map((g) => (
                <div key={g.gate} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, padding: 9, fontSize: 11, marginBottom: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--foreground)" }}>
                    <span>{g.gate}</span>
                    <span style={{ color: "#46a36e" }}>{g.status}</span>
                  </div>
                  <div style={{ color: "var(--muted)", marginTop: 2 }}>{g.question}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRIORITIZED PLAN BUILDER & PYTHON REFERENCE */}
      {activeTab === "roadmap" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Interactive Plan Selector */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 12 }}>
              Tailored 90-Day Engineering Plan Builder
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
                  Primary Engineering Objective
                </div>
                {[
                  "Prove exploitability with reliable, reproducible evidence",
                  "Discover vulnerabilities that SAST misses",
                  "Build a commercial, enterprise-ready security platform",
                  "Develop advanced research capabilities for novel vulnerability discovery",
                ].map((obj) => (
                  <button
                    key={obj}
                    onClick={() => setPrimaryObjective(obj)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      marginBottom: 6,
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      background: primaryObjective === obj ? "rgba(122, 162, 247, 0.14)" : "var(--background)",
                      border: `1px solid ${primaryObjective === obj ? "#7aa2f7" : "var(--border)"}`,
                      color: primaryObjective === obj ? "#7aa2f7" : "var(--foreground-muted)",
                      cursor: "pointer",
                    }}
                  >
                    {obj}
                  </button>
                ))}
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
                  Primary Target Environment
                </div>
                {[
                  "Web applications and REST APIs",
                  "Microservices and distributed systems",
                  "Multiple languages and application types",
                  "Mobile applications and their backend APIs",
                ].map((env) => (
                  <button
                    key={env}
                    onClick={() => setTargetEnv(env)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      marginBottom: 6,
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      background: targetEnv === env ? "rgba(122, 162, 247, 0.14)" : "var(--background)",
                      border: `1px solid ${targetEnv === env ? "#7aa2f7" : "var(--border)"}`,
                      color: targetEnv === env ? "#7aa2f7" : "var(--foreground-muted)",
                      cursor: "pointer",
                    }}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#7aa2f7" }}>DAYS 1–30 · FOUNDATION</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--foreground)", margin: "4px 0 6px" }}>
                  Canonical Schema, Commit Lock &amp; Static Reachability
                </div>
                <p style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 }}>
                  Ingest SARIF 2.1.0 into CanonicalFinding records bound to commit_sha, enforce authorized scope gates, and deploy adapters for {targetEnv}.
                </p>
              </div>
              <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#7aa2f7" }}>DAYS 31–60 · VALIDATION</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--foreground)", margin: "4px 0 6px" }}>
                  Priority 1–5 Validators &amp; Claim Verifier
                </div>
                <p style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 }}>
                  Focus on &ldquo;{primaryObjective}&rdquo; with 6-point Proof Contracts, OpenTelemetry span correlation, and disposable container fixtures.
                </p>
              </div>
              <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#7aa2f7" }}>DAYS 61–90 · INTELLIGENCE</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--foreground)", margin: "4px 0 6px" }}>
                  Invariants, Differential Retest &amp; CI/CD Gates
                </div>
                <p style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 }}>
                  Enable Given/When/Expected security contracts, Z3 counterexample minimization, 7-factor test optimization, and benchmark calibration.
                </p>
              </div>
            </div>
          </div>

          {/* Deterministic vs AI Governance Matrix */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#46a36e", marginBottom: 10 }}>
                Strictly Deterministic Responsibilities
              </h3>
              {DETERMINISTIC_VS_AI_MATRIX.deterministic.map((d) => (
                <div key={d.item} style={{ marginBottom: 8, fontSize: 11.5 }}>
                  <div style={{ fontWeight: 700, color: "var(--foreground)" }}>&check; {d.item}</div>
                  <div style={{ color: "var(--muted)" }}>{d.detail}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#7aa2f7", marginBottom: 10 }}>
                AI-Assisted Synthesis (Policy-Gated, Untrusted Input Isolated)
              </h3>
              {DETERMINISTIC_VS_AI_MATRIX.aiAssisted.map((a) => (
                <div key={a.item} style={{ marginBottom: 8, fontSize: 11.5 }}>
                  <div style={{ fontWeight: 700, color: "var(--foreground)" }}>&bull; {a.item}</div>
                  <div style={{ color: "var(--muted)" }}>{a.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: OWASP TOP 10 · CWE · NVD / NIST CATALOG */}
      {activeTab === "catalog" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
              Python Standards Catalog (validation_engine/catalog.py) &middot; OWASP Top 10, CWE &amp; NIST SP 800-53
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
              When a SAST finding matches a rule or CWE ID, the engine queries this defensive catalog for AST guard specifications, NIST 800-53 controls, and remediation standards.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 12 }}>
              {OWASP_CWE_NVD_CATALOG.owaspTop10.map((entry) => (
                <div
                  key={entry.code}
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 14,
                    fontSize: 11.5,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 800, color: "#7aa2f7" }}>
                      {entry.code} &mdash; {entry.title}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                      {entry.cwes.join(", ")}
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, color: "#46a36e", marginBottom: 6 }}>
                    NIST SP 800-53: {entry.nistControls.join(" · ")}
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 6 }}>
                    {entry.defensiveChecks.map((chk) => (
                      <div key={chk} style={{ marginTop: 2 }}>
                        &bull; {chk}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--foreground-muted)" }}>
                    <strong>Standard:</strong> {entry.remediationStandard}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)", marginBottom: 4 }}>
              NIST NVD / CVE Reachability Catalog
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
              Links package advisories to CWE identifiers, vulnerable symbols, and call-graph reachability checks.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 12 }}>
              {OWASP_CWE_NVD_CATALOG.nvdAdvisories.map((adv) => (
                <div
                  key={adv.cveId}
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 14,
                    fontSize: 11.5,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, color: "var(--foreground)" }}>
                      {adv.cveId} &middot; {adv.cweId}
                    </span>
                    <span style={{ fontWeight: 800, color: adv.severity === "Critical" ? "#e5484d" : "#e2853b" }}>
                      CVSS {adv.cvss} ({adv.severity})
                    </span>
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "#7aa2f7", marginBottom: 4 }}>
                    {adv.ecosystem}: {adv.packageName} ({adv.affectedRange} &rarr; Fix: {adv.patchedVersion})
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 4 }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Symbol:</strong>{" "}
                    <span style={{ fontFamily: "monospace" }}>{adv.vulnerableSymbol}</span>
                  </div>
                  <div style={{ color: "var(--muted)" }}>
                    <strong style={{ color: "var(--foreground-muted)" }}>Reachability Check:</strong> {adv.reachabilityCheck}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
