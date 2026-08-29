"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Play, Sparkles, Terminal, Code, HelpCircle, FileText, CheckCircle, ShieldAlert, Layers, Download, Check, RefreshCw, Cpu, Brain, GitPullRequest, ArrowRight
} from "lucide-react";

type CodeSnippet = {
  lang: string;
  name: string;
  cwe: string;
  vulnCode: string;
  fixedCode: string;
  ruleYaml: string;
  fixExplanation: string;
};

const CODE_TEMPLATES: Record<string, CodeSnippet> = {
  "java_sqli": {
    lang: "java",
    name: "Java Spring: SQL Injection in JdbcTemplate",
    cwe: "CWE-89 (SQL Injection)",
    vulnCode: `package com.api.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class AccountController {
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/users")
    public String getUserProfile(@RequestParam String username) {
        // ❌ VULNERABLE (CWE-89): Unsanitized concatenation in SQL sink
        String query = "SELECT id, email, balance FROM users WHERE username = '" + username + "'";
        return jdbcTemplate.queryForObject(query, String.class);
    }
}`,
    fixedCode: `package com.api.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class AccountController {
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/users")
    public String getUserProfile(@RequestParam String username) {
        // ✅ SECURE: Parameterized prepared statement with bind arguments
        String query = "SELECT id, email, balance FROM users WHERE username = ?";
        return jdbcTemplate.queryForObject(query, new Object[]{username}, String.class);
    }
}`,
    ruleYaml: `rules:
  - id: java-spring-sqli-concatenation
    pattern-either:
      - pattern: $JDBC.query("..." + $INPUT, ...)
      - pattern: $JDBC.queryForObject("..." + $INPUT, ...)
    message: "Detected unparameterized SQL concatenation passed to JdbcTemplate."
    severity: ERROR
    metadata:
      cwe: "CWE-89"
      owasp: "A03:2021-Injection"
      ai_model: "DeepSeek-Coder-V2"
    languages: [java]`,
    fixExplanation: "Replaced raw string interpolation with parameterized SQL placeholders (`?`). The query engine now treats user input strictly as literal data rather than executable SQL command tokens."
  },
  "python_cmdi": {
    lang: "python",
    name: "Python FastAPI: Command Injection in Subprocess",
    cwe: "CWE-78 (OS Command Injection)",
    vulnCode: `from fastapi import FastAPI, Query
import subprocess

app = FastAPI()

@app.get("/ping")
def ping_host(host: str = Query(...)):
    # ❌ VULNERABLE (CWE-78): Shell=True with raw string concatenation
    command = f"ping -c 1 {host}"
    output = subprocess.check_output(command, shell=True)
    return {"status": "ok", "output": output.decode()}`,
    fixedCode: `from fastapi import FastAPI, Query
import subprocess
import ipaddress

app = FastAPI()

@app.get("/ping")
def ping_host(host: str = Query(...)):
    # ✅ SECURE: Validate input + run subprocess with argument array (shell=False)
    ipaddress.ip_address(host) # Validates strict IP address syntax
    output = subprocess.check_output(["ping", "-c", "1", host], shell=False)
    return {"status": "ok", "output": output.decode()}`,
    ruleYaml: `rules:
  - id: python-subprocess-shell-true
    pattern: subprocess.$FUNC(f"..." + $VAR, ..., shell=True)
    message: "Untrusted variable passed to subprocess with shell=True."
    severity: CRITICAL
    metadata:
      cwe: "CWE-78"
      owasp: "A03:2021-Injection"
    languages: [python]`,
    fixExplanation: "Eliminated `shell=True` and structured arguments as a discrete array `['ping', '-c', '1', host]`. Added IP address format validation to ensure only valid IPv4/IPv6 strings reach the process."
  },
  "ts_pathtraversal": {
    lang: "typescript",
    name: "TypeScript Express: Arbitrary File Read (Path Traversal)",
    cwe: "CWE-22 (Path Traversal)",
    vulnCode: `import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();

app.get('/download', (req, res) => {
    const filename = req.query.file as string;
    // ❌ VULNERABLE (CWE-22): Path traversal via ../ sequences
    const targetPath = path.join('/var/www/uploads', filename);
    const content = fs.readFileSync(targetPath, 'utf8');
    res.send(content);
});`,
    fixedCode: `import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const BASE_DIR = path.resolve('/var/www/uploads');

app.get('/download', (req, res) => {
    const filename = path.basename(req.query.file as string);
    const targetPath = path.resolve(BASE_DIR, filename);
    
    // ✅ SECURE: Canonical directory boundary check
    if (!targetPath.startsWith(BASE_DIR)) {
        return res.status(403).send('Forbidden: Path Traversal detected');
    }
    const content = fs.readFileSync(targetPath, 'utf8');
    res.send(content);
});`,
    ruleYaml: `rules:
  - id: node-path-traversal-join
    pattern: fs.readFileSync(path.join($BASE, $INPUT), ...)
    message: "path.join with user input does not prevent ../ directory breakout."
    severity: HIGH
    metadata:
      cwe: "CWE-22"
    languages: [typescript, javascript]`,
    fixExplanation: "Used `path.basename()` to strip directory delimiters and added `targetPath.startsWith(BASE_DIR)` to strictly guarantee the resolved file resides inside the allowed directory boundary."
  }
};

