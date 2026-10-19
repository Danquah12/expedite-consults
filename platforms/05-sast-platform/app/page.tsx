"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Shield, Sparkles, Cpu, Layers, GitGraph, Box, Terminal, Bot, ArrowRight, 
  CheckCircle2, AlertTriangle, Zap, Code2, Lock, Flame, Server, RefreshCw,
  GitPullRequest, Play, Pause, ChevronLeft, ChevronRight
} from "lucide-react";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      id: "risk-posture",
      badge: "LIVE RISK POSTURE",
      title: "XTRIKE One Risk & Fixability",
      content: (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3a404c" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3a404c" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3a404c" }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: "#4a4239", marginLeft: 6, letterSpacing: "0.05em" }}>
                XTRIKE SAST RISK POSTURE
              </span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#46a36e", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#46a36e", display: "inline-block" }} />
              LIVE TELEMETRY
            </span>
          </div>

          <div style={{
            background: "#ece5d8",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16
          }}>
            <div style={{
              background: "#8b4528",
              color: "#f3eee4",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 900
            }}>
              TACKLE TODAY &rarr;
            </div>
            <div style={{ display: "flex", gap: 10, fontSize: 10.5, fontWeight: 800 }}>
              <span style={{ color: "#e5484d" }}>37 Critical</span>
              <span style={{ color: "#e2853b" }}>45 Urgent</span>
              <span style={{ color: "#5c5349" }}>13 Pending</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
            <div style={{ background: "#f3eee4", padding: 10, borderRadius: 10, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
                Vulnerabilities By Risk
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 85, padding: "0 6px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#e5484d" }}>37</div>
                  <div style={{ width: 14, height: 60, background: "#e5484d", borderRadius: "3px 3px 0 0" }} />
                  <div style={{ fontSize: 8.5, color: "var(--muted)", marginTop: 2 }}>CRIT</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#e2853b" }}>45</div>
                  <div style={{ width: 14, height: 75, background: "#e2853b", borderRadius: "3px 3px 0 0" }} />
                  <div style={{ fontSize: 8.5, color: "var(--muted)", marginTop: 2 }}>HIGH</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#d6a847" }}>34</div>
                  <div style={{ width: 14, height: 48, background: "#d6a847", borderRadius: "3px 3px 0 0" }} />
                  <div style={{ fontSize: 8.5, color: "var(--muted)", marginTop: 2 }}>MED</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#8b4528" }}>28</div>
                  <div style={{ width: 14, height: 35, background: "#8b4528", borderRadius: "3px 3px 0 0" }} />
                  <div style={{ fontSize: 8.5, color: "var(--muted)", marginTop: 2 }}>LOW</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#8b4528" }}>22</div>
                  <div style={{ width: 14, height: 26, background: "#8b4528", borderRadius: "3px 3px 0 0" }} />
                  <div style={{ fontSize: 8.5, color: "var(--muted)", marginTop: 2 }}>INFO</div>
                </div>
              </div>
            </div>

            <div style={{ background: "#f3eee4", padding: 10, borderRadius: 10, border: "1px solid var(--border)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>Fixability</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                  width: 75,
                  height: 75,
                  borderRadius: "50%",
                  border: "6px solid #e2853b",
                  borderTopColor: "#e5484d",
                  borderRightColor: "#46a36e",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#1f1b18" }}>1,218</div>
                  <div style={{ fontSize: 7.5, color: "var(--muted)" }}>TOTAL</div>
                </div>
              </div>
              <div style={{ fontSize: 9, display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ color: "#4a4239" }}>&bull; Requires attention: <span style={{ color: "#e5484d" }}>24%</span></div>
                <div style={{ color: "#4a4239" }}>&bull; 1-Click Easy Fix: <span style={{ color: "#46a36e" }}>76%</span></div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "fusion-engine",
      badge: "HYBRID FUSION ENGINE",
      title: "Deterministic AST + XTRIKE Neural-Triage",
      content: (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#8b4528" }}>Real-time Hybrid Scan</div>
            <span style={{ fontSize: 10, color: "#46a36e", fontWeight: 800, background: "rgba(70, 163, 110, 0.15)", padding: "2px 6px", borderRadius: 4 }}>
              94.2% False Positives Eliminated
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ background: "#f3eee4", padding: 10, borderRadius: 8, border: "1px solid rgba(70, 163, 110, 0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800 }}>
                <span style={{ color: "#1f1b18" }}>FUS-02 &middot; SSRF in WebhookDispatcher</span>
                <span style={{ color: "#46a36e" }}>FALSE POSITIVE CUT</span>
              </div>
              <div style={{ fontSize: 10, color: "#5c5349", marginTop: 4 }}>
                XTRIKE Neural-Triage v4 verified private subnet filter at L82 blocks cloud metadata 169.254.169.254.
              </div>
            </div>

            <div style={{ background: "#f3eee4", padding: 10, borderRadius: 8, border: "1px solid rgba(229, 72, 77, 0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800 }}>
                <span style={{ color: "#1f1b18" }}>FUS-01 &middot; SQL Injection in Profile</span>
                <span style={{ color: "#e5484d" }}>CONFIRMED EXPLOITABLE</span>
              </div>
              <div style={{ fontSize: 10, color: "#5c5349", marginTop: 4 }}>
                Direct parameter concatenation without parameterized query. 1-Click PR Fix generated.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "developer-assist",
      badge: "AGENTIC 1-CLICK FIX",
      title: "Automated Git PR & Test Diff Generator",
      content: (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#1f1b18" }}>authController.ts &middot; CWE-89 Patch</div>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "#f4e5dc", color: "#8b4528" }}>
              PR #104 READY
            </span>
          </div>

          <pre style={{
            background: "#f3eee4",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 10,
            fontSize: 10.5,
            fontFamily: "monospace",
            color: "#1f1b18",
            lineHeight: 1.4,
            marginBottom: 8
          }}>
{`- const query = "SELECT * FROM users WHERE id = '" + id + "'";
+ const query = 'SELECT * FROM users WHERE id = $1';
+ return await db.query(query, [id]);`}
          </pre>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 10, color: "#46a36e" }}>&check; XTRIKE regression test generated</div>
            <button style={{ background: "#8b4528", border: "none", color: "#f3eee4", fontSize: 10.5, fontWeight: 900, padding: "4px 10px", borderRadius: 4 }}>
              Merge Pull Request
            </button>
          </div>
        </div>
      )
    },
    {
      id: "ai-bom",
      badge: "AI SUPPLY CHAIN",
      title: "AI-BOM & Model Weight Inventory",
      content: (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#1f1b18" }}>Model Lineage &amp; Tool Protection</div>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#8b4528" }}>1,420 Assets Scanned</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", background: "#f3eee4", padding: "8px 10px", borderRadius: 6, fontSize: 10.5 }}>
              <span style={{ color: "#1f1b18", fontWeight: 700 }}>xtrike-llm/Core-8B-Instruct</span>
              <span style={{ color: "#46a36e", fontWeight: 800 }}>Safetensors (Clean)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", background: "#f3eee4", padding: "8px 10px", borderRadius: 6, fontSize: 10.5 }}>
              <span style={{ color: "#1f1b18", fontWeight: 700 }}>xtrike-rag-agent-v2</span>
              <span style={{ color: "#e5484d", fontWeight: 800 }}>Indirect Prompt Injection</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", background: "#f3eee4", padding: "8px 10px", borderRadius: 6, fontSize: 10.5 }}>
              <span style={{ color: "#1f1b18", fontWeight: 700 }}>mcp-filesystem-server-v1</span>
              <span style={{ color: "#e2853b", fontWeight: 800 }}>Tool Path Traversal Guard</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "mcp-server",
      badge: "IDE INTEGRATION",
      title: "Model Context Protocol (MCP) Server Hub",
      content: (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#8b4528" }}>XTRIKE IDE &amp; Desktop Endpoint</div>
            <span style={{ fontSize: 10, color: "#46a36e", fontWeight: 800 }}>CONNECTED</span>
          </div>

          <pre style={{
            background: "#f3eee4",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 10,
            fontSize: 10.5,
            fontFamily: "monospace",
            color: "#8b4528",
            lineHeight: 1.4
          }}>
{`{
  "mcpServers": {
    "xtrike-sast": {
      "command": "npx @xtrike/mcp-sast",
      "tools": ["scan_buffer", "apply_patch"]
    }
  }
}`}
          </pre>
        </div>
      )
    }
  ];

  // Auto-advance carousel every 5 seconds unless paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {/* Hero Section with Dynamic Feature Carousel */}
      <section style={{ position: "relative", overflow: "hidden", padding: "60px 20px 60px 20px" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 36, alignItems: "center" }}>
          
          {/* Left Column: Headlines & CTAs */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 14px", borderRadius: 50, background: "#f4e5dc", border: "1px solid var(--border)", marginBottom: 18 }}>
              <Sparkles size={13} color="#8b4528" />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "#8b4528", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                THE AGENTIC CODE SECURITY PLATFORM
              </span>
            </div>

            <h1 style={{ fontSize: "clamp(34px, 4.2vw, 56px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 18, color: "#1f1b18" }}>
              AI Generates Code. <br />
              <span style={{
                background: "#8b4528",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                XTRIKE SAST Secures It.
              </span>
            </h1>

            <p style={{ fontSize: 16, color: "#5c5349", lineHeight: 1.6, marginBottom: 28, maxWidth: 580 }}>
              The Agentic Application Security Platform combining hybrid AST scanning, XTRIKE AI triage agents, and unified risk intelligence across every code repository.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link
                href="/fusion-engine"
                style={{
                  background: "#8b4528",
                  color: "#f3eee4",
                  padding: "13px 26px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "none"
                }}
              >
                <span>Launch Fusion Engine</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                href="/developer-assist"
                style={{
                  background: "#fbf8f3",
                  color: "#8b4528",
                  border: "1px solid var(--border)",
                  padding: "13px 24px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <Bot size={16} />
                <span>Ask Developer Assist</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Dynamic Auto-Advancing Feature Carousel */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
              background: "#fbf8f3",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(20px)",
              minHeight: 330,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            {/* Top Slide Tab Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(idx)}
                    style={{
                      background: currentSlide === idx ? "#f4e5dc" : "#ece5d8",
                      border: currentSlide === idx ? "1px solid #8b4528" : "1px solid var(--border)",
                      color: currentSlide === idx ? "#8b4528" : "#5c5349",
                      padding: "3px 8px",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 800,
                      cursor: "pointer"
                    }}
                  >
                    {s.badge}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsPaused(!isPaused)}
                style={{ background: "transparent", border: "none", color: "#5c5349", cursor: "pointer", display: "flex", alignItems: "center" }}
                title={isPaused ? "Resume Auto-Slide" : "Pause Auto-Slide"}
              >
                {isPaused ? <Play size={12} /> : <Pause size={12} />}
              </button>
            </div>

            {/* Slide Body */}
            <div style={{ minHeight: 200 }}>
              {slides[currentSlide].content}
            </div>

            {/* Carousel Pagination Dots & Nav Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
              <button
                onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
                style={{ background: "transparent", border: "none", color: "#5c5349", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {slides.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    style={{
                      width: currentSlide === idx ? 20 : 6,
                      height: 6,
                      borderRadius: 3,
                      background: currentSlide === idx ? "#8b4528" : "#f4e5dc",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                style={{ background: "transparent", border: "none", color: "#5c5349", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Bar */}
      <section style={{ maxWidth: 1360, margin: "0 auto 60px auto", padding: "0 20px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          background: "#fbf8f3",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "20px 24px",
          backdropFilter: "blur(16px)"
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>False-Positive Cut</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#1f1b18", marginTop: 4 }}>94.2%</div>
            <div style={{ fontSize: 11, color: "#867b6e" }}>Validated across 120k repos</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Hybrid Scan Latency</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#1f1b18", marginTop: 4 }}>1.4s / 10k LoC</div>
            <div style={{ fontSize: 11, color: "#867b6e" }}>AST + XTRIKE Neural-Triage</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>AI-BOM Inventory</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#1f1b18", marginTop: 4 }}>1,420 Models</div>
            <div style={{ fontSize: 11, color: "#867b6e" }}>Weights &amp; MCP Endpoints</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Auto-Fix Pull Requests</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#1f1b18", marginTop: 4 }}>98.6% Merged</div>
            <div style={{ fontSize: 11, color: "#867b6e" }}>AST &amp; Unit Test Verified</div>
          </div>
        </div>
      </section>

      {/* 6 Flagship Studios Catalog */}
      <section style={{ maxWidth: 1360, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1f1b18" }}>Flagship XTRIKE SAST Studios &amp; Modules</h2>
          <p style={{ fontSize: 13.5, color: "#5c5349" }}>Explore the next-generation static security ecosystem built natively into the XTRIKE SAST Desk.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
          <Link href="/validation-engine" style={{ textDecoration: "none" }}>
            <div style={{ background: "#ece5d8", border: "1px solid var(--border)", borderRadius: 14, padding: 22, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={20} color="#8b4528" />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "var(--surface-3)", color: "var(--muted)" }}>PROOF ENGINE</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1f1b18", marginBottom: 8 }}>Finding Validation &amp; Proof Engine</h3>
                <p style={{ fontSize: 12.5, color: "#5c5349", lineHeight: 1.5 }}>6-stage A–F validation pipeline, 6-point Proof Contracts, XTRIKE-Solver counterexample minimization, security invariants, and OWASP/CWE/NVD catalog.</p>
              </div>
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#8b4528" }}>
                <span>Open Validation Engine</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </Link>

          <Link href="/fusion-engine" style={{ textDecoration: "none" }}>
            <div style={{ background: "#ece5d8", border: "1px solid var(--border)", borderRadius: 14, padding: 22, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Sparkles size={20} color="#8b4528" />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "var(--surface-3)", color: "var(--muted)" }}>FLAGSHIP</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1f1b18", marginBottom: 8 }}>XTRIKE Fusion Engine</h3>
                <p style={{ fontSize: 12.5, color: "#5c5349", lineHeight: 1.5 }}>Hybrid scanning combining deterministic AST rules with XTRIKE Neural-Triage to eliminate false positives in SQLi, SSRF, RCE, and XSS.</p>
              </div>
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#8b4528" }}>
                <span>Launch Fusion Studio</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </Link>

          <Link href="/developer-assist" style={{ textDecoration: "none" }}>
            <div style={{ background: "#ece5d8", border: "1px solid var(--border)", borderRadius: 14, padding: 22, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Bot size={20} color="#8b4528" />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "var(--surface-3)", color: "var(--muted)" }}>AI AGENT</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1f1b18", marginBottom: 8 }}>Developer Assist Agent</h3>
                <p style={{ fontSize: 12.5, color: "#5c5349", lineHeight: 1.5 }}>Interactive AI copilot generating 1-click AST-validated pull request diffs, secure coding explanations, and real-time triage.</p>
              </div>
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#8b4528" }}>
                <span>Open Agent Workbench</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </Link>

          <Link href="/ai-bom" style={{ textDecoration: "none" }}>
            <div style={{ background: "#ece5d8", border: "1px solid var(--border)", borderRadius: 14, padding: 22, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Box size={20} color="#8b4528" />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "var(--surface-3)", color: "var(--muted)" }}>AI SUPPLY CHAIN</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1f1b18", marginBottom: 8 }}>AI-BOM &amp; Model Inventory</h3>
                <p style={{ fontSize: 12.5, color: "#5c5349", lineHeight: 1.5 }}>Bill of Materials scanner for AI model weights, RAG prompt pipelines, vector stores, and MCP tools.</p>
              </div>
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#8b4528" }}>
                <span>Inspect AI Inventory</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </Link>

          <Link href="/taint-graph" style={{ textDecoration: "none" }}>
            <div style={{ background: "#ece5d8", border: "1px solid var(--border)", borderRadius: 14, padding: 22, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GitGraph size={20} color="#8b4528" />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "var(--surface-3)", color: "var(--muted)" }}>GRAPH DAG</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1f1b18", marginBottom: 8 }}>Inter-Procedural Taint Graph</h3>
                <p style={{ fontSize: 12.5, color: "#5c5349", lineHeight: 1.5 }}>Interactive multi-file data flow visualization tracking untrusted HTTP sources through sanitizers into dangerous sinks.</p>
              </div>
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#8b4528" }}>
                <span>View Taint Graph</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </Link>

          <Link href="/mcp-server" style={{ textDecoration: "none" }}>
            <div style={{ background: "#ece5d8", border: "1px solid var(--border)", borderRadius: 14, padding: 22, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Terminal size={20} color="#8b4528" />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "var(--surface-3)", color: "var(--muted)" }}>IDE PROTOCOL</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1f1b18", marginBottom: 8 }}>XTRIKE MCP Server Hub</h3>
                <p style={{ fontSize: 12.5, color: "#5c5349", lineHeight: 1.5 }}>Model Context Protocol (MCP) server endpoints enabling developer IDEs and desktop agents to run XTRIKE SAST scans directly.</p>
              </div>
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#8b4528" }}>
                <span>Configure MCP Hub</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </Link>

          <Link href="/scan" style={{ textDecoration: "none" }}>
            <div style={{ background: "#ece5d8", border: "1px solid var(--border)", borderRadius: 14, padding: 22, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Code2 size={20} color="#8b4528" />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "var(--surface-3)", color: "var(--muted)" }}>INTERACTIVE</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1f1b18", marginBottom: 8 }}>Multi-Language Scanner</h3>
                <p style={{ fontSize: 12.5, color: "#5c5349", lineHeight: 1.5 }}>Scan TypeScript, Python, Java, Go, C++, Rust, and PHP files with instant CWE categorization and AI-verified remediation diffs.</p>
              </div>
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#8b4528" }}>
                <span>Start Multi-Language Scan</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
