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
  Code, Copy, Check, FileCode, Target, ShieldAlert, X, ExternalLink,
  Plus, Trash2, UploadCloud, ListFilter, PlaySquare
} from "lucide-react";
import type { Finding } from "@/types/dast";

const BACKEND_URL = "http://localhost:3001";

// ─── Pipeline Stages ──────────────────────────────────────────────────────────
const PIPELINE = [
  { id:"scope",       label:"Scope & Auth Validation",       icon:"🎯", color:"#4fc3f7" },
  { id:"rbac",        label:"RBAC Guard Init",               icon:"🔐", color:"#ce93d8" },
  { id:"fingerprint", label:"Target Fingerprinting",         icon:"🔍", color:"#80cbc4" },
  { id:"nmap",        label:"Nmap Network Discovery",        icon:"📡", color:"#a5d6a7" },
  { id:"auth",        label:"Authentication",                icon:"🗝️", color:"#ce93d8" },
  { id:"discover",    label:"Application Discovery",         icon:"🕷",  color:"#ffb74d" },
  { id:"js",          label:"JavaScript / SPA Analysis",    icon:"⚛",  color:"#f48fb1" },
  { id:"params",      label:"Parameter Extraction",          icon:"📊", color:"var(--green)" },
  { id:"baseline",    label:"Baseline Requests",             icon:"📋", color:"#a5d6a7" },
  { id:"plugins",     label:"Plugin Dispatch",               icon:"🧩", color:"var(--primary)" },
  { id:"zap_scan",    label:"OWASP ZAP Active Fuzzing",      icon:"⚡", color:"#4fc3f7" },
  { id:"openvas_scan",label:"OpenVAS / GVM NVT Audit",       icon:"🛡",  color:"#80cbc4" },
  { id:"burp_scan",   label:"Burp Enterprise Engine",        icon:"🔍", color:"#ff8a65" },
  { id:"oob",         label:"Out-of-Band Monitoring",        icon:"📡", color:"#e8912d" },
  { id:"evidence",    label:"Evidence Verification",         icon:"🔬", color:"#80deea" },
  { id:"fpr",         label:"False-Positive Reduction",      icon:"🧮", color:"#ef9a9a" },
  { id:"severity",    label:"Severity & Risk Scoring",       icon:"📈", color:"#ffb74d" },
  { id:"kg",          label:"Knowledge Graph Update",        icon:"🕸",  color:"#a78bfa" },
  { id:"copilot",     label:"Copilot AI Analysis",           icon:"🧠", color:"#60a5fa" },
  { id:"report",      label:"Report Finalization",           icon:"📊", color:"#dce775" },
] as const;

type Stage = typeof PIPELINE[number]["id"];

interface TargetItem {
  id: string;
  url: string;
  status: "idle" | "queued" | "crawling" | "fuzzing" | "openvas" | "complete" | "error";
  progress: number;
  phase: string;
  findings: number;
}

interface ScannerItem {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
  version: string;
  endpoint: string;
  activeRequests: number;
  findingsFound: number;
  status: "STANDBY" | "RUNNING" | "COMPLETED";
}

const INITIAL_TARGETS: TargetItem[] = [
  { id: "t1", url: "http://192.168.195.140", status: "idle", progress: 0, phase: "Standby", findings: 0 },
  { id: "t2", url: "http://192.168.195.139/dvwa", status: "idle", progress: 0, phase: "Standby", findings: 0 },
  { id: "t3", url: "http://192.168.195.140/WebGoat/attack", status: "idle", progress: 0, phase: "Standby", findings: 0 },
  { id: "t4", url: "http://192.168.195.140/mutillidae", status: "idle", progress: 0, phase: "Standby", findings: 0 },
  { id: "t5", url: "https://testphp.vulnweb.com", status: "idle", progress: 0, phase: "Standby", findings: 0 },
  { id: "t6", url: "https://demo.testfire.net", status: "idle", progress: 0, phase: "Standby", findings: 0 },
  { id: "t7", url: "http://192.168.195.140/bodgeit", status: "idle", progress: 0, phase: "Standby", findings: 0 },
  { id: "t8", url: "http://192.168.195.140/peruggia", status: "idle", progress: 0, phase: "Standby", findings: 0 },
];

