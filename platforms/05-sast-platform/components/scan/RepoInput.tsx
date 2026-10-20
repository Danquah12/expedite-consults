"use client";

import { useState, useRef } from "react";
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
  Upload,
  FileCode2,
  Trash2,
  Search,
  Layers,
} from "lucide-react";
import { SAMPLE_REPOS, LANGUAGES } from "@/data/engines";
import { LANGUAGE_STARTER_CODEBASES } from "@/lib/enterprise-sast-engine";
import { SAST_400_PLUGINS, SAST_400_CATEGORIES } from "@/lib/sast-400-plugins";

export type AttachedSourceFile = {
  path: string;
  language: string;
  content: string;
};

type Props = {
  onStart: (params: {
    repoUrl: string;
    branch: string;
    commitSha: string;
    language: string;
    engines: string[];
    attachedFiles: AttachedSourceFile[];
  }) => void;
};

const AVAILABLE_ENGINES = [
  {
    name: "XTRIKE XQL",
    desc: "XQL AST queries, Best Fix Location (BFL) & PCI-DSS / NIST 800-53 / ISO compliance",
    tag: "XQL + BFL",
  },
  {
    name: "XTRIKE DeepFlow",
    desc: "Intelligent source-to-sink taint flow & sanitizer dominance verification",
    tag: "Taint + Sanitizer",
  },
  {
    name: "XTRIKE StructSCA",
    desc: "5 Core Analyzers (Dataflow, Control Flow, Structural, Config, Semantic) & 7 Kingdoms",
    tag: "7 Kingdoms",
  },
  {
    name: "XTRIKE AST-Query",
    desc: "Inter-procedural taint-flow tracing & semantic AST queries across 10 languages",
    tag: "AST + DataFlow",
  },
  {
    name: "XTRIKE PatternGuard",
    desc: "Single-Pass Token-Indexed Dispatcher executing 400 OWASP / CWE / CERT plugins",
    tag: "400 Plugins",
  },
  {
    name: "XTRIKE DepGuard",
    desc: "Live OSV & NIST NVD CVE dependency call-graph reachability",
    tag: "Live Advisory + SCA",
  },
];

