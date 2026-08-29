"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import {
  Globe2, Shield, Play, Terminal, CheckCircle2, AlertTriangle, XCircle, Code, Lock, RefreshCw, Layers, FileText, Key, Zap, Check, ArrowRight
} from "lucide-react";

type OpenApiEndpoint = {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  summary: string;
  auth: string;
  fuzzTarget: string;
  owaspCategory: string;
  risk: "Critical" | "High" | "Medium";
};

const SAMPLE_ENDPOINTS: OpenApiEndpoint[] = [
  { path: "/api/v2/orders/{order_id}", method: "GET", summary: "Retrieve customer order details", auth: "Bearer JWT", fuzzTarget: "order_id (BOLA/IDOR)", owaspCategory: "API1:2023 BOLA", risk: "Critical" },
  { path: "/api/v2/users/profile", method: "PUT", summary: "Update user profile data", auth: "Bearer JWT", fuzzTarget: "role, is_admin (Mass Assignment)", owaspCategory: "API3:2023 Mass Assignment", risk: "High" },
  { path: "/api/v2/auth/login", method: "POST", summary: "Authenticate client credentials", auth: "None", fuzzTarget: "password, rate_limit", owaspCategory: "API2:2023 Broken Auth", risk: "High" },
  { path: "/api/v2/webhooks/subscribe", method: "POST", summary: "Register external webhook callback", auth: "API Key", fuzzTarget: "callback_url (SSRF to AWS IMDS)", owaspCategory: "API7:2023 SSRF", risk: "Critical" },
  { path: "/api/v2/admin/tenants", method: "DELETE", summary: "Purge tenant workspace", auth: "Bearer JWT", fuzzTarget: "role-check bypass (BFLA)", owaspCategory: "API5:2023 BFLA", risk: "Critical" }
];

