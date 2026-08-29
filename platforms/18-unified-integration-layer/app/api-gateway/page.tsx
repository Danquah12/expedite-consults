"use client";
import { useState } from "react";
import {
  Terminal, Play, Copy, Code, Layers, Zap, Globe, Radio, CheckCircle,
  FileCode, Cpu, ChevronRight, Database, Info, HelpCircle, ArrowRight,
  Send, Sparkles, Check, CheckCircle2
} from "lucide-react";
import { API_GATEWAY_ROUTES } from "@/data/integrationData";
import { ApiGatewayRoute } from "@/types/integration";

export default function ApiGatewayPage() {
  const [routes, setRoutes] = useState<ApiGatewayRoute[]>(API_GATEWAY_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<ApiGatewayRoute>(API_GATEWAY_ROUTES[0]);
  const [activeLang, setActiveLang] = useState<"curl" | "python" | "go" | "ts" | "ps">("curl");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [customParam, setCustomParam] = useState<string>('{"fleet": "cerberus-re", "action": "stream_sync"}');
  
  const [queryResponse, setQueryResponse] = useState<any>({
    status: "200 OK",
    latency: "4.8ms",
    data: {
      success: true,
      event_id: "EVT-90412",
      propagated_to: ["cerberus-re", "aegis-recovery", "axiom-dast"],
      timestamp: new Date().toISOString()
    }
  });

  const handleExecuteQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      const latency = (Math.random() * 6 + 2).toFixed(1);
      setQueryResponse({
        status: "200 OK",
        latency: `${latency}ms`,
        data: {
          success: true,
          endpoint: selectedRoute.endpointPath,
          method: selectedRoute.method,
          execution_time: new Date().toISOString(),
          downstream_service: selectedRoute.downstreamService,
          correlation_id: `CORR-${Math.floor(10000 + Math.random() * 90000)}`,
          rate_limit_remaining: "49,998 / min"
        }
      });
    }, 500);
  };

  const getCodeSnippet = () => {
    const url = `https://api.expedite.security${selectedRoute.endpointPath}`;
    switch (activeLang) {
      case "curl":
        return `curl -X ${selectedRoute.method === "GRAPHQL" ? "POST" : selectedRoute.method} "${url}" \
  -H "Authorization: Bearer exp_live_sec_88493012" \
  -H "Content-Type: application/json" \
  -d '${customParam}'`;
      case "python":
        return `import httpx

headers = {
    "Authorization": "Bearer exp_live_sec_88493012",
    "Content-Type": "application/json"
}
payload = ${customParam}

with httpx.Client() as client:
    response = client.${selectedRoute.method === "GRAPHQL" ? "post" : selectedRoute.method.toLowerCase()}(
        "${url}",
        json=payload,
        headers=headers,
        timeout=10.0
    )
    print(response.json())`;
      case "go":
        return `package main

import (
    "bytes"
    "fmt"
    "net/http"
)

func main() {
    url := "${url}"
    body := []byte(\`${customParam}\`)
    req, _ := http.NewRequest("${selectedRoute.method === "GRAPHQL" ? "POST" : selectedRoute.method}", url, bytes.NewBuffer(body))
    req.Header.Set("Authorization", "Bearer exp_live_sec_88493012")
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, _ := client.Do(req)
    fmt.Println(resp.Status)
}`;
      case "ts":
        return `const response = await fetch("${url}", {
  method: "${selectedRoute.method === "GRAPHQL" ? "POST" : selectedRoute.method}",
  headers: {
    "Authorization": "Bearer exp_live_sec_88493012",
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${customParam})
});
const data = await response.json();
console.log(data);`;
      case "ps":
        return `$headers = @{
    "Authorization" = "Bearer exp_live_sec_88493012"
    "Content-Type"  = "application/json"
}
$body = '${customParam}'

$response = Invoke-RestMethod -Uri "${url}" -Method ${selectedRoute.method === "GRAPHQL" ? "POST" : selectedRoute.method} -Headers $headers -Body $body
$response`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1600, margin: "0 auto" }}>
      
      {/* ── Top Executive Header Banner ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(139,92,246,0.1) 100%)",
        border: "1px solid rgba(6,182,212,0.3)",
        borderRadius: 12,
        padding: "18px 24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: "linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(6,182,212,0.35)"
          }}>
            <Terminal size={24} color="#050811" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>
                High-Throughput GraphQL & REST API Gateway
              </h1>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                background: "rgba(6,182,212,0.15)",
                color: "#06b6d4",
                border: "1px solid rgba(6,182,212,0.3)",
                padding: "2px 8px",
                borderRadius: 4,
                fontFamily: "monospace"
              }}>
                gRPC / REST / GRAPHQL
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "3px 0 0 0" }}>
              Unified API gateway proxy with live query playground, multi-language SDK code generation, and automated Envoy rate limiting.
            </p>
          </div>
        </div>

        <button
          onClick={handleExecuteQuery}
          disabled={isExecuting}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "8px 16px" }}
        >
          <Play size={13} fill="#fff" />
          <span>{isExecuting ? "Executing Query..." : "Test Endpoint Live"}</span>
        </button>
      </div>

      {/* ── Plain-English Helper Card ── */}
      <div style={{
        background: "rgba(6,182,212,0.06)",
        border: "1px solid rgba(6,182,212,0.25)",
        borderRadius: 10,
        padding: "14px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12
      }}>
        <HelpCircle size={20} color="#06b6d4" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--foreground-muted)" }}>
          <strong style={{ color: "#06b6d4" }}>What Is An API Gateway? </strong>
          Think of this as the secure central dispatcher for the entire cybersecurity ecosystem. When a scanner finds a vulnerability or malware, it makes a lightweight API request here. The gateway instantly verifies authentication tokens, enforces rate limits, and notifies all other platforms in under 5 milliseconds.
        </div>
      </div>

      {/* ── 4 Top Gateway Metrics ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Gateway RPS", val: "38,420 rps", sub: "Envoy HTTP/2 mesh", color: "#06b6d4" },
          { label: "P99 Edge Latency", val: "4.8ms", sub: "Global Anycast routing", color: "#10b981" },
          { label: "Success Rate (2XX)", val: "99.98%", sub: "0.02% 4xx rate-limits", color: "#a855f7" },
          { label: "Active Subscribed Fleets", val: "6 Fleets", sub: "Mutual-TLS Authenticated", color: "#f59e0b" }
        ].map((m, i) => (
          <div key={i} className="card-tactical" style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc", margin: "4px 0" }}>{m.val}</div>
            <div style={{ fontSize: 11, color: m.color, fontWeight: 600 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Interactive Endpoints List & Live Playground ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 18 }}>
        
        {/* Left: Available Gateway Endpoints */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <strong style={{ fontSize: 13, color: "#f8fafc" }}>Available Gateway Endpoints ({routes.length})</strong>
            <span style={{ fontSize: 10.5, color: "var(--muted)" }}>Click to load into Playground:</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {routes.map((route) => {
              const isSelected = selectedRoute.id === route.id;
              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRoute(route)}
                  style={{
                    background: isSelected ? "rgba(6,182,212,0.12)" : "var(--surface-2)",
                    border: `1px solid ${isSelected ? "#06b6d4" : "var(--border)"}`,
                    borderRadius: 8,
                    padding: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.15s"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 900,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: route.method === "POST" ? "rgba(16,185,129,0.2)" : route.method === "GET" ? "rgba(56,189,248,0.2)" : "rgba(168,85,247,0.2)",
                        color: route.method === "POST" ? "#10b981" : route.method === "GET" ? "#38bdf8" : "#c084fc"
                      }}>
                        {route.method}
                      </span>
                      <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>
                        {route.endpointPath}
                      </span>
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)" }}>
                      Target: <span style={{ color: "#38bdf8" }}>{route.downstreamService}</span> · Auth: {route.authType}
                    </div>
                  </div>

                  <span style={{ fontFamily: "monospace", fontSize: 10.5, color: "#10b981", fontWeight: 700 }}>
                    {route.latencyMs}ms
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Code Generator & Live HTTP Response Console */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          
          {/* Language Selector & Copy Button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { id: "curl", label: "cURL" },
                { id: "python", label: "Python" },
                { id: "go", label: "Go" },
                { id: "ts", label: "TypeScript" },
                { id: "ps", label: "PowerShell" }
              ].map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setActiveLang(lang.id as any)}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 4,
                    border: activeLang === lang.id ? "1px solid #06b6d4" : "1px solid var(--border)",
                    background: activeLang === lang.id ? "rgba(6,182,212,0.2)" : "var(--surface-3)",
                    color: activeLang === lang.id ? "#06b6d4" : "var(--muted)",
                    cursor: "pointer"
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopyCode}
              style={{
                background: "var(--surface-3)",
                border: "1px solid var(--border)",
                color: copied ? "#10b981" : "var(--fg)",
                fontSize: 10.5,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 4,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              <span>{copied ? "Copied!" : "Copy Snippet"}</span>
            </button>
          </div>

          {/* Generated Code Box */}
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
            {getCodeSnippet()}
          </pre>

          {/* Live Response Box */}
          <div style={{
            background: "#050811",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>Live Gateway Response:</span>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: "#10b981", background: "rgba(16,185,129,0.15)", padding: "1px 6px", borderRadius: 3 }}>
                  {queryResponse.status} ({queryResponse.latency})
                </span>
              </div>
              <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>TLS 1.3 · HTTP/2</span>
            </div>

            <pre style={{
              margin: 0,
              fontFamily: "monospace",
              fontSize: 11,
              color: "#34d399",
              overflowY: "auto",
              maxHeight: 160
            }}>
              {JSON.stringify(queryResponse.data, null, 2)}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
}
