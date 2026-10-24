"use client";

import { ShieldCheck, ShieldAlert, Code2 } from "lucide-react";
import type { SASTFinding } from "@/types/sast";

type Props = { finding: SASTFinding };

const FW_COLORS: Record<string, string> = {
  "PCI DSS":      "#46a36e",
  "NIST 800-53":  "#8b4528",
  "ISO 27001":    "#8b4528",
  "CIS Controls": "#e2853b",
  "OWASP Top 10": "#e2853b",
};

// Map XTRIKE XQL queries based on finding ID
const XQL_QUERIES: Record<string, string> = {
  "F-001": `/**
 * @name SQL Injection
 * @kind path-problem
 * @id xtrike/java/sql-injection
 */
import java
import xtrike.code.java.security.QueryInjection
import QueryInjectionFlow::PathGraph

from QueryInjectionFlow::PathNode source, QueryInjectionFlow::PathNode sink
where QueryInjectionFlow::flowPath(source, sink)
select sink.getNode(), source, sink, "SQL Injection flow path detected."`,
  "F-002": `/**
 * @name Deserialization of untrusted data
 * @kind path-problem
 * @id xtrike/java/unsafe-deserialization
 */
import java
import xtrike.code.java.security.UnsafeDeserialization
import UnsafeDeserializationFlow::PathGraph

from UnsafeDeserializationFlow::PathNode source, UnsafeDeserializationFlow::PathNode sink
where UnsafeDeserializationFlow::flowPath(source, sink)
select sink.getNode(), source, sink, "Deserialization gadget vulnerability detected."`
};

export default function ComplianceMapping({ finding: f }: Props) {
  const xqlQuery = XQL_QUERIES[f.id] || `/**
 * @name XTRIKE Custom AST Query
 * @id xtrike/custom-ast-match
 */
import java
from MethodCall call
where call.getMethod().hasName("${f.sink.split("(")[0]}")
select call, "Matching invocation signature."`;

  return (
    <div className="space-y-6">
      
      {/* Compliance Section */}
      <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="text-lg font-bold text-[#1f1b18] mb-5 flex items-center gap-2">
          <span>📋 Enterprise Compliance Mapping</span>
        </h2>

        <div className="space-y-3">
          {f.compliance.map((c, i) => {
            const color = FW_COLORS[c.framework] || "var(--primary)";
            return (
              <div
                key={i}
                className="rounded-xl p-3.5 overflow-hidden"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span className="text-xs font-bold text-[#1f1b18]">{c.framework}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <span className="text-[10px] text-[#e5484d] font-bold">NON-COMPLIANT</span>
                    <ShieldAlert size={12} className="text-[#e5484d]" />
                  </span>
                </div>

                <div>
                  <span
                    className="px-2.5 py-1 rounded-md text-[10.5px] font-bold inline-block"
                    style={{
                      background: color,
                      color: "#fbf8f3",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                      maxWidth: "100%",
                      lineHeight: 1.35,
                    }}
                  >
                    {c.reference}
                  </span>
                </div>

                <div
                  className="text-xs"
                  style={{
                    color: "var(--muted)",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    lineHeight: 1.45,
                  }}
                >
                  {c.description}
                </div>
              </div>
            );
          })}
        </div>

        {f.compliance.length === 0 && (
          <div className="text-sm text-center py-6" style={{ color: "var(--muted)" }}>
            No compliance mapping for this finding.
          </div>
        )}
      </div>

      {/* XTRIKE XQL Query Box */}
      <div className="rounded-2xl p-6 overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="text-base font-bold text-[#1f1b18] mb-3 flex items-center gap-2">
          <Code2 size={16} className="text-[#8b4528] shrink-0" />
          <span>XTRIKE XQL Query Node Signature</span>
        </h2>
        <div className="terminal overflow-hidden">
          <div className="terminal-header">
            <div className="terminal-dot" style={{ background: "#e5484d" }} />
            <div className="terminal-dot" style={{ background: "#d6a847" }} />
            <div className="terminal-dot" style={{ background: "#46a36e" }} />
            <span className="ml-2 text-xs truncate" style={{ color: "var(--muted)" }}>xtrike/query-detect.xql</span>
          </div>
          <pre style={{
            padding: 12,
            background: "#f3eee4",
            fontFamily: "monospace",
            fontSize: 10,
            color: "#8b4528",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            lineHeight: 1.45,
            maxHeight: 200,
            overflowY: "auto"
          }}>
            {xqlQuery}
          </pre>
        </div>
        <div className="text-[10px] text-slate-500 mt-2">
          This XTRIKE XQL predicate checks structural patterns inside AST compiler trees to trace path reachability.
        </div>
      </div>

    </div>
  );
}
