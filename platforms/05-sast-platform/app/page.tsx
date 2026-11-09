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
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#9e2a2b" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#996b1f" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2d6a4f" }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: "#4a4239", marginLeft: 6, letterSpacing: "0.05em" }}>
                XTRIKE SAST RISK POSTURE
              </span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#2d6a4f", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2d6a4f", display: "inline-block" }} />
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
              color: "#fbf8f3",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 900
            }}>
              TACKLE TODAY &rarr;
            </div>
            <div style={{ display: "flex", gap: 10, fontSize: 10.5, fontWeight: 800 }}>
              <span style={{ color: "#9e2a2b" }}>37 Critical</span>
              <span style={{ color: "#8b4528" }}>45 Urgent</span>
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
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#9e2a2b" }}>37</div>
                  <div style={{ width: 14, height: 60, background: "#9e2a2b", borderRadius: "3px 3px 0 0" }} />
                  <div style={{ fontSize: 8.5, color: "var(--muted)", marginTop: 2 }}>CRIT</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#8b4528" }}>45</div>
                  <div style={{ width: 14, height: 75, background: "#8b4528", borderRadius: "3px 3px 0 0" }} />
                  <div style={{ fontSize: 8.5, color: "var(--muted)", marginTop: 2 }}>HIGH</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#996b1f" }}>34</div>
                  <div style={{ width: 14, height: 48, background: "#996b1f", borderRadius: "3px 3px 0 0" }} />
                  <div style={{ fontSize: 8.5, color: "var(--muted)", marginTop: 2 }}>MED</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#2d6a4f" }}>28</div>
                  <div style={{ width: 14, height: 35, background: "#2d6a4f", borderRadius: "3px 3px 0 0" }} />
                  <div style={{ fontSize: 8.5, color: "var(--muted)", marginTop: 2 }}>LOW</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#5c5349" }}>22</div>
                  <div style={{ width: 14, height: 26, background: "#5c5349", borderRadius: "3px 3px 0 0" }} />
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
                  border: "6px solid #996b1f",
                  borderTopColor: "#9e2a2b",
                  borderRightColor: "#2d6a4f",
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
                <div style={{ color: "#4a4239" }}>&bull; Requires attention: <span style={{ color: "#9e2a2b", fontWeight: 700 }}>24%</span></div>
                <div style={{ color: "#4a4239" }}>&bull; 1-Click Easy Fix: <span style={{ color: "#2d6a4f", fontWeight: 700 }}>76%</span></div>
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
            <span style={{ fontSize: 10, color: "#2d6a4f", fontWeight: 800, background: "rgba(45, 106, 79, 0.14)", padding: "2px 6px", borderRadius: 4 }}>
              94.2% False Positives Eliminated
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ background: "#f3eee4", padding: 10, borderRadius: 8, border: "1px solid rgba(45, 106, 79, 0.35)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800 }}>
                <span style={{ color: "#1f1b18" }}>FUS-02 &middot; SSRF in WebhookDispatcher</span>
                <span style={{ color: "#2d6a4f" }}>FALSE POSITIVE CUT</span>
              </div>
              <div style={{ fontSize: 10, color: "#5c5349", marginTop: 4 }}>
                XTRIKE Neural-Triage v4 verified private subnet filter at L82 blocks cloud metadata 169.254.169.254.
              </div>
            </div>

            <div style={{ background: "#f3eee4", padding: 10, borderRadius: 8, border: "1px solid rgba(158, 42, 43, 0.35)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800 }}>
                <span style={{ color: "#1f1b18" }}>FUS-01 &middot; SQL Injection in Profile</span>
                <span style={{ color: "#9e2a2b" }}>CONFIRMED EXPLOITABLE</span>
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
            <div style={{ fontSize: 10, color: "#2d6a4f", fontWeight: 700 }}>&check; XTRIKE regression test generated</div>
            <button style={{ background: "#8b4528", border: "none", color: "#fbf8f3", fontSize: 10.5, fontWeight: 900, padding: "4px 10px", borderRadius: 4 }}>
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
              <span style={{ color: "#2d6a4f", fontWeight: 800 }}>Safetensors (Clean)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", background: "#f3eee4", padding: "8px 10px", borderRadius: 6, fontSize: 10.5 }}>
              <span style={{ color: "#1f1b18", fontWeight: 700 }}>xtrike-rag-agent-v2</span>
              <span style={{ color: "#9e2a2b", fontWeight: 800 }}>Indirect Prompt Injection</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", background: "#f3eee4", padding: "8px 10px", borderRadius: 6, fontSize: 10.5 }}>
              <span style={{ color: "#1f1b18", fontWeight: 700 }}>mcp-filesystem-server-v1</span>
              <span style={{ color: "#996b1f", fontWeight: 800 }}>Tool Path Traversal Guard</span>
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
            <span style={{ fontSize: 10, color: "#2d6a4f", fontWeight: 800 }}>CONNECTED</span>
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
                  color: "#fbf8f3",
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
              boxShadow: "0 12px 32px rgba(31, 27, 24, 0.08)",
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

      {/* =====================================================================
          "UNIFIED. SCALABLE. SECURE." 4-PILLAR VALUE STRIP (SCREENSHOT 2)
         ===================================================================== */}
      <section style={{ maxWidth: 1360, margin: "68px auto 0 auto", padding: "0 20px" }}>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "44px 36px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
            <span
              style={{
                width: 4,
                height: 34,
                borderRadius: 2,
                background: "linear-gradient(180deg, #8b4528 0%, #2d6a4f 100%)",
                display: "inline-block",
              }}
            />
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#1f1b18", margin: 0, letterSpacing: "-0.02em" }}>
              Unified. Scalable. Secure.
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 32,
            }}
          >
            {/* Card 1: Control and visibility */}
            <div>
              <div style={{ height: 120, marginBottom: 18, display: "flex", alignItems: "center" }}>
                <svg viewBox="0 0 180 110" style={{ width: 165, height: 105 }}>
                  <rect x="6" y="18" width="128" height="82" rx="4" fill="#ece5d8" stroke="#1f1b18" strokeWidth="2" />
                  <rect x="6" y="18" width="10" height="82" fill="#1f1b18" />
                  <rect x="24" y="8" width="42" height="36" rx="3" fill="#2d6a4f" />
                  <polygon points="45,17 54,22 54,31 45,36 36,31 36,22" fill="#fbf8f3" />
                  <rect x="74" y="14" width="66" height="38" rx="3" fill="#68b684" />
                  <rect x="82" y="34" width="6" height="12" fill="#1f1b18" />
                  <rect x="92" y="26" width="6" height="20" fill="#8b4528" />
                  <rect x="102" y="30" width="6" height="16" fill="#1f1b18" />
                  <rect x="112" y="22" width="6" height="24" fill="#8b4528" />
                  <rect x="122" y="28" width="6" height="18" fill="#1f1b18" />
                  <rect x="24" y="54" width="52" height="36" rx="3" fill="#fbf8f3" />
                  <path d="M 34 80 A 16 16 0 0 1 66 80" fill="none" stroke="#2d6a4f" strokeWidth="4" />
                  <rect x="82" y="60" width="36" height="34" rx="3" fill="#5c5349" />
                  <rect x="112" y="50" width="40" height="36" rx="3" fill="#8b4528" />
                  <circle cx="132" cy="70" r="9" fill="#fbf8f3" />
                  <text x="132" y="74" textAnchor="middle" fill="#1f1b18" fontSize="12" fontWeight="900">!</text>
                </svg>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1f1b18", marginBottom: 10 }}>
                Control and visibility
              </h3>
              <p style={{ fontSize: 13.5, color: "#5c5349", lineHeight: 1.6, margin: 0 }}>
                Gain deep visibility across infrastructure, polyglot applications, SAST taint paths, and user
                experience in one platform. Our library of more than 2,000 monitoring integrations and 400+ CWE AST
                plugins makes full-stack observability possible.
              </p>
            </div>

            {/* Card 2: Value at scale */}
            <div>
              <div style={{ height: 120, marginBottom: 18, display: "flex", alignItems: "center" }}>
                <svg viewBox="0 0 140 110" style={{ width: 130, height: 105 }}>
                  <circle cx="65" cy="55" r="44" fill="#fbf8f3" stroke="#1f1b18" strokeWidth="5" />
                  <path d="M 65 15 A 40 40 0 0 1 102 72 L 65 55 Z" fill="#cbe3d6" />
                  <path d="M 65 32 A 23 23 0 0 1 86 65 L 65 55 Z" fill="#2d6a4f" />
                  <circle cx="65" cy="55" r="9" fill="#ece5d8" />
                  <circle cx="65" cy="55" r="4" fill="#1f1b18" />
                  <line x1="65" y1="55" x2="104" y2="73" stroke="#8b4528" strokeWidth="2.5" />
                </svg>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1f1b18", marginBottom: 10 }}>
                Value at scale
              </h3>
              <p style={{ fontSize: 13.5, color: "#5c5349", lineHeight: 1.6, margin: 0 }}>
                Predictable host, repository, and service-based licensing that reduces observability and AppSec spend
                by up to 70% without compromising on enterprise-grade 8-engine static analysis or runtime proof
                capabilities.
              </p>
            </div>

            {/* Card 3: Secure by design */}
            <div>
              <div style={{ height: 120, marginBottom: 18, display: "flex", alignItems: "center" }}>
                <svg viewBox="0 0 140 110" style={{ width: 130, height: 105 }}>
                  <path
                    d="M 48 34 L 48 20 L 65 10 L 82 20 L 82 34"
                    fill="none"
                    stroke="#1f1b18"
                    strokeWidth="5"
                    strokeLinejoin="round"
                  />
                  <polygon points="65,24 104,45 104,83 65,104 26,83 26,45" fill="#68b684" />
                  <polygon points="65,33 95,50 95,78 65,95 35,78 35,50" fill="#2d6a4f" />
                  <polygon points="65,45 83,55 83,73 65,83 47,73 47,55" fill="#1f1b18" />
                  <path
                    d="M 65 53 L 73 57 L 73 65 C 73 70 65 74 65 74 C 65 74 57 70 57 65 L 57 57 Z"
                    fill="none"
                    stroke="#fbf8f3"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1f1b18", marginBottom: 10 }}>
                Secure by design
              </h3>
              <p style={{ fontSize: 13.5, color: "#5c5349", lineHeight: 1.6, margin: 0 }}>
                Built for sovereign and critical-infrastructure organizations, with Ed25519 cryptographic evidence
                ledgers, isolated exploit sandboxes, and support for fully air-gapped deployments where needed.
              </p>
            </div>

            {/* Card 4: Best in class ROI */}
            <div>
              <div style={{ height: 120, marginBottom: 18, display: "flex", alignItems: "center" }}>
                <svg viewBox="0 0 160 110" style={{ width: 150, height: 105 }}>
                  <path d="M 32 95 L 32 42 L 25 49 M 32 42 L 39 49" stroke="#e6b89c" strokeWidth="6" strokeLinecap="round" fill="none" />
                  <path d="M 52 95 L 52 34 L 46 40 M 52 34 L 58 40" stroke="#1f1b18" strokeWidth="5" strokeLinecap="round" fill="none" />
                  <path d="M 104 95 L 104 42 L 98 48 M 104 42 L 110 48" stroke="#5c5349" strokeWidth="5" strokeLinecap="round" fill="none" />
                  <path d="M 124 95 L 124 68 L 119 73 M 124 68 L 129 73" stroke="#1f1b18" strokeWidth="5" strokeLinecap="round" fill="none" />
                  <polygon points="78,8 90,28 90,66 66,66 66,28" fill="#68b684" />
                  <polygon points="66,48 56,64 66,64" fill="#2d6a4f" />
                  <polygon points="90,48 100,64 90,64" fill="#2d6a4f" />
                  <polygon points="78,30 84,34 84,41 78,45 72,41 72,34" fill="#1f1b18" />
                  <polygon points="72,66 84,66 78,82" fill="#8b4528" />
                  <path d="M 38 96 Q 48 80 64 86 Q 78 74 96 86 Q 112 82 120 96 Z" fill="#5c5349" />
                </svg>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1f1b18", marginBottom: 10 }}>
                Best in class ROI
              </h3>
              <p style={{ fontSize: 13.5, color: "#5c5349", lineHeight: 1.6, margin: 0 }}>
                Eliminate tool sprawl across SAST, SCA, infrastructure, network, and synthetic UX monitoring. Lower
                false-positive triage effort by 94.2% and realize value faster with a unified autonomous platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          USE CASES — INFRASTRUCTURE MONITORING & APPLICATION OBSERVABILITY
          (SCREENSHOT 3)
         ===================================================================== */}
      <section style={{ maxWidth: 1360, margin: "44px auto 0 auto", padding: "0 20px" }}>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "44px 36px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <span
              style={{
                width: 4,
                height: 34,
                borderRadius: 2,
                background: "linear-gradient(180deg, #8b4528 0%, #2d6a4f 100%)",
                display: "inline-block",
              }}
            />
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#1f1b18", margin: 0, letterSpacing: "-0.02em" }}>
              Use cases
            </h2>
          </div>

          {/* Row 1: Infrastructure Monitoring */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 40,
              alignItems: "center",
              paddingBottom: 40,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#1f1b18", marginBottom: 12 }}>
                Infrastructure Monitoring
              </h3>
              <p style={{ fontSize: 14.5, color: "#5c5349", lineHeight: 1.65, marginBottom: 18 }}>
                Keep your critical servers, Kubernetes clusters, networks, and databases available and performing at
                their best. XTRIKE gives you real-time visibility into your full hybrid stack, so you can detect
                resource saturation early, resolve incidents faster with Noctis AI, and plan capacity with confidence.
              </p>
              <Link
                href="/cyber-monitoring"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#8b4528",
                  textDecoration: "none",
                }}
              >
                <span>Learn more</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <svg viewBox="0 0 360 210" style={{ width: "100%", maxWidth: 350, height: "auto" }}>
                <polygon points="30,130 155,70 210,105 110,185" fill="#e2d9c8" />
                <polygon points="175,115 280,60 340,120 225,190" fill="#ece5d8" />
                <rect x="135" y="42" width="28" height="58" rx="2" fill="#2d6a4f" />
                <polygon points="135,42 149,34 177,42 163,50" fill="#68b684" />
                <ellipse cx="96" cy="95" rx="16" ry="8" fill="#2d6a4f" />
                <rect x="80" y="95" width="32" height="22" fill="#1f1b18" />
                <ellipse cx="96" cy="117" rx="16" ry="8" fill="#1f1b18" />
                <polygon points="110,148 136,136 162,148 136,160" fill="#2d6a4f" />
                <polygon points="215,38 258,15 258,68 215,91" fill="#e6b89c" />
                <polygon points="255,102 302,78 302,138 255,162" fill="#d99b78" />
                <circle cx="278" cy="120" r="5" fill="#1f1b18" />
                <circle cx="266" cy="108" r="3" fill="#1f1b18" />
                <circle cx="290" cy="108" r="3" fill="#1f1b18" />
                <circle cx="266" cy="132" r="3" fill="#1f1b18" />
                <circle cx="290" cy="132" r="3" fill="#1f1b18" />
              </svg>
            </div>
          </div>

          {/* Row 2: Application Observability & Code-to-Runtime Security */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 40,
              alignItems: "center",
              paddingTop: 40,
            }}
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <svg viewBox="0 0 360 210" style={{ width: "100%", maxWidth: 350, height: "auto" }}>
                <polygon points="30,135 150,75 195,120 105,190" fill="#e2d9c8" />
                <polygon points="165,120 275,70 330,130 215,190" fill="#ece5d8" />
                <polygon points="48,62 92,38 92,102 48,126" fill="#e3f0e9" stroke="#2d6a4f" strokeWidth="1.5" />
                <polygon points="105,46 148,24 148,112 105,134" fill="#cbe3d6" stroke="#2d6a4f" strokeWidth="1.5" />
                <polygon points="195,58 238,36 238,118 195,140" fill="#f4e5dc" stroke="#8b4528" strokeWidth="1.5" />
                <polygon points="252,52 296,28 296,112 252,136" fill="#e6b89c" stroke="#8b4528" strokeWidth="1.5" />
                <path
                  d="M 70 86 C 100 68, 118 75, 130 78 C 160 85, 190 65, 218 82 C 242 95, 260 75, 276 72"
                  fill="none"
                  stroke="#2d6a4f"
                  strokeWidth="3"
                  strokeDasharray="4 2"
                />
              </svg>
            </div>

            <div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#1f1b18", marginBottom: 12 }}>
                Application Observability &amp; Code-to-Runtime Proof
              </h3>
              <p style={{ fontSize: 14.5, color: "#5c5349", lineHeight: 1.65, marginBottom: 18 }}>
                Understand application health, synthetic user journeys, and vulnerability exploitability across modern
                cloud microservices and legacy systems alike. XTRIKE connects application signals and AST taint paths
                with underlying infrastructure, so you can spot bottlenecks faster, verify patches in isolated
                sandboxes, and deliver a resilient user experience.
              </p>
              <Link
                href="/cyber-monitoring"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#8b4528",
                  textDecoration: "none",
                }}
              >
                <span>Explore Full-Stack Suites (Server, Network, DB &amp; UX)</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
