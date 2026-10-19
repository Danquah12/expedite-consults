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
  Code2,
  Terminal,
  Sparkles,
} from "lucide-react";
import { SAMPLE_REPOS, LANGUAGES } from "@/data/engines";
import {
  PYTHON_STANDARD_PLUGINS,
  SAMPLE_CODE_SNIPPETS,
  type StandardPluginId,
} from "@/lib/live-sast-scanner";

export type ScanStartPayload = {
  repoUrl: string;
  branch: string;
  commitSha: string;
  language: string;
  scanMode: "repo" | "code";
  customCode?: string;
  customFilePath?: string;
  engines: string[];
  activePlugins: StandardPluginId[];
};

type Props = {
  onStart: (payload: ScanStartPayload) => void;
};

const AVAILABLE_ENGINES = [
  { name: "CodeQL", desc: "Inter-procedural taint-flow tracing & semantic AST queries", tag: "AST + DataFlow" },
  { name: "Semgrep", desc: "Fast pattern rules across 3,000+ CWE & OWASP signatures", tag: "Pattern Engine" },
  { name: "Snyk", desc: "Software composition & GHSA / NVD CVE call-graph reachability", tag: "SCA + GHSA" },
  { name: "Checkmarx", desc: "Enterprise compliance alignment (NIST 800-53, ASVS, PCI-DSS)", tag: "Compliance" },
];

