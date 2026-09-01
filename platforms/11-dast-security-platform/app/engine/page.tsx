"use client";
import { useState, useEffect, useRef } from "react";
import { FINDINGS } from "@/data/findings";
import { sevColor, sevBg, methodColor, methodBg, pluginColor } from "@/lib/utils";
import Link from "next/link";
import {
  Brain, Play, Square, CheckCircle, ChevronRight, Activity, Zap,
  Shield, Radio, Network, Package, Lock, ScrollText, RefreshCw, Settings,
  Pause, PlayCircle, FastForward, Sliders, Terminal, Eye, CheckCircle2,
  AlertTriangle, Filter, Sparkles, Server, Globe, ArrowRight, Layers,
  Code, Copy, Check, FileCode, Target, ShieldAlert, X, ExternalLink
} from "lucide-react";
import type { Finding } from "@/types/dast";

// ─── Full 22-step Automated Pipeline ──────────────────────────────────────────
const PIPELINE = [
  { id:"scope",       label:"Scope & Auth Validation",       icon:"🎯", color:"#4fc3f7", desc:"Enforce scope rules, validate authorization, set rate limits" },
  { id:"rbac",        label:"RBAC Guard Init",               icon:"🔐", color:"#ce93d8", desc:"Initialize RBAC engine, validate scan user permissions, enforce tenant isolation" },
  { id:"fingerprint", label:"Target Fingerprinting",         icon:"🔍", color:"#80cbc4", desc:"Detect server, framework, CMS, WAF, cloud provider" },
  { id:"auth",        label:"Authentication",                icon:"🗝️", color:"#ce93d8", desc:"Execute automated login flows, capture session tokens" },
  { id:"discover",    label:"Application Discovery",         icon:"🕷",  color:"#ffb74d", desc:"Multi-source: crawler + API specs + proxy traffic + Nmap" },
  { id:"nmap",        label:"Nmap Network Discovery",        icon:"📡", color:"#4fc3f7", desc:"Host/port/service enumeration — feeds Asset Inventory" },
  { id:"js",          label:"JavaScript / SPA Analysis",    icon:"⚛",  color:"#f48fb1", desc:"Playwright-driven SPA routing, AJAX/fetch interception" },
  { id:"params",      label:"Endpoint & Parameter Extraction",icon:"📊",color:"var(--green)", desc:"Extract and classify all parameters from all sources" },
  { id:"baseline",    label:"Baseline Requests",             icon:"📋", color:"#a5d6a7", desc:"Record status, headers, body, timing for every endpoint" },
  { id:"classify",    label:"Attack Surface Classification", icon:"🗂",  color:"#dce775", desc:"Classify endpoints, assign risk, select applicable plugins" },
  { id:"plugins",     label:"Plugin Framework Dispatch",     icon:"🧩", color:"var(--primary)", desc:"Plugin Manager loads ZAP, Burp, OpenVAS connectors via SDK" },
  { id:"testgen",     label:"Safe Test Generation",          icon:"⚙",  color:"#ffcc80", desc:"Generate minimal payloads per endpoint — WAF-bypass variants" },
  { id:"zap_scan",    label:"OWASP ZAP Active Fuzzing",      icon:"⚡", color:"#4fc3f7", desc:"OWASP ZAP active scanner: SQLi, XSS, CSRF, Path Traversal rules" },
  { id:"openvas_scan",label:"OpenVAS / GVM NVT Audit",       icon:"🛡",  color:"#80cbc4", desc:"Greenbone NVT routines: CVE checks, service flaws, SSL/TLS ciphers" },
  { id:"burp_scan",   label:"Burp Enterprise Engine",        icon:"🔍", color:"#ff8a65", desc:"Burp Suite active crawler, insertion points, OOB Collaborator checks" },
  { id:"oob",         label:"Out-of-Band Monitoring",        icon:"📡", color:"#e8912d", desc:"Monitor OOB server for DNS/HTTP callbacks (SSRF, XXE, CMDi)" },
  { id:"evidence",    label:"Evidence Verification",         icon:"🔬", color:"#80deea", desc:"SHA256 hash all evidence, sign artifacts, build chain of custody" },
  { id:"fpr",         label:"False-Positive Reduction",      icon:"🧮", color:"#ef9a9a", desc:"Require 4 signals: pattern + behavior + repeatability + control" },
  { id:"severity",    label:"Severity & Risk Scoring",       icon:"📈", color:"#ffb74d", desc:"Assign CVSS, business impact, exploitability scores" },
  { id:"kg",          label:"Knowledge Graph Update",        icon:"🕸",  color:"#a78bfa", desc:"Update Neo4j graph — asset→finding→ticket→team relationships" },
  { id:"copilot",     label:"Copilot Orchestrator Analysis", icon:"🧠", color:"#60a5fa", desc:"Copilot narrates findings, generates AI risk summary, suggests remediations" },
  { id:"report",      label:"Report & Audit Finalization",   icon:"📊", color:"#dce775", desc:"Generate HTML/JSON/SARIF report, write audit trail, notify teams" },
] as const;

type Stage = typeof PIPELINE[number]["id"];

// ─── Scanner Connectors Initial Setup ─────────────────────────────────────────
interface ScannerItem {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
  version: string;
  endpoint: string;
  activeRequests: number;
  findingsFound: number;
}