export default function RepoInput({ onStart }: Props) {
  const [repoUrl, setRepoUrl] = useState(SAMPLE_REPOS[0].url);
  const [language, setLanguage] = useState(SAMPLE_REPOS[0].language);
  const [branch, setBranch] = useState("main");
  const [commitSha, setCommitSha] = useState("a4f92c81e03b4d12");
  const [selectedEngines, setSelectedEngines] = useState<string[]>([
    "XTRIKE XQL",
    "XTRIKE DeepFlow",
    "XTRIKE StructSCA",
    "XTRIKE AST-Query",
    "XTRIKE PatternGuard",
    "XTRIKE DepGuard",
  ]);

  const [scanMode, setScanMode] = useState<"repo_and_adapter" | "attached_code">("repo_and_adapter");
  const [attachedFiles, setAttachedFiles] = useState<AttachedSourceFile[]>(() => [
    ...(LANGUAGE_STARTER_CODEBASES["Java"] || []),
  ]);
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [showPluginCatalog, setShowPluginCatalog] = useState(false);
  const [pluginSearch, setPluginSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    const starter = LANGUAGE_STARTER_CODEBASES[lang];
    if (starter && starter.length > 0) {
      setAttachedFiles(starter.map((f) => ({ ...f })));
      setActiveFileIdx(0);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const uploaded: AttachedSourceFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      try {
        const text = await f.text();
        uploaded.push({
          path: f.webkitRelativePath || f.name,
          language,
          content: text,
        });
      } catch {
        // ignore binary read error
      }
    }

    if (uploaded.length > 0) {
      setAttachedFiles((prev) => [...uploaded, ...prev]);
      setActiveFileIdx(0);
      setScanMode("attached_code");
    }
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = repoUrl || SAMPLE_REPOS[0].url;
    onStart({
      repoUrl: url,
      branch,
      commitSha,
      language,
      engines: selectedEngines,
      attachedFiles: scanMode === "attached_code" ? attachedFiles : [],
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

  const activeFile = attachedFiles[activeFileIdx] || attachedFiles[0];

  const filteredPlugins = SAST_400_PLUGINS.filter((p) => {
    if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
    if (!pluginSearch.trim()) return true;
    const q = pluginSearch.toLowerCase();
    return (
      p.pluginId.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.cwe.toLowerCase().includes(q) ||
      p.owasp.toLowerCase().includes(q) ||
      p.nist80053.toLowerCase().includes(q) ||
      p.languages.some((l) => l.toLowerCase().includes(q))
    );
  });

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
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
                1. Target Repository or Attached Codebase
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setScanMode("repo_and_adapter")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: scanMode === "repo_and_adapter" ? "#8b4528" : "var(--background)",
                    color: scanMode === "repo_and_adapter" ? "#f3eee4" : "var(--muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  GitHub Repo + Language AST
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode("attached_code")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: scanMode === "attached_code" ? "#8b4528" : "var(--background)",
                    color: scanMode === "attached_code" ? "#f3eee4" : "var(--muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  Scan Attached / Live Code ({attachedFiles.length} files)
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {SAMPLE_REPOS.map((repo) => {
                const isSelected = repoUrl === repo.url && scanMode === "repo_and_adapter";
                return (
                  <button
                    key={repo.name}
                    type="button"
                    onClick={() => {
                      setRepoUrl(repo.url);
                      handleLanguageSelect(repo.language);
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
                      minHeight: 108,
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
                        Live AST Scan
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 0.7fr 0.9fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
                Repository URL (Live GitHub API Fetch)
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

          {/* 2. Primary Language & AST Adapter */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
                2. Primary Language &amp; AST Adapter (10 Polyglot Adapters Active)
              </label>
              <span style={{ fontSize: 11.5, color: "#8b4528", fontWeight: 700 }}>
                Active Adapter: {language} AST + Taint Graph
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {LANGUAGES.map((lang) => {
                const active = language === lang;
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageSelect(lang)}
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

          {/* Attached / Live Codebase Workspace */}
          <div
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileCode2 size={16} color="#8b4528" />
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--foreground)" }}>
                  Attached {language} Codebase &amp; Live AST Buffer ({attachedFiles.length} {attachedFiles.length === 1 ? "file" : "files"})
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 11px",
                    borderRadius: 8,
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: "#f4e5dc",
                    border: "1px solid #8b4528",
                    color: "#8b4528",
                    cursor: "pointer",
                  }}
                >
                  <Upload size={13} />
                  <span>Attach Local Code Files</span>
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 8 }}>
              {attachedFiles.map((fileItem, idx) => {
                const isCurr = idx === activeFileIdx;
                return (
                  <div
                    key={`${fileItem.path}-${idx}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 10px",
                      borderRadius: 7,
                      fontSize: 11.5,
                      fontFamily: "monospace",
                      background: isCurr ? "#8b4528" : "var(--surface)",
                      color: isCurr ? "#f3eee4" : "var(--foreground)",
                      border: "1px solid var(--border)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                    onClick={() => setActiveFileIdx(idx)}
                  >
                    <span>{fileItem.path.split("/").slice(-2).join("/")}</span>
                    {attachedFiles.length > 1 && (
                      <Trash2
                        size={11}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          const next = attachedFiles.filter((_, i) => i !== idx);
                          setAttachedFiles(next);
                          setActiveFileIdx(0);
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {activeFile && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 4, fontFamily: "monospace" }}>
                  <span>File: {activeFile.path}</span>
                  <span>Adapter: {language} &middot; Edit or paste your own code below to scan</span>
                </div>
                <textarea
                  value={activeFile.content}
                  onChange={(e) => {
                    const updated = [...attachedFiles];
                    updated[activeFileIdx] = {
                      ...activeFile,
                      content: e.target.value,
                    };
                    setAttachedFiles(updated);
                    setScanMode("attached_code");
                  }}
                  rows={7}
                  spellCheck={false}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                    fontFamily: "monospace",
                    fontSize: 11.5,
                    lineHeight: 1.45,
                    resize: "vertical",
                    outline: "none",
                  }}
                />
              </div>
            )}
          </div>

          {/* 3. Multi-Engine Configuration */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Settings size={15} color="#8b4528" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
                  3. Enterprise Static &amp; SCA Analysis Engines ({selectedEngines.length} of {AVAILABLE_ENGINES.length} Active)
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
                      padding: "13px 15px",
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
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
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
                            color: "#8b4528",
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

        {/* RIGHT COLUMN */}
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
                <ShieldCheck size={18} color="#8b4528" />
                <span style={{ fontSize: 14.5, fontWeight: 800, color: "var(--foreground)" }}>
                  400-Plugin Single-Pass Dispatcher &amp; Proof Pipeline
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
                {SAST_400_PLUGINS.length} PLUGINS ACTIVE
              </span>
            </div>

            <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5, marginBottom: 14 }}>
              Unlike legacy scanners that walk the AST hundreds of times, XTRIKE uses an{" "}
              <strong style={{ color: "var(--foreground)" }}>O(1) Token-Bucket Single-Pass Dispatcher</strong> across{" "}
              <strong style={{ color: "var(--foreground)" }}>400 security plugins</strong> aligned with OWASP, NIST, CWE, PCI-DSS v4.0, ISO 27001, XTRIKE XQL, XTRIKE DeepFlow, and XTRIKE StructSCA 7 Kingdoms.
            </p>

            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--foreground)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Layers size={14} color="#8b4528" />
                  Global Standard Plugin Families ({SAST_400_PLUGINS.length} Rules)
                </span>
                <button
                  type="button"
                  onClick={() => setShowPluginCatalog(!showPluginCatalog)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    background: "#f4e5dc",
                    color: "#8b4528",
                    border: "1px solid #8b4528",
                    cursor: "pointer",
                  }}
                >
                  {showPluginCatalog ? "Hide 400 Plugins" : "Browse All 400 Plugins"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {SAST_400_CATEGORIES.map((cat) => (
                  <div
                    key={cat.category}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "5px 8px",
                      borderRadius: 6,
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      fontSize: 11,
                    }}
                  >
                    <span style={{ color: "var(--foreground)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cat.category}
                    </span>
                    <span style={{ color: "#8b4528", fontWeight: 800, fontFamily: "monospace", marginLeft: 6 }}>
                      {cat.count}
                    </span>
                  </div>
                ))}
              </div>

              {showPluginCatalog && (
                <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <Search size={13} color="#5c5349" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                      <input
                        type="text"
                        value={pluginSearch}
                        onChange={(e) => setPluginSearch(e.target.value)}
                        placeholder="Search 400 plugins by CWE, OWASP, NIST, language, PLG-ID..."
                        style={{
                          width: "100%",
                          padding: "7px 10px 7px 30px",
                          borderRadius: 7,
                          fontSize: 11.5,
                          background: "var(--background)",
                          border: "1px solid var(--border)",
                          color: "var(--foreground)",
                        }}
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      style={{
                        padding: "7px 8px",
                        borderRadius: 7,
                        fontSize: 11,
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        color: "var(--foreground)",
                      }}
                    >
                      <option value="All">All Categories (400)</option>
                      {SAST_400_CATEGORIES.map((c) => (
                        <option key={c.category} value={c.category}>
                          {c.category} ({c.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ maxHeight: 230, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
                    {filteredPlugins.slice(0, 60).map((plg) => (
                      <div
                        key={plg.pluginId}
                        style={{
                          padding: "7px 9px",
                          borderRadius: 7,
                          background: "var(--background)",
                          border: "1px solid var(--border)",
                          fontSize: 11,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--foreground)" }}>
                          <span>
                            <span style={{ color: "#8b4528", fontFamily: "monospace", marginRight: 6 }}>{plg.pluginId}</span>
                            {plg.name}
                          </span>
                          <span style={{ fontFamily: "monospace", color: "#5c5349" }}>{plg.cwe}</span>
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                          {plg.owasp} &middot; {plg.nist80053} &middot; {plg.checkmarxQuery} &middot; [{plg.languages.join(", ")}]
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {[
                { code: "Stage A–B", title: "SARIF 2.1.0 Ingestion & Commit SHA Binding", note: "Preserves XTRIKE XQL BFL, DeepFlow Taint & StructSCA Kingdom metadata" },
                { code: "Stage C", title: "O(1) Token-Bucket 400-Plugin Dispatcher", note: "Single-pass multi-language AST & taint evaluation across 10 languages" },
                { code: "Stage D1/D2", title: "Priority 1–5 Static & Sanitizer Dominance Verifiers", note: "Authz, SQL AST, XSS context, Path boundary, Outbound SSRF & Crypto" },
                { code: "Stage E", title: "Independent Evidence Verifier (6-Point Proof Contract)", note: "Strictly separates ValidationStatus from Evidence Confidence" },
                { code: "Stage F", title: "Live OSV.dev NVD Lookup & Standards Mapping", note: "Maps to OWASP Top 10/ASVS/API/LLM, NIST 800-53/SSDF, PCI-DSS v4.0 & ISO 27001" },
              ].map((s) => (
                <div
                  key={s.code}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "9px 12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "var(--foreground)" }}>
                    <span>
                      <span style={{ color: "#8b4528", marginRight: 6 }}>{s.code}:</span>
                      {s.title}
                    </span>
                    <CheckCircle2 size={14} color="#46a36e" />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.note}</div>
                </div>
              ))}
            </div>
          </div>

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
              {scanMode === "attached_code"
                ? `Scan Attached ${language} Codebase (${attachedFiles.length} File${attachedFiles.length === 1 ? "" : "s"}) with 400 Plugins`
                : `Launch 400-Plugin Multi-Engine Scan (${language} AST)`}
            </span>
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </form>
  );
}
