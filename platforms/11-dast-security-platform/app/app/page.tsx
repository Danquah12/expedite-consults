"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Shield, Swords, Zap, Activity, AlertTriangle, CheckCircle, Terminal,
  Layers, Play, Copy, Check, Download, RefreshCw, Filter, Search,
  ExternalLink, Eye, ChevronRight, Server, Globe, Lock, Cpu, Bot,
  MessageSquare, Flame, Radio, Code2, Sparkles, Send, FileCode, CheckSquare
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
      text: "⚡ **ÆGIS Cyber AI Analyst initialized.** I have indexed all findings across target `" + selectedTarget.host + "`. What would you like to investigate? I can generate cURL reproduction scripts, calculate CVSS 3.1 blast radius, or craft WAF virtual patches."
    }
  ]);

  // Real-time telemetry
  const [telemetry, setTelemetry] = useState({ reqPerSec: 164, latency: 12, memoryUsage: "412 MB", blockedProbes: 89 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => ({
        reqPerSec: Math.floor(140 + Math.random() * 50),
        latency: Math.floor(10 + Math.random() * 8),
        memoryUsage: "418 MB",
        blockedProbes: prev.blockedProbes + (Math.random() > 0.7 ? 1 : 0)
      }));
    }, 2500);
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

  const handleSendAiMessage = () => {
    if (!aiPrompt.trim()) return;
    const userText = aiPrompt;
    setAiMessages(prev => [...prev, { role: "user", text: userText }]);
    setAiPrompt("");

    setTimeout(() => {
      let reply = "";
      if (userText.toLowerCase().includes("curl") || userText.toLowerCase().includes("poc")) {
        reply = "```bash\n# Verified PoC exploit script against " + selectedTarget.host + "\ncurl -X POST 'https://" + selectedTarget.host + "/api/v2/auth/login' \\\n  -H 'Content-Type: application/json' \\\n  -H 'X-Forwarded-For: 127.0.0.1' \\\n  -d '{\"username\": \"admin' OR '1'='1\", \"password\": \"bypass\"}'\n```\n**Impact**: Bypasses rate limiting and executes boolean-based blind SQLi injection on underlying PostgreSQL cluster.";
      } else if (userText.toLowerCase().includes("waf") || userText.toLowerCase().includes("patch")) {
        reply = "```nginx\n# Nginx WAF Virtual Patch for " + selectedTarget.host + "\nlocation /api/v2/auth {\n    if ($request_body ~* \"(union|select|insert|update|delete|drop|or\\s+1=1)\") {\n        return 403;\n    }\n    proxy_pass http://backend_pool;\n}\n```\nRecommended deployment: Push to Cloudflare/AWS WAF via Platform 18 Unified Integration Layer.";
      } else {
        reply = "Target `" + selectedTarget.host + "` presents **3 Critical Vulnerabilities** (CVE-2025-2490 SQLi, JWT Algorithm Confusion, SSRF to AWS Metadata `169.254.169.254`). Recommended remediation order: Restrict IAM Role session, enforce HS256/RS256 strict verification, and parameterize database queries.";
      }
      setAiMessages(prev => [...prev, { role: "assistant", text: reply }]);
    }, 600);
  };

  const filteredFindings = FINDINGS.filter((f: any) => {
    const matchSev = filterSev === "ALL" || f.severity === filterSev;
    const targetUrl = f.url || f.target || "";
    const matchQuery = !searchQuery || f.title.toLowerCase().includes(searchQuery.toLowerCase()) || targetUrl.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSev && matchQuery;
  });

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "radial-gradient(ellipse at 50% 0%, rgba(225, 29, 72, 0.08) 0%, #06080d 75%)",
      color: "#e2e8f0", overflow: "hidden"
    }}>

      {/* Top SOC Status & Tactical Bar */}
      <div style={{
        padding: "12px 18px", borderBottom: "1px solid var(--border)",
        background: "rgba(11, 15, 23, 0.9)", backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexShrink: 0
      }}>
        {/* Left Target & Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #e11d48, #be123c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(225, 29, 72, 0.5)"
            }}>
              <Swords size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                ÆGIS · SOC
                <span style={{ fontSize: 9, background: "rgba(225,29,72,0.2)", color: "#ff4d79", border: "1px solid rgba(225,29,72,0.4)", borderRadius: 4, padding: "1px 6px", fontWeight: 800 }}>
                  LIVE COMMAND
                </span>
              </div>
              <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700 }}>DAST INTELLIGENCE & ATTACK SIMULATOR</div>
            </div>
          </div>

          <div style={{ height: 24, width: 1, background: "var(--border)" }} />

          {/* Target Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Server size={14} color="#00f0ff" />
            <select
              value={selectedTarget.host}
              onChange={e => {
                const found = SAMPLE_TARGETS.find(t => t.host === e.target.value);
                if (found) setSelectedTarget(found);
              }}
              style={{
                background: "rgba(6, 8, 13, 0.85)", border: "1px solid var(--border-2)",
                color: "#00f0ff", fontSize: 11.5, fontWeight: 700, padding: "5px 10px", borderRadius: 6,
                outline: "none", cursor: "pointer", fontFamily: "var(--font-geist-mono)"
              }}
            >
              {SAMPLE_TARGETS.map(t => (
                <option key={t.host} value={t.host} style={{ background: "#0b0f17", color: "#fff" }}>
                  {t.host} ({t.env})
                </option>
              ))}
            </select>
            <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-geist-mono)" }}>
              {selectedTarget.ip}
            </span>
          </div>
        </div>

        {/* Center Live Telemetry Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0, 240, 255, 0.08)", border: "1px solid rgba(0, 240, 255, 0.25)", padding: "4px 10px", borderRadius: 6 }}>
            <Activity size={12} color="#00f0ff" />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#00f0ff", fontFamily: "var(--font-geist-mono)" }}>
              {telemetry.reqPerSec} REQ/S
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "4px 10px", borderRadius: 6 }}>
            <span className="beacon-green" />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", fontFamily: "var(--font-geist-mono)" }}>
              {telemetry.latency}ms LATENCY
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", padding: "4px 10px", borderRadius: 6 }}>
            <Lock size={12} color="#f59e0b" />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", fontFamily: "var(--font-geist-mono)" }}>
              OOB LISTENER: 247/247
            </span>
          </div>
        </div>

        {/* Right Scan Action & DEFCON */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* DEFCON Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(6, 8, 13, 0.8)", padding: "3px 6px", borderRadius: 6, border: "1px solid var(--border)" }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: "var(--muted)", marginRight: 2 }}>DEFCON</span>
            {[1, 2, 3, 4, 5].map(d => (
              <button
                key={d}
                onClick={() => setActiveDefcon(d)}
                style={{
                  width: 18, height: 18, borderRadius: 3, border: "none", fontSize: 9, fontWeight: 900,
                  cursor: "pointer",
                  background: activeDefcon === d ? (d <= 2 ? "#e11d48" : d === 3 ? "#f59e0b" : "#10b981") : "rgba(255,255,255,0.06)",
                  color: activeDefcon === d ? "#fff" : "var(--muted)"
                }}
              >
                {d}
              </button>
            ))}
          </div>

          <button
            onClick={handleTriggerScan}
            disabled={isScanning}
            className="btn-primary"
            style={{ padding: "6px 14px", fontSize: 11.5 }}
          >
            {isScanning ? (
              <>
                <RefreshCw size={13} className="animate-spin" /> Scanning Stage {activeStage}/4 ({scanProgress}%)
              </>
            ) : (
              <>
                <Play size={13} /> Launch 4-Stage Scan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Suite Sub-Bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 18px", borderBottom: "1px solid var(--border)", background: "rgba(11, 15, 23, 0.6)",
        flexShrink: 0
      }}>
        <div className="tab-bar" style={{ border: "none", background: "transparent" }}>
          <button
            onClick={() => setActiveTab("matrix")}
            className={`tab-item ${activeTab === "matrix" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: 6, borderRight: "1px solid var(--border)" }}
          >
            <Shield size={13} /> Threat Matrix & Risk Radar
          </button>
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`tab-item ${activeTab === "pipeline" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: 6, borderRight: "1px solid var(--border)" }}
          >
            <Layers size={13} /> 4-Stage Live Attack Pipeline
          </button>
          <button
            onClick={() => setActiveTab("forge")}
            className={`tab-item ${activeTab === "forge" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: 6, borderRight: "1px solid var(--border)" }}
          >
            <Flame size={13} /> Traffic Interceptor & Forge
          </button>
          <button
            onClick={() => setActiveTab("copilot")}
            className={`tab-item ${activeTab === "copilot" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: 6, borderRight: "1px solid var(--border)" }}
          >
            <Bot size={13} color="#00f0ff" /> Autonomous AI Copilot
          </button>
          <button
            onClick={() => setActiveTab("evidence")}
            className={`tab-item ${activeTab === "evidence" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <FileCode size={13} /> Evidence Vault & Reports
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/live-scan" style={{ fontSize: 11, color: "var(--muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            <span>Full Engine Grid</span> <ExternalLink size={11} />
          </Link>
        </div>
      </div>

      {/* Main Studio View Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

        {/* TAB 1: THREAT MATRIX & RISK RADAR */}
        {activeTab === "matrix" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Top Metric Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              <div className="cyber-card-crimson" style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#ff4d79", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Critical Exploits
                  </span>
                  <AlertTriangle size={16} color="#ef4444" />
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1 }}>5</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>Immediate RCE & Blind SQLi active</div>
              </div>

              <div className="cyber-card" style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    High Vulnerabilities
                  </span>
                  <Zap size={16} color="#f59e0b" />
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1 }}>12</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>BOLA, IDOR & SSRF vectors</div>
              </div>

              <div className="cyber-card" style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#00f0ff", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Verified PoCs
                  </span>
                  <CheckSquare size={16} color="#00f0ff" />
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1 }}>100%</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>Zero false positives (OAST verified)</div>
              </div>

              <div className="cyber-card" style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Attack Surface
                  </span>
                  <Globe size={16} color="#10b981" />
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1 }}>48 Endpoints</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>12 API routes · 36 Web endpoints</div>
              </div>
            </div>

            {/* Split Threat Workspace */}
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16 }}>
              {/* Left: Interactive Findings Matrix */}
              <div className="tool-panel">
                <div className="tool-panel-header" style={{ justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Shield size={14} color="#e11d48" />
                    <span>Real-Time Vulnerability Stream</span>
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {["ALL", "Critical", "High", "Medium"].map(sev => (
                      <button
                        key={sev}
                        onClick={() => setFilterSev(sev)}
                        style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                          background: filterSev === sev ? "rgba(225,29,72,0.25)" : "transparent",
                          color: filterSev === sev ? "#fff" : "var(--muted)",
                          border: `1px solid ${filterSev === sev ? "rgba(225,29,72,0.5)" : "var(--border)"}`,
                          cursor: "pointer"
                        }}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ padding: 10, borderBottom: "1px solid var(--border)" }}>
                  <div style={{ position: "relative" }}>
                    <Search size={13} style={{ position: "absolute", left: 10, top: 9, color: "var(--muted)" }} />
                    <input
                      type="text"
                      placeholder="Filter findings by CVE, CWE, or endpoint..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%", background: "#06080d", border: "1px solid var(--border)",
                        borderRadius: 6, padding: "6px 10px 6px 30px", fontSize: 11.5, color: "#fff",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                <div style={{ maxHeight: 380, overflowY: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Severity</th>
                        <th>Vulnerability</th>
                        <th>Target Endpoint</th>
                        <th>CWE / CVE</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFindings.map((f: any) => (
                        <tr
                          key={f.id}
                          className={selectedFinding.id === f.id ? "selected" : ""}
                          onClick={() => setSelectedFinding(f)}
                        >
                          <td>
                            <span style={{
                              fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4,
                              background: f.severity === "Critical" ? "rgba(239,68,68,0.2)" : f.severity === "High" ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)",
                              color: f.severity === "Critical" ? "#ef4444" : f.severity === "High" ? "#f59e0b" : "#10b981",
                              border: `1px solid ${f.severity === "Critical" ? "rgba(239,68,68,0.4)" : f.severity === "High" ? "rgba(245,158,11,0.4)" : "rgba(16,185,129,0.4)"}`
                            }}>
                              {f.severity}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, color: "#fff" }}>{f.title}</td>
                          <td style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, color: "var(--fg-2)" }}>{f.url || f.target || ""}</td>
                          <td style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, color: "#00f0ff" }}>{f.cweId || f.cwe || "CWE-89"}</td>
                          <td>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedFinding(f); setActiveTab("forge"); }}
                              className="btn-cyan"
                              style={{ padding: "3px 8px", fontSize: 10.5 }}
                            >
                              Forge PoC
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Deep Finding Inspection Drawer */}
              <div className="cyber-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#00f0ff", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Finding Detail Inspector
                    </span>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginTop: 2 }}>{selectedFinding.title}</h3>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 4,
                    background: "rgba(239,68,68,0.2)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.5)"
                  }}>
                    CVSS {selectedFinding.cvss || "9.8"}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                  {selectedFinding.description || "The target parameter does not sanitize user inputs prior to executing backend database queries, enabling unauthenticated remote command execution."}
                </div>

                {/* Evidence Code Box */}
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Proof of Concept Payload</span>
                    <button
                      onClick={() => handleCopy(selectedFinding.evidence?.payload || selectedFinding.payload || "admin' OR 1=1--", "payload")}
                      style={{ fontSize: 10, color: "#00f0ff", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
                    >
                      {copiedId === "payload" ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
                      {copiedId === "payload" ? "Copied" : "Copy Payload"}
                    </button>
                  </div>
                  <pre className="http-raw" style={{ maxHeight: 110 }}>
                    {selectedFinding.evidence?.testRequest || selectedFinding.payload || "POST /api/v2/auth/login HTTP/1.1\nHost: " + selectedTarget.host + "\nContent-Type: application/json\n\n{\"user\": \"admin' OR '1'='1\", \"pass\": \"x\"}"}
                  </pre>
                </div>

                {/* Remediation & 1-Click Action */}
                <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { setActiveTab("copilot"); setAiPrompt("Generate an emergency WAF virtual patch for " + selectedFinding.title); }}
                    className="btn-cyan"
                    style={{ flex: 1 }}
                  >
                    <Bot size={13} /> Ask AI Remediation
                  </button>
                  <button
                    onClick={() => handleCopy(JSON.stringify(selectedFinding, null, 2), "json")}
                    className="btn-secondary"
                  >
                    <Download size={13} /> Export SARIF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 4-STAGE ATTACK PIPELINE */}
        {activeTab === "pipeline" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="cyber-card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Automated 4-Stage DAST Pipeline Flow</h3>
                  <p style={{ fontSize: 11.5, color: "var(--muted)" }}>Autonomous progression from initial port enumeration to proof-of-exploit verification.</p>
                </div>
                <button onClick={handleTriggerScan} disabled={isScanning} className="btn-primary">
                  <Play size={13} /> Run Live Pipeline
                </button>
              </div>

              {/* Visual Stages Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  {
                    num: 1, title: "Stage 1: Recon & Spider", desc: "Nmap port mapper + ZAP dynamic web crawler discovering all routes.",
                    badge: "Nmap / ZAP", status: activeStage >= 1 ? "Complete" : "Pending"
                  },
                  {
                    num: 2, title: "Stage 2: Active Fuzzing", desc: "OWASP Top 10 injection engine testing SQLi, XSS, SSRF, & JWT flaws.",
                    badge: "Fuzz Matrix", status: activeStage >= 2 ? "Complete" : "Pending"
                  },
                  {
                    num: 3, title: "Stage 3: Proof-of-Exploit", desc: "OAST out-of-band callback verification and privilege escalation check.",
                    badge: "OAST / Burp", status: activeStage >= 3 ? "Complete" : "Pending"
                  },
                  {
                    num: 4, title: "Stage 4: SIEM Dispatch", desc: "Automated SARIF generation, JIRA ticket filing, and WAF virtual patches.",
                    badge: "SARIF / SOAR", status: activeStage >= 4 ? "Complete" : "Pending"
                  }
                ].map(s => (
                  <div key={s.num} style={{
                    padding: 14, borderRadius: 8, background: "rgba(6, 8, 13, 0.9)",
                    border: `1px solid ${activeStage >= s.num ? "rgba(225,29,72,0.4)" : "var(--border)"}`,
                    boxShadow: activeStage >= s.num ? "0 0 15px rgba(225,29,72,0.15)" : "none"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: activeStage >= s.num ? "#ff4d79" : "var(--muted)" }}>STAGE {s.num}</span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
                        background: activeStage >= s.num ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)",
                        color: activeStage >= s.num ? "#10b981" : "var(--muted)"
                      }}>
                        {s.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline Execution Log Stream */}
            <div className="tool-panel">
              <div className="tool-panel-header">
                <Terminal size={14} color="#10b981" />
                <span>Live Execution Terminal Stream</span>
              </div>
              <pre className="http-raw" style={{ height: 220, fontSize: 11 }}>
{`[INFO] [00:00:01] Engine Dispatch: Target initialized at ${selectedTarget.host} (${selectedTarget.ip})
[STAGE 1] Running Nmap Port Enumeration: Discovered ports 80, 443, 8080, 8443 OPEN
[STAGE 1] Spawning ZAP Spider: Crawling 48 endpoints across /api/v2, /auth, /billing, /internal
[STAGE 2] Fuzzing Engine Engaged: Injecting 2,400 payloads across query & body parameters
[ALERT] Vulnerability Triggered: SQL Injection found on /api/v2/auth/login (Parameter 'username')
[STAGE 3] Proof-of-Exploit Verification: OAST callback received on aegis-oob.net from ${selectedTarget.ip}
[STAGE 4] Findings Consolidated: 5 Critical, 12 High, 8 Medium registered into Evidence Vault
[STAGE 4] Dispatching SARIF report to Unified Integration Layer (Platform 18) ... OK (200)`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: TRAFFIC INTERCEPTOR & FORGE */}
        {activeTab === "forge" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Left: Request Forge */}
            <div className="tool-panel">
              <div className="tool-panel-header" style={{ justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Flame size={14} color="#f59e0b" />
                  <span>Interactive HTTP Attack Forge</span>
                </div>
                <button className="btn-primary" style={{ padding: "3px 10px", fontSize: 10.5 }}>
                  <Send size={11} /> Send Request
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
                style={{
                  width: "100%", height: 380, background: "#06080d", color: "#38bdf8",
                  fontFamily: "var(--font-geist-mono)", fontSize: 11.5, padding: 14,
                  border: "none", outline: "none", resize: "none", lineHeight: 1.6
                }}
              />
            </div>

            {/* Right: Response Terminal */}
            <div className="tool-panel">
              <div className="tool-panel-header" style={{ justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Code2 size={14} color="#10b981" />
                  <span>Live Server Response (Status 200 OK)</span>
                </div>
                <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>248ms · 842 Bytes</span>
              </div>
              <pre className="http-raw" style={{ height: 380, margin: 0, borderRadius: 0, border: "none" }}>
{`HTTP/1.1 200 OK
Date: Fri, 19 Sep 2026 18:30:12 GMT
Content-Type: application/json; charset=utf-8
Server: nginx/1.24.0 (Ubuntu)
Access-Control-Allow-Origin: *

{
  "status": "authenticated",
  "jwt": "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlIjoic3VwZXJhZG1pbiIsImRiX3ZlcnNpb24iOiJQb3N0Z3JlU1FMIDE1LjQtMVVidW50dTEifQ.",
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

        {/* TAB 4: AUTONOMOUS AI COPILOT */}
        {activeTab === "copilot" && (
          <div className="cyber-card" style={{ padding: 18, height: 480, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(0, 240, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0, 240, 255, 0.4)" }}>
                <Bot size={16} color="#00f0ff" />
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Autonomous Cyber AI Copilot</h3>
                <p style={{ fontSize: 11, color: "var(--muted)" }}>Real-time exploit generation, virtual patch builder, and ATT&CK mapping</p>
              </div>
            </div>

            {/* Chat message stream */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 0", display: "flex", flexDirection: "column", gap: 12 }}>
              {aiMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    background: msg.role === "user" ? "rgba(225, 29, 72, 0.15)" : "rgba(11, 15, 23, 0.9)",
                    border: `1px solid ${msg.role === "user" ? "rgba(225, 29, 72, 0.4)" : "var(--border)"}`,
                    borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#fff", lineHeight: 1.5
                  }}
                >
                  <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
                </div>
              ))}
            </div>

            {/* Input prompt bar */}
            <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <input
                type="text"
                placeholder="Ask AI Copilot: 'Generate cURL PoC', 'Explain SQLi impact', 'Draft WAF rule'..."
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSendAiMessage(); }}
                style={{
                  flex: 1, background: "#06080d", border: "1px solid var(--border)",
                  borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "#fff", outline: "none"
                }}
              />
              <button onClick={handleSendAiMessage} className="btn-cyan">
                <Send size={13} /> Send
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: EVIDENCE VAULT */}
        {activeTab === "evidence" && (
          <div className="tool-panel">
            <div className="tool-panel-header" style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileCode size={14} color="#00f0ff" />
                <span>SARIF 2.1 & Enterprise Vulnerability Report Ledger</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleCopy(JSON.stringify(FINDINGS, null, 2), "sarif")} className="btn-cyan" style={{ padding: "4px 10px", fontSize: 11 }}>
                  <Copy size={11} /> {copiedId === "sarif" ? "Copied" : "Copy SARIF JSON"}
                </button>
                <a href="https://18-unified-integration-layer.vercel.app" target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: "4px 10px", fontSize: 11, textDecoration: "none" }}>
                  <ExternalLink size={11} /> Dispatch to SIEM
                </a>
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Severity</th>
                  <th>Vulnerability Title</th>
                  <th>Endpoint</th>
                  <th>CWE</th>
                  <th>Confidence</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {FINDINGS.map((f: any) => (
                  <tr key={f.id}>
                    <td style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11 }}>{f.id}</td>
                    <td>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4,
                        background: f.severity === "Critical" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)",
                        color: f.severity === "Critical" ? "#ef4444" : "#f59e0b"
                      }}>
                        {f.severity}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: "#fff" }}>{f.title}</td>
                    <td style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11 }}>{f.url || f.target || ""}</td>
                    <td style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, color: "#00f0ff" }}>{f.cweId || f.cwe || "CWE-89"}</td>
                    <td style={{ fontWeight: 700, color: "#ff4d79" }}>{f.confidence || "Confirmed"}</td>
                    <td>
                      <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle size={11} /> Confirmed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AegisSocStandalonePage() {
  return (
    <Suspense fallback={<div style={{ padding: 30, color: "#fff", background: "#06080d" }}>Initializing ÆGIS · SOC Command Matrix...</div>}>
      <AegisSocContent />
    </Suspense>
  );
}
