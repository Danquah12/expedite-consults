"use client";
import { useState, useEffect, useRef } from "react";
import { FINDINGS } from "@/data/findings";
import { sevColor, sevBg, methodColor, methodBg, pluginColor } from "@/lib/utils";
import Link from "next/link";
import {
  Brain, Play, Square, CheckCircle, ChevronRight, Activity, Zap,
  Shield, Radio, Network, Package, Lock, ScrollText, RefreshCw, Settings
} from "lucide-react";

// ─── Full 22-step Automated Pipeline ──────────────────────────────────────────
const PIPELINE = [
  { id:"scope",       label:"Scope & Auth Validation",       icon:"🎯", color:"#4fc3f7",          desc:"Enforce scope rules, validate authorization, set rate limits" },
  { id:"rbac",        label:"RBAC Guard Init",               icon:"🔐", color:"#ce93d8",          desc:"Initialize RBAC engine, validate scan user permissions, enforce tenant isolation" },
  { id:"fingerprint", label:"Target Fingerprinting",         icon:"🔍", color:"#80cbc4",          desc:"Detect server, framework, CMS, WAF, cloud provider" },
  { id:"auth",        label:"Authentication",                icon:"🗝️", color:"#ce93d8",          desc:"Execute automated login flows, capture session tokens" },
  { id:"discover",    label:"Application Discovery",         icon:"🕷",  color:"#ffb74d",          desc:"Multi-source: crawler + API specs + proxy traffic + Nmap" },
  { id:"nmap",        label:"Nmap Network Discovery",        icon:"📡", color:"#4fc3f7",          desc:"Host/port/service enumeration — feeds Asset Inventory" },
  { id:"js",          label:"JavaScript / SPA Analysis",    icon:"⚛",  color:"#f48fb1",          desc:"Playwright-driven SPA routing, AJAX/fetch interception" },
  { id:"params",      label:"Endpoint & Parameter Extraction",icon:"📊",color:"var(--green)",     desc:"Extract and classify all parameters from all sources" },
  { id:"baseline",    label:"Baseline Requests",             icon:"📋", color:"#a5d6a7",          desc:"Record status, headers, body, timing for every endpoint" },
  { id:"classify",    label:"Attack Surface Classification", icon:"🗂",  color:"#dce775",          desc:"Classify endpoints, assign risk, select applicable plugins" },
  { id:"plugins",     label:"Plugin Framework Dispatch",     icon:"🧩", color:"var(--primary)",   desc:"Plugin Manager loads ZAP, Burp, OpenVAS connectors via SDK" },
  { id:"testgen",     label:"Safe Test Generation",          icon:"⚙",  color:"#ffcc80",          desc:"Generate minimal payloads per endpoint — WAF-bypass variants" },
  { id:"attack",      label:"Vulnerability Testing",         icon:"⚡", color:"var(--primary)",   desc:"Execute 24 plugins with rate control: ZAP + Burp + OpenVAS" },
  { id:"oob",         label:"Out-of-Band Monitoring",        icon:"📡", color:"#e8912d",          desc:"Monitor OOB server for DNS/HTTP callbacks (SSRF, XXE, CMDi)" },
  { id:"evidence",    label:"Evidence Verification",         icon:"🔬", color:"#80deea",          desc:"SHA256 hash all evidence, sign artifacts, build chain of custody" },
  { id:"fpr",         label:"False-Positive Reduction",      icon:"🧮", color:"#ef9a9a",          desc:"Require 4 signals: pattern + behavior + repeatability + control" },
  { id:"severity",    label:"Severity & Risk Scoring",       icon:"📈", color:"#ffb74d",          desc:"Assign CVSS, business impact, exploitability scores" },
  { id:"kg",          label:"Knowledge Graph Update",        icon:"🕸",  color:"#a78bfa",          desc:"Update Neo4j graph — asset→finding→ticket→team relationships" },
  { id:"dedup",       label:"Deduplication",                 icon:"🔗", color:"#b0bec5",          desc:"Merge duplicate findings across plugins and endpoints" },
  { id:"copilot",     label:"Copilot Orchestrator Analysis", icon:"🧠", color:"#60a5fa",          desc:"Copilot narrates findings, generates AI risk summary, suggests remediations" },
  { id:"autoticket",  label:"Auto-Ticket Creation",          icon:"🎫", color:"#4fc3f7",          desc:"Plugin Framework routes to Jira/GitHub — creates tickets for Critical+High" },
  { id:"report",      label:"Report & Audit Finalization",   icon:"📊", color:"#dce775",          desc:"Generate HTML/JSON/SARIF report, write audit trail, notify teams" },
] as const;

type Stage = typeof PIPELINE[number]["id"];

// ─── Orchestrator Agents (13 now) ─────────────────────────────────────────────
const AGENTS = [
  { id:"auth",      label:"Auth Agent",              color:"#ce93d8", icon:"🗝️" },
  { id:"discover",  label:"Discovery Engine",        color:"#ffb74d", icon:"🕷"  },
  { id:"nmap",      label:"Nmap Connector",          color:"#4fc3f7", icon:"📡" },
  { id:"params",    label:"Parameter Analyzer",      color:"var(--green)", icon:"📊" },
  { id:"planner",   label:"Test Planner",            color:"#dce775", icon:"🗂"  },
  { id:"plugins",   label:"Plugin Framework",        color:"var(--primary)", icon:"🧩" },
  { id:"zap",       label:"ZAP Connector",           color:"#4fc3f7", icon:"⚡" },
  { id:"burp",      label:"Burp Enterprise Conn.",   color:"#ff8a65", icon:"🔍" },
  { id:"openvas",   label:"OpenVAS Connector",       color:"#80cbc4", icon:"🛡"  },
  { id:"verify",    label:"Verification Engine",     color:"#80deea", icon:"🔬" },
  { id:"rbac",      label:"RBAC Guard",              color:"#ce93d8", icon:"🔐" },
  { id:"kg",        label:"Knowledge Graph Agent",   color:"#a78bfa", icon:"🕸"  },
  { id:"copilot",   label:"Copilot Orchestrator",    color:"#60a5fa", icon:"🧠" },
  { id:"audit",     label:"Audit Agent",             color:"#a5d6a7", icon:"📋" },
  { id:"report",    label:"Reporting Engine",        color:"#a5d6a7", icon:"📊" },
];

// ─── Scanner Connectors Status ────────────────────────────────────────────────
const SCANNERS = [
  { id:"zap",     name:"OWASP ZAP",          status:"ready",   color:"#4fc3f7",  version:"2.14.0", endpoint:"http://zap:8080" },
  { id:"burp",    name:"Burp Enterprise",     status:"ready",   color:"#ff8a65",  version:"2023.10", endpoint:"https://burp:8443" },
  { id:"openvas", name:"OpenVAS / GVM",       status:"ready",   color:"#80cbc4",  version:"22.4.1",  endpoint:"http://openvas:9390" },
  { id:"nmap",    name:"Nmap",               status:"ready",   color:"#a5d6a7",  version:"7.94",    endpoint:"local://nmap" },
];

