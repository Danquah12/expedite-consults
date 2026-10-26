"use client";
import React, { useState, useEffect } from "react";
import DastVulnManagementTab from "@/components/vuln-management/DastVulnManagementTab";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function VulnManagementPage() {
  const [primaryUrl, setPrimaryUrl] = useState("https://vwad.owasp.org");
  const [scopedUrls, setScopedUrls] = useState<string[]>(["https://vwad.owasp.org"]);
  const [engineResults, setEngineResults] = useState<any[]>([]);
  const [engineBrainFindings, setEngineBrainFindings] = useState<any[]>([]);
  const [remediatedIds, setRemediatedIds] = useState<Record<string, boolean>>({});
  const [isPortalCleared, setIsPortalCleared] = useState<boolean>(false);

  useEffect(() => {
    try {
      const rawSync = localStorage.getItem("xtrike_dast_vuln_mgmt_sync");
      if (rawSync) {
        const parsed = JSON.parse(rawSync);
        if (parsed.primaryTargetUrl) setPrimaryUrl(parsed.primaryTargetUrl);
        if (Array.isArray(parsed.scopedTargetUrls) && parsed.scopedTargetUrls.length > 0) {
          setScopedUrls(parsed.scopedTargetUrls);
        }
        if (Array.isArray(parsed.engineBrainFindings)) {
          setEngineBrainFindings(parsed.engineBrainFindings);
        }
        if (Array.isArray(parsed.engineResults)) {
          setEngineResults(parsed.engineResults);
        }
        if (typeof parsed.isPortalCleared === "boolean") {
          setIsPortalCleared(parsed.isPortalCleared);
        }
      }
      const rawFindings = localStorage.getItem("axiom_last_findings");
      if (rawFindings) {
        const parsedF = JSON.parse(rawFindings);
        if (Array.isArray(parsedF)) {
          setEngineBrainFindings(parsedF);
        }
      }
      const rawEngineRes = localStorage.getItem("axiom_last_engine_results");
      if (rawEngineRes) {
        const parsedRes = JSON.parse(rawEngineRes);
        if (Array.isArray(parsedRes)) {
          setEngineResults(parsedRes);
        }
      }
      const rawTargets = localStorage.getItem("axiom_last_targets");
      if (rawTargets) {
        const list = rawTargets.split(",").map(s => s.trim()).filter(Boolean);
        if (list.length > 0) {
          setPrimaryUrl(list[0]);
          setScopedUrls(list);
        }
      }
      const rawRetest = localStorage.getItem("axiom_last_retest_map");
      if (rawRetest) {
        const parsedRt = JSON.parse(rawRetest);
        if (parsedRt && typeof parsedRt === "object") {
          const remMap: Record<string, boolean> = {};
          Object.entries(parsedRt).forEach(([k, v]: [string, any]) => {
            if (v?.status === "VERIFIED_FIXED" || v?.status === "MITIGATED_WAF") {
              remMap[k] = true;
            }
          });
          setRemediatedIds(remMap);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div style={{ padding: "18px 20px", maxWidth: 1600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Link
            href="/engine"
            style={{
              textDecoration: "none",
              background: "var(--surface)",
              border: "1px solid var(--surface-3)",
              color: "#e2e8f0",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <ArrowLeft size={13} color="#38bdf8" />
            <span>Back to Engine Brain DAST Scanner</span>
          </Link>
          <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
            Synced with Engine Brain Target Scope: <strong style={{ color: "#38bdf8" }}>{scopedUrls.join(", ")}</strong> ({engineBrainFindings.length} Validated Findings)
          </span>
        </div>
      </div>

      <DastVulnManagementTab
        primaryTargetUrl={primaryUrl}
        scopedTargetUrls={scopedUrls}
        engineResults={engineResults}
        engineBrainFindings={engineBrainFindings}
        remediatedIds={remediatedIds}
        isPortalCleared={isPortalCleared}
      />
    </div>
  );
}
