import { NextResponse } from "next/server";
import { SAST_400_PLUGINS, type SASTPluginDefinition } from "@/lib/sast-400-plugins";
import { BENCHMARK_32_REPOS, type BenchmarkRepoTarget } from "@/data/benchmark-repos";
import FINDINGS from "@/data/findings";
import type { SASTFinding } from "@/types/sast";

const NOCTIS_REMOTE_URL = "https://dstrike.app/api/noctis";

const SAST_PLATFORM_APPS_AND_MODULES = [
  {
    id: "front-desk",
    name: "Front Desk (Platform 05 Overview)",
    route: "/",
    purpose: "Executive posture overview, live risk & fixability carousel, 4-engine concordance metrics, and entry point to Hybrid SAST scanning.",
  },
  {
    id: "scan-workspace",
    name: "Scan Workspace & SAST/DAST Benchmark Lab",
    route: "/scan",
    purpose: "Live repository scanner supporting GitHub/GitLab URLs, local code snippets, and 1-click scanning of integrated OWASP SAST & DAST benchmark repositories. Automatically clears prior scan session state before each new scan.",
  },
  {
    id: "proof-engine",
    name: "6-Stage Proof Validation Engine",
    route: "/validation-engine",
    purpose: "PTES & NIST SP 800-115 6-stage deterministic validation pipeline distinguishing static AST/dataflow reachability from verified runtime exploit proof.",
  },
  {
    id: "triage-desk",
    name: "Triage Desk & Split Finding Inspector",
    route: "/dashboard",
    purpose: "Interactive vulnerability triage workspace with severity filters, composite risk gauge, compliance gates (PCI-DSS, NIST 800-53, ISO 27001, OWASP Top 10), and deep exploitability dossiers.",
  },
  {
    id: "report-engine",
    name: "Executive & Technical PDF Report Engine",
    route: "/reports",
    purpose: "Generates audit-grade PDF and printable security dossiers with reconciled proof states, CWE-matched advisories, and language-verified remediation diffs.",
  },
  {
    id: "fusion-engine",
    name: "XTRIKE Fusion Engine (SAST + SCA + DAST + IaC)",
    route: "/fusion-engine",
    purpose: "Correlates static code paths (XTRIKE XQL, DeepFlow, StructSCA, AST-Query) with reachability and runtime probe telemetry.",
  },
  {
    id: "taint-graph",
    name: "Interactive Source-to-Sink Taint Graph",
    route: "/taint-graph",
    purpose: "Visualizes AST/CFG/DFG taint propagation from untrusted entry points (@RequestParam, req.body, CLI/env) through intermediate transforms to dangerous execution sinks.",
  },
  {
    id: "ai-bom",
    name: "AI-BOM & Model Supply Chain Inspector",
    route: "/ai-bom",
    purpose: "Inventories LLM models, prompt pipelines, vector stores, and OWASP LLM Top 10:2025 risks across repositories.",
  },
  {
    id: "mcp-server",
    name: "XTRIKE SAST MCP Server",
    route: "/mcp-server",
    purpose: "Model Context Protocol (MCP) server exposing XTRIKE SAST rules, taint traces, and AST patches to IDE agents.",
  },
  {
    id: "rule-editor",
    name: "Custom AST & XQL Rule Editor",
    route: "/rule-editor",
    purpose: "Author and test custom language-specific SAST detection rules across 401 built-in plugins (PLG-001 to PLG-401).",
  },
  {
    id: "ask-noctis",
    name: "Ask Noctis (In-App AI SAST & AppSec Pop-up)",
    route: "/api/noctis",
    purpose: "In-app pop-up assistant connected via API to Noctis with complete access to all XTRIKE SAST findings, 401 plugins, benchmark repositories, taint graphs, and remediation diffs.",
  },
];

