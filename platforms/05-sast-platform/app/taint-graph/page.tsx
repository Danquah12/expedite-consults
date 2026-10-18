"use client";

import { useState } from "react";
import { GitGraph, ArrowRight, ShieldCheck, AlertTriangle, Code2, Layers } from "lucide-react";

export default function TaintGraphPage() {
  const [selectedNode, setSelectedNode] = useState("sink");

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 4, background: "rgba(70, 163, 110, 0.15)", border: "1px solid rgba(70, 163, 110, 0.4)", color: "#46a36e", fontSize: 11, fontWeight: 800, marginBottom: 8 }}>
          <GitGraph size={13} />
          <span>INTER-PROCEDURAL TAINT GRAPH</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1f1b18" }}>Inter-Procedural Data Flow DAG</h1>
        <p style={{ fontSize: 14, color: "#5c5349" }}>
          Track untrusted input propagation across controllers, services, and queries to identify the exact sanitizer bypass.
        </p>
      </div>

      <div style={{
        background: "#fbf8f3",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        overflowX: "auto"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 800, gap: 16 }}>
          <div
            onClick={() => setSelectedNode("source")}
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              background: "rgba(229, 72, 77, 0.15)",
              border: selectedNode === "source" ? "2px solid #e5484d" : "1px solid rgba(229, 72, 77, 0.4)",
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: "#e5484d", textTransform: "uppercase" }}>TAINT SOURCE</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#1f1b18", marginTop: 4 }}>req.body.searchQuery</div>
            <div style={{ fontSize: 10.5, color: "#4a4239", marginTop: 2 }}>routes/api.ts:L14</div>
          </div>

          <div style={{ color: "#8b4528", fontSize: 20, fontWeight: 900 }}>&rarr;</div>

          <div
            onClick={() => setSelectedNode("controller")}
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              background: "#f4e5dc",
              border: selectedNode === "controller" ? "2px solid #8b4528" : "1px solid var(--border)",
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: "#8b4528", textTransform: "uppercase" }}>CONTROLLER</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#1f1b18", marginTop: 4 }}>searchController.handle()</div>
            <div style={{ fontSize: 10.5, color: "#4a4239", marginTop: 2 }}>controllers/search.ts:L28</div>
          </div>

          <div style={{ color: "#8b4528", fontSize: 20, fontWeight: 900 }}>&rarr;</div>

          <div
            onClick={() => setSelectedNode("sanitizer")}
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              background: "rgba(226, 133, 59, 0.15)",
              border: selectedNode === "sanitizer" ? "2px solid #e2853b" : "1px solid rgba(226, 133, 59, 0.4)",
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: "#e2853b", textTransform: "uppercase" }}>SANITIZER GAP</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#1f1b18", marginTop: 4 }}>No Escaping Applied</div>
            <div style={{ fontSize: 10.5, color: "#4a4239", marginTop: 2 }}>Bypassed Validation</div>
          </div>

          <div style={{ color: "#8b4528", fontSize: 20, fontWeight: 900 }}>&rarr;</div>

          <div
            onClick={() => setSelectedNode("sink")}
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              background: "rgba(229, 72, 77, 0.25)",
              border: selectedNode === "sink" ? "2px solid #e5484d" : "1px solid rgba(229, 72, 77, 0.6)",
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: "#e5484d", textTransform: "uppercase" }}>DANGEROUS SINK</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#1f1b18", marginTop: 4 }}>db.queryRaw(sql)</div>
            <div style={{ fontSize: 10.5, color: "#4a4239", marginTop: 2 }}>db/postgres.ts:L92</div>
          </div>
        </div>
      </div>

      <div style={{ background: "#fbf8f3", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1f1b18", marginBottom: 6 }}>Taint Flow Analysis: {selectedNode.toUpperCase()}</h3>
        <p style={{ fontSize: 13, color: "#5c5349", lineHeight: 1.5 }}>
          The user parameter is passed across 3 stack frames without input sanitization or parameterized bindings, resulting in direct execution at PostgreSQL sink.
        </p>
      </div>
    </div>
  );
}