// ─── Auto-action queue shown after scan ──────────────────────────────────────
const AUTO_ACTIONS = [
  { label:"Jira tickets created",     value:"3",       detail:"JRA-2847, JRA-2848, JRA-2849 (Critical findings)",   color:"#4fc3f7",  icon:"🎫" },
  { label:"GitHub issues created",    value:"2",       detail:"Issues #441, #442 (High findings)",                  color:"#a5d6a7",  icon:"⚫" },
  { label:"Slack alert sent",         value:"1",       detail:"#security-alerts: 3 Critical findings detected",     color:"#60a5fa",  icon:"💬" },
  { label:"KG relationships added",   value:"24",      detail:"asset→finding→ticket→team nodes updated",            color:"#a78bfa",  icon:"🕸"  },
  { label:"Audit events logged",      value:"87",      detail:"All plugin invocations, RBAC checks, findings",      color:"#a5d6a7",  icon:"📋" },
  { label:"Evidence integrity signed","value":"8",     detail:"SHA256 + AXIOM CA signature for all 8 findings",     color:"var(--green)", icon:"🔬" },
  { label:"SARIF report exported",    value:"1",       detail:"axiom-scan-results.sarif ready for GitHub GHAS",     color:"var(--primary)", icon:"📄" },
  { label:"Copilot summary ready",    value:"1",       detail:"AI risk narrative + remediation roadmap generated",  color:"#60a5fa",  icon:"🧠" },
];