export default function RepoInput({ onStart }: Props) {
  const [scanMode, setScanMode] = useState<"repo" | "code">("repo");
  const [repoUrl, setRepoUrl] = useState(SAMPLE_REPOS[0].url);
  const [language, setLanguage] = useState(SAMPLE_REPOS[0].language);
  const [branch, setBranch] = useState("main");
  const [commitSha, setCommitSha] = useState("a4f92c81e03b4d12");
  const [customFilePath, setCustomFilePath] = useState(SAMPLE_CODE_SNIPPETS.Python.filePath);
  const [customCode, setCustomCode] = useState(SAMPLE_CODE_SNIPPETS.Python.code);

  const [selectedEngines, setSelectedEngines] = useState<string[]>([
    "CodeQL",
    "Semgrep",
    "Snyk",
    "Checkmarx",
  ]);

  const [selectedPlugins, setSelectedPlugins] = useState<StandardPluginId[]>(
    PYTHON_STANDARD_PLUGINS.map((p) => p.pluginId)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = scanMode === "code" ? `live-code://${customFilePath}` : repoUrl || SAMPLE_REPOS[0].url;
    onStart({
      repoUrl: url,
      branch,
      commitSha,
      language,
      scanMode,
      customCode: scanMode === "code" ? customCode : undefined,
      customFilePath: scanMode === "code" ? customFilePath : undefined,
      engines: selectedEngines,
      activePlugins: selectedPlugins,
    });
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

  const togglePlugin = (id: StandardPluginId) => {
    if (selectedPlugins.includes(id)) {
      if (selectedPlugins.length > 1) {
        setSelectedPlugins(selectedPlugins.filter((p) => p !== id));
      }
    } else {
      setSelectedPlugins([...selectedPlugins, id]);
    }
  };

  const loadCodePreset = (langKey: string) => {
    const preset = SAMPLE_CODE_SNIPPETS[langKey] || SAMPLE_CODE_SNIPPETS.Python;
    setLanguage(preset.language);
    setCustomFilePath(preset.filePath);
    setCustomCode(preset.code);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Mode Switcher Banner: GitHub Repo URL vs Live Source Code Paste */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 22,
          padding: 12,
          borderRadius: 12,
          background: "var(--background)",
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setScanMode("repo")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 16px",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              background: scanMode === "repo" ? "#8b4528" : "var(--surface)",
              color: scanMode === "repo" ? "#f3eee4" : "var(--foreground)",
              border: `1px solid ${scanMode === "repo" ? "#8b4528" : "var(--border)"}`,
            }}
          >
            <FolderGit2 size={15} />
            <span>GitHub Repository / Preset Scan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setScanMode("code");
              if (!customCode) loadCodePreset("Python");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 16px",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              background: scanMode === "code" ? "#8b4528" : "var(--surface)",
              color: scanMode === "code" ? "#f3eee4" : "var(--foreground)",
              border: `1px solid ${scanMode === "code" ? "#8b4528" : "var(--border)"}`,
            }}
          >
            <Code2 size={15} />
            <span>Live Source Code Inspector (Paste Any Code)</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
          <Sparkles size={14} color="#8b4528" />
          <span>
            Dynamic AST + 9 Python Standards Plugins (MITRE ATT&amp;CK · OWASP · CWE · CVSS · NIST · GHSA · PTES · SearchSploit · Metasploit)
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: 28,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: Repository OR Live Code Editor + Engines */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {scanMode === "repo" ? (
            <>
              {/* Quick-Start Sample Repositories */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
                    1. Select Benchmark Repository or Enter Any Live GitHub URL
                  </label>
                  <span style={{ fontSize: 11.5, color: "var(--muted)" }}>Each target produces distinct AST findings</span>
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
                          setCommitSha(
                            repo.name.includes("WebGoat")
                              ? "a4f92c81e03b"
                              : repo.name.includes("DVNA")
                              ? "7c31b90e441a"
                              : "9e12d45fa80c"
                          );
                        }}
                        style={{
                          textAlign: "left",
                          background: isSelected ? "#f4e5dc" : "var(--background)",
                          border: `1px solid ${isSelected ? "#8b4528" : "var(--border)"}`,
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
                            <FolderGit2 size={15} color={isSelected ? "#8b4528" : "#5c5349"} />
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
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#8b4528" }}>
                            Unique AST Tree
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
                    GitHub Repository URL (Public GitHub API Supported)
                  </label>
                  <div style={{ position: "relative" }}>
                    <GitBranch
                      size={15}
                      color="#5c5349"
                      style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}
                    />
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/owner/repository"
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
                      color="#8b4528"
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
            </>
          ) : (
            /* LIVE SOURCE CODE EDITOR MODE */
            <div
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: "var(--foreground)" }}>
                  1. Paste or Edit Source Code for Live Multi-Standard TTP &amp; AST Analysis
                </label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {Object.keys(SAMPLE_CODE_SNIPPETS).map((langKey) => (
                    <button
                      key={langKey}
                      type="button"
                      onClick={() => loadCodePreset(langKey)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: language === langKey ? "#8b4528" : "var(--surface)",
                        color: language === langKey ? "#f3eee4" : "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      Load {langKey} Sample
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    Virtual File Path
                  </span>
                  <input
                    type="text"
                    value={customFilePath}
                    onChange={(e) => setCustomFilePath(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontFamily: "monospace",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    Commit Lock
                  </span>
                  <input
                    type="text"
                    value={commitSha}
                    onChange={(e) => setCommitSha(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontFamily: "monospace",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
              </div>

              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                rows={13}
                spellCheck={false}
                placeholder="Paste Python, Java, TypeScript/JS, or Go code here..."
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 10,
                  fontSize: 12,
                  lineHeight: 1.5,
                  fontFamily: "var(--font-mono), monospace",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>
          )}

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
                      background: active ? "#f4e5dc" : "var(--background)",
                      border: `1px solid ${active ? "#8b4528" : "var(--border)"}`,
                      color: active ? "#8b4528" : "var(--muted)",
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
                <Settings size={15} color="#8b4528" />
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
                      border: `1px solid ${isSelected ? "#8b4528" : "var(--border)"}`,
                      borderRadius: 12,
                      padding: "14px 16px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ marginTop: 2 }}>
                      {isSelected ? (
                        <CheckSquare size={17} color="#8b4528" />
                      ) : (
                        <Square size={17} color="#5c5349" />
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

        {/* RIGHT COLUMN: Python Standards & Threat-Intel Plugin Repository */}
        <div
          style={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 22,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 18,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={18} color="#8b4528" />
                <span style={{ fontSize: 14.5, fontWeight: 800, color: "var(--foreground)" }}>
                  Python Security Standards &amp; TTP Plugin Repository ({selectedPlugins.length}/9 Active)
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
                validation_engine/plugins/
              </span>
            </div>

            <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginBottom: 14 }}>
              Every discovered code sink is evaluated against all 9 Python plugins in{" "}
              <code style={{ color: "var(--foreground)" }}>validation_engine/plugins/</code>—producing MITRE ATT&amp;CK TTP procedures, OWASP ASVS controls, CVSS v3.1/v4.0 vectors, NIST 800-53/SSDF mappings, GitHub GHSA advisories, PTES 7-phase traces, SearchSploit EDB-IDs, and Metasploit CheckCode references:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 7, marginBottom: 16 }}>
              {PYTHON_STANDARD_PLUGINS.map((plugin) => {
                const active = selectedPlugins.includes(plugin.pluginId);
                return (
                  <div
                    key={plugin.pluginId}
                    onClick={() => togglePlugin(plugin.pluginId)}
                    style={{
                      background: active ? "var(--surface)" : "var(--background)",
                      border: `1px solid ${active ? "#8b4528" : "var(--border)"}`,
                      borderRadius: 10,
                      padding: "9px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <div style={{ marginTop: 2 }}>
                      {active ? (
                        <CheckCircle2 size={14} color="#8b4528" />
                      ) : (
                        <Square size={14} color="var(--muted)" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "var(--foreground)" }}>
                          {plugin.name}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "monospace",
                            padding: "1px 6px",
                            borderRadius: 4,
                            background: "var(--surface-2)",
                            color: "#8b4528",
                            fontWeight: 700,
                          }}
                        >
                          {plugin.shortBadge}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, lineHeight: 1.35 }}>
                        {plugin.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Python Runner CLI preview */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 11,
                fontFamily: "var(--font-mono), monospace",
                color: "var(--muted)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--foreground)", fontWeight: 700, marginBottom: 4 }}>
                <Terminal size={13} color="#8b4528" />
                <span>Python Plugin Runner Invocation</span>
              </div>
              <div>from validation_engine.plugins import StandardsPluginRunner</div>
              <div>reports = StandardsPluginRunner().scan_source_code(code, file_path, language)</div>
            </div>
          </div>

          {/* Primary Submit CTA */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "15px 22px",
              borderRadius: 12,
              background: "#8b4528",
              color: "#f3eee4",
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
            <span>
              {scanMode === "code"
                ? "Scan Pasted Source Code Across All 9 Standards Plugins"
                : "Launch Multi-Standard Repository Scan & TTP Validation"}
            </span>
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </form>
  );
}