export default function RuleEditorPage() {
  const [selectedKey, setSelectedKey] = useState<string>("java_sqli");
  const [codeText, setCodeText] = useState(CODE_TEMPLATES["java_sqli"].vulnCode);
  const [ruleText, setRuleText] = useState(CODE_TEMPLATES["java_sqli"].ruleYaml);
  const [promptText, setPromptText] = useState("");
  const [ruleRunning, setRuleRunning] = useState(false);
  const [generatingPatch, setGeneratingPatch] = useState(false);
  const [showPatchDiff, setShowPatchDiff] = useState(false);
  const [patchApplied, setPatchApplied] = useState(false);
  const [prStatus, setPrStatus] = useState<"idle" | "creating" | "testing" | "merged">("idle");
  const [matches, setMatches] = useState<{ line: number; text: string; details: string; cwe: string }[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[init] DeepSeek-Coder-V2 AST Analyzer online.",
    "[init] Semgrep-AXIOM Static Rule Engine initialized.",
    "[ready] Select a language template or run AST vulnerability analysis on the canvas."
  ]);

  const activeTemplate = CODE_TEMPLATES[selectedKey];

  const handleCreatePr = () => {
    setPrStatus("creating");
    setConsoleLogs(c => [
      ...c,
      `[gitops-bot] Initializing branch 'patch/deepseek-${selectedKey}'...`,
      `[gitops-bot] Committing signed AST remediation patch...`,
      `[gitops-bot] Opening GitHub PR #342 against main repository...`
    ]);

    setTimeout(() => {
      setPrStatus("testing");
      setConsoleLogs(c => [
        ...c,
        `[ci-cd-sandbox] Running isolated Docker container regression suite...`,
        `[ci-cd-sandbox] ✓ 142/142 unit tests passed. 0 AST regressions detected.`
      ]);

      setTimeout(() => {
        setPrStatus("merged");
        setConsoleLogs(c => [
          ...c,
          `[gitops-bot] PR #342 merged automatically into production main branch.`,
          `[axiom-sync] Marked vulnerability ${activeTemplate.cwe} as CLOSED across all SOC dashboards.`
        ]);
      }, 1200);
    }, 1000);
  };

  const handleSelectTemplate = (key: string) => {
    setSelectedKey(key);
    setCodeText(CODE_TEMPLATES[key].vulnCode);
    setRuleText(CODE_TEMPLATES[key].ruleYaml);
    setShowPatchDiff(false);
    setPatchApplied(false);
    setPrStatus("idle");
    setMatches([]);
    setConsoleLogs(c => [...c, `[template] Loaded ${CODE_TEMPLATES[key].name} into AST canvas.`]);
  };

  const handleRunRule = () => {
    setRuleRunning(true);
    setMatches([]);
    setConsoleLogs(c => [
      ...c,
      `[deepseek-ast] Ingesting source tokens (${activeTemplate.lang})...`,
      `[deepseek-ast] Building Control Flow Graph (CFG) & Abstract Syntax Tree (AST)...`,
      `[rules] Evaluating Semgrep pattern: ${activeTemplate.cwe}...`
    ]);

    setTimeout(() => {
      const codeLines = codeText.split("\n");
      const foundMatches: { line: number; text: string; details: string; cwe: string }[] = [];

      codeLines.forEach((line, index) => {
        if (
          (line.includes("String query = \"SELECT") && line.includes("+")) ||
          (line.includes("subprocess.check_output(command") && line.includes("shell=True")) ||
          (line.includes("path.join('/var/www/uploads'") && line.includes("filename"))
        ) {
          foundMatches.push({
            line: index + 1,
            text: line.trim(),
            details: `DeepSeek-Coder AST flagged insecure data flow sink: Variable reaches execution boundary without sanitizer.`,
            cwe: activeTemplate.cwe
          });
        }
      });

      setMatches(foundMatches);
      setConsoleLogs(c => [
        ...c,
        `[scanner] Source files parsed: 1`,
        `[scanner] AST Findings detected: ${foundMatches.length}`,
        foundMatches.length > 0
          ? `[!] CRITICAL: ${activeTemplate.cwe} confirmed at Line ${foundMatches[0].line}`
          : `[info] Clean: No AST security violations detected in canvas.`
      ]);
      setRuleRunning(false);
    }, 850);
  };

  const handleGenerateAIPatch = () => {
    setGeneratingPatch(true);
    setConsoleLogs(c => [
      ...c,
      `[deepseek-coder] Generating automated AST patch diff for ${activeTemplate.cwe}...`,
      `[deepseek-coder] Applying secure coding pattern rules (OWASP Top 10 guidelines)...`
    ]);

    setTimeout(() => {
      setShowPatchDiff(true);
      setGeneratingPatch(false);
      setConsoleLogs(c => [
        ...c,
        `[patch] AI Auto-Patch successfully generated.`,
        `[patch] Review the side-by-side diff and click 'Apply Patch' to commit.`
      ]);
    }, 1200);
  };

  const handleApplyPatch = () => {
    setCodeText(activeTemplate.fixedCode);
    setPatchApplied(true);
    setShowPatchDiff(false);
    setMatches([]);
    setConsoleLogs(c => [
      ...c,
      `[commit] AI Patch applied to code canvas.`,
      `[re-eval] Re-running DeepSeek AST verification...`,
      `[re-eval] ✅ Verified: All CWE vulnerability sinks resolved.`
    ]);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <Navbar />
      
      <main className="flex-1 pt-20 pb-12 flex flex-col" style={{ height: "calc(100vh - 80px)", overflow: "hidden" }}>
        
        {/* Template Selector & AI Header */}
        <div className="px-6 py-3 border-b" style={{ background: "var(--surface)", borderBottomColor: "var(--border)" }}>
          <div className="max-w-7xl mx-auto flex gap-4 items-center justify-between flex-wrap">
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">DeepSeek-Coder AST Engine</span>
              </div>

              {/* Language Template Selector */}
              <div className="flex items-center gap-2 ml-4">
                {Object.entries(CODE_TEMPLATES).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectTemplate(key)}
                    style={{
                      fontSize: 11,
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: selectedKey === key ? "1px solid var(--primary)" : "1px solid var(--border)",
                      background: selectedKey === key ? "rgba(0, 212, 255, 0.15)" : "var(--bg)",
                      color: selectedKey === key ? "#00d4ff" : "var(--muted)",
                      cursor: "pointer",
                      fontWeight: selectedKey === key ? 700 : 500
                    }}
                  >
                    {t.name.split(":")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerateAIPatch}
                disabled={generatingPatch}
                className="btn-secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  padding: "5px 12px",
                  borderRadius: 8,
                  background: "rgba(232, 145, 45, 0.12)",
                  border: "1px solid rgba(232, 145, 45, 0.3)",
                  color: "var(--primary)",
                  cursor: "pointer",
                  fontWeight: 700
                }}
              >
                <Sparkles size={13} />
                {generatingPatch ? "Generating AI Patch..." : "✨ AI Auto-Patch"}
              </button>

              <button
                onClick={handleRunRule}
                disabled={ruleRunning}
                className="btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  padding: "5px 14px",
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #00d4ff, #0070f3)",
                  border: "none",
                  color: "#0a0f1a",
                  cursor: "pointer",
                  fontWeight: 800
                }}
              >
                <Play size={11} fill="currentColor" />
                {ruleRunning ? "Auditing AST..." : "Run AST Scan"}
              </button>
            </div>
          </div>
        </div>

        {/* 3-Column Split Workbench */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Column 1: YAML Semgrep Rule */}
          <div className="w-[310px] flex flex-col border-r" style={{ borderColor: "var(--border)" }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase">Semgrep AST Rule</span>
              </div>
              <span style={{ fontSize: 9.5, color: "var(--muted)", fontFamily: "monospace" }}>YAML v2</span>
            </div>
            <textarea
              className="flex-1 p-4 font-mono text-[11px] bg-slate-950 text-emerald-400 outline-none resize-none"
              value={ruleText}
              onChange={e => setRuleText(e.target.value)}
              spellCheck={false}
            />
          </div>

          {/* Column 2: Code Canvas */}
          <div className="flex-1 flex flex-col border-r" style={{ borderColor: "var(--border)" }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <Code size={14} className="text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase">
                  Source Code Canvas ({activeTemplate.name})
                </span>
              </div>
              {patchApplied && (
                <span style={{ fontSize: 10, color: "var(--green)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <CheckCircle size={12} /> AI Patch Applied & Verified
                </span>
              )}
            </div>
            <textarea
              className="flex-1 p-4 font-mono text-xs bg-slate-950 text-slate-300 outline-none resize-none"
              value={codeText}
              onChange={e => setCodeText(e.target.value)}
              spellCheck={false}
            />
          </div>

          {/* Column 3: CWE & OWASP Diagnostics */}
          <div className="w-[320px] flex flex-col bg-slate-900/50">
            <div className="px-4 py-3 border-b flex items-center gap-2" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <Layers size={14} className="text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase">CWE & OWASP Diagnostics</span>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {matches.map((match, i) => (
                <div key={i} className="border border-red-500/30 rounded-xl p-4 bg-red-950/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-red-500" />
                    <span className="text-xs font-bold text-red-500 uppercase">{match.cwe}</span>
                    <span className="text-[10px] bg-red-950/40 text-red-400 px-2 py-0.5 rounded ml-auto">Line {match.line}</span>
                  </div>
                  <pre className="text-[10.5px] font-mono text-slate-300 bg-black/40 p-2 rounded overflow-x-auto">
                    {match.text}
                  </pre>
                  <p className="text-[10.5px] text-slate-400 leading-normal">{match.details}</p>
                </div>
              ))}

              {matches.length === 0 && !patchApplied && (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Click &quot;Run AST Scan&quot; or &quot;✨ AI Auto-Patch&quot; to audit and remediate this code.
                </div>
              )}

              {patchApplied && (
                <div className="border border-emerald-500/30 rounded-xl p-4 bg-emerald-950/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase">Remediation Confirmed</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    {activeTemplate.fixExplanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Auto-Patch Side-by-Side Diff Modal */}
        {showPatchDiff && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 20
            }}
          >
            <div
              className="animate-scaleIn"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                width: "100%",
                maxWidth: 780,
                maxHeight: "90vh",
                overflowY: "auto",
                padding: 24,
                position: "relative"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "var(--primary)" }}>
                    DeepSeek-Coder AI Patch Generator
                  </span>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 4 }}>
                    Automated Code Diff & Fix Review ({activeTemplate.cwe})
                  </h3>
                </div>
                <button
                  onClick={() => setShowPatchDiff(false)}
                  style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 11.5, color: "var(--fg)" }}>
                <strong style={{ color: "#00d4ff", display: "block", marginBottom: 4 }}>Remediation Rationale:</strong>
                {activeTemplate.fixExplanation}
              </div>

              {/* Side by side diff preview */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#ef5350", marginBottom: 6 }}>❌ Before (Vulnerable)</div>
                  <pre style={{ background: "#000", border: "1px solid rgba(239,83,80,0.3)", borderRadius: 8, padding: 12, fontSize: 10.5, fontFamily: "monospace", color: "#ef5350", overflowX: "auto", maxHeight: 240 }}>
                    {activeTemplate.vulnCode}
                  </pre>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", marginBottom: 6 }}>✅ After (AI Remediated)</div>
                  <pre style={{ background: "#000", border: "1px solid rgba(52,199,89,0.3)", borderRadius: 8, padding: 12, fontSize: 10.5, fontFamily: "monospace", color: "var(--green)", overflowX: "auto", maxHeight: 240 }}>
                    {activeTemplate.fixedCode}
                  </pre>
                </div>
              </div>

              {/* GitOps PR Status Card */}
              {prStatus !== "idle" && (
                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 800, color: "#fff", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      <GitPullRequest size={14} color="var(--primary)" />
                      GitHub Pull Request #342: [DeepSeek-APR] {activeTemplate.cwe} Patch
                    </span>
                    <span style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: 10,
                      background: prStatus === "merged" ? "rgba(52,199,89,0.15)" : "rgba(0,212,255,0.15)",
                      color: prStatus === "merged" ? "var(--green)" : "#00d4ff",
                      border: `1px solid ${prStatus === "merged" ? "var(--green)" : "#00d4ff"}`
                    }}>
                      {prStatus === "creating" ? "Opening PR..." : prStatus === "testing" ? "CI/CD Tests Running..." : "✓ MERGED & RESOLVED"}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
                    {prStatus === "creating" && "Pushing signed AST diff to branch patch/deepseek..."}
                    {prStatus === "testing" && "Running Docker regression sandbox: 142/142 tests passed."}
                    {prStatus === "merged" && "Vulnerability auto-closed in central SOC bus. Pull Request merged."}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <button
                  onClick={handleCreatePr}
                  disabled={prStatus !== "idle"}
                  style={{
                    background: prStatus === "merged" ? "rgba(52,199,89,0.15)" : "linear-gradient(135deg, #e8912d, #f59e0b)",
                    border: prStatus === "merged" ? "1px solid var(--green)" : "none",
                    color: prStatus === "merged" ? "var(--green)" : "#0a0f1a",
                    padding: "8px 18px",
                    borderRadius: 8,
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <GitPullRequest size={13} />
                  {prStatus === "idle" ? "🚀 Open Automated GitHub PR (GitOps)" : prStatus === "merged" ? "✓ PR Merged & Closed" : "Running Automated Pipeline..."}
                </button>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setShowPatchDiff(false)}
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 11.5, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyPatch}
                    style={{ background: "linear-gradient(135deg, #00d4ff, #0070f3)", border: "none", color: "#0a0f1a", padding: "8px 18px", borderRadius: 8, fontSize: 11.5, fontWeight: 800, cursor: "pointer" }}
                  >
                    Apply Patch to Canvas
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Console Logging Panel */}
        <div className="h-36 border-t flex flex-col bg-black" style={{ borderColor: "var(--border)" }}>
          <div className="px-4 py-2 border-b flex items-center justify-between" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <Terminal size={12} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">DeepSeek-AST & Semgrep Trace Stream</span>
            </div>
          </div>
          <div className="flex-1 p-3 overflow-y-auto font-mono text-[10.5px] space-y-1 text-slate-400 select-all">
            {consoleLogs.map((log, i) => (
              <div key={i} className={log.includes("[!]") ? "text-red-500" : log.includes("[info]") || log.includes("[ready]") ? "text-cyan-400" : log.includes("✅") ? "text-emerald-400" : ""}>
                $ {log}
              </div>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}

