"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Shield, Swords, Zap, Activity, AlertTriangle, CheckCircle, Terminal,
  Layers, Play, Copy, Check, Download, RefreshCw, Filter, Search,
  ExternalLink, Eye, ChevronRight, Server, Globe, Lock, Cpu, Bot,
  MessageSquare, Flame, Radio, Code2, Sparkles, Send, FileCode, CheckSquare,
  Maximize2, Minimize2, ArrowUpRight, ShieldCheck, ChevronDown
} from "lucide-react";
import { FINDINGS } from "@/data/findings";

const SAMPLE_TARGETS = [
  { host: "api.enterprise-auth.corp", env: "Production", ip: "192.168.10.45", risk: "Critical" },
  { host: "payments.gateway-cloud.io", env: "Staging", ip: "10.0.4.120", risk: "High" },
  { host: "portal.identity-internal.net", env: "Internal Microservice", ip: "172.16.88.14", risk: "Medium" },
  { host: "k8s-ingress.prod.us-east.aws", env: "Edge Gateway", ip: "54.210.14.99", risk: "Critical" }
];

const BRAIN_8_STAGES = [
  { num: 1, key: "DISCOVER",   title: "1. DISCOVER · Surface & API Discovery",      desc: "Nmap TCP SYN sweep, DOM spider, OpenAPI/GraphQL & Cloudflare DoH DNS enumeration.", tool: "Nmap NSE & DOM Spider", standards: "PTES P2 · WSTG-INFO · MITRE TA0043" },
  { num: 2, key: "UNDERSTAND", title: "2. UNDERSTAND · App Model & Trust Boundaries", desc: "Maps roles (Admin/User/Guest), JWT/cookie state machines & microservice trust boundaries.", tool: "Trust Boundary Modeler", standards: "OWASP ASVS v4.0.3 · NIST §3" },
  { num: 3, key: "PLAN",       title: "3. PLAN · Adaptive Risk-Based Test Plan",     desc: "Prioritizes attack vectors via FIRST EPSS v4 exploit probability & CISA KEV catalog.", tool: "EPSS / KEV Planner", standards: "FIRST EPSS · CISA KEV · WSTG v4.2" },
  { num: 4, key: "EXECUTE",    title: "4. EXECUTE · Controlled Dynamic Testing",     desc: "Rate-limited DAST fuzzing across SQLi, XSS, SSRF, BOLA/BFLA & auth bypass vectors.", tool: "OWASP ZAP & Burp OOB", standards: "OWASP Top 10 · API Top 10 · MITRE TA0001" },
  { num: 5, key: "VALIDATE",   title: "5. VALIDATE · Exploitability Verification",   desc: "Independent safe PoC replay & OAST callback verification — 0% false positives.", tool: "OAST & Safe PoC Verifier", standards: "PTES P5 · NIST §5 · MITRE TA0004" },
  { num: 6, key: "CORRELATE",  title: "6. CORRELATE · Attack-Path & Root-Cause",     desc: "Chains findings into multi-hop kill paths & groups into systemic CWE / NIST SSDF root causes.", tool: "Attack-Path Graph Brain", standards: "CWE · NIST SP 800-218 (SSDF)" },
  { num: 7, key: "REPORT",     title: "7. REPORT · Evidence-Traceable Dossier",      desc: "Generates SHA-256 signed HTTP transcripts, CVSS v3.1/v4.0 vectors & cURL reproduction.", tool: "Dossier & SARIF Engine", standards: "SARIF v2.1.0 · CVSS v4.0 · PTES P7" },
  { num: 8, key: "RETEST",     title: "8. RETEST · Automated Regression Check",      desc: "Re-executes post-patch verification probes & MITRE D3FEND™ countermeasure validation.", tool: "MITRE D3FEND™ Retester", standards: "MITRE D3FEND™ · OWASP SAMM" }
];

