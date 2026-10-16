"use client";
import React, { useState, useEffect } from "react";
import DastVulnManagementTab from "@/components/vuln-management/DastVulnManagementTab";
import Link from "next/link";
import { Brain, ArrowLeft, RefreshCw } from "lucide-react";

export default function VulnManagementPage() {
  const [primaryUrl, setPrimaryUrl] = useState("https://demo.testfire.net");
  const [scopedUrls, setScopedUrls] = useState<string[]>(["https://demo.testfire.net"]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("xtrike_dast_vuln_mgmt_sync");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.primaryTargetUrl) setPrimaryUrl(parsed.primaryTargetUrl);
        if (Array.isArray(parsed.scopedTargetUrls) && parsed.scopedTargetUrls.length > 0) {
          setScopedUrls(parsed.scopedTargetUrls);
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
              background: "rgba(56,189,248,0.14)",
              border: "1px solid rgba(56,189,248,0.4)",
              color: "#38bdf8",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <ArrowLeft size={13} />
            <span>Back to Engine Brain DAST Scanner</span>
          </Link>
          <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
            Synced with Engine Brain Target Scope: <strong style={{ color: "#10b981" }}>{scopedUrls.join(", ")}</strong>
          </span>
        </div>
      </div>

      <DastVulnManagementTab
        primaryTargetUrl={primaryUrl}
        scopedTargetUrls={scopedUrls}
      />
    </div>
  );
}