const SAST_REPO_FILES = [
  { path: "lib/enterprise-sast-engine.ts", role: "Core multi-engine static AST/CFG/DFG scanner, CWE rule matcher, & canonical proof-state classifier" },
  { path: "lib/sast-400-plugins.ts", role: "401 enterprise SAST detection plugins (PLG-001 to PLG-401) with language-strict rules (e.g., PLG-046 Python vs PLG-054 Java)" },
  { path: "lib/deep-enumeration-engine.ts", role: "Evidence-bound finding dossier generator (CVSS v3.1 vectors, blast-radius breakdown, curl/Python probes, multi-step chains)" },
  { path: "lib/live-sast-scanner.ts", role: "Live scan session manager, 9 Python security standard plugins, and automatic state cleanup on new scan" },
  { path: "lib/validation-engine.ts", role: "6-stage PTES / NIST 800-115 proof validation pipeline" },
  { path: "lib/pdf-report-generator.ts", role: "Executive & technical PDF audit report generator with release-gate reconciliation" },
  { path: "data/findings.ts", role: "Canonical catalog of 27 deep SAST findings (F-001 to F-027) with code snippets, taint paths, and multi-language fixes" },
  { path: "data/benchmark-repos.ts", role: "Integrated SAST & DAST vulnerable benchmark repositories (OWASP Benchmark, Juice Shop, WebGoat, DVWA, crAPI, Semgrep, Gosec, etc.)" },
  { path: "types/sast.ts", role: "Canonical TypeScript schema for SASTFinding, ProofState, AttackNode, EngineResult, and Remediation" },
  { path: "components/finding/DeepExploitabilityPanel.tsx", role: "Proof Engine & Taint Graph UI distinguishing statically detected paths from verified runtime proof" },
  { path: "components/finding/DiffRemediation.tsx", role: "Language-verified AST remediation diff & regression test generator" },
  { path: "components/DeveloperAssistAgent.tsx", role: "Ask Noctis in-app pop-up assistant connected via API to Noctis" },
  { path: "app/api/noctis/route.ts", role: "Noctis AI API endpoint bridging XTRIKE SAST assets & live scan state with Noctis" },
];

type ClientFindingSummary = Partial<SASTFinding> & {
  id?: string;
  ruleId?: string;
  title?: string;
  cwe?: string;
  owasp?: string;
  severity?: string;
  cvss?: number;
  language?: string;
  file?: string;
  filePath?: string;
  line?: number;
  lineStart?: number;
  proofState?: string;
  proofStatus?: string;
  auditDisposition?: string;
  source?: string;
  sink?: string;
  codeSnippet?: string;
  executiveSummary?: string;
  rootCause?: string;
};