function AegisSocContent() {
  const searchParams = useSearchParams();
  const isStandalone = searchParams.get("standalone") === "1";

  const [activeTab, setActiveTab] = useState<"matrix" | "pipeline" | "forge" | "copilot" | "evidence">("matrix");
  const [selectedTarget, setSelectedTarget] = useState(SAMPLE_TARGETS[0]);
  const [activeDefcon, setActiveDefcon] = useState(2);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<any>(FINDINGS[0]);
  const [filterSev, setFilterSev] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [activeStage, setActiveStage] = useState(8);

  // Copilot State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: `Hello, I am your Security Intelligence Copilot. I have analyzed all scan telemetry for **${selectedTarget.host}**. 

I can help you:
- **Reproduce findings**: Generate precise cURL commands or Burp repeater requests
- **Evaluate blast radius**: Calculate CVSS 3.1 vector metrics and asset impact
- **Remediate vulnerabilities**: Draft WAF virtual patches and developer guidance

Select a finding or type a question below to begin.`
    }
  ]);

  // Real-time telemetry (calm, realistic updates)
  const [telemetry, setTelemetry] = useState({ reqPerSec: 164, latency: 12, memoryUsage: "412 MB", activeRules: 247 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => ({
        reqPerSec: Math.floor(150 + Math.random() * 25),
        latency: Math.floor(10 + Math.random() * 5),
        memoryUsage: "416 MB",
        activeRules: 247
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTriggerScan = () => {
    setIsScanning(true);
    const stageSteps = [
      { stage: 1, pct: 12 },
      { stage: 2, pct: 25 },
      { stage: 3, pct: 38 },
      { stage: 4, pct: 52 },
      { stage: 5, pct: 66 },
      { stage: 6, pct: 80 },
      { stage: 7, pct: 92 },
      { stage: 8, pct: 100 }
    ];
    stageSteps.forEach((s, idx) => {
      setTimeout(() => {
        setActiveStage(s.stage);
        setScanProgress(s.pct);
        if (s.stage === 8) setIsScanning(false);
      }, idx * 550);
    });
  };

  const handleSendAiMessage = (promptText?: string) => {
    const textToSend = promptText || aiPrompt;
    if (!textToSend.trim()) return;
    const userText = textToSend;
    setAiMessages(prev => [...prev, { role: "user", text: userText }]);
    if (!promptText) setAiPrompt("");

    setTimeout(() => {
      let reply = "";
      const lower = userText.toLowerCase();
      if (lower.includes("curl") || lower.includes("poc")) {
        reply = `Here is the verified cURL reproduction command for **${selectedFinding?.title || selectedTarget.host}**:

\`\`\`bash
# Reproduction cURL against ${selectedTarget.host}
curl -i -s -k -X POST 'https://${selectedTarget.host}/api/v2/auth/login' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Forwarded-For: 127.0.0.1' \\
  -d '{"username": "admin'\'' OR 1=1--", "password": "verification_payload"}'
\`\`\`

**Expected Result**: Bypasses authentication checks and confirms database error or unauthorized session token generation.`;
      } else if (lower.includes("waf") || lower.includes("patch")) {
        reply = `Here is a recommended WAF virtual patch for **${selectedTarget.host}**:

\`\`\`nginx
# Nginx / ModSecurity Rule definition
location /api/v2/auth {
    if ($request_body ~* "(union\\s+select|or\\s+1=1|drop\\s+table|--|/\\*)") {
        return 403 '{"error": "Security rule violation", "code": "SEC_WAF_089"}';
    }
    proxy_pass http://backend_cluster;
}
\`\`\`

**Deployment Note**: Apply this rule at the edge (Cloudflare / AWS WAF) for immediate mitigation while applying database parameterized queries.`;
      } else if (lower.includes("cvss") || lower.includes("blast")) {
        reply = `### Impact & Blast Radius Analysis for ${selectedTarget.host}
- **Assessed CVSS Score**: 9.8 (Critical)
- **Vector**: \`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H\`
- **Affected Assets**: Database cluster, authentication tokens, downstream customer records
- **Confidentiality**: High (direct database extraction)
- **Integrity**: High (potential data modification)
- **Availability**: Moderate (risk of resource exhaustion via denial of service)`;
      } else {
        reply = `Target **${selectedTarget.host}** is currently evaluated at **DEFCON ${activeDefcon}**.

**Summary**:
- **Critical Issues**: 5 vulnerabilities requiring priority triage (SQLi, Broken Object Auth, JWT Algorithm Confusion).
- **Recommended Order**:
  1. Patch unparameterized queries on \`/api/products/search\` and \`/api/v2/auth/login\`.
  2. Enforce strict RS256 algorithm validation on JWT authorization tokens.
  3. Restrict internal network egress to block SSRF metadata calls to \`169.254.169.254\`.`;
      }
      setAiMessages(prev => [...prev, { role: "assistant", text: reply }]);
    }, 500);
  };

  const filteredFindings = FINDINGS.filter((f: any) => {
    const matchSev = filterSev === "ALL" || f.severity === filterSev;
    const targetUrl = f.url || f.target || "";
    const matchQuery = !searchQuery || f.title.toLowerCase().includes(searchQuery.toLowerCase()) || targetUrl.toLowerCase().includes(searchQuery.toLowerCase()) || (f.cweId && f.cweId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSev && matchQuery;
  });

  return (
    <div className="flex flex-col min-h-full bg-slate-950 text-slate-100 overflow-x-hidden font-sans selection:bg-sky-500/20 selection:text-white">

      {/* Top Header: Dignified, Clean, Professional — 100% visible on mobile & desktop */}
      <header className="px-3 sm:px-5 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Left: Brand Identity & Target Selector */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0">
              <Shield className="size-4 text-sky-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-white tracking-tight">ÆGIS · SOC</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  Platform 11
                </span>
                {isStandalone && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-950 text-sky-300 border border-sky-800/60 inline-block">
                    Standalone Console
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 block">Security Operations & Dynamic Analysis</p>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 hidden md:block" />

          {/* Clean Target Dropdown */}
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <div className="relative max-w-full">
              <select
                value={selectedTarget.host}
                onChange={e => {
                  const found = SAMPLE_TARGETS.find(t => t.host === e.target.value);
                  if (found) setSelectedTarget(found);
                }}
                className="appearance-none bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer transition-colors max-w-full"
              >
                {SAMPLE_TARGETS.map(t => (
                  <option key={t.host} value={t.host} className="bg-slate-900 text-slate-200">
                    {t.host} ({t.env})
                  </option>
                ))}
              </select>
              <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <span className="text-[11px] font-mono text-slate-400 inline-block">
              {selectedTarget.ip}
            </span>
          </div>
        </div>

        {/* Center: System Health Telemetry (Visible on all devices) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] sm:text-xs text-slate-300 font-mono">
          <div className="flex items-center gap-1.5 px-1.5 py-0.5">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span>{telemetry.reqPerSec} req/s</span>
          </div>
          <span className="text-slate-700">·</span>
          <div className="px-1.5 py-0.5 text-slate-400">
            <span>{telemetry.latency}ms latency</span>
          </div>
          <span className="text-slate-700">·</span>
          <div className="px-1.5 py-0.5 text-slate-400">
            <span>{telemetry.activeRules} active rules</span>
          </div>
        </div>

        {/* Right: DEFCON Selector & Main Scan Trigger */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          
          {/* Subtle DEFCON Segmented Control (Visible on mobile & desktop) */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-medium text-slate-400 px-1.5 uppercase tracking-wider">DEFCON</span>
            {[1, 2, 3, 4, 5].map(d => {
              const isActive = activeDefcon === d;
              return (
                <button
                  key={d}
                  onClick={() => setActiveDefcon(d)}
                  className={`size-6 rounded text-xs font-semibold transition-all ${
                    isActive
                      ? d <= 2
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : d === 3
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title={`DEFCON ${d}`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleTriggerScan}
            disabled={isScanning}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                <span>Brain Stage {activeStage}/8 ({scanProgress}%)</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current" />
                <span>Run 8-Stage Brain Scan</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Live 8-Stage Autonomous Brain Progression & Highlight Ribbon */}
      <div className="px-3 sm:px-5 py-2 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center gap-1.5 shrink-0">
        <span className="text-[10px] font-bold font-mono text-sky-400 mr-1 whitespace-nowrap">
          🧠 8-STAGE AUTONOMOUS BRAIN:
        </span>
        {BRAIN_8_STAGES.map(st => {
          const isCurrent = isScanning && activeStage === st.num;
          const isDone = (!isScanning && activeStage >= st.num) || (isScanning && activeStage > st.num);
          return (
            <button
              key={st.num}
              onClick={() => {
                setActiveStage(st.num);
                setActiveTab("pipeline");
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
                isCurrent
                  ? "bg-amber-500/25 text-amber-300 border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                  : isDone
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-900 text-slate-400 border border-slate-800"
              }`}
              title={`${st.title} — ${st.desc}`}
            >
              <span>{isCurrent ? "⚡" : isDone ? "✓" : "○"}</span>
              <span>{st.num}. {st.key}</span>
              {isCurrent && (
                <span className="px-1 rounded bg-amber-400 text-slate-950 text-[8px] font-black">
                  ACTIVE
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="px-5 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between gap-4 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("matrix")}
            className={`px-3.5 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "matrix"
                ? "border-sky-400 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="size-3.5" />
            <span>Vulnerability Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-3.5 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "pipeline"
                ? "border-sky-400 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="size-3.5" />
            <span>8-Stage Brain Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab("forge")}
            className={`px-3.5 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "forge"
                ? "border-sky-400 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="size-3.5" />
            <span>HTTP Request Studio</span>
          </button>

          <button
            onClick={() => setActiveTab("copilot")}
            className={`px-3.5 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "copilot"
                ? "border-sky-400 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bot className="size-3.5" />
            <span>AI Security Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab("evidence")}
            className={`px-3.5 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "evidence"
                ? "border-sky-400 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="size-3.5" />
            <span>Evidence & Reports</span>
          </button>
        </div>

        <div className="flex items-center gap-3 py-1.5 shrink-0">
          <Link
            href="/live-scan"
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <span>Scan Engine Matrix</span>
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-y-auto p-5 sm:p-6">
        
        {/* ============================================================== */}
        {/* TAB 1: VULNERABILITY MATRIX & RISK RADAR                       */}
        {/* ============================================================== */}
        {activeTab === "matrix" && (
          <div className="space-y-5 max-w-7xl mx-auto">
            
            {/* 4 Unified, Clean Metric Cards (Reduced Coloring) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Metric 1: Critical Issues */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Critical Exploits</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      Action Required
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">5</div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Immediate RCE and unauthenticated blind SQL injection.
                </p>
              </div>

              {/* Metric 2: High Severity */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>High Vulnerabilities</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      12 Active
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">12</div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  BOLA, IDOR, and SSRF internal service probes.
                </p>
              </div>

              {/* Metric 3: Verified Proof of Concept */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Verified PoCs</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Verified
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">100%</div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Zero false positives confirmed via OAST callbacks.
                </p>
              </div>

              {/* Metric 4: Monitored Attack Surface */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Attack Surface</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      Monitored
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">48 Endpoints</div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  12 API routes and 36 public web service endpoints.
                </p>
              </div>

            </div>

            {/* Split Workspace: Findings List + Detail Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Interactive Table (7 cols) */}
              <div className="lg:col-span-7 rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden flex flex-col">
                
                {/* Search & Filter Header */}
                <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter by vulnerability, endpoint, or CWE..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1">
                    {["ALL", "Critical", "High", "Medium"].map(sev => {
                      const isSel = filterSev === sev;
                      return (
                        <button
                          key={sev}
                          onClick={() => setFilterSev(sev)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                            isSel
                              ? "bg-slate-800 text-white border border-slate-700"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {sev}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Table Data */}
                <div className="overflow-x-auto max-h-[460px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 font-medium border-b border-slate-800 sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3">Severity</th>
                        <th className="py-2.5 px-3">Vulnerability</th>
                        <th className="py-2.5 px-3">Endpoint</th>
                        <th className="py-2.5 px-3">CWE</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredFindings.map((f: any) => {
                        const isSelected = selectedFinding?.id === f.id;
                        const isCrit = f.severity === "Critical";
                        const isHigh = f.severity === "High";
                        return (
                          <tr
                            key={f.id}
                            onClick={() => setSelectedFinding(f)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-slate-800/60 border-l-2 border-sky-400"
                                : "hover:bg-slate-800/30"
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                isCrit
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  : isHigh
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                              }`}>
                                {f.severity}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-100 break-words">
                              {f.title}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-400 break-all">
                              {f.url || f.target || "—"}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-400">
                              {f.cweId || f.cwe || "CWE-89"}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFinding(f);
                                  setActiveTab("forge");
                                }}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                              >
                                Test
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Summary */}
                <div className="p-2.5 border-t border-slate-800 bg-slate-900/60 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
                  <span>Showing {filteredFindings.length} of {FINDINGS.length} security findings</span>
                  <span className="font-mono text-slate-500">Target: {selectedTarget.host}</span>
                </div>
              </div>

              {/* Right Column: Finding Detail Inspector (5 cols) */}
              <div className="lg:col-span-5 rounded-xl bg-slate-900/60 border border-slate-800 p-5 flex flex-col justify-between">
                
                <div>
                  {/* Top Bar: Title & CVSS */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        Finding Inspection
                      </span>
                      <h3 className="text-sm font-semibold text-white mt-1 leading-snug">
                        {selectedFinding?.title}
                      </h3>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                      CVSS {selectedFinding?.cvss || "9.8"}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="text-xs text-slate-300 leading-relaxed mb-4">
                    {selectedFinding?.description ||
                      "The target endpoint is vulnerable to unauthenticated manipulation. User input is reflected or concatenated directly into backend commands."}
                  </div>

                  {/* Impact */}
                  {selectedFinding?.impact && (
                    <div className="mb-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Business Impact
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedFinding.impact}
                      </p>
                    </div>
                  )}

                  {/* Proof of Concept Snippet */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Reproduction Payload</span>
                      <button
                        onClick={() => handleCopy(selectedFinding?.evidence?.payload || selectedFinding?.payload || "admin' OR 1=1--", "payload")}
                        className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                      >
                        {copiedId === "payload" ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                        <span>{copiedId === "payload" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[140px] leading-relaxed">
                      {selectedFinding?.evidence?.testRequest || selectedFinding?.payload || `POST /api/v2/auth/login HTTP/1.1\nHost: ${selectedTarget.host}\nContent-Type: application/json\n\n{"username": "admin' OR 1=1--", "password": "x"}`}
                    </pre>
                  </div>
                </div>

                {/* Bottom Quick Action Strip */}
                <div className="pt-3 border-t border-slate-800 flex items-center gap-2 mt-4">
                  <button
                    onClick={() => {
                      setActiveTab("copilot");
                      handleSendAiMessage("How do I remediate " + selectedFinding?.title + "?");
                    }}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Bot className="size-3.5 text-sky-400" />
                    <span>Ask AI Remediation</span>
                  </button>

                  <button
                    onClick={() => handleCopy(JSON.stringify(selectedFinding, null, 2), "sarif")}
                    className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-colors"
                    title="Copy finding as JSON"
                  >
                    <Download className="size-3.5" />
                    <span>{copiedId === "sarif" ? "Copied" : "JSON"}</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: 8-STAGE AUTONOMOUS BRAIN PIPELINE                       */}
        {/* ============================================================== */}
        {activeTab === "pipeline" && (
          <div className="space-y-5 max-w-7xl mx-auto">
            
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-white">Autonomous 8-Stage Brain Assessment Pipeline</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Every assessment steps sequentially through all 8 Autonomous Brain Stages (1. Discover ➔ 8. Retest), highlighting each stage in real time.
                  </p>
                </div>
                <button
                  onClick={handleTriggerScan}
                  disabled={isScanning}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white self-start sm:self-auto flex items-center gap-1.5"
                >
                  <Play className="size-3.5 fill-current" />
                  <span>{isScanning ? `Running Stage ${activeStage}/8...` : "Execute 8-Stage Brain Pipeline"}</span>
                </button>
              </div>

              {/* 8 Stage Progression Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {BRAIN_8_STAGES.map(stage => {
                  const isCurrent = isScanning && activeStage === stage.num;
                  const isDone = (!isScanning && activeStage >= stage.num) || (isScanning && activeStage > stage.num);
                  return (
                    <div
                      key={stage.num}
                      onClick={() => setActiveStage(stage.num)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-amber-500/10 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                          : isDone
                          ? "bg-slate-900 border-emerald-500/40 shadow-sm"
                          : "bg-slate-950/40 border-slate-800/60 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-mono font-bold text-sky-400">Brain Stage {stage.num}/8</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isCurrent
                            ? "bg-amber-400 text-slate-950 border-amber-300"
                            : isDone
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-800 text-slate-500 border-slate-700"
                        }`}>
                          {isCurrent ? "⚡ ACTIVE STAGE" : isDone ? "✓ Verified" : "Pending"}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-white mb-1">{stage.title}</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{stage.desc}</p>
                      <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800/60 pt-2 flex flex-col gap-0.5">
                        <span>Engine: <strong className="text-slate-200">{stage.tool}</strong></span>
                        <span className="text-purple-400">{stage.standards}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Execution Log Terminal */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
              <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Terminal className="size-3.5 text-slate-400" />
                  <span>Execution Log Stream</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">Live Telemetry</span>
              </div>

              <pre className="p-4 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed max-h-[300px] overflow-y-auto">
{`[INFO] [00:00:01] Initializing scan daemon against ${selectedTarget.host} (${selectedTarget.ip})
[STAGE 1] Running Nmap Port Enumeration: Discovered ports 80/tcp, 443/tcp, 8080/tcp, 8443/tcp open
[STAGE 1] Spawning ZAP Spider: Discovered 48 endpoints across /api/v2, /auth, /billing, /internal
[STAGE 2] Fuzzing Engine Engaged: Testing 2,400 payloads across query & body parameters
[ALERT] Vulnerability Confirmed: SQL Injection found on /api/v2/auth/login (Parameter 'username')
[STAGE 3] Proof-of-Exploit Verification: OAST callback received on aegis-oob.net from ${selectedTarget.ip}
[STAGE 4] Findings Consolidated: 5 Critical, 12 High, 8 Medium registered into Evidence Vault
[STAGE 4] Generated SARIF 2.1 report for Platform 18 SIEM dispatch ... OK (200)`}
              </pre>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: HTTP REQUEST STUDIO & FORGE                             */}
        {/* ============================================================== */}
        {activeTab === "forge" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-7xl mx-auto">
            
            {/* Left: Request Forge */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden flex flex-col">
              <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Code2 className="size-3.5 text-slate-400" />
                  <span>HTTP Attack Forge</span>
                </div>
                <button
                  onClick={() => alert("Request dispatched to target environment.")}
                  className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Send className="size-3" />
                  <span>Send Request</span>
                </button>
              </div>

              <textarea
                defaultValue={`POST /api/v2/auth/login HTTP/1.1
Host: ${selectedTarget.host}
User-Agent: AEGIS-DAST/4.5 (Security Audit)
Accept: application/json
Content-Type: application/json
X-Forwarded-For: 127.0.0.1

{
  "username": "admin' UNION SELECT 1, version(), current_user, 4--",
  "password": "payload_test_0x99"
}`}
                className="flex-1 w-full h-[380px] p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed border-none outline-none resize-none selection:bg-sky-500/20"
              />
            </div>

            {/* Right: Response Viewer */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden flex flex-col">
              <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  <span>Server Response</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    200 OK
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">248ms · 842 B</span>
              </div>

              <pre className="flex-1 p-4 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed overflow-auto max-h-[380px]">
{`HTTP/1.1 200 OK
Date: Fri, 19 Sep 2026 18:30:12 GMT
Content-Type: application/json; charset=utf-8
Server: nginx/1.24.0 (Ubuntu)
Access-Control-Allow-Origin: *

{
  "status": "authenticated",
  "jwt": "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0...",
  "extracted_data": {
    "db_user": "postgres_admin",
    "version": "PostgreSQL 15.4",
    "privilege": "SUPERUSER"
  }
}`}
              </pre>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: AI SECURITY COPILOT                                     */}
        {/* ============================================================== */}
        {activeTab === "copilot" && (
          <div className="max-w-4xl mx-auto rounded-xl bg-slate-900/60 border border-slate-800 min-h-[520px] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <Bot className="size-4 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">AI Security Assistant</h3>
                  <p className="text-[11px] text-slate-400">Contextual exploit reproduction, blast radius & WAF patching</p>
                </div>
              </div>

              {/* Quick suggestion chips (Visible on mobile & desktop) */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleSendAiMessage("Generate cURL reproduction script")}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
                >
                  cURL PoC
                </button>
                <button
                  onClick={() => handleSendAiMessage("Draft WAF virtual patch")}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
                >
                  WAF Patch
                </button>
                <button
                  onClick={() => handleSendAiMessage("Analyze CVSS blast radius")}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
                >
                  Blast Radius
                </button>
              </div>
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {aiMessages.map((msg, idx) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                        isUser
                          ? "bg-slate-800 text-white border border-slate-700"
                          : "bg-slate-900/90 text-slate-200 border border-slate-800"
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                      {isUser ? "You" : "Security Assistant"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about reproduction, remediation, or WAF rules..."
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSendAiMessage(); }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700"
              />
              <button
                onClick={() => handleSendAiMessage()}
                className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Send className="size-3" />
                <span>Send</span>
              </button>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: EVIDENCE VAULT & SARIF REPORTS                          */}
        {/* ============================================================== */}
        {activeTab === "evidence" && (
          <div className="max-w-7xl mx-auto space-y-4">
            
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
              <div className="p-3.5 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileCode className="size-4 text-sky-400" />
                  <span className="text-xs font-semibold text-white">SARIF 2.1 & Enterprise Vulnerability Ledger</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(JSON.stringify(FINDINGS, null, 2), "sarif-all")}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="size-3" />
                    <span>{copiedId === "sarif-all" ? "Copied" : "Copy SARIF"}</span>
                  </button>

                  <a
                    href="https://18-unified-integration-layer.vercel.app"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="size-3" />
                    <span>Dispatch to SIEM</span>
                  </a>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-medium border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-3">Vulnerability Title</th>
                      <th className="py-2.5 px-3">Endpoint</th>
                      <th className="py-2.5 px-3">CWE</th>
                      <th className="py-2.5 px-3">Confidence</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {FINDINGS.map((f: any) => {
                      const isCrit = f.severity === "Critical";
                      const isHigh = f.severity === "High";
                      return (
                        <tr key={f.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-mono text-slate-400">{f.id}</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              isCrit
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : isHigh
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                            }`}>
                              {f.severity}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-100">{f.title}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-400">{f.url || f.target || "—"}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-400">{f.cweId || f.cwe || "CWE-89"}</td>
                          <td className="py-2.5 px-3 text-slate-300">{f.confidence || "Confirmed"}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                              <CheckCircle className="size-3" />
                              <span>Verified</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}

export default function AegisSocStandalonePage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400 bg-slate-950 h-full flex items-center justify-center">Loading Security Console...</div>}>
      <AegisSocContent />
    </Suspense>
  );
}