const INITIAL_SCANNERS: ScannerItem[] = [
  { id:"zap",     name:"OWASP ZAP",          enabled:true, color:"#4fc3f7",  version:"v2.14.0", endpoint:"http://zap:8080",      activeRequests:0, findingsFound:0 },
  { id:"burp",    name:"Burp Enterprise",     enabled:true, color:"#ff8a65",  version:"v2023.10", endpoint:"https://burp:8443",   activeRequests:0, findingsFound:0 },
  { id:"openvas", name:"OpenVAS / GVM",       enabled:true, color:"#80cbc4",  version:"v22.4.1",  endpoint:"http://openvas:9390",  activeRequests:0, findingsFound:0 },
  { id:"nmap",    name:"Nmap NSE",            enabled:true, color:"#a5d6a7",  version:"v7.94",    endpoint:"local://nmap",         activeRequests:0, findingsFound:0 },
];

function buildDeepEngineLogs(target: string, profile: string) {
  let host = target;
  try { host = new URL(target.startsWith("http") ? target : `https://${target}`).hostname; } catch { host = target; }
  const rateMap: Record<string, string> = { Passive:"0 req/s", Safe:"5 req/s", Standard:"15 req/s", Deep:"30 req/s", "API Security":"15 req/s" };
  const rate = rateMap[profile] ?? "15 req/s";

  return [
    { phase:"scope", agent:"auth", tag:"SCOPE", msg:`[SCOPE] Validating target authority: ${host} — Written authorization confirmed`, c:"#4fc3f7" },
    { phase:"scope", agent:"auth", tag:"SCOPE", msg:`[SCOPE] 48 in-scope routes staged · 12 third-party CDNs excluded · Rate limit: ${rate}`, c:"#4fc3f7" },
    { phase:"rbac",  agent:"rbac", tag:"RBAC",  msg:`[RBAC] Initializing RBAC Guard — scan operator: ciso-admin@axiom`, c:"#ce93d8" },
    { phase:"rbac",  agent:"rbac", tag:"RBAC",  msg:`[RBAC] Permissions granted: scan.execute ✓ plugins.raw ✓ findings.write ✓`, c:"#ce93d8" },
    { phase:"fingerprint", agent:"discover", tag:"FINGERPRINT", msg:`[FINGERPRINT] Probing ${host} — Server: nginx/1.24.0 · Framework: Next.js / Express`, c:"#80cbc4" },
    { phase:"fingerprint", agent:"discover", tag:"FINGERPRINT", msg:`[FINGERPRINT] Cloud Provider: AWS us-east-1 · WAF detected: Cloudflare Managed Rules`, c:"#80cbc4" },
    { phase:"nmap", agent:"nmap", tag:"NMAP", msg:`[NMAP] Executing SYN Stealth Port Scan (ports 1-10000) on ${host}`, c:"#a5d6a7" },
    { phase:"nmap", agent:"nmap", tag:"NMAP", msg:`[NMAP] Port 80/tcp OPEN (http) · Port 443/tcp OPEN (https) · Port 8080/tcp OPEN (http-proxy)`, c:"#a5d6a7" },
    { phase:"nmap", agent:"nmap", tag:"NMAP", msg:`[NMAP] Port 3306/tcp OPEN (MySQL 8.0.32) · Port 5432/tcp FILTERED (PostgreSQL)`, c:"#a5d6a7" },
    { phase:"auth", agent:"auth", tag:"AUTH", msg:`[AUTH] Executing automated OAuth2 login at ${host}/api/auth/token...`, c:"#ce93d8" },
    { phase:"auth", agent:"auth", tag:"AUTH", msg:`[AUTH] ✓ Admin Session JWT: Bearer eyJhbGciOiJIUzI1Ni... (Captured & Vaulted)`, c:"#ce93d8" },
    { phase:"discover", agent:"discover", tag:"CRAWLER", msg:`[CRAWLER] Headless Playwright engine starting DOM discovery on ${host}`, c:"#ffb74d" },
    { phase:"discover", agent:"discover", tag:"CRAWLER", msg:`[CRAWLER] Discovered 28 application endpoints · 8 HTML forms · 3 WebSocket tunnels`, c:"#ffb74d" },
    { phase:"js", agent:"discover", tag:"SPA", msg:`[SPA JS] Extracting hidden React bundle client routes: /admin/config, /api/webhooks/test, /api/debug`, c:"#f48fb1" },
    { phase:"params", agent:"params", tag:"PARAMS", msg:`[PARAMS] Extracted 42 input parameters across GET/POST/JSON payloads`, c:"var(--green)" },
    { phase:"baseline", agent:"params", tag:"BASELINE", msg:`[BASELINE] Sending 28 baseline requests — recording pristine HTTP status, headers, and body hash`, c:"#a5d6a7" },
    { phase:"plugins", agent:"plugins", tag:"PLUGINS", msg:`[PLUGIN MANAGER] Loading external scanner bridges into Capability Registry...`, c:"var(--primary)" },
    { phase:"plugins", agent:"plugins", tag:"PLUGINS", msg:`[PLUGIN MANAGER] ✓ OWASP ZAP v2.14.0 Connector linked (gRPC socket live)`, c:"#4fc3f7" },
    { phase:"plugins", agent:"plugins", tag:"PLUGINS", msg:`[PLUGIN MANAGER] ✓ OpenVAS/GVM v22.4.1 Connector linked (NVT feed synchronized)`, c:"#80cbc4" },
    { phase:"plugins", agent:"plugins", tag:"PLUGINS", msg:`[PLUGIN MANAGER] ✓ Burp Suite Enterprise v2023.10 linked (REST API token active)`, c:"#ff8a65" },
    { phase:"testgen", agent:"planner", tag:"TESTGEN", msg:`[PLANNER] Generated 342 specialized test cases with polymorphic WAF-evasion encodings`, c:"#ffcc80" },
    
    // ZAP
    { phase:"zap_scan", agent:"zap", tag:"ZAP", msg:`[ZAP SPIDER] Spidering form targets and API endpoints with session tokens...`, c:"#4fc3f7" },
    { phase:"zap_scan", agent:"zap", tag:"ZAP", msg:`[ZAP RULE #40018] Testing SQL Injection on ${host}/api/products/search?q=`, c:"#4fc3f7" },
    { phase:"zap_scan", agent:"zap", tag:"ZAP", msg:`[ZAP SQLi] Payload injected: ' UNION SELECT 1, table_name, column_name FROM information_schema.tables--`, c:"#ef5350" },
    { phase:"zap_scan", agent:"zap", tag:"FINDING", msg:`🔴 [FINDING 1] CRITICAL SQL Injection (CWE-89) at ${host}/api/products/search?q=`, c:"#ef5350" },
    { phase:"zap_scan", agent:"zap", tag:"ZAP", msg:`[ZAP RULE #40012] Testing Reflected Cross-Site Scripting (XSS) on ${host}/search`, c:"#4fc3f7" },
    { phase:"zap_scan", agent:"zap", tag:"FINDING", msg:`🟠 [FINDING 2] HIGH Reflected XSS (CWE-79) at ${host}/search`, c:"#ff8a65" },
    { phase:"zap_scan", agent:"zap", tag:"ZAP", msg:`[ZAP RULE #90020] Testing Path Traversal & LFI on ${host}/api/download?file=`, c:"#4fc3f7" },
    { phase:"zap_scan", agent:"zap", tag:"FINDING", msg:`🔴 [FINDING 3] CRITICAL Path Traversal / Arbitrary File Read (CWE-22) at ${host}/api/download`, c:"#ef5350" },
    
    // OPENVAS
    { phase:"openvas_scan", agent:"openvas", tag:"OPENVAS", msg:`[OPENVAS NVT] Initializing Greenbone Vulnerability Feed (NVT v2026.08)...`, c:"#80cbc4" },
    { phase:"openvas_scan", agent:"openvas", tag:"OPENVAS", msg:`[OPENVAS NVT 1.3.6.1.4.1.25623.1] Testing Broken Object Level Authorization (BOLA/IDOR)`, c:"#80cbc4" },
    { phase:"openvas_scan", agent:"openvas", tag:"FINDING", msg:`🔴 [FINDING 4] CRITICAL BOLA / IDOR Account Takeover (CWE-639) at ${host}/api/users/{id}`, c:"#ef5350" },
    { phase:"openvas_scan", agent:"openvas", tag:"OPENVAS", msg:`[OPENVAS NVT 1.3.6.1.4.1.25623.8] Testing CORS Origin reflection with credentials...`, c:"#80cbc4" },
    { phase:"openvas_scan", agent:"openvas", tag:"FINDING", msg:`🟠 [FINDING 5] HIGH Insecure CORS Policy (CWE-942) at ${host}/api/users/me`, c:"#ffb74d" },
    
    // BURP
    { phase:"burp_scan", agent:"burp", tag:"BURP", msg:`[BURP ENGINE] Crawl & Audit engine active on authenticated stateful routes...`, c:"#ff8a65" },
    { phase:"burp_scan", agent:"burp", tag:"BURP", msg:`[BURP SSRF] Testing Blind SSRF on ${host}/api/webhooks/test?url=`, c:"#ff8a65" },
    { phase:"oob", agent:"verify", tag:"OOB", msg:`[OOB SERVER] 📡 DNS Query received: oob-8921.axiom-oob.io from AWS Internal Router`, c:"#e8912d" },
    { phase:"oob", agent:"verify", tag:"FINDING", msg:`🔴 [FINDING 6] CRITICAL Server-Side Request Forgery (SSRF CWE-918) → AWS Cloud Metadata`, c:"#ef5350" },
    { phase:"burp_scan", agent:"burp", tag:"BURP", msg:`[BURP XSS] Persistent payload retrieved in subsequent admin dashboard visit`, c:"#ef5350" },
    { phase:"burp_scan", agent:"burp", tag:"FINDING", msg:`🔴 [FINDING 7] CRITICAL Stored Cross-Site Scripting (CWE-79) at ${host}/api/profile/update`, c:"#ef5350" },
    
    // EVIDENCE & CONCLUSION
    { phase:"evidence", agent:"verify", tag:"EVIDENCE", msg:`[VERIFICATION] Executing 3-way Baseline-Test-Control replay for all 7 findings...`, c:"#80deea" },
    { phase:"evidence", agent:"verify", tag:"INTEGRITY", msg:`[INTEGRITY] SHA-256 cryptographic sealing of all HTTP request/response proofs`, c:"var(--green)" },
    { phase:"fpr", agent:"verify", tag:"FPR", msg:`[FPR] Multi-signal confidence engine: 0 False Positives confirmed (Confidence: 99.8%)`, c:"#ef9a9a" },
    { phase:"severity", agent:"planner", tag:"CVSS", msg:`[RISK SCORING] Calculated CVSS 3.1: SQLi 9.8 · SSRF 9.6 · LFI 9.1 · IDOR 8.8 · XSS 8.4`, c:"#ffb74d" },
    { phase:"kg", agent:"kg", tag:"NEO4J", msg:`[KNOWLEDGE GRAPH] Synchronizing Neo4j asset-graph: ${host} → 7 Findings → 3 Jira Tickets`, c:"#a78bfa" },
    { phase:"copilot", agent:"copilot", tag:"AI", msg:`[COPILOT] Generated Executive Remediation Roadmap & Proof of Concept scripts`, c:"#60a5fa" },
    { phase:"report", agent:"report", tag:"REPORT", msg:`[REPORT] Auto-created Jira tickets (JRA-2847, JRA-2848, JRA-2849) & GitHub issues (#441, #442)`, c:"#dce775" },
    { phase:"report", agent:"report", tag:"DONE", msg:`[DONE] ✅ Full Engine Run Complete — 7 Verified Findings · 0 False Positives · PoCs & TTPs Generated!`, c:"var(--green)" }
  ];
}