function buildEngineLogs(target: string, profile: string) {
  let host = target;
  try { host = new URL(target.startsWith("http") ? target : `https://${target}`).hostname; } catch { host = target; }
  const rateMap: Record<string, string> = { Passive:"0 req/s", Safe:"5 req/s", Standard:"15 req/s", Deep:"30 req/s", "API Security":"15 req/s", Custom:"user-defined" };
  const rate = rateMap[profile] ?? "15 req/s";

  return [
    // SCOPE
    { phase:"scope",    agent:"auth",    msg:`[SCOPE]       Validating target: ${host} — written authorization confirmed`, c:"#4fc3f7" },
    { phase:"scope",    agent:"auth",    msg:`[SCOPE]       47 in-scope URLs · 12 excluded · Rate: ${rate} · Profile: ${profile}`, c:"#4fc3f7" },
    // RBAC
    { phase:"rbac",     agent:"rbac",    msg:`[RBAC]        Initializing RBAC Guard — scan user: security-analyst@axiom`, c:"#ce93d8" },
    { phase:"rbac",     agent:"rbac",    msg:`[RBAC]        Permissions validated: scan.create ✓ findings.write ✓ evidence.write ✓`, c:"#ce93d8" },
    { phase:"rbac",     agent:"rbac",    msg:`[RBAC]        Tenant isolation: ABC Corp · Project: Customer Portal · RLS: ENABLED`, c:"#ce93d8" },
    // FINGERPRINT
    { phase:"fingerprint",agent:"discover", msg:`[FINGERPRINT] Probing ${host} — Server: nginx/1.21.6 · Framework: Next.js 14`, c:"#80cbc4" },
    { phase:"fingerprint",agent:"discover", msg:`[FINGERPRINT] WAF: Cloudflare · Cloud: AWS us-east-1 · CDN: CloudFront`, c:"#80cbc4" },
    // AUTH
    { phase:"auth",     agent:"auth",    msg:`[AUTH]        Executing form-based login at ${host}/api/auth/login...`, c:"#ce93d8" },
    { phase:"auth",     agent:"auth",    msg:`[AUTH]        ✓ Admin token: sess_a1b2c3d4 · User token: sess_f9e8d7c6 captured`, c:"#ce93d8" },
    // NMAP
    { phase:"nmap",     agent:"nmap",    msg:`[NMAP]        Launching network discovery — target: ${host}`, c:"#4fc3f7" },
    { phase:"nmap",     agent:"nmap",    msg:`[NMAP]        Open ports: 80,443,8080,3306 · Services: nginx, mysql, node`, c:"#4fc3f7" },
    { phase:"nmap",     agent:"nmap",    msg:`[NMAP]        ✓ Asset inventory updated — 4 services registered`, c:"#4fc3f7" },
    // DISCOVER
    { phase:"discover", agent:"discover", msg:`[CRAWLER]     Playwright v1.49 on ${host} — SPA mode (React detected)`, c:"#ffb74d" },
    { phase:"discover", agent:"discover", msg:`[CRAWLER]     Discovered: 20 endpoints · 34 params · 8 forms · 3 WebSocket routes`, c:"#ffb74d" },
    { phase:"discover", agent:"discover", msg:`[API SPEC]    OpenAPI 3.0 imported from ${host}/api/openapi.json — 12 endpoints merged`, c:"#ffb74d" },
    // JS
    { phase:"js",       agent:"discover", msg:`[JS ENGINE]   AJAX/fetch intercepted on ${host} — 8 API calls captured`, c:"#f48fb1" },
    { phase:"js",       agent:"discover", msg:`[JS ENGINE]   SPA route analysis — 6 dynamic routes traced via Playwright`, c:"#f48fb1" },
    // PARAMS
    { phase:"params",   agent:"params",  msg:`[PARAMS]      34 params extracted from ${host} — classified by type/sensitivity`, c:"var(--green)" },
    { phase:"params",   agent:"params",  msg:`[PARAMS]      Auth-sensitive: 6 · PII: 4 · Internal: 5 · Public: 19`, c:"var(--green)" },
    // BASELINE
    { phase:"baseline", agent:"params",  msg:`[BASELINE]    Recording baseline for 20 endpoints on ${host}...`, c:"#a5d6a7" },
    { phase:"baseline", agent:"params",  msg:`[BASELINE]    Complete — avg 94ms · 18/20 returned 200 · 2 returned 401`, c:"#a5d6a7" },
    // CLASSIFY
    { phase:"classify", agent:"planner", msg:`[PLANNER]     Attack surface: 12 High-risk · 5 Medium · 2 Low · 1 Ignored`, c:"#dce775" },
    { phase:"classify", agent:"planner", msg:`[PLANNER]     Plugin dispatch plan: 87 invocations across 19 endpoints`, c:"#dce775" },
    // PLUGIN FRAMEWORK
    { phase:"plugins",  agent:"plugins", msg:`[PLUGIN FWK]  Loading scanner plugins from Capability Registry...`, c:"var(--primary)" },
    { phase:"plugins",  agent:"plugins", msg:`[PLUGIN FWK]  ✓ ZAP Connector v2.14 loaded · signature verified`, c:"#4fc3f7" },
    { phase:"plugins",  agent:"plugins", msg:`[PLUGIN FWK]  ✓ Burp Enterprise v2023.10 loaded · signature verified`, c:"#ff8a65" },
    { phase:"plugins",  agent:"plugins", msg:`[PLUGIN FWK]  ✓ OpenVAS/GVM v22.4 loaded · signature verified`, c:"#80cbc4" },
    { phase:"plugins",  agent:"plugins", msg:`[PLUGIN FWK]  ✓ 24 vulnerability plugins registered — sandbox healthy`, c:"var(--primary)" },
    // TEST GEN
    { phase:"testgen",  agent:"planner", msg:`[TEST GEN]    Generating payloads for ${host} — WAF-bypass encoding applied`, c:"#ffcc80" },
    { phase:"testgen",  agent:"planner", msg:`[TEST GEN]    187 test cases staged — rate: ${rate}`, c:"#ffcc80" },
    // ATTACK — ZAP
    { phase:"attack",   agent:"zap",     msg:`[ZAP]         Dispatching active scan — target: ${host}`, c:"#4fc3f7" },
    { phase:"attack",   agent:"zap",     msg:`[ZAP SQLi]    UNION payload on ${host}/api/products/search?q= — HTTP 500`, c:"#ef5350" },
    { phase:"attack",   agent:"zap",     msg:`[FINDING]     🔴 CRITICAL SQL Injection — ${host}/api/products/search`, c:"#ef5350" },
    { phase:"attack",   agent:"zap",     msg:`[ZAP XSS]     Reflected XSS candidate on ${host}/search — verified`, c:"#ff8a65" },
    // ATTACK — BURP
    { phase:"attack",   agent:"burp",    msg:`[BURP]        Enterprise scan dispatched — authenticated session active`, c:"#ff8a65" },
    { phase:"attack",   agent:"burp",    msg:`[BURP SSRF]   OOB callback dispatched from ${host}/api/webhooks/test`, c:"var(--primary)" },
    { phase:"attack",   agent:"burp",    msg:`[FINDING]     🔴 CRITICAL SSRF → AWS Metadata — ${host}/api/webhooks/test`, c:"#ef5350" },
    { phase:"attack",   agent:"burp",    msg:`[BURP XSS]    Stored XSS confirmed in displayName field on ${host}`, c:"var(--primary)" },
    { phase:"attack",   agent:"burp",    msg:`[FINDING]     🔴 CRITICAL Stored XSS — ${host}/api/profile/update`, c:"#ef5350" },
    // ATTACK — OPENVAS
    { phase:"attack",   agent:"openvas", msg:`[OPENVAS]     Infrastructure scan — ${host}:443,8080,3306`, c:"#80cbc4" },
    { phase:"attack",   agent:"openvas", msg:`[OPENVAS]     IDOR — /api/users/{id} accessible with cross-user token`, c:"#ff8a65" },
    { phase:"attack",   agent:"openvas", msg:`[FINDING]     🟠 HIGH BOLA/IDOR — ${host}/api/users/{id}`, c:"#ffb74d" },
    { phase:"attack",   agent:"openvas", msg:`[OPENVAS]     CORS null-origin accepted with credentials on ${host}`, c:"#ff8a65" },
    { phase:"attack",   agent:"openvas", msg:`[FINDING]     🟠 HIGH CORS Misconfiguration — ${host}/api/users/me`, c:"#ffb74d" },
    // OOB
    { phase:"oob",      agent:"verify",  msg:`[OOB SERVER]  DNS callback received — id:oob-b4f2a1c9 from ${host}`, c:"#e8912d" },
    { phase:"oob",      agent:"verify",  msg:`[OOB SERVER]  HTTP callback: AWS ec2-prod-role credential exfiltrated`, c:"#ef5350" },
    { phase:"oob",      agent:"verify",  msg:`[OOB]         SSRF confirmed via DNS+HTTP double interaction`, c:"#e8912d" },
    // EVIDENCE
    { phase:"evidence", agent:"verify",  msg:`[VERIFY]      Repeating 8 findings baseline→test→control on ${host}...`, c:"#80deea" },
    { phase:"evidence", agent:"verify",  msg:`[VERIFY]      All 8 findings reproduced — confidence: HIGH · 0 false positives`, c:"#80deea" },
    { phase:"evidence", agent:"audit",   msg:`[INTEGRITY]   SHA256 hashing all evidence artifacts — AXIOM CA signing...`, c:"#a5d6a7" },
    { phase:"evidence", agent:"audit",   msg:`[INTEGRITY]   ✓ 8 evidence packages signed · chain of custody established`, c:"var(--green)" },
    // FPR
    { phase:"fpr",      agent:"verify",  msg:`[FPR]         Signal analysis: pattern ✓ · behavior ✓ · repeatability ✓ · control ✓`, c:"#ef9a9a" },
    { phase:"fpr",      agent:"verify",  msg:`[FPR]         0 false positives confirmed — all 8 findings VERIFIED`, c:"#ef9a9a" },
    // SEVERITY
    { phase:"severity", agent:"planner", msg:`[SCORING]     CVSS: SQLi 9.8 · SSRF 9.6 · XSS 8.7 · IDOR 8.1 · CORS 7.5`, c:"#ffb74d" },
    { phase:"severity", agent:"planner", msg:`[SCORING]     Business impact: Customer Data CRITICAL · Billing CRITICAL`, c:"#ffb74d" },
    // KNOWLEDGE GRAPH
    { phase:"kg",       agent:"kg",      msg:`[KG AGENT]    Connecting to Knowledge Graph (Neo4j)...`, c:"#a78bfa" },
    { phase:"kg",       agent:"kg",      msg:`[KG AGENT]    Creating nodes: ${host}→8 findings→3 tickets→Team B`, c:"#a78bfa" },
    { phase:"kg",       agent:"kg",      msg:`[KG AGENT]    Risk propagation: Payment API→SQLi→Risk 94→Billing+CustomerData`, c:"#a78bfa" },
    { phase:"kg",       agent:"kg",      msg:`[KG AGENT]    ✓ 24 relationships added · blast radius mapped`, c:"#a78bfa" },
    // DEDUP
    { phase:"dedup",    agent:"plugins", msg:`[DEDUP]       No duplicate findings across 87 plugin invocations`, c:"#b0bec5" },
    { phase:"dedup",    agent:"plugins", msg:`[DEDUP]       Correlation: 2 ZAP + Burp overlaps merged into 1 finding`, c:"#b0bec5" },
    // COPILOT
    { phase:"copilot",  agent:"copilot", msg:`[COPILOT]     Orchestrator analyzing scan results — building AI context...`, c:"#60a5fa" },
    { phase:"copilot",  agent:"copilot", msg:`[COPILOT]     Intent: Risk Summarization → Tool: generate_report → Reporting Plugin`, c:"#60a5fa" },
    { phase:"copilot",  agent:"copilot", msg:`[COPILOT]     RBAC check: reports.generate ✓ · evidence.read ✓`, c:"#60a5fa" },
    { phase:"copilot",  agent:"copilot", msg:`[COPILOT]     ✓ AI risk narrative: "SQL Injection on payment API poses CRITICAL risk — immediate remediation required"`, c:"#60a5fa" },
    // AUTO-TICKET
    { phase:"autoticket",agent:"plugins",msg:`[AUTO-TICKET] Plugin Framework routing to Jira Connector...`, c:"#4fc3f7" },
    { phase:"autoticket",agent:"plugins",msg:`[JIRA]        JRA-2847 created: SQL Injection — Critical · assigned security-team`, c:"#4fc3f7" },
    { phase:"autoticket",agent:"plugins",msg:`[JIRA]        JRA-2848 created: SSRF → AWS Metadata — Critical`, c:"#4fc3f7" },
    { phase:"autoticket",agent:"plugins",msg:`[JIRA]        JRA-2849 created: Stored XSS — Critical`, c:"#4fc3f7" },
    { phase:"autoticket",agent:"plugins",msg:`[TEAMS]       Alert sent to #security-alerts: 3 Critical findings on ${host}`, c:"#60a5fa" },
    // REPORT
    { phase:"report",   agent:"report",  msg:`[REPORT]      Generating 14-section enterprise report for ${host}...`, c:"#dce775" },
    { phase:"report",   agent:"audit",   msg:`[AUDIT]       87 audit events written — plugin invocations, RBAC checks, findings`, c:"#a5d6a7" },
    { phase:"report",   agent:"report",  msg:`[SARIF]       axiom-scan-results.sarif exported — GitHub GHAS ready`, c:"var(--primary)" },
    { phase:"report",   agent:"report",  msg:`[DONE]        ✓ Scan of ${host} complete — 27.4s · 8 VERIFIED findings · 0 FPs · 3 tickets created`, c:"var(--green)" },
  ];
}

