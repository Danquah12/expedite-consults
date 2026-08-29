"use client";

import { useState } from "react";
import { GitBranch, Play, ChevronRight, CheckSquare, Square, Settings } from "lucide-react";
import { SAMPLE_REPOS, LANGUAGES } from "@/data/engines";

type Props = {
  onStart: (repo: string, lang: string, engines: string[]) => void;
};

const AVAILABLE_ENGINES = [
  { name: "CodeQL", desc: "Taint-flow tracing & AST analysis" },
  { name: "Semgrep", desc: "Rule-based fast pattern checks" },
  { name: "Snyk", desc: "SCA dependency vulnerability scanning" },
  { name: "Checkmarx", desc: "Enterprise coding compliance checks" }
];

export default function RepoInput({ onStart }: Props) {
  const [repoUrl, setRepoUrl]   = useState("");
  const [language, setLanguage] = useState("Java");
  const [selectedEngines, setSelectedEngines] = useState<string[]>(["CodeQL", "Semgrep", "Snyk", "Checkmarx"]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = repoUrl || SAMPLE_REPOS[0].url;
    onStart(url, language, selectedEngines);
  };

  const toggleEngine = (name: string) => {
    if (selectedEngines.includes(name)) {
      setSelectedEngines(selectedEngines.filter(e => e !== name));
    } else {
      setSelectedEngines([...selectedEngines, name]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>Quick start — pick a sample vulnerable app:</p>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {SAMPLE_REPOS.map((repo) => (
          <button
            key={repo.name}
            type="button"
            onClick={() => { setRepoUrl(repo.url); setLanguage(repo.language); }}
            className="text-left rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: repoUrl === repo.url ? "rgba(0,212,255,0.1)" : "var(--surface)",
              border: repoUrl === repo.url ? "1px solid rgba(0,212,255,0.4)" : "1px solid var(--border)",
              cursor: "pointer"
            }}
          >
            <div className="text-sm font-bold text-white mb-1">{repo.name}</div>
            <div className="text-xs mb-2" style={{ color: "var(--muted)" }}>{repo.description}</div>
            <div className="flex items-center justify-between">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--border)", color: "var(--muted)" }}>
                {repo.language}
              </span>
              <span className="text-xs" style={{ color: "var(--primary)" }}>~{repo.expectedFindings} findings</span>
            </div>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Repository Input */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Repository URL</label>
          <div className="relative">
            <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
            <input
              type="text"
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              placeholder="https://github.com/your-org/your-repo"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
          </div>
        </div>

        {/* Primary Language */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Primary Language</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  background: language === lang ? "rgba(0,212,255,0.15)" : "var(--surface)",
                  border: language === lang ? "1px solid rgba(0,212,255,0.4)" : "1px solid var(--border)",
                  color: language === lang ? "var(--primary)" : "var(--muted)",
                  cursor: "pointer"
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Next-Gen Engine Selection Panel */}
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Settings size={14} color="var(--primary)" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>Engine Configurations</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {AVAILABLE_ENGINES.map(engine => {
              const isSelected = selectedEngines.includes(engine.name);
              return (
                <div
                  key={engine.name}
                  onClick={() => toggleEngine(engine.name)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "var(--surface)",
                    border: isSelected ? "1px solid rgba(0,212,255,0.3)" : "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {isSelected ? (
                    <CheckSquare size={16} color="var(--primary)" />
                  ) : (
                    <Square size={16} color="var(--muted)" />
                  )}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: isSelected ? "var(--primary)" : "var(--fg)" }}>{engine.name}</div>
                    <div style={{ fontSize: 9.5, color: "var(--muted)", marginTop: 1 }}>{engine.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold transition-all duration-200 hover:opacity-90 hover:scale-[1.01]"
          style={{ background: "linear-gradient(135deg, #00d4ff, #0098b8)", color: "#0a0f1a", cursor: "pointer" }}
        >
          <Play className="w-5 h-5" />
          Ignite Multi-Engine Scan
          <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
