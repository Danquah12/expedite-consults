"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  GitBranch, Sparkles, Cpu, Layers, Box, ShieldAlert, Bot, ArrowRight, 
  CheckCircle2, AlertTriangle, Zap, Code2, Lock, Flame, RefreshCw, FileText,
  Play, Pause, ChevronLeft, ChevronRight, ShieldCheck, Terminal, Compass
} from "lucide-react";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      id: "risk-posture",
      badge: "THREAT MODEL POSTURE",
      title: "Expedite Core Threat Modeling Posture",
      content: (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: "#cbd5e1", marginLeft: 6, letterSpacing: "0.05em" }}>
                THREAT POSTURE &middot; STRIDE MATRIX
              </span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              DFD SYNC
            </span>
          </div>

          <div style={{
            background: "rgba(21, 13, 56, 0.9)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: 8,
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16
          }}>
            <div style={{
              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              color: "#ffffff",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 900
            }}>
              TACKLE TODAY &rarr;
            </div>
            <div style={{ display: "flex", gap: 10, fontSize: 10.5, fontWeight: 800 }}>
              <span style={{ color: "#f43f5e" }}>5 Spoofing Threats</span>
              <span style={{ color: "#ff6b00" }}>8 Tampering Flows</span>
              <span style={{ color: "#94a3b8" }}>12 Elevation of Privilege</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
            <div style={{ background: "rgba(7, 4, 20, 0.6)", padding: 10, borderRadius: 10, border: "1px solid rgba(139, 92, 246, 0.15)" }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
                Threats by STRIDE Category
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 85, padding: "0 6px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#f43f5e" }}>5</div>
                  <div style={{ width: 12, height: 45, background: "#f43f5e", borderRadius: "3px 3px 0 0" }} />
                  <div style={{ fontSize: 7.5, color: "var(--muted)", marginTop: 2 }}>S</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#ff6b00" }}>8</div>
                  <div style={{ width: 12, height: 60, background: "#ff6b00", borderRadius: "3px 3px 0 0" }} />
                  <div style={{ fontSize: 7.5, color: "var(--muted)", marginTop: 2 }}>T</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#f59e0b" }}>4</div>
                  <div style={{ width: 12, height: 35, background: "#f59e0b", borderRadius: "3px 3px 0 0" }} />
                  <div style={{ fontSize: 7.5, color: "var(--muted)", marginTop: 2 }}>R</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#00f0ff" }}>7</div>
                  <div style={{ width: 12, height: 50, background: "#00f0ff", borderRadius: "3px 3px 0 0" }} />
                  <div style={{ fontSize: 7.5, color: "var(--muted)", marginTop: 2 }}>I</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#8b5cf6" }}>6</div>
                  <div style={{ width: 12, height: 42, background: "#8b5cf6", borderRadius: "3px 3px 0 0" }} />
                  <div style={{ fontSize: 7.5, color: "var(--muted)", marginTop: 2 }}>D</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#ec4899" }}>12</div>
                  <div style={{ width: 12, height: 75, background: "#ec4899", borderRadius: "3px 3px 0 0" }} />
                  <div style={{ fontSize: 7.5, color: "var(--muted)", marginTop: 2 }}>E</div>
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(7, 4, 20, 0.6)", padding: 10, borderRadius: 10, border: "1px solid rgba(139, 92, 246, 0.15)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>Mitigation Coverage</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                  width: 75,
                  height: 75,
                  borderRadius: "50%",
                  border: "6px solid #00f0ff",
                  borderTopColor: "#f43f5e",
                  borderRightColor: "#10b981",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#ffffff" }}>91%</div>
                  <div style={{ fontSize: 7.5, color: "var(--muted)" }}>MITIGATED</div>
                </div>
              </div>
              <div style={{ fontSize: 9, display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ color: "#cbd5e1" }}>&bull; Controls Verified: <span style={{ color: "#10b981" }}>42 Controls</span></div>
                <div style={{ color: "#cbd5e1" }}>&bull; Unmitigated Sinks: <span style={{ color: "#f43f5e" }}>3 Left</span></div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "dfd-canvas",
      badge: "DFD CANVAS",
      title: "Interactive Data Flow Diagram Canvas",
      content: (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#00f0ff" }}>Trust Boundary: Public Web &rarr; Internal VPC</div>
            <span style={{ fontSize: 10, color: "#f43f5e", fontWeight: 800 }}>UNENCRYPTED FLOW</span>
          </div>

          <div style={{ background: "rgba(7, 4, 20, 0.7)", padding: 12, borderRadius: 8, border: "1px solid rgba(0, 240, 255, 0.3)" }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: "#ffffff" }}>
              Data Store 'Customer_PII_DB' accessed without mTLS mutual authentication across trust boundary.
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
              Automatic compensating control generated: Envoy mTLS Sidecar Proxy.
            </div>
          </div>
        </div>
      )
    },
    {
      id: "attack-trees",
      badge: "ATTACK TREES",
      title: "Automated Multi-Stage Attack Tree Simulator",
      content: (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#ff6b00" }}>Goal: Exfiltrate Credit Card Token DB</div>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#f43f5e" }}>ATTACK PATH FOUND</span>
          </div>

          <pre style={{
            background: "#070414",
            border: "1px solid rgba(255, 107, 0, 0.3)",
            borderRadius: 8,
            padding: 10,
            fontSize: 10.5,
            fontFamily: "monospace",
            color: "#f8fafc",
            lineHeight: 1.4,
            marginBottom: 8
          }}>
{`PATH 1: Phishing -> Steal AWS Key -> AssumeRole -> Dump S3 Bucket
Estimated Attacker Cost: $200 | Time: 45 min
Recommended Choke-Point: Enforce MFA Condition on S3 KMS Key`}
          </pre>
        </div>
      )
    },
    {
      id: "mitre-capec",
      badge: "MITRE & CAPEC",
      title: "MITRE ATT&CK & CAPEC Adversary Pattern Matrix",
      content: (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#c4b5fd" }}>CAPEC-66: SQL Injection &middot; T1190 Exploit Public App</div>
            <span style={{ fontSize: 10, color: "#10b981", fontWeight: 800 }}>MAPPED</span>
          </div>

          <div style={{ background: "rgba(7, 4, 20, 0.7)", padding: 12, borderRadius: 8, border: "1px solid rgba(139, 92, 246, 0.3)" }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: "#ffffff" }}>
              Adversary pattern matched against 14 known nation-state threat actors targeting financial services.
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
              Automated SIEM detection rules and WAF signatures exported.
            </div>
          </div>
        </div>
      )
    },
    {
      id: "countermeasure-planner",
      badge: "COUNTERMEASURES",
      title: "Automated Guardrail & Control Recommendations",
      content: (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#10b981" }}>NIST SP 800-53 &middot; ISO 27001 &middot; CIS Controls</div>
            <span style={{ fontSize: 10, color: "#00f0ff", fontWeight: 800 }}>42 ENFORCED</span>
          </div>

          <pre style={{
            background: "#070414",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: 8,
            padding: 10,
            fontSize: 10.5,
            fontFamily: "monospace",
            color: "#10b981",
            lineHeight: 1.4
          }}>
{`Generated Policy:
- OPA Rego: Deny S3 Public Read/Write
- Terraform: Enforce KMS Customer Managed Keys
- Spring Security: Enable OAuth2 Resource Server Token Filter`}
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
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 14px", borderRadius: 50, background: "rgba(0, 240, 255, 0.15)", border: "1px solid rgba(0, 240, 255, 0.4)", marginBottom: 18 }}>
              <Sparkles size={13} color="#00f0ff" />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "#00f0ff", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                THE AGENTIC THREAT MODELING PLATFORM
              </span>
            </div>

            <h1 style={{ fontSize: "clamp(34px, 4.2vw, 56px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 18, color: "#ffffff" }}>
              Architects Design. <br />
              <span style={{
                background: "linear-gradient(135deg, #00f0ff 0%, #8b5cf6 50%, #10b981 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                AXIOM Threat Models Flaws.
              </span>
            </h1>

            <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.6, marginBottom: 28, maxWidth: 580 }}>
              The Agentic Threat Modeling Platform combining automated STRIDE risk identification, interactive DFD generation, Attack Tree simulations, and MITRE ATT&CK / CAPEC alignment.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link
                href="/stride-analyzer"
                style={{
                  background: "linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%)",
                  color: "#070414",
                  padding: "13px 26px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 900,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 0 25px rgba(0, 240, 255, 0.4)"
                }}
              >
                <span>Launch STRIDE Studio</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                href="/dfd-studio"
                style={{
                  background: "rgba(14, 8, 38, 0.8)",
                  color: "#00f0ff",
                  border: "1px solid rgba(0, 240, 255, 0.4)",
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
                <Compass size={16} />
                <span>DFD Canvas</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Dynamic Auto-Advancing Feature Carousel */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
              background: "rgba(14, 8, 38, 0.92)",
              border: "1px solid rgba(139, 92, 246, 0.35)",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(139, 92, 246, 0.15)",
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
                      background: currentSlide === idx ? "rgba(139, 92, 246, 0.3)" : "rgba(21, 13, 56, 0.5)",
                      border: currentSlide === idx ? "1px solid #8b5cf6" : "1px solid rgba(139, 92, 246, 0.15)",
                      color: currentSlide === idx ? "#00f0ff" : "#94a3b8",
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
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center" }}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 10, borderTop: "1px solid rgba(139, 92, 246, 0.2)" }}>
              <button
                onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
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
                      background: currentSlide === idx ? "#00f0ff" : "rgba(139, 92, 246, 0.4)",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
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
          background: "rgba(14, 8, 38, 0.7)",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          borderRadius: 16,
          padding: "20px 24px",
          backdropFilter: "blur(16px)"
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>DFD Synthesis Speed</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#10b981", marginTop: 4 }}>Instant / AST</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Codebase-to-architecture graph</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Threats Categorized</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#00f0ff", marginTop: 4 }}>42 Flaws</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Full STRIDE taxonomy</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Attack Paths Modeled</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#ff6b00", marginTop: 4 }}>18 Attack Trees</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Cost &amp; probability calculated</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>MITRE / CAPEC Links</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#8b5cf6", marginTop: 4 }}>100% Mapped</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Automated countermeasure rules</div>
          </div>
        </div>
      </section>

      {/* 6 Flagship Studios Catalog */}
      <section style={{ maxWidth: 1360, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#f8fafc" }}>Flagship Threat Modeling Studios</h2>
          <p style={{ fontSize: 13.5, color: "#94a3b8" }}>Enterprise architecture security and attack simulation inspired by Expedite Core &amp; Black Duck Polaris.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
          <Link href="/stride-analyzer" style={{ textDecoration: "none" }}>
            <div style={{ background: "rgba(21, 13, 56, 0.6)", border: "1px solid rgba(244, 63, 94, 0.35)", borderRadius: 14, padding: 22, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(244, 63, 94, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShieldAlert size={20} color="#f43f5e" />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(244, 63, 94, 0.2)", color: "#f43f5e" }}>STRIDE</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>STRIDE Risk Engine</h3>
                <p style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5 }}>Automatically evaluate systems against Spoofing, Tampering, Repudiation, Information Disclosure, DoS, and Elevation of Privilege.</p>
              </div>
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#00f0ff" }}>
                <span>Launch STRIDE Engine</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </Link>

          <Link href="/dfd-studio" style={{ textDecoration: "none" }}>
            <div style={{ background: "rgba(21, 13, 56, 0.6)", border: "1px solid rgba(0, 240, 255, 0.35)", borderRadius: 14, padding: 22, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(0, 240, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Compass size={20} color="#00f0ff" />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(0, 240, 255, 0.2)", color: "#00f0ff" }}>DFD CANVAS</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>Data Flow Diagram Canvas</h3>
                <p style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5 }}>Interactive node-and-wire canvas modeling Processes, Data Stores, External Interactors, and Trust Boundaries.</p>
              </div>
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#00f0ff" }}>
                <span>Open DFD Canvas</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </Link>

          <Link href="/attack-trees" style={{ textDecoration: "none" }}>
            <div style={{ background: "rgba(21, 13, 56, 0.6)", border: "1px solid rgba(255, 107, 0, 0.35)", borderRadius: 14, padding: 22, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255, 107, 0, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GitBranch size={20} color="#ff6b00" />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(255, 107, 0, 0.2)", color: "#ff6b00" }}>ATTACK TREES</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>Attack Tree Simulator</h3>
                <p style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5 }}>Model AND/OR attacker decision trees, estimating adversary financial cost, required skill level, and choke points.</p>
              </div>
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#00f0ff" }}>
                <span>Simulate Attack Trees</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </Link>

          <Link href="/mitre-capec-bridge" style={{ textDecoration: "none" }}>
            <div style={{ background: "rgba(21, 13, 56, 0.6)", border: "1px solid rgba(139, 92, 246, 0.35)", borderRadius: 14, padding: 22, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(139, 92, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Layers size={20} color="#8b5cf6" />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(139, 92, 246, 0.2)", color: "#c4b5fd" }}>MITRE ATT&amp;CK</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>MITRE ATT&amp;CK &amp; CAPEC Bridge</h3>
                <p style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5 }}>Link theoretical threat model vectors directly to real-world adversary TTPs and nation-state threat actor profiles.</p>
              </div>
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#00f0ff" }}>
                <span>Explore MITRE Matrix</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </Link>

          <Link href="/countermeasure-planner" style={{ textDecoration: "none" }}>
            <div style={{ background: "rgba(21, 13, 56, 0.6)", border: "1px solid rgba(16, 185, 129, 0.35)", borderRadius: 14, padding: 22, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShieldCheck size={20} color="#10b981" />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(16, 185, 129, 0.2)", color: "#10b981" }}>GUARDRAILS</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>Countermeasure &amp; Guardrail Planner</h3>
                <p style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5 }}>Synthesize Open Policy Agent Rego guardrails, Terraform IAM constraints, and WAF rules to remediate threats.</p>
              </div>
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#00f0ff" }}>
                <span>Deploy Countermeasures</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </Link>

          <Link href="/scan" style={{ textDecoration: "none" }}>
            <div style={{ background: "rgba(21, 13, 56, 0.6)", border: "1px solid rgba(139, 92, 246, 0.35)", borderRadius: 14, padding: 22, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(139, 92, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GitBranch size={20} color="#8b5cf6" />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(139, 92, 246, 0.2)", color: "#c4b5fd" }}>INTERACTIVE</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>Automated Architecture Scanner</h3>
                <p style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5 }}>Ingest cloud infrastructure HCL or microservice topology to automatically synthesize threat models.</p>
              </div>
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#00f0ff" }}>
                <span>Synthesize Threat Model</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