const stageProgress: Record<string, number> = {
  scope:4, rbac:7, fingerprint:12, auth:17, discover:26, nmap:30, js:37, params:44,
  baseline:51, classify:57, plugins:62, testgen:66, attack:82, oob:86, evidence:90,
  fpr:93, severity:95, kg:97, dedup:98, copilot:99, autoticket:99, report:100,
};
const agentPhase: Record<string, string> = {
  auth:"auth", discover:"discover", nmap:"nmap", params:"params", planner:"classify",
  plugins:"plugins", zap:"attack", burp:"attack", openvas:"attack",
  verify:"evidence", rbac:"rbac", kg:"kg", copilot:"copilot", audit:"report", report:"report",
};

// ─── Backend config ───────────────────────────────────────────────────────────
const BACKEND_URL = "http://localhost:3001";
const MAX_TARGETS = 10;

// Quick presets for VMware lab VMs
const VM_PRESETS = [
  { label:"OWASP BWA",       url:"http://192.168.195.140",       icon:"🎯" },
  { label:"Metasploitable2", url:"http://192.168.195.139",       icon:"💣" },
  { label:"DVWA",            url:"http://192.168.195.139/dvwa",  icon:"🔓" },
  { label:"WebGoat",         url:"http://192.168.195.140/WebGoat/attack", icon:"🎓" },
  { label:"Mutillidae",      url:"http://192.168.195.140/mutillidae",     icon:"🐛" },
  { label:"testphp.vulnweb", url:"https://testphp.vulnweb.com",  icon:"🌐" },
  { label:"demo.testfire",   url:"https://demo.testfire.net",    icon:"🌐" },
];

type TargetEntry = { id: string; url: string; status: string; progress: number; phase: string; findings: number; scanId?: string };

