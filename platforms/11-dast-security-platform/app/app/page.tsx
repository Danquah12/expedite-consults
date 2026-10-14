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
  const [activeStage, setActiveStage] = useState(4);

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
    setScanProgress(15);
    setActiveStage(1);
    setTimeout(() => { setScanProgress(45); setActiveStage(2); }, 1200);
    setTimeout(() => { setScanProgress(75); setActiveStage(3); }, 2400);
    setTimeout(() => { setScanProgress(100); setActiveStage(4); setIsScanning(false); }, 3600);
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
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-sky-500/20 selection:text-white">

      {/* Top Header: Dignified, Clean, Professional */}
      <header className="px-5 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
        
        {/* Left: Brand Identity & Target Selector */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0">
              <Shield className="size-4 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white tracking-tight">ÆGIS · SOC</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  Platform 11
                </span>
                {isStandalone && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-950 text-sky-300 border border-sky-800/60 hidden sm:inline-block">
                    Standalone Console
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Security Operations & Dynamic Analysis</p>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 hidden md:block" />

          {/* Clean Target Dropdown */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative">
              <select
                value={selectedTarget.host}
                onChange={e => {
                  const found = SAMPLE_TARGETS.find(t => t.host === e.target.value);
                  if (found) setSelectedTarget(found);
                }}
                className="appearance-none bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer transition-colors"
              >
                {SAMPLE_TARGETS.map(t => (
                  <option key={t.host} value={t.host} className="bg-slate-900 text-slate-200">
                    {t.host} ({t.env})
                  </option>
                ))}
              </select>
              <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <span className="text-[11px] font-mono text-slate-500 hidden lg:inline">
              {selectedTarget.ip}
            </span>
          </div>
        </div>

        {/* Center: Calm System Health Telemetry */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 font-mono">
          <div className="flex items-center gap-1.5 px-2 py-0.5">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span>{telemetry.reqPerSec} req/s</span>
          </div>
          <span className="text-slate-700">·</span>
          <div className="px-2 py-0.5 text-slate-400">
            <span>{telemetry.latency}ms latency</span>
          </div>
          <span className="text-slate-700">·</span>
          <div className="px-2 py-0.5 text-slate-400">
            <span>{telemetry.activeRules} active rules</span>
          </div>
        </div>

        {/* Right: DEFCON Selector & Main Scan Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Subtle DEFCON Segmented Control */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800">
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
                <span>Stage {activeStage}/4 ({scanProgress}%)</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current" />
                <span>Run 4-Stage Scan</span>
              </>
            )}
          </button>
        </div>
      </header>

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
            <span>Attack Pipeline</span>
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
                            <td className="py-2.5 px-3 font-medium text-slate-100 max-w-[200px] truncate">
                              {f.title}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-400 max-w-[180px] truncate">
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
                <div className="p-2.5 border-t border-slate-800 bg-slate-900/60 text-[11px] text-slate-400 flex items-center justify-between">
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
        {/* TAB 2: 4-STAGE ATTACK PIPELINE                                 */}
        {/* ============================================================== */}
        {activeTab === "pipeline" && (
          <div className="space-y-5 max-w-7xl mx-auto">
            
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-white">Autonomous 4-Stage Attack Pipeline</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Automated progression from reconnaissance to verified proof generation.</p>
                </div>
                <button
                  onClick={handleTriggerScan}
                  disabled={isScanning}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white self-start sm:self-auto flex items-center gap-1.5"
                >
                  <Play className="size-3.5 fill-current" />
                  <span>Execute Pipeline</span>
                </button>
              </div>

              {/* 4 Stage Progression Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    num: 1,
                    title: "Stage 1: Recon & Spider",
                    desc: "Port enumeration and automated crawling of exposed API routes.",
                    tool: "Nmap & Spider",
                    active: activeStage >= 1
                  },
                  {
                    num: 2,
                    title: "Stage 2: Active Fuzzing",
                    desc: "OWASP Top 10 injection engine testing SQLi, SSRF, & auth parameters.",
                    tool: "Fuzz Matrix",
                    active: activeStage >= 2
                  },
                  {
                    num: 3,
                    title: "Stage 3: Proof Verification",
                    desc: "OAST out-of-band callback confirmation with zero false positives.",
                    tool: "OAST Engine",
                    active: activeStage >= 3
                  },
                  {
                    num: 4,
                    title: "Stage 4: SIEM Dispatch",
                    desc: "Automated SARIF ledger generation, virtual patch export & triage.",
                    tool: "SARIF Ledger",
                    active: activeStage >= 4
                  }
                ].map(stage => (
                  <div
                    key={stage.num}
                    className={`p-3.5 rounded-lg border transition-all ${
                      stage.active
                        ? "bg-slate-900 border-slate-700 shadow-sm"
                        : "bg-slate-950/40 border-slate-800/60 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-400">Stage {stage.num}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        stage.active
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-800 text-slate-500 border-slate-700"
                      }`}>
                        {stage.active ? "Complete" : "Pending"}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white mb-1">{stage.title}</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{stage.desc}</p>
                    <div className="text-[10px] font-mono text-slate-500 border-t border-slate-800/60 pt-2">
                      Tool: {stage.tool}
                    </div>
                  </div>
                ))}
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
          <div className="max-w-4xl mx-auto rounded-xl bg-slate-900/60 border border-slate-800 h-[560px] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <Bot className="size-4 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">AI Security Assistant</h3>
                  <p className="text-[11px] text-slate-400">Contextual exploit reproduction, blast radius & WAF patching</p>
                </div>
              </div>

              {/* Quick suggestion chips */}
              <div className="hidden sm:flex items-center gap-1.5">
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