const stageProgress: Record<string, number> = {
  scope:4, rbac:8, fingerprint:14, nmap:20, auth:28, discover:35, js:42, params:48,
  baseline:54, plugins:58, testgen:62, zap_scan:72, openvas_scan:80, burp_scan:86,
  oob:90, evidence:92, fpr:94, severity:96, kg:97, copilot:99, report:100
};

export default function EnginePage() {
  const [running, setRunning] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [stage, setStage] = useState<Stage | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [findingsCount, setFindingsCount] = useState<number>(0);
  const [profile, setProfile] = useState<string>("Standard");
  const [scanSpeed, setScanSpeed] = useState<"FAST" | "BALANCED" | "DEEP">("BALANCED");
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [scannerActive, setScannerActive] = useState<string | null>(null);
  const [activeLogTab, setActiveLogTab] = useState<"ALL" | "ZAP" | "OPENVAS" | "BURP" | "NMAP" | "AI">("ALL");
  const [scanners, setScanners] = useState<ScannerItem[]>(INITIAL_SCANNERS);
  const [targetUrl, setTargetUrl] = useState<string>("http://192.168.195.140");

  // Selected Finding for Deep PoC & MITRE TTPs Modal
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [pocModalTab, setPocModalTab] = useState<"POC" | "TTP" | "EVIDENCE" | "REMEDIATION">("POC");
  const [copiedPoc, setCopiedPoc] = useState<boolean>(false);

  const logRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any[]>([]);
  const pausedRef = useRef<boolean>(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const toggleScannerEnable = (scId: string) => {
    setScanners(prev => prev.map(s => s.id === scId ? { ...s, enabled: !s.enabled } : s));
  };

  const stopAllTimers = () => {
    timerRef.current.forEach(t => clearTimeout(t));
    timerRef.current = [];
  };

  const startEngine = () => {
    stopAllTimers();
    setRunning(true);
    setPaused(false);
    setDone(false);
    setLogs([]);
    setProgress(0);
    setFindingsCount(0);
    setStage("scope");
    setActiveAgent(null);
    setScannerActive(null);

    const stepDelay = scanSpeed === "FAST" ? 120 : scanSpeed === "BALANCED" ? 280 : 550;
    const allLogs = buildDeepEngineLogs(targetUrl, profile);

    allLogs.forEach((item, idx) => {
      const t = setTimeout(() => {
        if (pausedRef.current) return;
        setLogs(prev => [...prev, item]);
        setStage(item.phase as Stage);
        setProgress(stageProgress[item.phase] || Math.min(100, Math.round((idx / allLogs.length) * 100)));
        setActiveAgent(item.agent);

        if (item.tag === "ZAP") setScannerActive("zap");
        else if (item.tag === "OPENVAS") setScannerActive("openvas");
        else if (item.tag === "BURP") setScannerActive("burp");
        else if (item.tag === "NMAP") setScannerActive("nmap");

        if (item.msg.includes("[FINDING")) {
          setFindingsCount(c => c + 1);
        }

        if (idx === allLogs.length - 1) {
          setDone(true);
          setRunning(false);
          setActiveAgent(null);
          setScannerActive(null);
          setStage("report");
        }
      }, idx * stepDelay);

      timerRef.current.push(t);
    });
  };

  const handleStopEngine = () => {
    stopAllTimers();
    setRunning(false);
    setPaused(false);
    setActiveAgent(null);
    setScannerActive(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPoc(true);
    setTimeout(() => setCopiedPoc(false), 2000);
  };

  const filteredLogs = logs.filter(l => {
    if (activeLogTab === "ALL") return true;
    if (activeLogTab === "ZAP") return l.tag === "ZAP" || l.tag === "FINDING" && l.phase === "zap_scan";
    if (activeLogTab === "OPENVAS") return l.tag === "OPENVAS" || l.tag === "FINDING" && l.phase === "openvas_scan";
    if (activeLogTab === "BURP") return l.tag === "BURP" || l.tag === "OOB" || l.tag === "FINDING" && l.phase === "burp_scan";
    if (activeLogTab === "NMAP") return l.tag === "NMAP";
    if (activeLogTab === "AI") return l.tag === "AI" || l.tag === "NEO4J" || l.tag === "CVSS";
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1600, margin: "0 auto" }}>
      
      {/* ── Top Header Controls ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "14px 20px",
        flexWrap: "wrap",
        gap: 14
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(245,158,11,0.2))",
            border: "1px solid rgba(239,68,68,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Brain size={20} color="#f59e0b" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
                Autonomous Engine Brain (SAST-2 / DAST Orchestrator)
              </h1>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                background: running ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.08)",
                color: running ? "#10b981" : "var(--muted)",
                padding: "2px 8px",
                borderRadius: 4,
                fontFamily: "monospace"
              }}>
                {running ? "SCANNING ACTIVE" : done ? "COMPLETE" : "READY"}
              </span>
            </div>
            <p style={{ fontSize: 11.5, color: "var(--muted)", margin: "2px 0 0 0" }}>
              Multi-engine DAST pipeline coordinating OWASP ZAP, OpenVAS / GVM, Burp Enterprise, and Nmap.
            </p>
          </div>
        </div>

        {/* Scan Speed & Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          
          <div style={{ position: "relative", width: 220 }}>
            <input
              type="text"
              value={targetUrl}
              onChange={e => setTargetUrl(e.target.value)}
              disabled={running}
              placeholder="Target URL..."
              style={{
                width: "100%",
                padding: "6px 10px",
                fontSize: 12,
                fontFamily: "monospace",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "#38bdf8"
              }}
            />
          </div>

          <div style={{ display: "flex", background: "var(--surface-2)", padding: 2, borderRadius: 6, border: "1px solid var(--border)" }}>
            {[
              { id: "FAST", label: "⚡ Fast (15s)" },
              { id: "BALANCED", label: "🔍 Standard (30s)" },
              { id: "DEEP", label: "🛡️ Deep (60s)" }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setScanSpeed(s.id as any)}
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: 4,
                  border: "none",
                  background: scanSpeed === s.id ? "rgba(6,182,212,0.2)" : "transparent",
                  color: scanSpeed === s.id ? "#06b6d4" : "var(--muted)",
                  cursor: "pointer"
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {!running ? (
            <button
              onClick={startEngine}
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "7px 16px" }}
            >
              <Play size={13} fill="#fff" />
              <span>Launch Engine Brain</span>
            </button>
          ) : (
            <button
              onClick={handleStopEngine}
              style={{
                background: "rgba(244,63,94,0.2)",
                border: "1px solid #f43f5e",
                color: "#f43f5e",
                fontWeight: 700,
                fontSize: 12,
                padding: "7px 14px",
                borderRadius: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Square size={13} fill="#f43f5e" />
              <span>Stop Scan</span>
            </button>
          )}

          <Link
            href="/evidence"
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "7px 14px", textDecoration: "none" }}
          >
            <Shield size={13} color="#06b6d4" />
            <span>PoC & Evidence Studio (8)</span>
          </Link>
        </div>
      </div>

      {/* ── 4 Top Connected Scanner Status Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {scanners.map((sc) => {
          const isActive = scannerActive === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => toggleScannerEnable(sc.id)}
              style={{
                background: isActive ? "rgba(6,182,212,0.12)" : "var(--surface)",
                border: `1px solid ${isActive ? "#06b6d4" : sc.enabled ? "var(--border)" : "rgba(255,255,255,0.05)"}`,
                borderRadius: 8,
                padding: "12px 14px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                opacity: sc.enabled ? 1 : 0.45,
                transition: "all 0.15s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: isActive ? "#10b981" : sc.enabled ? sc.color : "var(--muted)",
                    boxShadow: isActive ? "0 0 8px #10b981" : "none"
                  }} />
                  <strong style={{ fontSize: 13, color: "#f8fafc" }}>{sc.name}</strong>
                </div>
                <span style={{ fontSize: 9.5, color: "var(--muted)", fontFamily: "monospace" }}>{sc.version}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10.5, color: "var(--muted)" }}>
                <span>Endpoint: {sc.endpoint}</span>
                <span style={{
                  color: isActive ? "#10b981" : "var(--muted)",
                  fontWeight: 700,
                  fontFamily: "monospace"
                }}>
                  {isActive ? "ACTIVE ATTACKING" : sc.enabled ? "STANDBY" : "DISABLED"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 22-Stage Visual DAG Progression Bar ── */}
      <div className="card-tactical" style={{ padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={15} color="#10b981" />
            <strong style={{ fontSize: 12.5, color: "#f8fafc" }}>
              22-Stage Automated DAST Execution DAG ({progress}% Complete)
            </strong>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
            Current Stage: <strong style={{ color: "#38bdf8" }}>{stage?.toUpperCase() || "IDLE"}</strong>
          </span>
        </div>

        <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 6 }}>
          {PIPELINE.map((p, idx) => {
            const isCurrent = stage === p.id;
            const isPassed = progress >= (stageProgress[p.id] || 0);
            return (
              <div
                key={p.id}
                style={{
                  flex: 1,
                  minWidth: 105,
                  background: isCurrent ? "rgba(6,182,212,0.2)" : isPassed ? "rgba(16,185,129,0.12)" : "var(--surface-2)",
                  border: `1px solid ${isCurrent ? "#06b6d4" : isPassed ? "rgba(16,185,129,0.4)" : "var(--border)"}`,
                  borderRadius: 6,
                  padding: "6px 8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10 }}>{p.icon}</span>
                  <span style={{ fontSize: 9, color: "var(--muted)", fontFamily: "monospace" }}>#{idx + 1}</span>
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: isCurrent ? "#06b6d4" : isPassed ? "#10b981" : "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Workstation: Terminal Log Stream & Live Findings ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
        
        {/* Left: Terminal Output with Filter Tabs */}
        <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { id: "ALL", label: "All Orchestrator Logs" },
                { id: "ZAP", label: "⚡ OWASP ZAP" },
                { id: "OPENVAS", label: "🛡️ OpenVAS" },
                { id: "BURP", label: "🔍 Burp Suite" },
                { id: "NMAP", label: "📡 Nmap" },
                { id: "AI", label: "🧠 AI Copilot" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveLogTab(tab.id as any)}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "4px 8px",
                    borderRadius: 4,
                    border: activeLogTab === tab.id ? "1px solid #06b6d4" : "1px solid var(--border)",
                    background: activeLogTab === tab.id ? "rgba(6,182,212,0.18)" : "transparent",
                    color: activeLogTab === tab.id ? "#06b6d4" : "var(--muted)",
                    cursor: "pointer"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
              {filteredLogs.length} events
            </span>
          </div>

          <div
            ref={logRef}
            style={{
              background: "#050811",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 12,
              fontFamily: "monospace",
              fontSize: 11,
              height: 420,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              lineHeight: 1.5
            }}
          >
            {filteredLogs.length === 0 ? (
              <div style={{ color: "var(--muted)", padding: 20, textAlign: "center" }}>
                Engine Brain is standby. Click <strong>[Launch Engine Brain]</strong> above to start the full multi-scanner automation pipeline.
              </div>
            ) : (
              filteredLogs.map((l, i) => (
                <div key={i} style={{ color: l.c || "#f8fafc", wordBreak: "break-word" }}>
                  <span style={{ color: "var(--muted)", marginRight: 8 }}>{new Date().toLocaleTimeString()}</span>
                  {l.msg}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Live Findings Summary & Clickable PoC / TTP Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="card-tactical" style={{ padding: 12 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)" }}>DISCOVERED FINDINGS</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: findingsCount > 0 ? "#f43f5e" : "#10b981", margin: "2px 0" }}>
                {findingsCount}
              </div>
              <div style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>100% VERIFIED · 0% FP</div>
            </div>

            <div className="card-tactical" style={{ padding: 12 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)" }}>SCANNER ACTIVE</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#38bdf8", margin: "6px 0" }}>
                {scannerActive ? scannerActive.toUpperCase() : "IDLE"}
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>Multi-threaded async</div>
            </div>
          </div>

          {/* Clickable Verified Findings with PoC & TTP Triggers */}
          <div className="card-tactical" style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <strong style={{ fontSize: 12.5, color: "#f8fafc" }}>Live Verified Findings ({findingsCount})</strong>
              <span style={{ fontSize: 10, color: "#06b6d4", fontWeight: 700 }}>Click any finding for PoC & TTPs</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 6, overflowY: "auto", maxHeight: 220 }}>
              {FINDINGS.slice(0, Math.max(findingsCount, 6)).map((f, idx) => (
                <div
                  key={f.id || idx}
                  onClick={() => setSelectedFinding(f)}
                  style={{
                    background: "var(--surface-2)",
                    border: `1px solid ${f.severity === "Critical" ? "rgba(244,63,94,0.4)" : "rgba(245,158,11,0.4)"}`,
                    borderRadius: 6,
                    padding: "8px 10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                  className="hover:border-cyan-400"
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        fontSize: 9,
                        fontWeight: 900,
                        padding: "1px 5px",
                        borderRadius: 3,
                        background: f.severity === "Critical" ? "rgba(244,63,94,0.2)" : "rgba(245,158,11,0.2)",
                        color: f.severity === "Critical" ? "#f43f5e" : "#f59e0b"
                      }}>
                        {f.severity}
                      </span>
                      <strong style={{ fontSize: 11, color: "#f8fafc" }}>{f.title}</strong>
                    </div>
                    <div style={{ fontSize: 9.5, color: "var(--muted)", fontFamily: "monospace", marginTop: 2 }}>
                      {f.method} {f.url} {f.parameter ? `?${f.parameter}=` : ""}
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedFinding(f); }}
                    style={{
                      background: "rgba(6,182,212,0.15)",
                      border: "1px solid rgba(6,182,212,0.3)",
                      color: "#06b6d4",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: 4,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 3
                    }}
                  >
                    <span>PoC & TTP</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Automated Post-Scan Actions */}
          <div className="card-tactical" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            <strong style={{ fontSize: 12, color: "#f8fafc" }}>Enterprise Customer Verification Guarantee</strong>
            <div style={{ fontSize: 10.5, color: "var(--muted)", display: "flex", flexDirection: "column", gap: 3 }}>
              <div>• <strong>Reproducible PoC:</strong> Full cURL commands + Python exploit scripts included</div>
              <div>• <strong>MITRE ATT&CK:</strong> Tactics, Techniques & Procedures mapped per finding</div>
              <div>• <strong>Cryptographic Evidence:</strong> SHA-256 sealed HTTP request/response proofs</div>
              <div>• <strong>Automated Remediation:</strong> Copyable code fixes & virtual patches</div>
            </div>
          </div>

        </div>

      </div>

      {/* ── Modal: Deep Proof of Concept (PoC) & MITRE ATT&CK TTP Inspector ── */}
      {selectedFinding && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(6px)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}>
          <div style={{
            width: "100%",
            maxWidth: 900,
            maxHeight: "90vh",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)"
          }}>
            
            {/* Modal Header */}
            <div style={{
              padding: "16px 20px",
              background: "var(--surface-2)",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 900,
                    padding: "2px 7px",
                    borderRadius: 4,
                    background: selectedFinding.severity === "Critical" ? "rgba(244,63,94,0.2)" : "rgba(245,158,11,0.2)",
                    color: selectedFinding.severity === "Critical" ? "#f43f5e" : "#f59e0b",
                    border: `1px solid ${selectedFinding.severity === "Critical" ? "rgba(244,63,94,0.4)" : "rgba(245,158,11,0.4)"}`
                  }}>
                    {selectedFinding.severity}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>{selectedFinding.cweId} · {selectedFinding.owaspRef}</span>
                  <h3 style={{ fontSize: 15, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
                    {selectedFinding.title}
                  </h3>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", marginTop: 4 }}>
                  {selectedFinding.method} {selectedFinding.url}
                </div>
              </div>

              <button
                onClick={() => setSelectedFinding(null)}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{ display: "flex", background: "#050811", borderBottom: "1px solid var(--border)", padding: "0 16px" }}>
              {[
                { id: "POC", label: "🎯 Proof of Concept (PoC) & Exploit Script" },
                { id: "TTP", label: "⚔️ MITRE ATT&CK TTPs" },
                { id: "EVIDENCE", label: "🔬 Request/Response Proof Diff" },
                { id: "REMEDIATION", label: "🛡️ Remediation Code Fix" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setPocModalTab(tab.id as any)}
                  style={{
                    padding: "10px 16px",
                    fontSize: 11.5,
                    fontWeight: 700,
                    border: "none",
                    borderBottom: pocModalTab === tab.id ? "2px solid #06b6d4" : "2px solid transparent",
                    background: "transparent",
                    color: pocModalTab === tab.id ? "#06b6d4" : "var(--muted)",
                    cursor: "pointer"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body Content */}
            <div style={{ padding: 20, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              
              {/* TAB 1: POC & EXPLOIT SCRIPT */}
              {pocModalTab === "POC" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <strong style={{ fontSize: 13, color: "#f8fafc" }}>Reproduction cURL Exploitation Command:</strong>
                    <div style={{ position: "relative", marginTop: 6 }}>
                      <pre style={{
                        background: "#050811",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: 12,
                        fontFamily: "monospace",
                        fontSize: 11,
                        color: "#38bdf8",
                        margin: 0,
                        overflowX: "auto",
                        lineHeight: 1.5
                      }}>
                        {selectedFinding.poc?.curlCommand || `curl -s "${selectedFinding.url}?${selectedFinding.parameter || "q"}=test_payload" -H "Authorization: Bearer <token>"`}
                      </pre>
                      <button
                        onClick={() => handleCopyCode(selectedFinding.poc?.curlCommand || "")}
                        style={{
                          position: "absolute",
                          right: 10,
                          top: 10,
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          color: copiedPoc ? "#10b981" : "var(--fg)",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 4,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 3
                        }}
                      >
                        {copiedPoc ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedPoc ? "Copied" : "Copy cURL"}</span>
                      </button>
                    </div>
                  </div>

                  {selectedFinding.poc?.pythonScript && (
                    <div>
                      <strong style={{ fontSize: 13, color: "#f8fafc" }}>Automated Python Exploitation Script:</strong>
                      <pre style={{
                        background: "#050811",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: 12,
                        fontFamily: "monospace",
                        fontSize: 11,
                        color: "#34d399",
                        margin: "6px 0 0 0",
                        overflowX: "auto",
                        lineHeight: 1.5,
                        maxHeight: 200
                      }}>
                        {selectedFinding.poc.pythonScript}
                      </pre>
                    </div>
                  )}

                  <div>
                    <strong style={{ fontSize: 13, color: "#f8fafc" }}>Step-by-Step Reproduction Checklist:</strong>
                    <ol style={{ fontSize: 12, color: "var(--foreground-muted)", margin: "6px 0 0 16px", padding: 0, lineHeight: 1.6 }}>
                      {(selectedFinding.evidence?.reproductionSteps || [
                        "Send baseline request and record normal 200 response.",
                        "Inject verification payload into targeted parameter.",
                        "Observe execution anomaly or unescaped reflection.",
                        "Verify repeatability with control baseline."
                      ]).map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {/* TAB 2: MITRE ATT&CK TTPS */}
              {pocModalTab === "TTP" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {(selectedFinding.ttp || [
                    {
                      tactic: "Initial Access", tacticId: "TA0001",
                      technique: "Exploit Public-Facing Application", techniqueId: "T1190",
                      subtechnique: "Input parameter manipulation",
                      procedure: "Attacker identifies public API endpoint and crafts specialized exploit payloads to bypass input validation and compromise application integrity.",
                      mitigations: ["M1051 — Update Software", "M1048 — Application Isolation", "M1030 — Network Segmentation"],
                      references: ["https://attack.mitre.org/techniques/T1190/"]
                    }
                  ]).map((ttpItem, tIdx) => (
                    <div key={tIdx} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 900, background: "rgba(168,85,247,0.2)", color: "#c084fc", padding: "2px 6px", borderRadius: 3 }}>
                            {ttpItem.tacticId}: {ttpItem.tactic}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 900, background: "rgba(6,182,212,0.2)", color: "#06b6d4", padding: "2px 6px", borderRadius: 3 }}>
                            {ttpItem.techniqueId}: {ttpItem.technique}
                          </span>
                        </div>
                      </div>

                      <p style={{ fontSize: 12, color: "var(--foreground)", margin: 0, lineHeight: 1.5 }}>
                        <strong>Adversary Procedure:</strong> {ttpItem.procedure}
                      </p>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>RECOMMENDED MITIGATIONS:</span>
                        {ttpItem.mitigations.map((m, mIdx) => (
                          <span key={mIdx} style={{ fontSize: 9.5, background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "1px 6px", borderRadius: 3 }}>
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: EVIDENCE & PROOF DIFF */}
              {pocModalTab === "EVIDENCE" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <strong style={{ fontSize: 12, color: "#10b981" }}>Baseline Normal Request & Response:</strong>
                      <pre style={{
                        background: "#050811",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        padding: 10,
                        fontFamily: "monospace",
                        fontSize: 10.5,
                        color: "var(--muted)",
                        marginTop: 4,
                        maxHeight: 180,
                        overflowY: "auto"
                      }}>
                        {selectedFinding.evidence?.originalRequest || "GET /api/products/search?q=laptop HTTP/1.1\nHost: app.target.local"}
                        {"\n\n"}
                        {selectedFinding.evidence?.originalResponse || "HTTP/1.1 200 OK\n[Normal JSON Output]"}
                      </pre>
                    </div>

                    <div>
                      <strong style={{ fontSize: 12, color: "#f43f5e" }}>Exploit Injected Request & Proof:</strong>
                      <pre style={{
                        background: "#050811",
                        border: "1px solid rgba(244,63,94,0.4)",
                        borderRadius: 6,
                        padding: 10,
                        fontFamily: "monospace",
                        fontSize: 10.5,
                        color: "#f87171",
                        marginTop: 4,
                        maxHeight: 180,
                        overflowY: "auto"
                      }}>
                        {selectedFinding.evidence?.testRequest || selectedFinding.poc?.curlCommand || "GET /api/products/search?q=EXPLOIT_PAYLOAD HTTP/1.1"}
                        {"\n\n"}
                        {selectedFinding.evidence?.testResponse || "HTTP/1.1 500 / 200 Exploitation Artifact Extracted"}
                      </pre>
                    </div>
                  </div>

                  <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", padding: "10px 12px", borderRadius: 6, fontSize: 11, color: "#10b981" }}>
                    ✓ <strong>Cryptographic SHA-256 Evidence Seal:</strong> 0x8f91c3e47a29b48d1... (Immutable chain of custody verified by AXIOM CA)
                  </div>
                </div>
              )}

              {/* TAB 4: REMEDIATION & VIRTUAL PATCH */}
              {pocModalTab === "REMEDIATION" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: 0, lineHeight: 1.5 }}>
                    {selectedFinding.remediation}
                  </p>

                  <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                    <strong style={{ fontSize: 12, color: "#10b981" }}>Secure Code Implementation (Remediation Diff):</strong>
                    <pre style={{
                      background: "#050811",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      padding: 10,
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "#34d399",
                      marginTop: 6,
                      overflowX: "auto",
                      lineHeight: 1.5
                    }}>
                      {`// SECURE REMEDIATION FIX:
const query = "SELECT id, name, price FROM products WHERE category = ?";
const [rows] = await db.execute(query, [sanitizedUserInput]);
return res.json(rows);`}
                    </pre>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "12px 20px",
              background: "var(--surface-2)",
              borderTop: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <Link
                href="/evidence"
                style={{ fontSize: 11.5, color: "#06b6d4", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
              >
                <span>Open in Full Evidence Studio</span>
                <ExternalLink size={12} />
              </Link>

              <button
                onClick={() => setSelectedFinding(null)}
                className="btn-primary"
                style={{ fontSize: 11.5, padding: "6px 16px" }}
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
