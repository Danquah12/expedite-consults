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

// Map CodeQL/Joern queries based on finding ID
const CODEQL_QUERIES: Record<string, string> = {
  "F-001": `/**
 * @name SQL Injection
 * @kind path-problem
 * @id java/sql-injection
 */
import java
import semmle.code.java.security.QueryInjection
import QueryInjectionFlow::PathGraph

from QueryInjectionFlow::PathNode source, QueryInjectionFlow::PathNode sink
where QueryInjectionFlow::flowPath(source, sink)
select sink.getNode(), source, sink, "SQL Injection flow path detected."`,
  "F-002": `/**
 * @name Deserialization of untrusted data
 * @kind path-problem
 * @id java/unsafe-deserialization
 */
import java
import semmle.code.java.security.UnsafeDeserialization
import UnsafeDeserializationFlow::PathGraph

from UnsafeDeserializationFlow::PathNode source, UnsafeDeserializationFlow::PathNode sink
where UnsafeDeserializationFlow::flowPath(source, sink)
select sink.getNode(), source, sink, "Deserialization gadget vulnerability detected."`
};

export default function ComplianceMapping({ finding: f }: Props) {
  const codeqlQuery = CODEQL_QUERIES[f.id] || `/**
 * @name Custom AST query
 * @id java/custom-ast-match
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
                className="flex items-start gap-3 rounded-xl p-3"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <div
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 text-[#1f1b18]"
                  style={{ background: color }}
                >
                  {c.reference}
                </div>
                <div className="min-w-0 flex-1">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="text-xs font-semibold text-[#1f1b18]">{c.framework}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <span className="text-[10px] text-[#e5484d] font-bold">NON-COMPLIANT</span>
                      <ShieldAlert size={12} className="text-[#e5484d]" />
                    </span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{c.description}</div>
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

      {/* CodeQL Query Box */}
      <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="text-base font-bold text-[#1f1b18] mb-3 flex items-center gap-2">
          <Code2 size={16} className="text-[#8b4528]" />
          CodeQL Query Node Signature
        </h2>
        <div className="terminal">
          <div className="terminal-header">
            <div className="terminal-dot" style={{ background: "#e5484d" }} />
            <div className="terminal-dot" style={{ background: "#d6a847" }} />
            <div className="terminal-dot" style={{ background: "#46a36e" }} />
            <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>java/query-detect.ql</span>
          </div>
          <pre style={{
            padding: 12,
            background: "#f3eee4",
            fontFamily: "monospace",
            fontSize: 9.5,
            color: "#8b4528",
            overflowX: "auto",
            lineHeight: 1.4,
            maxHeight: 180
          }}>
            {codeqlQuery}
          </pre>
        </div>
        <div className="text-[10px] text-slate-500 mt-2">
          This CodeQL script checks structural patterns inside AST compiler trees to trace path reachability.
        </div>
      </div>

    </div>
  );
}