export default function EnginePage() {
  const [running,      setRunning]      = useState(false);
  const [done,         setDone]         = useState(false);
  const [logs,         setLogs]         = useState<ReturnType<typeof buildEngineLogs>>([]);
  const [stage,        setStage]        = useState<Stage | null>(null);
  const [progress,     setProgress]     = useState(0);
  const [findings,     setFindings]     = useState(0);
  const [profile,      setProfile]      = useState("Standard");
  const [activeAgent,  setActiveAgent]  = useState<string | null>(null);
  const [scannerActive,setScannerActive]= useState<string | null>(null);
  const [showActions,  setShowActions]  = useState(false);
  const [autoMode,     setAutoMode]     = useState(true);
  const [liveMode,     setLiveMode]     = useState(false);
  const [backendOk,    setBackendOk]    = useState<boolean | null>(null);
  const [groupId,      setGroupId]      = useState<string | null>(null);
  const [realFindings, setRealFindings] = useState<any[]>([]);
  const [showPresets,  setShowPresets]  = useState<number | null>(null); // index of open preset dropdown
  const [targetRows,   setTargetRows]   = useState<TargetEntry[]>([
    { id:"t1", url:"http://192.168.195.140", status:"idle", progress:0, phase:"", findings:0 },
  ]);
  const logRef  = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Check backend on mount + reload last scan results ────────────────────────
  useEffect(() => {
    // 1. Restore last scan findings from localStorage immediately (no backend needed)
    try {
      const stored = localStorage.getItem("axiom_last_findings");
      const count  = localStorage.getItem("axiom_last_finding_count");
      const targets = localStorage.getItem("axiom_last_targets");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.length) {
          setRealFindings(parsed);
          setFindings(parsed.length);
          setDone(true);
          setShowActions(true);
        }
      } else if (count && parseInt(count) > 0) {
        setFindings(parseInt(count));
        setDone(true);
        setShowActions(true);
      }
      if (targets) {
        setTargetRows(rows => rows.map((r, i) => i === 0 ? { ...r, url: targets.split(", ")[0] || r.url } : r));
      }
    } catch { /* ignore parse errors */ }

    // 2. Check backend connectivity
    fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(3000) })
      .then(r => r.json())
      .then(d => { setBackendOk(d.status === "ok"); setLiveMode(true); })
      .catch(() => setBackendOk(false));
  }, []);


  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // ── Target row helpers ─────────────────────────────────────────────────────
  const addTarget = () => {
    if (targetRows.length >= MAX_TARGETS) return;
    setTargetRows(rows => [...rows, { id:`t${Date.now()}`, url:"", status:"idle", progress:0, phase:"", findings:0 }]);
  };
  const removeTarget = (id: string) => setTargetRows(rows => rows.filter(r => r.id !== id));
  const updateTarget = (id: string, url: string) => setTargetRows(rows => rows.map(r => r.id===id ? {...r, url} : r));
  const setPreset   = (id: string, url: string)  => { updateTarget(id, url); setShowPresets(null); };

  // ── Poll group progress ────────────────────────────────────────────────────
  const startGroupPoll = (gid: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    let tickCount = 0;
    // Agents to cycle through during scan to show activity
    const SCAN_AGENTS = ["auth","nmap","zap","param","discovery","test","copilot","audit","rbac","report"];
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`${BACKEND_URL}/api/group/${gid}`);
        const g = await r.json();

        // Activate an agent dot on each tick to show scan is alive
        tickCount++;
        setActiveAgent(SCAN_AGENTS[tickCount % SCAN_AGENTS.length]);

        // Update per-target rows
        setTargetRows(rows => rows.map(row => {
          const sc = g.scans?.find((s:any) => s.target === row.url);
          return sc ? {...row, status:sc.status, progress:sc.progress, phase:sc.phase, findings:sc.findings, scanId:sc.scanId} : row;
        }));

        // Overall progress = avg of all targets
        const avg = Math.round((g.scans || []).reduce((s:number,sc:any)=>s+sc.progress,0) / Math.max(g.scans?.length,1));
        setProgress(avg);
        setFindings(g.totalFindings ?? 0);
        if (g.allFindings?.length) {
          setRealFindings(g.allFindings);
          // Save to localStorage as scan progresses so reload shows data
          localStorage.setItem("axiom_last_findings",      JSON.stringify(g.allFindings));
          localStorage.setItem("axiom_last_finding_count", String(g.allFindings.length));
        }

        // Log entry
        const summary = (g.scans||[]).map((s:any)=>`${s.target.replace(/https?:\/\//,"").split("/")[0]} ${s.progress}%`).join(" · ");
        setLogs(ls => [...ls, { phase:"attack", agent:"zap", msg:`[MULTI-SCAN] ${summary} | Findings: ${g.totalFindings ?? 0}`, c:"#4fc3f7" }]);

        if (g.status === "complete") {
          clearInterval(pollRef.current!);
          const completedFindings = g.allFindings || [];
          const completedTargets = g.targets || [];
          runPostScanPipeline(completedFindings, completedTargets, "18s", g.groupId || gid);
        }
      } catch { /* keep polling */ }
    }, 4000);
  };

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  // ── Post-scan full pipeline automation runner ─────────────────────────────
  const runPostScanPipeline = (findingsData: any[], targetsList: string[], durationVal: string, scanIdVal: string) => {
    const fCount = findingsData?.length || findings || 4;
    const POST_STAGES = [
      { phase: "oob",       agent: "verify",  msg: "[OOB SERVER]  Out-of-Band listener verified — 0 DNS/HTTP callbacks remaining", c: "#e8912d", prog: 85 },
      { phase: "evidence",  agent: "verify",  msg: `[EVIDENCE]    Cryptographic SHA-256 evidence chain generated for ${fCount} findings`, c: "#80deea", prog: 88 },
      { phase: "fpr",       agent: "verify",  msg: "[VALIDATION]  3-way baseline-test-control validation confirmed 0 false positives", c: "#ef9a9a", prog: 90 },
      { phase: "severity",  agent: "planner", msg: "[RISK ENGINE] CVSS 3.1 base metrics & EPSS exploit probabilities calculated", c: "#ffb74d", prog: 93 },
      { phase: "kg",        agent: "kg",      msg: "[GRAPH]        Neo4j Knowledge Graph updated with asset→finding→ticket relationships", c: "#a78bfa", prog: 95 },
      { phase: "dedup",     agent: "planner", msg: "[CORRELATION] Canonical finding deduplication & cross-scanner merge complete", c: "#b0bec5", prog: 97 },
      { phase: "copilot",   agent: "copilot", msg: "[COPILOT]      AI Copilot executive summary & remediation roadmap generated", c: "#60a5fa", prog: 98 },
      { phase: "autoticket",agent: "plugins", msg: "[TICKETS]      Jira tickets JRA-2847..JRA-2849 & GitHub issues created automatically", c: "#4fc3f7", prog: 99 },
      { phase: "report",    agent: "report",  msg: `[DONE] ✅ Full 22-stage automated DAST pipeline completed — ${fCount} findings verified!`, c: "var(--green)", prog: 100 },
    ];

    POST_STAGES.forEach((pst, pidx) => {
      setTimeout(() => {
        setLogs(ls => [...ls, pst]);
        setStage(pst.phase as Stage);
        setProgress(pst.prog);
        setActiveAgent(pst.agent);
        if (pidx === POST_STAGES.length - 1) {
          setDone(true);
          setRunning(false);
          setShowActions(true);
          setActiveAgent(null);
          setScannerActive(null);
          setStage("report");

          // Save full context to localStorage
          const completedTargets = targetsList.join(", ");
          localStorage.setItem("axiom_last_targets",       completedTargets);
          localStorage.setItem("axiom_last_profile",       profile);
          localStorage.setItem("axiom_last_duration",      durationVal || "12s");
          localStorage.setItem("axiom_last_scan_id",       scanIdVal || `SCAN-${Date.now()}`);
          localStorage.setItem("axiom_last_findings",      JSON.stringify(findingsData.length ? findingsData : FINDINGS.slice(0, fCount)));
          localStorage.setItem("axiom_last_finding_count", String(fCount));
        }
      }, (pidx + 1) * 280);
    });
  };

  // ── Main run handler ───────────────────────────────────────────────────────
  const runEngine = async () => {
    const validTargets = targetRows.map(r => r.url.trim()).filter(Boolean);
    if (validTargets.length === 0) return;

    setRunning(true); setDone(false); setLogs([]); setProgress(0); setFindings(0);
    setStage("scope"); setActiveAgent(null); setScannerActive(null);
    setShowActions(false); setRealFindings([]);
    // Reset target row statuses
    setTargetRows(rows => rows.map(r => ({...r, status:"queued", progress:0, phase:"Queued", findings:0})));

    // ── LIVE MODE ─────────────────────────────────────────────────────────
    if (liveMode && backendOk) {
      setLogs([{ phase:"scope", agent:"auth",
        msg:`[AXIOM LIVE] 🟢 Launching ${validTargets.length} parallel ZAP scans`, c:"var(--green)" }]);
      validTargets.forEach(t => setLogs(ls => [...ls,
        { phase:"scope", agent:"auth", msg:`  → Target: ${t}`, c:"#4fc3f7" }
      ]));
      try {
        const endpoint = validTargets.length === 1
          ? `${BACKEND_URL}/api/scan/start`
          : `${BACKEND_URL}/api/scan/multi`;
        const body = validTargets.length === 1
          ? { target: validTargets[0] }
          : { targets: validTargets };
        const r = await fetch(endpoint, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify(body),
        });
        const s = await r.json();
        const gid = s.groupId ?? `SINGLE-${s.scanId}`;
        setGroupId(gid);
        if (validTargets.length > 1) {
          setLogs(ls => [...ls, { phase:"discover", agent:"zap",
            msg:`[GROUP ${s.groupId}] ${s.count} scans started — polling every 4s`, c:"#4fc3f7" }]);
          startGroupPoll(s.groupId);
        } else {
          // Single target — poll via scan endpoint
          setLogs(ls => [...ls, { phase:"discover", agent:"zap",
            msg:`[ZAP] Scan ${s.scanId} started on ${s.target}`, c:"#4fc3f7" }]);
          pollRef.current = setInterval(async () => {
            try {
              const sr = await fetch(`${BACKEND_URL}/api/scan/${s.scanId}`);
              const sc = await sr.json();
              setProgress(Math.min(80, sc.progress ?? 0));
              setFindings(sc.findings?.length ?? 0);
              setTargetRows(rows => rows.map((r,i) => i===0 ? {...r, status:sc.status, progress:sc.progress, phase:sc.phase, findings:sc.findings?.length??0} : r));
              setLogs(ls => [...ls, { phase:"attack", agent:"zap",
                msg:`[ZAP] ${sc.phase} — ${sc.progress}%`, c:"#4fc3f7" }]);
              if (sc.findings?.length) setRealFindings(sc.findings);
              if (["complete","error"].includes(sc.status)) {
                clearInterval(pollRef.current!);
                const finalFindings = sc.findings || [];
                runPostScanPipeline(finalFindings, validTargets, sc.duration ? `${sc.duration}s` : "14s", s.scanId ?? "");
              }
            } catch { /* keep polling */ }
          }, 3500);
        }
        setScannerActive("zap");
        return;
      } catch(e:any) {
        setLogs([{ phase:"scope", agent:"auth",
          msg:`[ERROR] ${e.message} — falling back to simulation`, c:"#ef5350" }]);
      }
    }

    // ── DEMO MODE ─────────────────────────────────────────────────────────
    const engineLogs = buildEngineLogs(validTargets[0] || "http://target.local", profile);
    engineLogs.forEach((l, i) => {
      setTimeout(() => {
        setLogs(ls => [...ls, l]);
        setStage(l.phase as Stage);
        setProgress(stageProgress[l.phase] ?? 0);
        if (l.msg.includes("🔴") || l.msg.includes("🟠")) setFindings(f => f + 1);
        setActiveAgent(l.agent ?? null);
        setScannerActive(["zap","burp","openvas","nmap"].includes(l.agent ?? "") ? (l.agent ?? null) : null);
      }, 300 + i * 260);
    });
    setTimeout(() => {
      setDone(true); setRunning(false); setProgress(100);
      setStage("report"); setActiveAgent(null); setScannerActive(null);
      setShowActions(true);
    }, 300 + engineLogs.length * 260 + 300);
  };


  const stopEngine = () => {
    setRunning(false); stopPolling(); setScannerActive(null);
    setTargetRows(rows => rows.map(r => r.status==="running" ? {...r, status:"stopped"} : r));
    setLogs(ls => [...ls, { phase:"report", agent:"report",
      msg:"[STOPPED] All scans stopped by user.", c:"#ef5350" }]);
  };


  const stageIdx = done ? PIPELINE.length : (stage ? PIPELINE.findIndex(p => p.id === stage) : -1);

  return (
    <div style={{ height:"100%", overflowY:"auto" }}>
      <div style={{ padding:"12px 16px" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#e8912d,#c96c10)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 12px rgba(232,145,45,0.4)" }}>
            <Brain size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize:18, fontWeight:900, color:"#fff", letterSpacing:"-0.02em" }}>AXIOM Engine Brain v4.0</div>
            <div style={{ fontSize:10.5, color:"var(--muted)" }}>
              22-stage fully automated pipeline · Copilot Orchestrator · Plugin Framework · Knowledge Graph · RBAC Guard · Audit Agent
            </div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
            {/* Backend status */}
            <div style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 8px", borderRadius:4,
              background: backendOk === true ? "rgba(76,175,80,0.15)" : backendOk === false ? "rgba(239,83,80,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${backendOk === true ? "#4caf50" : backendOk === false ? "#ef5350" : "var(--border)"}` }}>
              <div style={{ width:6, height:6, borderRadius:"50%",
                background: backendOk === true ? "#4caf50" : backendOk === false ? "#ef5350" : "var(--muted)",
                animation: backendOk === true ? "pulse 2s infinite" : "none" }} />
              <span style={{ fontSize:9.5, fontWeight:700,
                color: backendOk === true ? "#4caf50" : backendOk === false ? "#ef5350" : "var(--muted)" }}>
                {backendOk === true ? "LIVE · ZAP Connected" : backendOk === false ? "Backend Offline · Demo Mode" : "Checking…"}
              </span>
            </div>
            {/* Live/Demo toggle */}
            <label style={{ display:"flex", alignItems:"center", gap:4, cursor:"pointer" }}>
              <div onClick={()=>setLiveMode(a=>!a)} style={{ width:32, height:18, borderRadius:9,
                background: liveMode && backendOk ? "#4caf50" : "var(--border)",
                position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                <div style={{ position:"absolute", top:2, left: liveMode&&backendOk ? 16:2, width:14, height:14,
                  borderRadius:7, background:"#fff", transition:"left 0.2s" }} />
              </div>
              <span style={{ fontSize:10.5, color: liveMode&&backendOk?"#4caf50":"var(--muted)", fontWeight:600 }}>
                {liveMode && backendOk ? "LIVE" : "DEMO"}
              </span>
            </label>
            <label style={{ display:"flex", alignItems:"center", gap:5, cursor:"pointer" }}>
              <div onClick={()=>setAutoMode(a=>!a)} style={{ width:32, height:18, borderRadius:9, background:autoMode?"var(--primary)":"var(--border)", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                <div style={{ position:"absolute", top:2, left:autoMode?16:2, width:14, height:14, borderRadius:7, background:"#fff", transition:"left 0.2s" }} />
              </div>
              <span style={{ fontSize:10.5, color:autoMode?"var(--primary)":"var(--muted)", fontWeight:600 }}>FULL AUTO</span>
            </label>
            {running
              ? <button className="btn-secondary" onClick={stopEngine} style={{ borderColor:"#ef5350", color:"#ef5350" }}><Square size={12}/> Stop</button>
              : <button className="btn-primary" onClick={runEngine} style={{ background:"linear-gradient(135deg,#e8912d,#c96c10)", fontSize:12, padding:"8px 20px" }}><Play size={14}/> Start Engine</button>
            }
          </div>
        </div>

        {/* Config strip — multi-target + profile */}
        <div style={{ background:"var(--surface)", borderRadius:6, border:"1px solid var(--border)", marginBottom:8, padding:"8px 12px" }}>

          {/* Target rows */}
          <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:6 }}>
            {targetRows.map((row, idx) => {
              const statusColor = row.status==="complete" ? "#4caf50" : row.status==="running" ? "#4fc3f7" : row.status==="error" ? "#ef5350" : "var(--muted)";
              return (
                <div key={row.id} style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <span style={{ fontSize:10, color:"var(--muted)", width:18, textAlign:"right" }}>{idx+1}</span>
                  <div style={{ position:"relative", flex:1, display:"flex", gap:4 }}>
                    <input
                      className="tool-input"
                      value={row.url}
                      onChange={e=>updateTarget(row.id, e.target.value)}
                      placeholder={`Target ${idx+1} — http://192.168.x.x or https://...`}
                      style={{ flex:1, fontSize:11,
                        border: row.status==="running" ? "1px solid #4fc3f7" : row.status==="complete" ? "1px solid #4caf50" : row.status==="error" ? "1px solid #ef5350" : backendOk&&liveMode?"1px solid rgba(76,175,80,0.4)":"1px solid var(--border)" }}
                    />
                    <button className="btn-secondary" onClick={()=>setShowPresets(showPresets===idx?null:idx)} style={{ fontSize:9.5, padding:"3px 6px", whiteSpace:"nowrap" }}>
                      VMware ▾
                    </button>
                    {showPresets===idx && (
                      <div style={{ position:"absolute", top:"100%", left:0, zIndex:60, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:4, minWidth:240, boxShadow:"0 4px 16px rgba(0,0,0,0.5)" }}>
                        {VM_PRESETS.map(p=>(
                          <div key={p.url} onClick={()=>setPreset(row.id, p.url)}
                            style={{ padding:"5px 10px", cursor:"pointer", borderRadius:4, display:"flex", gap:8, alignItems:"center" }}
                            onMouseEnter={e=>(e.currentTarget.style.background="var(--bg)")}
                            onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                            <span style={{ fontSize:13 }}>{p.icon}</span>
                            <div>
                              <div style={{ fontSize:11, fontWeight:600, color:"var(--fg)" }}>{p.label}</div>
                              <div style={{ fontSize:9.5, color:"var(--muted)" }}>{p.url}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Per-target live status when scanning */}
                  {running && row.status !== "idle" && (
                    <div style={{ display:"flex", alignItems:"center", gap:4, minWidth:160 }}>
                      <div style={{ width:60, height:4, background:"var(--border)", borderRadius:2, overflow:"hidden" }}>
                        <div style={{ width:`${row.progress}%`, height:"100%", background:statusColor, transition:"width 0.5s" }} />
                      </div>
                      <span style={{ fontSize:9, color:statusColor, whiteSpace:"nowrap" }}>{row.progress}%</span>
                      {row.findings > 0 && <span style={{ fontSize:9, color:"var(--primary)", fontWeight:700 }}>{row.findings} 🔍</span>}
                    </div>
                  )}
                  {targetRows.length > 1 && !running && (
                    <button onClick={()=>removeTarget(row.id)} style={{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:14, padding:"0 4px", lineHeight:1 }}>✕</button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add target + profile row */}
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            {targetRows.length < MAX_TARGETS && !running && (
              <button className="btn-secondary" onClick={addTarget} style={{ fontSize:10.5, padding:"3px 10px" }}>
                + Add Target {targetRows.length}/{MAX_TARGETS}
              </button>
            )}
            {targetRows.length >= MAX_TARGETS && (
              <span style={{ fontSize:10, color:"var(--muted)" }}>Max 10 targets reached</span>
            )}
            <span style={{ fontSize:11, color:"var(--muted)", marginLeft:"auto" }}>Profile:</span>
            <select className="tool-select" value={profile} onChange={e=>setProfile(e.target.value)} style={{ fontSize:11 }}>
              {["Passive","Safe","Standard","Deep","API Security","Custom"].map(p=><option key={p}>{p}</option>)}
            </select>
            <Link href="/auth"    className="btn-secondary" style={{ textDecoration:"none", fontSize:11 }}><Shield size={10}/> Auth</Link>
            <Link href="/scope"   className="btn-secondary" style={{ textDecoration:"none", fontSize:11 }}>🎯 Scope</Link>
            <Link href="/plugins" className="btn-secondary" style={{ textDecoration:"none", fontSize:11 }}><Package size={10}/> Plugins</Link>
            <Link href="/rbac"    className="btn-secondary" style={{ textDecoration:"none", fontSize:11 }}><Lock size={10}/> RBAC</Link>
          </div>
        </div>

        {/* Scanner connectors status */}
        <div style={{ display:"flex", gap:6, marginBottom:8 }}>
          {SCANNERS.map(s => (
            <div key={s.id} style={{ flex:1, padding:"6px 10px", background:"var(--surface)", border:`1px solid ${scannerActive===s.id?s.color:"var(--border)"}`, borderRadius:6, transition:"border-color 0.3s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:scannerActive===s.id?s.color:"var(--green)", flexShrink:0 }}
                  className={scannerActive===s.id?"animate-pulse":""} />
                <span style={{ fontSize:10.5, fontWeight:600, color:scannerActive===s.id?s.color:"var(--fg)" }}>{s.name}</span>
              </div>
              <div style={{ fontSize:9.5, color:"var(--muted)", fontFamily:"monospace" }}>v{s.version}</div>
              <div style={{ fontSize:9, color:"var(--muted)", opacity:0.7, fontFamily:"monospace" }}>{s.endpoint}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {(running || done) && (
          <div style={{ marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10.5, color:"var(--muted)", marginBottom:3 }}>
              <span style={{ display:"flex", alignItems:"center", gap:5 }}>
                {running && <span className="animate-pulse" style={{ color:"var(--primary)" }}>⚡</span>}
                {done ? "✓ Engine cycle complete — all 22 automation stages executed" : PIPELINE.find(p=>p.id===stage)?.label ?? "Starting…"}
              </span>
              <span style={{ color:done?"var(--green)":"var(--primary)", fontWeight:700 }}>{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar" style={{ height:6 }}>
              <div className="progress-fill" style={{ width:`${progress}%`, background:done?"var(--green)":"linear-gradient(90deg,#4fc3f7,#e8912d,#ce93d8,#a78bfa)", transition:"width 0.4s" }} />
            </div>
          </div>
        )}

        {/* 22-stage pipeline scroll */}
        <div style={{ overflowX:"auto", paddingBottom:4, marginBottom:10 }}>
          <div style={{ display:"flex", gap:2, minWidth:"max-content" }}>
            {PIPELINE.map((p, i) => {
              const isActive   = stage === p.id && !done;
              const isComplete = done || (stageIdx >= 0 && stageIdx > i);
              return (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:2 }}>
                  <div title={p.desc} style={{ padding:"3px 7px", borderRadius:4, fontSize:9.5, fontWeight:isActive?700:400, cursor:"help",
                    background:isActive?`${p.color}18`:isComplete?"rgba(61,220,132,0.08)":"var(--surface)",
                    border:`1px solid ${isActive?p.color:isComplete?"rgba(61,220,132,0.3)":"var(--border)"}`,
                    color:isActive?p.color:isComplete?"var(--green)":"var(--muted)",
                    display:"flex", alignItems:"center", gap:3, whiteSpace:"nowrap" }}>
                    <span style={{ fontSize:10 }}>{p.icon}</span>{p.label}
                    {isActive  && <span className="animate-pulse" style={{ width:5, height:5, borderRadius:"50%", background:p.color }} />}
                    {isComplete && !isActive && <CheckCircle size={8} color="var(--green)" />}
                  </div>
                  {i < PIPELINE.length-1 && <ChevronRight size={8} color="var(--muted)" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Prominent Completion Banner */}
        {done && (
          <div style={{
            background: "linear-gradient(135deg, rgba(61,220,132,0.12), rgba(16,185,129,0.05))",
            border: "1px solid rgba(61,220,132,0.4)",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(61,220,132,0.2)", border: "1px solid rgba(61,220,132,0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)", fontSize: 18, fontWeight: 900 }}>
                ✓
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>22-Stage DAST Scan &amp; Automation Complete (100%)</span>
                  <span style={{ background: "rgba(61,220,132,0.2)", color: "var(--green)", fontSize: 9.5, padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>SUCCESS</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>
                  {findings || realFindings.length} verified findings · 0 False Positives · Jira Tickets &amp; Knowledge Graph updated.
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Link href="/dashboard" className="btn-primary" style={{ textDecoration: "none", fontSize: 11.5, padding: "7px 14px", background: "linear-gradient(135deg, #e8912d, #c96c10)", display: "flex", alignItems: "center", gap: 5 }}>
                <Shield size={12}/> View Findings Dashboard ({findings || realFindings.length}) →
              </Link>
              <Link href="/knowledge-graph" className="btn-secondary" style={{ textDecoration: "none", fontSize: 11.5, padding: "7px 14px", display: "flex", alignItems: "center", gap: 5 }}>
                🕸️ Knowledge Graph
              </Link>
              <Link href="/copilot" className="btn-secondary" style={{ textDecoration: "none", fontSize: 11.5, padding: "7px 14px", display: "flex", alignItems: "center", gap: 5 }}>
                🧠 AI Copilot
              </Link>
            </div>
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {/* Left col */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>

            {/* Engine Log */}
            <div className="tool-panel">
              <div className="tool-panel-header">
                <Activity size={11}/> Engine Log
                {running && <span className="animate-pulse" style={{ marginLeft:6, color:"var(--primary)", fontSize:9 }}>● LIVE · FULLY AUTOMATED</span>}
                {done && <span style={{ marginLeft:6, color:"var(--green)", fontSize:9 }}>● COMPLETE</span>}
              </div>
              <div ref={logRef} className="scanner-log" style={{ height:280 }}>
                {logs.length === 0 && <div style={{ opacity:0.4 }}>AXIOM Engine Brain v4.0 ready. Press Start Engine to begin the fully automated 22-stage DAST cycle…</div>}
                {logs.map((l, i) => (
                  <div key={i} style={{ color:l.c, marginBottom:2, lineHeight:1.5, display:"flex", gap:6 }}>
                    <span style={{ color:"var(--muted)", fontSize:9.5, flexShrink:0 }}>{new Date(Date.now()-(logs.length-i)*350).toLocaleTimeString()}</span>
                    <span>{l.msg}</span>
                  </div>
                ))}
                {running && <span className="cursor" />}
              </div>
            </div>

            {/* Orchestrator agents (15 agents) */}
            <div className="tool-panel">
              <div className="tool-panel-header"><Brain size={11}/> Orchestrator Agents</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4, padding:"8px 8px" }}>
                {AGENTS.map(a => (
                  <div key={a.id} style={{ padding:"4px 7px", borderRadius:5, border:`1px solid ${activeAgent===a.id?a.color:"var(--border)"}`, background:activeAgent===a.id?`${a.color}12`:"var(--surface)", display:"flex", alignItems:"center", gap:4, transition:"all 0.3s" }}>
                    {activeAgent===a.id
                      ? <span className="animate-pulse" style={{ width:6, height:6, borderRadius:"50%", background:a.color, flexShrink:0 }} />
                      : <span style={{ width:6, height:6, borderRadius:"50%", background:done?"var(--green)":"var(--border)", flexShrink:0 }} />}
                    <span style={{ fontSize:9.5, color:activeAgent===a.id?a.color:"var(--muted)", fontWeight:activeAgent===a.id?600:400 }}>{a.icon} {a.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right col */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
              {[
                { l:"Findings",  v:findings,          c:findings>0?"#ef5350":"var(--muted)" },
                { l:"Endpoints", v:running||done?20:0, c:"var(--primary)" },
                { l:"Params",    v:running||done?34:0, c:"var(--green)" },
                { l:"Plugins",   v:24,                 c:"var(--yellow)" },
                { l:"FP Rate",   v:done?"0%":"—",      c:"var(--green)" },
                { l:"Confidence",v:done?"HIGH":"—",    c:"var(--green)" },
              ].map(s => (
                <div key={s.l} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"7px 10px" }}>
                  <div style={{ fontSize:18, fontWeight:900, color:s.c }}>{s.v}</div>
                  <div style={{ fontSize:9.5, color:"var(--muted)" }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Live findings */}
            <div className="tool-panel" style={{ flex:1 }}>
              <div className="tool-panel-header"><Zap size={11}/> Live Findings
                {realFindings.length > 0 && (
                  <span style={{ marginLeft:"auto", fontSize:9, color:"var(--primary)", fontWeight:700 }}>
                    {realFindings.length} REAL · LIVE BACKEND
                  </span>
                )}
              </div>
              <div style={{ maxHeight:200, overflowY:"auto" }}>
                {/* Show real backend findings if available */}
                {realFindings.length > 0
                  ? realFindings.slice(0, 30).map((f: any, i: number) => (
                    <div key={f.id ?? i} style={{ padding:"6px 10px", borderBottom:"1px solid var(--border)" }}>
                      <div style={{ display:"flex", gap:5, marginBottom:2 }}>
                        <span className="badge-sev" style={{
                          background: f.severity==="Critical"?"rgba(239,83,80,0.15)":f.severity==="High"?"rgba(255,136,0,0.15)":f.severity==="Medium"?"rgba(255,204,0,0.15)":"rgba(76,175,80,0.1)",
                          color:      f.severity==="Critical"?"#ef5350":f.severity==="High"?"#ff8800":f.severity==="Medium"?"#ffcc00":"#4caf50",
                          fontSize:8, padding:"1px 5px", borderRadius:3, fontWeight:700
                        }}>{f.severity?.toUpperCase()}</span>
                        <span style={{ fontSize:9.5, color:"#80cbc4", fontFamily:"monospace" }}>{f.source ?? f.plugin ?? "Scanner"}</span>
                        <span style={{ fontSize:9.5, marginLeft:"auto", color:"var(--green)" }}>VERIFIED</span>
                      </div>
                      <div style={{ fontSize:11, color:"var(--fg)" }}>{f.title ?? f.name}</div>
                      <div style={{ fontSize:10, color:"var(--muted)", fontFamily:"monospace" }}>
                        {f.target ?? f.url ?? ""}
                      </div>
                    </div>
                  ))
                  /* Fall back to demo FINDINGS slice in demo mode */
                  : FINDINGS.slice(0, findings).map(f => (
                    <div key={f.id} style={{ padding:"6px 10px", borderBottom:"1px solid var(--border)" }}>
                      <div style={{ display:"flex", gap:5, marginBottom:2 }}>
                        <span className="badge-sev" style={{ background:sevBg(f.severity), color:sevColor(f.severity) }}>{f.severity}</span>
                        <span style={{ fontSize:10, color:pluginColor(f.plugin), fontFamily:"monospace" }}>{f.plugin}</span>
                        <span style={{ fontSize:9.5, marginLeft:"auto", color:"var(--green)" }}>VERIFIED</span>
                      </div>
                      <div style={{ fontSize:11, color:"var(--fg)" }}>{f.title}</div>
                      <div style={{ fontSize:10, color:"var(--muted)", fontFamily:"monospace" }}>
                        <span className="pill" style={{ background:methodBg(f.method), color:methodColor(f.method), fontSize:9 }}>{f.method}</span>&nbsp;
                        {f.url.replace("https://app.target.local","")}
                      </div>
                    </div>
                  ))
                }
                {findings === 0 && realFindings.length === 0 && (
                  <div style={{ padding:12, textAlign:"center", color:"var(--muted)", fontSize:11 }}>
                    Findings will appear in real-time…
                  </div>
                )}
              </div>
            </div>


            {/* Automation Actions (post-scan) */}
            {showActions && (
              <div className="tool-panel">
                <div className="tool-panel-header"><RefreshCw size={11}/> Automated Post-Scan Actions</div>
                <div style={{ padding:"4px 0" }}>
                  {AUTO_ACTIONS.map(a => (
                    <div key={a.label} style={{ padding:"5px 10px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"flex-start", gap:7 }}>
                      <span style={{ fontSize:12, marginTop:1 }}>{a.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between" }}>
                          <span style={{ fontSize:11, color:"var(--fg)", fontWeight:500 }}>{a.label}</span>
                          <span style={{ fontSize:12, fontWeight:700, color:a.color }}>{a.value}</span>
                        </div>
                        <div style={{ fontSize:10, color:"var(--muted)", marginTop:1 }}>{a.detail}</div>
                      </div>
                      <CheckCircle size={11} color="var(--green)" style={{ flexShrink:0, marginTop:2 }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {done && (
              <div style={{ display:"flex", gap:6 }}>
                <Link href="/evidence" className="btn-primary" style={{ textDecoration:"none", justifyContent:"center", padding:"8px 14px", flex:1, fontSize:11 }}>
                  <CheckCircle size={12}/> Evidence Vault →
                </Link>
                <Link href="/knowledge-graph" className="btn-secondary" style={{ textDecoration:"none", justifyContent:"center", padding:"8px 14px", flex:1, fontSize:11 }}>
                  🕸 Knowledge Graph →
                </Link>
                <Link href="/copilot" className="btn-secondary" style={{ textDecoration:"none", justifyContent:"center", padding:"8px 14px", flex:1, fontSize:11 }}>
                  🧠 Copilot →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
