"use client";
import { useState } from "react";
import {
  Terminal,
  Play,
  Copy,
  Code,
  Layers,
  Zap,
  Globe,
  Radio,
  CheckCircle,
  FileCode,
  Cpu,
  ChevronRight,
  Database
} from "lucide-react";
import { API_GATEWAY_ROUTES } from "@/data/integrationData";
import { ApiGatewayRoute } from "@/types/integration";

export default function ApiGatewayPage() {
  const [routes, setRoutes] = useState<ApiGatewayRoute[]>(API_GATEWAY_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<ApiGatewayRoute>(API_GATEWAY_ROUTES[0]);
  const [activeLang, setActiveLang] = useState<"curl" | "python" | "go" | "ts">("curl");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [queryResponse, setQueryResponse] = useState<any>({
    status: "200 OK",
    latency: "4.8ms",
    data: {
      success: true,
      event_id: "EVT-90412",
      propagated_to: ["cerberus-re", "aegis-recovery", "axiom-dast"],
      timestamp: "2026-08-24T01:14:02.140Z"
    }
  });
  const [copied, setCopied] = useState<boolean>(false);

  const handleExecuteQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setQueryResponse({
        status: "200 OK",
        latency: `${(Math.random() * 8 + 2).toFixed(1)}ms`,
        data: {
          success: true,
          endpoint: selectedRoute.endpointPath,
          method: selectedRoute.method,
          execution_time: new Date().toISOString(),
          downstream: selectedRoute.downstreamService,
          correlation_id: `CORR-${Math.floor(10000 + Math.random() * 90000)}`
        }
      });
    }, 600);
  };

  const getCodeSnippet = () => {
    const url = `https://api.expedite.security${selectedRoute.endpointPath}`;
    switch (activeLang) {
      case "curl":
        return `curl -X ${selectedRoute.method === "GRAPHQL" ? "POST" : selectedRoute.method} "${url}" \\
  -H "Authorization: Bearer exp_live_sec_88493012" \\
  -H "Content-Type: application/json" \\
  -d '{"fleet": "cerberus-re", "action": "stream_sync"}'`;
      case "python":
        return `import httpx

headers = {
    "Authorization": "Bearer exp_live_sec_88493012",
    "Content-Type": "application/json"
}
payload = {"fleet": "cerberus-re", "action": "stream_sync"}

with httpx.Client() as client:
    response = client.${selectedRoute.method.toLowerCase()}(
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
    body := []byte(\`{"fleet": "cerberus-re", "action": "stream_sync"}\`)
    req, _ := http.NewRequest("${selectedRoute.method}", url, bytes.NewBuffer(body))
    req.Header.Set("Authorization", "Bearer exp_live_sec_88493012")
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, _ := client.Do(req)
    fmt.Println(resp.Status)
}`;
      case "ts":
        return `import axios from "axios";

const response = await axios.${selectedRoute.method === "GRAPHQL" ? "post" : selectedRoute.method.toLowerCase()}("${url}", {
  fleet: "cerberus-re",
  action: "stream_sync"
}, {
  headers: {
    Authorization: "Bearer exp_live_sec_88493012",
    "Content-Type": "application/json"
  }
});
console.log(response.data);`;
    }
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px 20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "rgba(168,85,247,0.15)",
            border: "1px solid rgba(168,85,247,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Terminal size={20} color="#a855f7" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
              High-Throughput GraphQL & REST API Gateway
            </h1>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0 0" }}>
              Unified API gateway proxy with live query playground, OpenAPI 3.1 schema viewer, and SDK code generation.
            </p>
          </div>
        </div>

        <button
          onClick={handleExecuteQuery}
          disabled={isExecuting}
          className="btn-primary"
        >
          <Play size={14} className={isExecuting ? "animate-spin" : ""} />
          <span>{isExecuting ? "EXECUTING..." : "Test Endpoint Live"}</span>
        </button>
      </div>

      {/* Gateway Telemetry Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Total Gateway RPS", val: "38,420 rps", sub: "Envoy HTTP/2 mesh", color: "#10b981" },
          { label: "P99 Edge Latency", val: "4.8ms", sub: "Global Anycast routing", color: "#06b6d4" },
          { label: "Success Rate (2xx)", val: "99.98%", sub: "0.02% 4xx rate-limits", color: "#a855f7" },
          { label: "Active Subscribed Fleets", val: "6 Fleets", sub: "Mutual-TLS Authenticated", color: "#f59e0b" }
        ].map((m, i) => (
          <div key={i} className="card-tactical" style={{ padding: "12px 16px" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{m.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc", margin: "4px 0" }}>{m.val}</div>
            <div style={{ fontSize: 10.5, color: m.color, fontWeight: 600 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Gateway Explorer: Routes List (Left) + Code & Runner (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 16 }}>
        {/* Route Directory */}
        <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>
            Available Gateway Endpoints ({routes.length})
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {routes.map((rt) => {
              const isSelected = selectedRoute.id === rt.id;
              const isPost = rt.method === "POST";
              const isGraphql = rt.method === "GRAPHQL";
              const isGrpc = rt.method === "GRPC_STREAM";

              return (
                <div
                  key={rt.id}
                  onClick={() => setSelectedRoute(rt)}
                  style={{
                    background: isSelected ? "rgba(168,85,247,0.12)" : "var(--surface-2)",
                    border: `1px solid ${isSelected ? "#a855f7" : "var(--border)"}`,
                    borderRadius: 6,
                    padding: "10px 12px",
                    cursor: "pointer",
                    transition: "all 0.12s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 900,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: isGraphql ? "rgba(244,63,94,0.15)" : isGrpc ? "rgba(6,182,212,0.15)" : "rgba(16,185,129,0.15)",
                        color: isGraphql ? "#f43f5e" : isGrpc ? "#06b6d4" : "#10b981",
                        border: `1px solid ${isGraphql ? "rgba(244,63,94,0.3)" : isGrpc ? "rgba(6,182,212,0.3)" : "rgba(16,185,129,0.3)"}`,
                        fontFamily: "monospace"
                      }}>
                        {rt.method}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc", fontFamily: "monospace" }}>
                        {rt.endpointPath}
                      </span>
                    </div>
                    <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>
                      {rt.p99LatencyMs}ms
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, color: "var(--muted)" }}>
                    <span>Target: <strong style={{ color: "#06b6d4" }}>{rt.targetPlatform}</strong></span>
                    <span>Auth: <strong style={{ color: "var(--fg-2)" }}>{rt.authLevel}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Code Generator & Interactive Response Runner */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* SDK Code Snippets */}
          <div className="card-tactical" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {(["curl", "python", "go", "ts"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    style={{
                      background: activeLang === lang ? "rgba(168,85,247,0.2)" : "var(--surface-2)",
                      border: `1px solid ${activeLang === lang ? "#a855f7" : "var(--border)"}`,
                      color: activeLang === lang ? "#c084fc" : "var(--muted)",
                      padding: "4px 10px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      textTransform: "uppercase"
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopySnippet}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--fg-2)",
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 4,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <Copy size={12} />
                <span>{copied ? "Copied!" : "Copy Snippet"}</span>
              </button>
            </div>

            <div style={{ background: "#050811", border: "1px solid var(--border)", borderRadius: 6, padding: 12, overflowX: "auto" }}>
              <pre style={{ fontFamily: "monospace", fontSize: 11, color: "#34d399", margin: 0, whiteSpace: "pre-wrap" }}>
                {getCodeSnippet()}
              </pre>
            </div>
          </div>

          {/* Live Response Viewer */}
          <div className="card-tactical" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle size={14} color="#10b981" />
                <span style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>
                  Live Gateway Response: <strong style={{ color: "#10b981" }}>{queryResponse.status}</strong> ({queryResponse.latency})
                </span>
              </div>
              <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                TLS 1.3 · HTTP/2
              </span>
            </div>

            <div style={{ background: "#050811", border: "1px solid var(--border)", borderRadius: 6, padding: 12, height: 180, overflowY: "auto" }}>
              <pre style={{ fontFamily: "monospace", fontSize: 11, color: "#06b6d4", margin: 0, whiteSpace: "pre-wrap" }}>
                {JSON.stringify(queryResponse.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