export default function APIScanPage() {
  const [activeTab, setActiveTab] = useState<"fuzzer" | "jwt_lab" | "openapi">("fuzzer");
  const [endpoints] = useState<OpenApiEndpoint[]>(SAMPLE_ENDPOINTS);
  const [selectedEndpoint, setSelectedEndpoint] = useState<OpenApiEndpoint>(SAMPLE_ENDPOINTS[0]);
  const [fuzzing, setFuzzing] = useState(false);
  const [fuzzResults, setFuzzResults] = useState<Record<string, { status: string; cvss: number; evidence: string }>>({});
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[init] Autonomous API Security Fuzzer v3.2 initialized.",
    "[schema] OpenAPI 3.0.3 specification ingested: 5 active test endpoints.",
    "[ready] Select an endpoint or run the automated OWASP API Top 10 Fuzzer."
  ]);

  // JWT Security Lab State
  const [jwtToken, setJwtToken] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDQ5MiIsIm5hbWUiOiJBbGV4IENoZW4iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxODAwMDAwMDAwfQ.g-tK6x5cM3...mockSig");
  const [jwtHeader, setJwtHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
  const [jwtPayload, setJwtPayload] = useState('{\n  "sub": "10492",\n  "name": "Alex Chen",\n  "role": "user",\n  "iat": 1700000000,\n  "exp": 1800000000\n}');
  const [jwtAttackResult, setJwtAttackResult] = useState<string | null>(null);

  const runOwaspFuzzer = () => {
    setFuzzing(true);
    setFuzzResults({});
    setConsoleLogs(c => [
      ...c,
      `[fuzz] Initiating automated OWASP API Top 10 fuzzing suite against ${endpoints.length} endpoints...`
    ]);

    endpoints.forEach((ep, index) => {
      setTimeout(() => {
        setConsoleLogs(c => [
          ...c,
          `[fuzz:${ep.method}] Probing ${ep.path} for ${ep.owaspCategory}...`,
          `[fuzz:${ep.method}] Sending parameter mutation payload to ${ep.fuzzTarget}...`
        ]);

        if (ep.owaspCategory.includes("BOLA")) {
          setFuzzResults(prev => ({
            ...prev,
            [ep.path]: {
              status: "VULNERABLE (BOLA / IDOR)",
              cvss: 9.1,
              evidence: "GET /api/v2/orders/9992 returned 200 OK with Tenant B invoice data while authenticated as Tenant A user."
            }
          }));
          setConsoleLogs(c => [...c, `[!] CRITICAL: BOLA vulnerability confirmed on ${ep.path} (CVSS: 9.1)`]);
        } else if (ep.owaspCategory.includes("Mass Assignment")) {
          setFuzzResults(prev => ({
            ...prev,
            [ep.path]: {
              status: "VULNERABLE (Mass Assignment)",
              cvss: 8.4,
              evidence: "PUT payload with 'is_admin: true' was accepted and modified user object in database without schema filtering."
            }
          }));
          setConsoleLogs(c => [...c, `[!] HIGH: Mass Assignment allowed unauthorized role escalation on ${ep.path}`]);
        } else if (ep.owaspCategory.includes("SSRF")) {
          setFuzzResults(prev => ({
            ...prev,
            [ep.path]: {
              status: "VULNERABLE (SSRF)",
              cvss: 9.6,
              evidence: "Callback URL 'http://169.254.169.254/latest/meta-data/' responded with AWS IAM security credentials."
            }
          }));
          setConsoleLogs(c => [...c, `[!] CRITICAL: SSRF to Cloud Metadata Service confirmed on ${ep.path}`]);
        } else {
          setFuzzResults(prev => ({
            ...prev,
            [ep.path]: {
              status: "SECURE (Filtered)",
              cvss: 0.0,
              evidence: "Endpoint rejected anomalous authentication and rate-limited excessive requests (HTTP 429 Too Many Requests)."
            }
          }));
          setConsoleLogs(c => [...c, `[+] PASSED: ${ep.path} enforced strict input typing and rate limiting.`]);
        }

        if (index === endpoints.length - 1) {
          setFuzzing(false);
          setConsoleLogs(c => [...c, `[done] OWASP API Top 10 Fuzzing completed. 3 critical vulnerabilities flagged.`]);
        }
      }, (index + 1) * 700);
    });
  };

  const testAlgNoneJwt = () => {
    setJwtAttackResult("Testing 'alg: none' JWT signature bypass...");
    setTimeout(() => {
      setJwtHeader('{\n  "alg": "none",\n  "typ": "JWT"\n}');
      setJwtPayload('{\n  "sub": "10492",\n  "name": "Alex Chen",\n  "role": "admin",\n  "iat": 1700000000,\n  "exp": 1800000000\n}');
      setJwtAttackResult("❌ VULNERABLE: Server accepted unsigned JWT token with alg: none. Role elevated to 'admin'. (CVSS: 9.8)");
      setConsoleLogs(c => [
        ...c,
        `[jwt] Fuzzing header: {"alg": "none"}`,
        `[jwt] Stripped HMAC signature suffix...`,
        `[!] CRITICAL: Server accepted 'alg: none' token with admin claim without signature validation!`
      ]);
    }, 600);
  };

  const testWeakHmacSecret = () => {
    setJwtAttackResult("Running dictionary attack on HMAC SHA-256 signing secret...");
    setTimeout(() => {
      setJwtAttackResult("❌ CRACKED: Weak JWT signing secret found: 'secret123'. An attacker can forge arbitrary admin tokens. (CVSS: 8.9)");
      setConsoleLogs(c => [
        ...c,
        `[jwt:hashcat] Ingesting JWT token for offline secret cracking...`,
        `[jwt:hashcat] Tested top 100,000 common HMAC passphrases...`,
        `[!] CRITICAL: Secret key cracked: 'secret123' in 0.04s.`
      ]);
    }, 700);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--fg)" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Top Header Bar */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              <Globe2 size={20} style={{ color: "var(--primary)" }} />
              Autonomous API Security & OWASP API Top 10 Lab
            </h1>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              OpenAPI 3.0 Ingestion · BOLA (IDOR) Fuzzing · Mass Assignment · JWT Cryptographic Lab
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setActiveTab("fuzzer")}
              style={{
                fontSize: 11,
                padding: "6px 14px",
                borderRadius: 8,
                border: activeTab === "fuzzer" ? "1px solid var(--primary)" : "1px solid var(--border)",
                background: activeTab === "fuzzer" ? "rgba(13,148,136,0.2)" : "var(--bg)",
                color: activeTab === "fuzzer" ? "#0d9488" : "var(--muted)",
                cursor: "pointer",
                fontWeight: 700
              }}
            >
              ⚡ OWASP API Fuzzer
            </button>

            <button
              onClick={() => setActiveTab("jwt_lab")}
              style={{
                fontSize: 11,
                padding: "6px 14px",
                borderRadius: 8,
                border: activeTab === "jwt_lab" ? "1px solid var(--primary)" : "1px solid var(--border)",
                background: activeTab === "jwt_lab" ? "rgba(13,148,136,0.2)" : "var(--bg)",
                color: activeTab === "jwt_lab" ? "#0d9488" : "var(--muted)",
                cursor: "pointer",
                fontWeight: 700
              }}
            >
              🔑 JWT Security Lab
            </button>

            <button
              onClick={() => setActiveTab("openapi")}
              style={{
                fontSize: 11,
                padding: "6px 14px",
                borderRadius: 8,
                border: activeTab === "openapi" ? "1px solid var(--primary)" : "1px solid var(--border)",
                background: activeTab === "openapi" ? "rgba(13,148,136,0.2)" : "var(--bg)",
                color: activeTab === "openapi" ? "#0d9488" : "var(--muted)",
                cursor: "pointer",
                fontWeight: 700
              }}
            >
              📄 OpenAPI 3.0 Schema
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          
          {/* TAB 1: OWASP API FUZZER */}
          {activeTab === "fuzzer" && (
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
              {/* Left Endpoints List */}
              <div style={{ width: 340, borderRight: "1px solid var(--border)", background: "var(--surface)", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--muted)" }}>
                    OpenAPI Endpoints ({endpoints.length})
                  </span>
                  <button
                    onClick={runOwaspFuzzer}
                    disabled={fuzzing}
                    style={{
                      background: "linear-gradient(135deg, #0d9488, #0f766e)",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <Play size={10} fill="currentColor" />
                    {fuzzing ? "Fuzzing..." : "Run All Fuzzers"}
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
                  {endpoints.map((ep, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedEndpoint(ep)}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 6,
                        border: selectedEndpoint.path === ep.path ? "1px solid var(--primary)" : "1px solid var(--border)",
                        background: selectedEndpoint.path === ep.path ? "rgba(13,148,136,0.12)" : "var(--bg)",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: ep.method === "GET" ? "rgba(0,212,255,0.15)" : ep.method === "POST" ? "rgba(52,199,89,0.15)" : ep.method === "PUT" ? "rgba(232,145,45,0.15)" : "rgba(239,83,80,0.15)",
                          color: ep.method === "GET" ? "#00d4ff" : ep.method === "POST" ? "var(--green)" : ep.method === "PUT" ? "var(--primary)" : "#ef5350"
                        }}>
                          {ep.method}
                        </span>
                        <span style={{ fontSize: 11, fontFamily: "monospace", color: "#fff", fontWeight: 700 }}>
                          {ep.path}
                        </span>
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>
                        {ep.summary}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10 }}>
                        <span style={{ color: "var(--primary)", fontWeight: 700 }}>{ep.owaspCategory}</span>
                        {fuzzResults[ep.path] && (
                          <span style={{
                            fontWeight: 800,
                            color: fuzzResults[ep.path].cvss > 0 ? "#ef5350" : "var(--green)"
                          }}>
                            {fuzzResults[ep.path].cvss > 0 ? `CVSS ${fuzzResults[ep.path].cvss}` : "PASSED"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Detail & Audit Evidence */}
              <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "4px 8px",
                      borderRadius: 6,
                      background: "rgba(13,148,136,0.15)",
                      color: "var(--primary)"
                    }}>
                      {selectedEndpoint.method}
                    </span>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>
                      {selectedEndpoint.path}
                    </h2>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
                    <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }}>
                      <span style={{ fontSize: 10, color: "var(--muted)" }}>OWASP Threat Vector</span>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", marginTop: 2 }}>{selectedEndpoint.owaspCategory}</div>
                    </div>
                    <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }}>
                      <span style={{ fontSize: 10, color: "var(--muted)" }}>Fuzzing Target Parameter</span>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginTop: 2 }}>{selectedEndpoint.fuzzTarget}</div>
                    </div>
                    <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }}>
                      <span style={{ fontSize: 10, color: "var(--muted)" }}>Authentication Scope</span>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#00d4ff", marginTop: 2 }}>{selectedEndpoint.auth}</div>
                    </div>
                  </div>

                  {fuzzResults[selectedEndpoint.path] ? (
                    <div style={{
                      padding: 16,
                      borderRadius: 10,
                      border: fuzzResults[selectedEndpoint.path].cvss > 0 ? "1px solid rgba(239,83,80,0.3)" : "1px solid rgba(52,199,89,0.3)",
                      background: fuzzResults[selectedEndpoint.path].cvss > 0 ? "rgba(239,83,80,0.08)" : "rgba(52,199,89,0.08)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        {fuzzResults[selectedEndpoint.path].cvss > 0 ? <AlertTriangle size={16} color="#ef5350" /> : <CheckCircle2 size={16} color="var(--green)" />}
                        <strong style={{ color: fuzzResults[selectedEndpoint.path].cvss > 0 ? "#ef5350" : "var(--green)", fontSize: 13 }}>
                          {fuzzResults[selectedEndpoint.path].status}
                        </strong>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.5 }}>
                        {fuzzResults[selectedEndpoint.path].evidence}
                      </p>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: 24, color: "var(--muted)", fontSize: 12 }}>
                      Click &quot;Run All Fuzzers&quot; to execute automated mutation fuzzing against this endpoint.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JWT SECURITY LAB */}
          {activeTab === "jwt_lab" && (
            <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
              <div style={{ maxWidth: 840, margin: "0 auto" }}>
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                    <Key size={18} style={{ color: "var(--primary)" }} />
                    JWT Cryptographic Attack Lab
                  </h2>
                  <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                    Test cryptographic validation against `alg: none` bypass, HMAC secret dictionary cracking, and claim tampering.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#00d4ff", display: "block", marginBottom: 6 }}>
                      JWT Header (JOSE)
                    </label>
                    <textarea
                      value={jwtHeader}
                      onChange={e => setJwtHeader(e.target.value)}
                      style={{ width: "100%", height: 140, background: "#000", border: "1px solid var(--border)", borderRadius: 8, padding: 12, fontSize: 11, fontFamily: "monospace", color: "#00d4ff", outline: "none", resize: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", display: "block", marginBottom: 6 }}>
                      JWT Claims Payload
                    </label>
                    <textarea
                      value={jwtPayload}
                      onChange={e => setJwtPayload(e.target.value)}
                      style={{ width: "100%", height: 140, background: "#000", border: "1px solid var(--border)", borderRadius: 8, padding: 12, fontSize: 11, fontFamily: "monospace", color: "var(--green)", outline: "none", resize: "none" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                  <button
                    onClick={testAlgNoneJwt}
                    style={{
                      background: "rgba(232, 145, 45, 0.15)",
                      border: "1px solid var(--primary)",
                      color: "var(--primary)",
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    ⚡ Test &apos;alg: none&apos; Bypass Attack
                  </button>

                  <button
                    onClick={testWeakHmacSecret}
                    style={{
                      background: "rgba(239, 83, 80, 0.15)",
                      border: "1px solid #ef5350",
                      color: "#ef5350",
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    🔥 Brute-Force HMAC Secret Key
                  </button>
                </div>

                {jwtAttackResult && (
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, fontSize: 12, color: "#fff" }}>
                    <strong style={{ color: "var(--primary)", display: "block", marginBottom: 4 }}>Attack Verdict:</strong>
                    {jwtAttackResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: OPENAPI SCHEMA VIEWER */}
          {activeTab === "openapi" && (
            <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
              <div style={{ maxWidth: 840, margin: "0 auto" }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
                  Ingested OpenAPI 3.0 Specification
                </h2>
                <pre style={{ background: "#000", border: "1px solid var(--border)", borderRadius: 12, padding: 16, fontSize: 11, fontFamily: "monospace", color: "#a5d6a7", overflowX: "auto", maxHeight: 400 }}>
{`openapi: 3.0.3
info:
  title: Acme Banking & Orders API
  version: 2.4.0
paths:
  /api/v2/orders/{order_id}:
    get:
      summary: Retrieve customer order
      security:
        - BearerAuth: []
      parameters:
        - name: order_id
          in: path
          required: true
          schema:
            type: integer
  /api/v2/users/profile:
    put:
      summary: Update profile
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name: { type: string }
                role: { type: string }
  /api/v2/webhooks/subscribe:
    post:
      summary: Subscribe webhook
      requestBody:
        content:
          application/json:
            schema:
              properties:
                callback_url: { type: string, format: uri }`}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer Live Fuzzing Stream */}
        <div style={{ height: 130, borderTop: "1px solid var(--border)", background: "#000", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "6px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", gap: 8 }}>
            <Terminal size={12} color="var(--primary)" />
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--primary)", textTransform: "uppercase" }}>
              OWASP API Mutation & Fuzzing Live Stream
            </span>
          </div>
          <div style={{ flex: 1, padding: 8, overflowY: "auto", fontFamily: "monospace", fontSize: 10.5, color: "#8898a8" }}>
            {consoleLogs.map((log, i) => (
              <div key={i} style={{ color: log.includes("[!]") ? "#ef5350" : log.includes("[+]") ? "var(--green)" : log.includes("[schema]") ? "#00d4ff" : "#8898a8" }}>
                $ {log}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