function formatFindingDossier(f: ClientFindingSummary): string {
  const fileLoc = f.file || f.filePath || "unknown";
  const lineLoc = f.line || f.lineStart || 1;
  const proof = f.proofState || f.proofStatus || "DATAFLOW_CONFIRMED";
  const remBlocks = Array.isArray(f.remediation)
    ? f.remediation
        .map(
          (r) =>
            `#### Verified Remediation (${r.platform})\n${r.explanation}\n\`\`\`${r.platform.toLowerCase()}\n${r.code}\n\`\`\``
        )
        .join("\n\n")
    : "";

  const taintSteps = Array.isArray(f.taintPath) && f.taintPath.length > 0
    ? `\n#### Source-to-Sink Taint Trace\n${f.taintPath.map((s, i) => `${i + 1}. \`${s}\``).join("\n")}`
    : "";

  return [
    `### Noctis Finding Dossier — \`${f.id || "FINDING"}\`: ${f.title}`,
    `- **Severity / CVSS:** **${String(f.severity || "High").toUpperCase()}** (CVSS ${f.cvss ?? "N/A"}${f.cvssVector ? ` · \`${f.cvssVector}\`` : ""})`,
    `- **Classification:** \`${f.cwe || "CWE"}\`${f.cweName ? ` (${f.cweName})` : ""} · OWASP \`${f.owasp || "A03:2021"}\` · MITRE \`${f.mitre || "T1190"}\``,
    `- **Location:** \`${fileLoc}:${lineLoc}\` (${f.language || "Source"})`,
    `- **Canonical Proof State:** \`${proof}\``,
    f.auditDisposition ? `- **Audit Disposition:** ${f.auditDisposition}` : "",
    f.source || f.sink ? `- **Source → Sink:** \`${f.source || "Untrusted Input"}\` → \`${f.sink || "Sensitive Sink"}\`` : "",
    f.executiveSummary ? `\n**Executive Summary:**\n${f.executiveSummary}` : "",
    f.rootCause ? `\n**Root Cause:**\n${f.rootCause}` : "",
    f.codeSnippet ? `\n#### Vulnerable Code Excerpt (\`${fileLoc}:${lineLoc}\`)\n\`\`\`${String(f.language || "java").toLowerCase()}\n${f.codeSnippet}\n\`\`\`` : "",
    taintSteps,
    remBlocks ? `\n${remBlocks}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildLocalSastAnswer(
  question: string,
  scanRepoName?: string,
  clientFindings?: ClientFindingSummary[]
): string {
  const q = question.toLowerCase().trim();
  const activeFindings: ClientFindingSummary[] =
    Array.isArray(clientFindings) && clientFindings.length > 0 ? clientFindings : FINDINGS;

  // 1. Direct match on Finding ID (e.g., F-001 .. F-027)
  const findingIdMatch = question.match(/\b(F-0\d{2})\b/i);
  if (findingIdMatch) {
    const targetId = findingIdMatch[1].toUpperCase();
    const found =
      activeFindings.find((f) => String(f.id).toUpperCase() === targetId) ||
      FINDINGS.find((f) => f.id.toUpperCase() === targetId);
    if (found) {
      return formatFindingDossier(found);
    }
  }

  // 2. Direct match on Plugin ID (PLG-001 .. PLG-401)
  const plgMatch = question.match(/\b(PLG-\d{3})\b/i);
  if (plgMatch) {
    const targetId = plgMatch[1].toUpperCase();
    const plugin: SASTPluginDefinition | undefined = SAST_400_PLUGINS.find(
      (p: SASTPluginDefinition) => p.pluginId.toUpperCase() === targetId
    );
    if (plugin) {
      return [
        `### Noctis SAST Plugin Inspection — \`${plugin.pluginId}: ${plugin.code}\``,
        `- **Title:** ${plugin.name}`,
        `- **Category / Languages:** ${plugin.category} · **${plugin.languages.join(", ")}**`,
        `- **CWE / OWASP / MITRE:** \`${plugin.cwe}\` (${plugin.cweName}) · \`${plugin.owasp}\` · \`${plugin.mitreAttack}\``,
        `- **Compliance:** ASVS \`${plugin.asvs}\` · NIST 800-53 \`${plugin.nist80053}\` · PCI-DSS \`${plugin.pciDss}\` · ISO 27001 \`${plugin.iso27001}\``,
        `- **Severity / CVSS:** **${plugin.severity.toUpperCase()}** (CVSS ${plugin.cvss}, EPSS ${(plugin.epss * 100).toFixed(1)}%)`,
        `- **AST Detection Pattern:** \`${plugin.pattern}\``,
        `- **Analyzer / Sanitizer Hint:** \`${plugin.fortifyAnalyzer}\` (${plugin.fortifyKingdom}) · ${plugin.sanitizerHint}`,
        `\n**Remediation Guidance (${plugin.languages.join("/")}):**\n${plugin.remediationSummary}`,
        plugin.pluginId === "PLG-046" || plugin.pluginId === "PLG-054"
          ? `\n> **Language Separation Audit Note:** \`PLG-046\` (\`CODEI-PY-EXEC\`, MITRE \`T1059.006\`) strictly targets **Python** \`exec()\`/\`compile()\`. Java dynamic compilation (\`javax.tools.JavaCompiler.getTask(...)\` in \`BlindScript.java\`) is governed separately by \`PLG-054\` (\`CODEI-JAVA-COMPILER\`, MITRE \`T1059\`).`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
    }
  }

  // 3. Direct match on CWE ID (e.g., CWE-89, CWE-94, CWE-79, CWE-502, CWE-918, etc.)
  const cweMatch = question.match(/\b(CWE-\d{1,4})\b/i);
  if (cweMatch) {
    const targetCwe = cweMatch[1].toUpperCase();
    const matchingFindings = activeFindings.filter((f) => String(f.cwe).toUpperCase() === targetCwe);
    const matchingPlugins = SAST_400_PLUGINS.filter((p) => p.cwe.toUpperCase() === targetCwe).slice(0, 6);

    if (matchingFindings.length > 0 || matchingPlugins.length > 0) {
      const findingSection =
        matchingFindings.length > 0
          ? formatFindingDossier(matchingFindings[0])
          : "";
      const pluginSection =
        matchingPlugins.length > 0
          ? [
              `#### XTRIKE SAST Plugins Covering \`${targetCwe}\` (${matchingPlugins.length} shown)`,
              ...matchingPlugins.map(
                (p) =>
                  `- **\`${p.pluginId}\` (${p.code})** — ${p.name} · Languages: **${p.languages.join(", ")}** · CVSS ${p.cvss}\n  - Fix: ${p.remediationSummary}`
              ),
            ].join("\n")
          : "";
      return [findingSection, pluginSection].filter(Boolean).join("\n\n---\n\n");
    }
  }

  // 4. Check if asking about current scan findings, summary, or vulnerabilities found
  if (
    /\b(current\s+scan|active\s+finding|what\s+did\s+the\s+scan\s+find|vulnerabilities\s+in\s+this\s+scan|fix\s+current|summarize\s+findings|top\s+findings|critical\s+findings|all\s+findings|list\s+findings)\b/i.test(
      q
    )
  ) {
    const critCount = activeFindings.filter((f) => String(f.severity).toLowerCase() === "critical").length;
    const highCount = activeFindings.filter((f) => String(f.severity).toLowerCase() === "high").length;
    const medCount = activeFindings.filter((f) => String(f.severity).toLowerCase() === "medium").length;
    const topItems = activeFindings
      .slice(0, 8)
      .map((f, idx) => {
        const loc = `${f.file || f.filePath || "source"}:${f.line || f.lineStart || 1}`;
        const proof = f.proofState || f.proofStatus || "DATAFLOW_CONFIRMED";
        return `${idx + 1}. **\`${f.id || `F-00${idx + 1}`}\` — ${f.title}** (\`${f.cwe || "CWE"}\` · CVSS ${f.cvss ?? "N/A"} · **${String(f.severity || "High").toUpperCase()}**)\n   - File: \`${loc}\` (${f.language || "Code"}) · Proof State: \`${proof}\``;
      })
      .join("\n");

    return [
      `### Noctis Live SAST Scan Intelligence${scanRepoName ? ` — \`${scanRepoName}\`` : ""}`,
      `- **Total Findings Indexed:** **${activeFindings.length}** (${critCount} Critical, ${highCount} High, ${medCount} Medium)`,
      `- **Engines Active:** XTRIKE XQL + XTRIKE DeepFlow + XTRIKE StructSCA + XTRIKE AST-Query`,
      `\n#### Priority Findings in Current SAST Workspace\n${topItems}`,
      `\nType any finding ID (e.g. \`F-001\`, \`F-002\`), CWE (e.g. \`CWE-89\`, \`CWE-94\`, \`CWE-918\`), or plugin (\`PLG-001\`–\`PLG-401\`) right here in the pop-up to view its full taint trace and verified code fix.`,
    ].join("\n");
  }

  // 5. Check if asking about SAST apps, modules, pages, or tools inside the platform
  if (/\b(apps|modules|pages|features|tools|resources|assets|navigation|what\s+is\s+in\s+sast|how\s+does\s+this\s+app\s+work)\b/i.test(q)) {
    const appList = SAST_PLATFORM_APPS_AND_MODULES.map(
      (m) => `- **${m.name}** (\`${m.route}\`): ${m.purpose}`
    ).join("\n");
    const repoList = SAST_REPO_FILES.map((f) => `- \`${f.path}\` — ${f.role}`).join("\n");
    return [
      `### Noctis — Complete XTRIKE SAST Platform Apps, Modules & Assets`,
      `All **${SAST_PLATFORM_APPS_AND_MODULES.length} SAST Platform Modules**, **${SAST_400_PLUGINS.length} Detection Plugins**, **${FINDINGS.length} Built-in Findings**, and **${BENCHMARK_32_REPOS.length} Benchmark Repositories** are synced directly with Noctis:`,
      `\n#### 1. SAST Platform Applications & Workspaces\n${appList}`,
      `\n#### 2. Core SAST Repository Architecture Indexed in Noctis\n${repoList}`,
    ].join("\n");
  }

  // 6. Check if asking about SQL Injection / Lesson 5a
  if (/\b(sql\s*injection|sqli|statement\.executequery|lesson5a)\b/i.test(q)) {
    return formatFindingDossier(FINDINGS[0]);
  }

  // 7. Check if asking about Code Injection / BlindScript.java / JavaCompiler / exec()
  if (/\b(blindscript|javacompiler|code\s*injection|exec\(|compile\()\b/i.test(q)) {
    const pyPlugin = SAST_400_PLUGINS.find((p) => p.pluginId === "PLG-046");
    const javaPlugin = SAST_400_PLUGINS.find((p) => p.pluginId === "PLG-054");
    return [
      `### Noctis SAST Audit — \`CWE-94\` Dynamic Code Generation & Execution`,
      `- **Python Rule (\`${pyPlugin?.pluginId}: ${pyPlugin?.code}\` · MITRE \`${pyPlugin?.mitreAttack}\`):** Targets Python \`exec()\` / \`compile()\` (\`src/scripting/rule_runner.py\`). Fix: ${pyPlugin?.remediationSummary}`,
      `- **Java Rule (\`${javaPlugin?.pluginId}: ${javaPlugin?.code}\` · MITRE \`${javaPlugin?.mitreAttack}\`):** Targets \`javax.tools.JavaCompiler.getTask(...)\` in \`BlindScript.java\`. Note that \`compiler.getTask(...)\` only initializes a compilation task; static analysis must verify whether \`task.call()\` executes and whether attacker input reaches the \`JavaFileObject\` source before claiming exploitability (**Proof Status: Needs Source-to-Execution Validation**).`,
      `\n#### Verified Java Remediation (\`BlindScript.java\`)\n\`\`\`java\n// Remove runtime JavaCompiler compilation of user-controlled source;\n// use a strict allowlist of pre-compiled strategies.\nMap<String, Runnable> ALLOWED_JOBS = Map.of(\n    \"dailyReport\", reportService::runDailyReport,\n    \"auditSync\", auditService::syncLedger\n);\nRunnable job = ALLOWED_JOBS.get(request.getParameter(\"jobName\"));\nif (job == null) {\n    throw new IllegalArgumentException(\"Disallowed job identifier\");\n}\njob.run();\n\`\`\``,
    ].join("\n");
  }

  // 8. Check if asking about Benchmark repositories
  if (/\b(benchmark|repo|juice\s*shop|webgoat|dvwa|crapi|semgrep|gosec|nodegoat|pygoat|railsgoat|mutillidae|vampi|vulhub)\b/i.test(q)) {
    const matchedRepos = BENCHMARK_32_REPOS.filter(
      (r) =>
        q.includes(r.name.toLowerCase()) ||
        q.includes(r.ownerRepo.toLowerCase()) ||
        q.includes(r.language.toLowerCase())
    );
    const listToRender = (matchedRepos.length > 0 ? matchedRepos : BENCHMARK_32_REPOS).slice(0, 10);
    const sample = listToRender
      .map(
        (r: BenchmarkRepoTarget) =>
          `- **${r.name}** (\`${r.ownerRepo}\`) — **${r.testingMode}** · ${r.category} · Language: \`${r.language}\` · Key CWEs: \`${r.keyCwes.join(", ")}\``
      )
      .join("\n");
    return [
      `### Noctis SAST & DAST Benchmark Corpus (${BENCHMARK_32_REPOS.length} Integrated Repositories)`,
      `- **SAST Repositories & Scanners:** ${BENCHMARK_32_REPOS.filter((r) => r.testingMode.includes("SAST")).length}`,
      `- **DAST Vulnerable Web Apps & APIs:** ${BENCHMARK_32_REPOS.filter((r) => r.testingMode.includes("DAST")).length}`,
      `\n#### Matching Benchmark Targets\n${sample}`,
    ].join("\n");
  }

  // 9. Keyword search across Findings & 401 Plugins
  const keywordFindings = activeFindings.filter(
    (f) =>
      String(f.title || "").toLowerCase().includes(q) ||
      String(f.file || f.filePath || "").toLowerCase().includes(q) ||
      String(f.cweName || "").toLowerCase().includes(q)
  );
  if (keywordFindings.length > 0) {
    return formatFindingDossier(keywordFindings[0]);
  }

  const keywordPlugins = SAST_400_PLUGINS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.cweName.toLowerCase().includes(q)
  ).slice(0, 5);
  if (keywordPlugins.length > 0) {
    return [
      `### Noctis SAST Plugin Matches (${keywordPlugins.length})`,
      ...keywordPlugins.map(
        (p) =>
          `- **\`${p.pluginId}: ${p.code}\`** — ${p.name} (\`${p.cwe}\` · **${p.languages.join(", ")}** · CVSS ${p.cvss})\n  - Pattern: \`${p.pattern}\`\n  - Fix: ${p.remediationSummary}`
      ),
    ].join("\n\n");
  }

  // 10. Comprehensive default overview of SAST & all synced XTRIKE SAST assets
  const filesList = SAST_REPO_FILES.map((f) => `- \`${f.path}\` — ${f.role}`).join("\n");
  return [
    `### Noctis AI — XTRIKE SAST Platform Complete Knowledge Base`,
    `**SAST (Static Application Security Testing)** analyzes source code, bytecode, IaC templates, Abstract Syntax Trees (AST), Control-Flow Graphs (CFG), and Data-Flow / Taint Graphs (DFG) to detect and remediate vulnerabilities before production deployment.`,
    `\n#### Synced XTRIKE SAST Assets & Resources in Noctis`,
    `- **4 Hybrid Static Engines:** \`XTRIKE XQL\`, \`XTRIKE DeepFlow\`, \`XTRIKE StructSCA\`, and \`XTRIKE AST-Query\``,
    `- **401 SAST Plugins:** \`PLG-001\` through \`PLG-401\` covering Java, Python, TypeScript/Node.js, Go, C#, PHP, Ruby, Rust, C/C++, Terraform, and Kubernetes`,
    `- **${activeFindings.length} Active Workspace Findings:** Full source-to-sink taint paths, proof states (\`DATAFLOW_CONFIRMED\`, \`RUNTIME_PROVED\`, \`NEEDS_VALIDATION\`), and language-verified remediation diffs`,
    `- **${BENCHMARK_32_REPOS.length} SAST & DAST Benchmark Repositories:** OWASP Benchmark, Juice Shop, WebGoat, DVWA, crAPI, Semgrep, Gosec, VAmPI, Vulhub, and more`,
    `- **${SAST_PLATFORM_APPS_AND_MODULES.length} SAST Platform Apps & Modules:** Front Desk, Scan Workspace, 6-Stage Proof Engine, Triage Desk, Report Engine, XTRIKE Fusion, Taint Graph, AI-BOM, MCP Server, and Rule Editor`,
    `\n#### Core Repository Modules Indexed\n${filesList}`,
    `\nAsk me about any finding (\`F-001\`–\`F-027\`), plugin (\`PLG-001\`–\`PLG-401\`), CWE (\`CWE-89\`, \`CWE-94\`, \`CWE-918\`, \`CWE-502\`), benchmark repo, or platform module directly inside this pop-up!`,
  ].join("\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "What is SAST and what assets are in the XTRIKE SAST Platform?";
  return NextResponse.json({
    ok: true,
    platform: "XTRIKE SAST Platform — Noctis In-App API",
    pluginsCount: SAST_400_PLUGINS.length,
    findingsCount: FINDINGS.length,
    benchmarksCount: BENCHMARK_32_REPOS.length,
    appsAndModules: SAST_PLATFORM_APPS_AND_MODULES,
    repositoryFiles: SAST_REPO_FILES,
    answer: buildLocalSastAnswer(q),
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      question?: string;
      turns?: { role: "user" | "assistant"; content: string }[];
      scanRepoName?: string;
      findings?: ClientFindingSummary[];
    };

    const question =
      (typeof body.question === "string" && body.question.trim()) ||
      (Array.isArray(body.turns)
        ? [...body.turns].reverse().find((t) => t.role === "user")?.content || ""
        : "");

    if (!question.trim()) {
      return NextResponse.json({ error: "Please enter a question for Noctis." }, { status: 400 });
    }

    const localSastSynthesis = buildLocalSastAnswer(question, body.scanRepoName, body.findings);

    // Query live Noctis API (https://dstrike.app/api/noctis) in the background and return the unified response into the in-app pop-up
    try {
      const turns =
        Array.isArray(body.turns) && body.turns.length > 0
          ? body.turns
          : [{ role: "user" as const, content: question }];

      const remoteRes = await fetch(NOCTIS_REMOTE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turns,
          skill: "code",
          depth: "deep",
          code: true,
          context: `XTRIKE SAST Platform In-App Noctis Pop-up. Active scan repository: ${
            body.scanRepoName || "Workspace Default"
          }. Synced Assets: 401 Plugins (PLG-001..PLG-401), ${
            Array.isArray(body.findings) ? body.findings.length : FINDINGS.length
          } Findings, ${BENCHMARK_32_REPOS.length} Benchmark Repos, ${
            SAST_PLATFORM_APPS_AND_MODULES.length
          } Platform Modules. Exact SAST Repository Match: ${localSastSynthesis.slice(0, 2200)}`,
        }),
        signal: AbortSignal.timeout(9000),
      });

      if (remoteRes.ok) {
        const remoteData = (await remoteRes.json()) as {
          answer?: string;
          model?: string;
        };
        if (remoteData?.answer && remoteData.answer.trim().length > 20) {
          // Always ensure specific SAST repository/finding/plugin/module queries include the exact SAST asset dossier
          const isSpecificSastAssetQuery =
            /\b(f-0\d{2}|plg-\d{3}|cwe-\d+|current\s+scan|active\s+finding|apps|modules|benchmark|blindscript|lesson5a|sast)\b/i.test(
              question
            );
          const finalAnswer = isSpecificSastAssetQuery
            ? `${localSastSynthesis}\n\n---\n\n${remoteData.answer}`
            : `${remoteData.answer}\n\n---\n\n${localSastSynthesis}`;

          return NextResponse.json({
            ok: true,
            answer: finalAnswer,
            model: remoteData.model || "noctis-sast-live-api",
            assetsSynced: {
              plugins: SAST_400_PLUGINS.length,
              findings: Array.isArray(body.findings) ? body.findings.length : FINDINGS.length,
              benchmarks: BENCHMARK_32_REPOS.length,
              modules: SAST_PLATFORM_APPS_AND_MODULES.length,
            },
          });
        }
      }
    } catch {
      // Seamless local deterministic SAST Noctis engine fallback so the pop-up never fails
    }

    return NextResponse.json({
      ok: true,
      answer: localSastSynthesis,
      model: "noctis-sast-engine-v1",
      assetsSynced: {
        plugins: SAST_400_PLUGINS.length,
        findings: Array.isArray(body.findings) ? body.findings.length : FINDINGS.length,
        benchmarks: BENCHMARK_32_REPOS.length,
        modules: SAST_PLATFORM_APPS_AND_MODULES.length,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Noctis could not process that SAST query." },
      { status: 500 }
    );
  }
}
