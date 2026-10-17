"use client";

import { useState } from "react";
import {
  GitBranch,
  Play,
  ChevronRight,
  CheckSquare,
  Square,
  Settings,
  GitCommit,
  ShieldCheck,
  CheckCircle2,
  FolderGit2,
} from "lucide-react";
import { SAMPLE_REPOS, LANGUAGES } from "@/data/engines";

type Props = {
  onStart: (repo: string, lang: string, engines: string[]) => void;
};

const AVAILABLE_ENGINES = [
  { name: "CodeQL", desc: "Inter-procedural taint-flow tracing & semantic AST queries", tag: "AST + DataFlow" },
  { name: "Semgrep", desc: "Fast pattern rules across 3,000+ CWE & OWASP signatures", tag: "Pattern Engine" },
  { name: "Snyk", desc: "Software composition & NVD CVE call-graph reachability", tag: "SCA + NVD" },
  { name: "Checkmarx", desc: "Enterprise compliance alignment (NIST 800-53, PCI-DSS, ISO)", tag: "Compliance" },
];

export default function RepoInput({ onStart }: Props) {
  const [repoUrl, setRepoUrl] = useState(SAMPLE_REPOS[0].url);
  const [language, setLanguage] = useState(SAMPLE_REPOS[0].language);
  const [branch, setBranch] = useState("main");
  const [commitSha, setCommitSha] = useState("a4f92c81e03b4d12");
  const [selectedEngines, setSelectedEngines] = useState<string[]>([
    "CodeQL",
    "Semgrep",
    "Snyk",
    "Checkmarx",
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = repoUrl || SAMPLE_REPOS[0].url;
    onStart(url, language, selectedEngines);
  };

  const toggleEngine = (name: string) => {
    if (selectedEngines.includes(name)) {
      if (selectedEngines.length > 1) {
        setSelectedEngines(selectedEngines.filter((e) => e !== name));
      }
    } else {
      setSelectedEngines([...selectedEngines, name]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: 28,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: Repository, Language & Engine Selection */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Quick-Start Sample Repositories */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
                1. Quick-Start Benchmark Repository (or enter a custom Git URL below)
              </label>
              <span style={{ fontSize: 11.5, color: "var(--muted)" }}>Click a preset to populate target</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {SAMPLE_REPOS.map((repo) => {
                const isSelected = repoUrl === repo.url;
                return (
                  <button
                    key={repo.name}
                    type="button"
                    onClick={() => {
                      setRepoUrl(repo.url);
                      setLanguage(repo.language);
                    }}
                    style={{
                      textAlign: "left",
                      background: isSelected ? "rgba(122, 162, 247, 0.12)" : "var(--background)",
                      border: `1px solid ${isSelected ? "#7aa2f7" : "var(--border)"}`,
                      borderRadius: 12,
                      padding: 16,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: 112,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--foreground)" }}>
                          {repo.name}
                        </span>
                        <FolderGit2 size={15} color={isSelected ? "#7aa2f7" : "#9aa0ab"} />
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>
                        {repo.description}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: "var(--surface-2)",
                          color: "var(--foreground-muted)",
                        }}
                      >
                        {repo.language}
                      </span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "#7aa2f7" }}>
                        ~{repo.expectedFindings} findings
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Repository URL + Branch & Commit SHA Lock */}
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 0.7fr 0.9fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
                Repository URL
              </label>
              <div style={{ position: "relative" }}>
                <GitBranch
                  size={15}
                  color="#9aa0ab"
                  style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/your-org/your-repo"
                  style={{
                    width: "100%",
                    padding: "11px 14px 11px 38px",
                    borderRadius: 10,
                    fontSize: 13,
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
                Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: "monospace",
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
                Build Commit SHA
              </label>
              <div style={{ position: "relative" }}>
                <GitCommit
                  size={14}
                  color="#7aa2f7"
                  style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  value={commitSha}
                  onChange={(e) => setCommitSha(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 10px 11px 32px",
                    borderRadius: 10,
                    fontSize: 12.5,
                    fontFamily: "monospace",
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                    outline: "none",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Primary Language */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
              2. Primary Language &amp; AST Adapter
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {LANGUAGES.map((lang) => {
                const active = language === lang;
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    style={{
                      padding: "8px 15px",
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 700,
                      background: active ? "rgba(122, 162, 247, 0.15)" : "var(--background)",
                      border: `1px solid ${active ? "#7aa2f7" : "var(--border)"}`,
                      color: active ? "#7aa2f7" : "var(--muted)",
                      cursor: "pointer",
                    }}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multi-Engine Configuration */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Settings size={15} color="#7aa2f7" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
                  3. Static &amp; SCA Analysis Engines ({selectedEngines.length} of 4 Active)
                </span>
              </div>
              <span style={{ fontSize: 11.5, color: "var(--muted)" }}>Outputs normalized to SARIF 2.1.0</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {AVAILABLE_ENGINES.map((engine) => {
                const isSelected = selectedEngines.includes(engine.name);
                return (
                  <div
                    key={engine.name}
                    onClick={() => toggleEngine(engine.name)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      background: isSelected ? "var(--surface-2)" : "var(--background)",
                      border: `1px solid ${isSelected ? "#7aa2f7" : "var(--border)"}`,
                      borderRadius: 12,
                      padding: "14px 16px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ marginTop: 2 }}>
                      {isSelected ? (
                        <CheckSquare size={17} color="#7aa2f7" />
                      ) : (
                        <Square size={17} color="#9aa0ab" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--foreground)" }}>
                          {engine.name}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "var(--surface-3)",
                            color: "var(--muted)",
                          }}
                        >
                          {engine.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4, lineHeight: 1.4 }}>
                        {engine.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Post-Scan Validation Pipeline & Standards Scope */}
        <div
          style={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 22,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={18} color="#7aa2f7" />
                <span style={{ fontSize: 14.5, fontWeight: 800, color: "var(--foreground)" }}>
                  Automated Post-Scan Validation Pipeline
                </span>
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: "rgba(70, 163, 110, 0.14)",
                  color: "#46a36e",
                }}
              >
                ENABLED
              </span>
            </div>

            <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5, marginBottom: 16 }}>
              Immediately after static scanning finishes, every candidate finding is normalized with commit{" "}
              <code style={{ color: "var(--foreground)" }}>{commitSha.slice(0, 8)}</code> and passed through the 6-stage Proof Validation Pipeline:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {[
                { code: "Stage A–B", title: "SARIF 2.1.0 Ingestion & Commit SHA Binding", note: "Preserves raw scanner trace & binds build identity" },
                { code: "Stage C", title: "7-Factor Test-Selection Optimizer", note: "Ranks checks by info gain, cost, and static resolution" },
                { code: "Stage D1/D2", title: "Priority 1–5 Static & Controlled Runtime Validators", note: "Authz, SQL structure, XSS context, Path boundary, Outbound guard" },
                { code: "Stage E", title: "Independent Evidence Verifier (6-Point Proof Contract)", note: "Separates ValidationStatus from Evidence Confidence" },
                { code: "Stage F", title: "Defensive Catalog Lookup & Regression Test Generation", note: "Maps to OWASP Top 10, MITRE CWE, NVD CVE & NIST 800-53" },
              ].map((s) => (
                <div
                  key={s.code}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "var(--foreground)" }}>
                    <span>
                      <span style={{ color: "#7aa2f7", marginRight: 6 }}>{s.code}:</span>
                      {s.title}
                    </span>
                    <CheckCircle2 size={14} color="#46a36e" />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.note}</div>
                </div>
              ))}
            </div>

            {/* Active Reference Catalogs */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 12,
                fontSize: 11.5,
              }}
            >
              <div style={{ fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
                Linked Reference Repositories (validation_engine/catalog.py)
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {[
                  "OWASP Top 10 (A01–A10)",
                  "MITRE CWE Catalog",
                  "NIST NVD / CVE Reachability",
                  "NIST SP 800-53 Rev. 5",
                  "PCI-DSS v4.0 Req 6.2.4",
                  "Security Contracts (CTR-01..03)",
                ].map((badge) => (
                  <span
                    key={badge}
                    style={{
                      padding: "3px 8px",
                      borderRadius: 5,
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground-muted)",
                      fontSize: 11,
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Submit CTA */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "15px 22px",
              borderRadius: 12,
              background: "#7aa2f7",
              color: "#0f1115",
              border: "none",
              fontSize: 14.5,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <Play size={17} />
            <span>Launch Multi-Engine Scan &amp; Proof Validation</span>
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </form>
  );
}