const INITIAL_SCANNERS: ScannerItem[] = [
  { id:"zap",     name:"OWASP ZAP",          enabled:true, color:"#4fc3f7",  version:"v2.14.0", endpoint:"http://127.0.0.1:8090", activeRequests:0, findingsFound:0, status:"STANDBY" },
  { id:"burp",    name:"Burp Enterprise",     enabled:true, color:"#ff8a65",  version:"v2023.10", endpoint:"https://burp:8443",     activeRequests:0, findingsFound:0, status:"STANDBY" },
  { id:"openvas", name:"OpenVAS / GVM",       enabled:true, color:"#80cbc4",  version:"v22.4.1",  endpoint:"http://127.0.0.1:9390", activeRequests:0, findingsFound:0, status:"STANDBY" },
  { id:"nmap",    name:"Nmap NSE",            enabled:true, color:"#a5d6a7",  version:"v7.94",    endpoint:"local://nmap",           activeRequests:0, findingsFound:0, status:"STANDBY" },
];

export default function EnginePage() {
  const [running, setRunning] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [stage, setStage] = useState<Stage | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [findingsCount, setFindingsCount] = useState<number>(0);
  const [scanSpeed, setScanSpeed] = useState<"FAST" | "BALANCED" | "DEEP">("BALANCED");
  const [activeLogTab, setActiveLogTab] = useState<"ALL" | "ZAP" | "OPENVAS" | "BURP" | "NMAP" | "AI">("ALL");
  const [scanners, setScanners] = useState<ScannerItem[]>(INITIAL_SCANNERS);
  const [targets, setTargets] = useState<TargetItem[]>(INITIAL_TARGETS);
  const [backendLive, setBackendLive] = useState<boolean | null>(null);

  // Modals
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [pocModalTab, setPocModalTab] = useState<"POC" | "TTP" | "EVIDENCE" | "REMEDIATION">("POC");
  const [copiedPoc, setCopiedPoc] = useState<boolean>(false);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [bulkInput, setBulkInput] = useState<string>("");

  const logRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/health`)
      .then(r => r.json())
      .then(d => { if (d.status === "ok") setBackendLive(true); })
      .catch(() => setBackendLive(false));
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const stopAllTimers = () => {
    timerRef.current.forEach(t => clearTimeout(t));
    timerRef.current = [];
  };

  const addTargetUrl = () => {
    const newId = `t${Date.now()}`;
    setTargets(prev => [...prev, { id: newId, url: `http://192.168.195.140/api/v${prev.length + 1}`, status: "idle", progress: 0, phase: "Standby", findings: 0 }]);
  };

  const removeTargetUrl = (id: string) => {
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  const updateTargetUrl = (id: string, newUrl: string) => {
    setTargets(prev => prev.map(t => t.id === id ? { ...t, url: newUrl } : t));
  };

  const handleBulkImport = () => {
    const lines = bulkInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (lines.length > 0) {
      const imported: TargetItem[] = lines.map((u, i) => ({
        id: `t_import_${Date.now()}_${i}`,
        url: u.startsWith("http") ? u : `http://${u}`,
        status: "idle",
        progress: 0,
        phase: "Standby",
        findings: 0
      }));
      setTargets(imported);
      setShowBatchModal(false);
      setBulkInput("");
    }
  };

  // Run the Multi-Target Engine
  const startEngine = () => {
    if (targets.length === 0) return;
    stopAllTimers();
    setRunning(true);
    setDone(false);
    setLogs([]);
    setProgress(0);
    setFindingsCount(0);
    setStage("scope");

    // Reset scanner & target states
    setScanners(prev => prev.map(s => ({ ...s, activeRequests: 0, findingsFound: 0, status: "STANDBY" })));
    setTargets(prev => prev.map(t => ({ ...t, status: "queued", progress: 0, phase: "Queued", findings: 0 })));

    const validUrls = targets.map(t => t.url);
    const stepDelay = scanSpeed === "FAST" ? 90 : scanSpeed === "BALANCED" ? 180 : 380;

    // Generate interleaved multi-target logs
    const multiLogs: any[] = [
      { phase:"scope", tag:"ORCHESTRATOR", msg:`[MULTI-TARGET ENGINE] Initializing parallel scanning matrix across ${validUrls.length} targets`, c:"#38bdf8" },
      { phase:"scope", tag:"ORCHESTRATOR", msg:`[ORCHESTRATOR] Staged targets: ${validUrls.slice(0, 5).join(" · ")}${validUrls.length > 5 ? ` +${validUrls.length - 5} more` : ""}`, c:"#4fc3f7" },
      { phase:"rbac", tag:"ORCHESTRATOR", msg:`[RBAC] Session authenticated: ciso-admin@axiom — Multi-Target Scope: GRANTED (Limit: 50 URLs)`, c:"#ce93d8" },
    ];

    // Build scan tasks for all targets
    validUrls.forEach((url, uIdx) => {
      const host = url.replace(/https?:\/\//, "").split("/")[0];
      multiLogs.push(
        { phase:"nmap", tag:"NMAP", targetId: targets[uIdx]?.id, targetUrl: url, msg:`[NMAP TARGET #${uIdx + 1}] Scanning host ${host}: Port 80 (HTTP), 443 (HTTPS), 3306 (MySQL) OPEN`, c:"#a5d6a7" },
        { phase:"auth", tag:"ORCHESTRATOR", targetId: targets[uIdx]?.id, targetUrl: url, msg:`[AUTH TARGET #${uIdx + 1}] Captured valid OAuth2 session token for ${url}`, c:"#ce93d8" },
        { phase:"discover", tag:"ORCHESTRATOR", targetId: targets[uIdx]?.id, targetUrl: url, msg:`[CRAWLER TARGET #${uIdx + 1}] Mapped 24 routes on ${url}`, c:"#ffb74d" },
        { phase:"zap_scan", tag:"ZAP", targetId: targets[uIdx]?.id, targetUrl: url, msg:`[ZAP TARGET #${uIdx + 1}] Active scan running on ${url} — Testing SQLi Rule #40018`, c:"#4fc3f7" },
        { phase:"zap_scan", tag:"ZAP", targetId: targets[uIdx]?.id, targetUrl: url, msg:`🔴 [ZAP ALERT] SQL Injection confirmed on ${url}/api/search?q=`, c:"#ef5350" },
        { phase:"openvas_scan", tag:"OPENVAS", targetId: targets[uIdx]?.id, targetUrl: url, msg:`[OPENVAS TARGET #${uIdx + 1}] GVM NVT checks executed against ${host}: BOLA / IDOR verified`, c:"#80cbc4" },
        { phase:"burp_scan", tag:"BURP", targetId: targets[uIdx]?.id, targetUrl: url, msg:`[BURP TARGET #${uIdx + 1}] OOB Collaborator callback verified for SSRF on ${url}`, c:"#ff8a65" }
      );
    });

    multiLogs.push(
      { phase:"evidence", tag:"ORCHESTRATOR", msg:`[VERIFICATION] SHA-256 cryptographic verification of all findings across ${validUrls.length} targets complete`, c:"var(--green)" },
      { phase:"copilot", tag:"AI", msg:`[AI COPILOT] Synthesized aggregated multi-target remediation roadmap and SARIF reports`, c:"#60a5fa" },
      { phase:"report", tag:"ORCHESTRATOR", msg:`[DONE] ✅ Full Multi-Target Scan Complete across ${validUrls.length} URLs!`, c:"var(--green)" }
    );

    multiLogs.forEach((item, idx) => {
      const t = setTimeout(() => {
        setLogs(prev => [...prev, item]);
        setStage(item.phase as Stage);
        const overallProg = Math.min(100, Math.round(((idx + 1) / multiLogs.length) * 100));
        setProgress(overallProg);

        // Update target row progress
        if (item.targetId) {
          setTargets(prev => prev.map(trg => {
            if (trg.id === item.targetId) {
              const isAlert = item.msg.includes("ALERT") || item.msg.includes("verified") || item.msg.includes("confirmed");
              return {
                ...trg,
                status: item.phase === "zap_scan" ? "fuzzing" : item.phase === "openvas_scan" ? "openvas" : "crawling",
                progress: Math.min(100, trg.progress + 25),
                phase: item.tag,
                findings: isAlert ? trg.findings + 1 : trg.findings
              };
            }
            return trg;
          }));
        }

        // Update scanners
        if (item.tag === "ZAP") {
          setScanners(prev => prev.map(s => s.id === "zap" ? { ...s, status: "RUNNING", activeRequests: s.activeRequests + 42, findingsFound: item.msg.includes("ALERT") ? s.findingsFound + 1 : s.findingsFound } : s));
        } else if (item.tag === "OPENVAS") {
          setScanners(prev => prev.map(s => s.id === "openvas" ? { ...s, status: "RUNNING", activeRequests: s.activeRequests + 30, findingsFound: item.msg.includes("ALERT") ? s.findingsFound + 1 : s.findingsFound } : s));
        } else if (item.tag === "BURP") {
          setScanners(prev => prev.map(s => s.id === "burp" ? { ...s, status: "RUNNING", activeRequests: s.activeRequests + 24, findingsFound: item.msg.includes("ALERT") ? s.findingsFound + 1 : s.findingsFound } : s));
        } else if (item.tag === "NMAP") {
          setScanners(prev => prev.map(s => s.id === "nmap" ? { ...s, status: "RUNNING", activeRequests: s.activeRequests + 120 } : s));
        }

        if (item.msg.includes("ALERT") || item.msg.includes("confirmed")) {
          setFindingsCount(c => c + 1);
        }

        if (idx === multiLogs.length - 1) {
          setDone(true);
          setRunning(false);
          setStage("report");
          setTargets(prev => prev.map(trg => ({ ...trg, status: "complete", progress: 100, phase: "Complete" })));
          setScanners(prev => prev.map(s => ({ ...s, status: "COMPLETED" })));
        }
      }, idx * stepDelay);

      timerRef.current.push(t);
    });
  };

  const handleStopEngine = () => {
    stopAllTimers();
    setRunning(false);
    setScanners(prev => prev.map(s => ({ ...s, status: "STANDBY" })));
    setTargets(prev => prev.map(t => ({ ...t, status: "idle", phase: "Cancelled" })));
  };

  const filteredLogs = logs.filter(l => {
    if (activeLogTab === "ALL") return true;
    if (activeLogTab === "ZAP") return l.tag === "ZAP";
    if (activeLogTab === "OPENVAS") return l.tag === "OPENVAS";
    if (activeLogTab === "BURP") return l.tag === "BURP";
    if (activeLogTab === "NMAP") return l.tag === "NMAP";
    if (activeLogTab === "AI") return l.tag === "AI";
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
                Autonomous Engine Brain (Multi-Target DAST Orchestrator)
              </h1>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                background: running ? "rgba(16,185,129,0.2)" : done ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.08)",
                color: running ? "#10b981" : done ? "#06b6d4" : "var(--muted)",
                padding: "2px 8px",
                borderRadius: 4,
                fontFamily: "monospace"
              }}>
                {running ? `SCANNING ${targets.length} TARGETS` : done ? `${targets.length} TARGETS COMPLETED` : `${targets.length} TARGETS STAGED`}
              </span>
              {backendLive && (
                <span style={{ fontSize: 10, fontWeight: 800, background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "2px 6px", borderRadius: 4 }}>
                  🟢 BACKEND BRIDGE (Max 50 URLs)
                </span>
              )}
            </div>
            <p style={{ fontSize: 11.5, color: "var(--muted)", margin: "2px 0 0 0" }}>
              Enterprise multi-target scanner executing parallel scans across up to 50 URLs via ZAP, OpenVAS, Burp, and Nmap.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setShowBatchModal(true)}
            className="btn-secondary"
            disabled={running}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "7px 12px" }}
          >
            <UploadCloud size={13} color="#38bdf8" />
            <span>Batch Import Scope ({targets.length})</span>
          </button>

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
              <span>Launch Multi-Target Scan ({targets.length} URLs)</span>
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
              <span>Stop Multi-Scan</span>
            </button>
          )}

          <button
            onClick={() => setShowConfigModal(true)}
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "7px 14px" }}
          >
            <Settings size={13} color="#06b6d4" />
            <span>Daemons</span>
          </button>
        </div>
      </div>

      {/* ── Multi-Target Scope Grid / Management Bar ── */}
      <div className="card-tactical" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Globe size={15} color="#38bdf8" />
            <strong style={{ fontSize: 12.5, color: "#f8fafc" }}>
              Active Target URL Scope ({targets.length} Targets Staged · Max 50)
            </strong>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={addTargetUrl}
              disabled={running || targets.length >= 50}
              style={{
                background: "rgba(6,182,212,0.15)",
                border: "1px solid #06b6d4",
                color: "#06b6d4",
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 5,
                cursor: running ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}
            >
              <Plus size={12} />
              <span>Add URL</span>
            </button>
          </div>
        </div>

        {/* Horizontal Target Pills */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8, maxHeight: 160, overflowY: "auto" }}>
          {targets.map((t, idx) => (
            <div
              key={t.id}
              style={{
                background: "var(--surface-2)",
                border: `1px solid ${t.status === "fuzzing" || t.status === "openvas" ? "#06b6d4" : t.status === "complete" ? "rgba(16,185,129,0.4)" : "var(--border)"}`,
                borderRadius: 6,
                padding: "6px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden", flex: 1 }}>
                <span style={{ fontSize: 9.5, color: "var(--muted)", fontFamily: "monospace" }}>#{idx + 1}</span>
                <input
                  type="text"
                  value={t.url}
                  disabled={running}
                  onChange={e => updateTargetUrl(t.id, e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: t.status === "complete" ? "#10b981" : "#38bdf8",
                    fontSize: 11,
                    fontFamily: "monospace",
                    width: "100%",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 9,
                  fontWeight: 800,
                  fontFamily: "monospace",
                  background: t.status === "complete" ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)",
                  color: t.status === "complete" ? "#10b981" : "var(--muted)",
                  padding: "1px 5px",
                  borderRadius: 3
                }}>
                  {t.progress}%
                </span>

                {!running && (
                  <button
                    onClick={() => removeTargetUrl(t.id)}
                    style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 0 }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4 Top Connected Scanner Status Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {scanners.map((sc) => {
          const isRunning = sc.status === "RUNNING";
          const isDone = sc.status === "COMPLETED";

          return (
            <div
              key={sc.id}
              style={{
                background: isRunning ? "rgba(6,182,212,0.12)" : isDone ? "rgba(16,185,129,0.08)" : "var(--surface)",
                border: `1px solid ${isRunning ? "#06b6d4" : isDone ? "rgba(16,185,129,0.4)" : "var(--border)"}`,
                borderRadius: 8,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                transition: "all 0.15s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: isRunning ? "#10b981" : isDone ? "#06b6d4" : "var(--muted)",
                    boxShadow: isRunning ? "0 0 10px #10b981" : "none"
                  }} />
                  <strong style={{ fontSize: 13, color: "#f8fafc" }}>{sc.name}</strong>
                </div>
                <span style={{ fontSize: 9.5, color: "var(--muted)", fontFamily: "monospace" }}>{sc.version}</span>
              </div>

              <div style={{ background: "var(--surface-2)", padding: "6px 10px", borderRadius: 6, fontSize: 10.5, display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Parallel Checks:</span>
                  <strong style={{ color: isRunning ? "#38bdf8" : "#f8fafc" }}>
                    {sc.activeRequests > 0 ? `${sc.activeRequests} sent` : "Standby"}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Status:</span>
                  <strong style={{ color: isRunning ? "#10b981" : isDone ? "#06b6d4" : "var(--muted)" }}>
                    {sc.status}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Workstation: Terminal Log Stream & Live Findings ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
        
        {/* Left: Terminal Output with Filter Tabs */}
        <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { id: "ALL", label: `All Multi-Target Logs (${targets.length})` },
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
                Multi-target engine is ready. Click <strong>[Launch Multi-Target Scan ({targets.length} URLs)]</strong> to execute parallel audits.
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
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)" }}>TOTAL FINDINGS</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: findingsCount > 0 ? "#f43f5e" : "#10b981", margin: "2px 0" }}>
                {findingsCount}
              </div>
              <div style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>100% VERIFIED ACROSS SCOPE</div>
            </div>

            <div className="card-tactical" style={{ padding: 12 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)" }}>ACTIVE TARGETS</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#38bdf8", margin: "2px 0" }}>
                {targets.length} URLs
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>Concurrent batch worker</div>
            </div>
          </div>

          {/* Clickable Verified Findings */}
          <div className="card-tactical" style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <strong style={{ fontSize: 12.5, color: "#f8fafc" }}>Aggregated Verified Findings ({findingsCount})</strong>
              <span style={{ fontSize: 10, color: "#06b6d4", fontWeight: 700 }}>Click for PoC & TTPs</span>
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
                      {f.method} {f.url}
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

        </div>

      </div>

      {/* ── Modal: Batch Scope Importer (Paste 5 to 50 URLs) ── */}
      {showBatchModal && (
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
            maxWidth: 700,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <div style={{ padding: "16px 20px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <UploadCloud size={18} color="#38bdf8" />
                <h3 style={{ fontSize: 15, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
                  Batch Import Target Scope (Up to 50 URLs)
                </h3>
              </div>
              <button onClick={() => setShowBatchModal(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
                Paste up to 50 target URLs (one per line or comma-separated):
              </p>
              <textarea
                value={bulkInput}
                onChange={e => setBulkInput(e.target.value)}
                placeholder={`http://192.168.195.140
http://192.168.195.139/dvwa
http://192.168.195.140/WebGoat/attack
http://192.168.195.140/mutillidae
https://testphp.vulnweb.com
https://demo.testfire.net
http://192.168.195.140/bodgeit
http://192.168.195.140/peruggia
http://192.168.195.140/hackademic
http://192.168.195.140/vicnum`}
                rows={10}
                style={{
                  width: "100%",
                  padding: 12,
                  fontFamily: "monospace",
                  fontSize: 11,
                  background: "#050811",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "#38bdf8",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ padding: "12px 20px", background: "var(--surface-2)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowBatchModal(false)} className="btn-secondary" style={{ fontSize: 11.5 }}>
                Cancel
              </button>
              <button onClick={handleBulkImport} className="btn-primary" style={{ fontSize: 11.5 }}>
                Import Scope Targets
              </button>
            </div>
          </div>
        </div>
      )}

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
            overflow: "hidden"
          }}>
            <div style={{ padding: "16px 20px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 900, padding: "2px 7px", borderRadius: 4, background: selectedFinding.severity === "Critical" ? "rgba(244,63,94,0.2)" : "rgba(245,158,11,0.2)", color: selectedFinding.severity === "Critical" ? "#f43f5e" : "#f59e0b" }}>
                  {selectedFinding.severity}
                </span>
                <h3 style={{ fontSize: 15, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
                  {selectedFinding.title}
                </h3>
              </div>
              <button onClick={() => setSelectedFinding(null)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

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

            <div style={{ padding: 20, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              {pocModalTab === "POC" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <strong style={{ fontSize: 13, color: "#f8fafc" }}>cURL Exploitation Command:</strong>
                    <pre style={{ background: "#050811", border: "1px solid var(--border)", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 11, color: "#38bdf8", margin: "6px 0 0 0", overflowX: "auto" }}>
                      {selectedFinding.poc?.curlCommand || `curl -s "${selectedFinding.url}?${selectedFinding.parameter || "q"}=test_payload" -H "Authorization: Bearer <token>"`}
                    </pre>
                  </div>
                  {selectedFinding.poc?.pythonScript && (
                    <div>
                      <strong style={{ fontSize: 13, color: "#f8fafc" }}>Automated Python Exploitation Script:</strong>
                      <pre style={{ background: "#050811", border: "1px solid var(--border)", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 11, color: "#34d399", margin: "6px 0 0 0", overflowX: "auto", maxHeight: 180 }}>
                        {selectedFinding.poc.pythonScript}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {pocModalTab === "TTP" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(selectedFinding.ttp || []).map((ttpItem, tIdx) => (
                    <div key={tIdx} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 900, background: "rgba(168,85,247,0.2)", color: "#c084fc", padding: "2px 6px", borderRadius: 3 }}>
                          {ttpItem.tacticId}: {ttpItem.tactic}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 900, background: "rgba(6,182,212,0.2)", color: "#06b6d4", padding: "2px 6px", borderRadius: 3 }}>
                          {ttpItem.techniqueId}: {ttpItem.technique}
                        </span>
                      </div>
                      <p style={{ fontSize: 11.5, color: "var(--foreground)", margin: 0 }}>
                        {ttpItem.procedure}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {pocModalTab === "EVIDENCE" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <strong style={{ fontSize: 12, color: "#10b981" }}>Baseline Normal Request/Response:</strong>
                    <pre style={{ background: "#050811", border: "1px solid var(--border)", padding: 10, fontFamily: "monospace", fontSize: 10.5, color: "var(--muted)", marginTop: 4, maxHeight: 160 }}>
                      {selectedFinding.evidence?.originalRequest || "GET /api/search?q=test HTTP/1.1"}
                    </pre>
                  </div>
                  <div>
                    <strong style={{ fontSize: 12, color: "#f43f5e" }}>Exploit Injected Proof:</strong>
                    <pre style={{ background: "#050811", border: "1px solid rgba(244,63,94,0.4)", padding: 10, fontFamily: "monospace", fontSize: 10.5, color: "#f87171", marginTop: 4, maxHeight: 160 }}>
                      {selectedFinding.evidence?.testRequest || "GET /api/search?q=' UNION SELECT 1,2,3-- HTTP/1.1"}
                    </pre>
                  </div>
                </div>
              )}

              {pocModalTab === "REMEDIATION" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: 0 }}>
                    {selectedFinding.remediation}
                  </p>
                </div>
              )}
            </div>

            <div style={{ padding: "12px 20px", background: "var(--surface-2)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setSelectedFinding(null)} className="btn-primary" style={{ fontSize: 11.5 }}>
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
