"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RepoInput, { type ScanStartPayload } from "@/components/scan/RepoInput";
import ScanProgress from "@/components/scan/ScanProgress";
import PostScanValidation from "@/components/scan/PostScanValidation";
import {
  runDynamicRepoOrCodeScan,
  type ActiveScanSession,
} from "@/lib/live-sast-scanner";
import { Shield, CheckCircle2, RotateCcw } from "lucide-react";

type Step = "input" | "scanning" | "validating";

export default function ScanPage() {
  const [step, setStep] = useState<Step>("input");
  const [repo, setRepo] = useState("");
  const [language, setLanguage] = useState("Java");
  const [engines, setEngines] = useState<string[]>([]);
  const [session, setSession] = useState<ActiveScanSession | null>(null);
  const router = useRouter();

  const handleStart = async (payload: ScanStartPayload) => {
    setRepo(payload.repoUrl);
    setLanguage(payload.language);
    setEngines(payload.engines);

    const activeSession = await runDynamicRepoOrCodeScan(payload);
    setSession(activeSession);
    setStep("scanning");
  };

  const handleScanComplete = () => {
    setTimeout(() => setStep("validating"), 600);
  };

  const handleValidationComplete = () => {
    router.push("/dashboard");
  };

  const stepLabels = [
    { step: 1, title: "Repository / Code & Plugins", sub: "GitHub URL or Live Code + 9 Plugins" },
    { step: 2, title: "AST & Standards Scan", sub: "CodeQL · Semgrep · Snyk · Checkmarx" },
    { step: 3, title: "TTP & 9-Standard Validation", sub: "MITRE · OWASP · CWE · CVSS · NIST · PTES" },
    { step: 4, title: "Verified Dashboard", sub: "Dynamic Triage & Remediation" },
  ];
  const currentIdx = step === "input" ? 0 : step === "scanning" ? 1 : 2;

  return (
    <div style={{ minHeight: "100vh", padding: "36px 24px 80px 24px" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        {/* Top Workspace Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={24} color="#8b4528" />
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--foreground)", lineHeight: 1.2 }}>
                Multi-Standard Code Scan &amp; TTP Validation Workspace
              </h1>
              <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 4 }}>
                Scan any GitHub repository or live source code across MITRE ATT&amp;CK TTPs, OWASP Top 10 + ASVS, MITRE CWE, CVSS v3.1/v4.0, NIST 800-53/SSDF, GitHub GHSA, PTES, SearchSploit &amp; Metasploit CheckCode.
              </p>
            </div>
          </div>

          {/* 4-Step Pipeline Progress Bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(150px, 1fr))",
              gap: 10,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 10,
              width: "100%",
              maxWidth: 760,
            }}
          >
            {stepLabels.map((item, idx) => {
              const active = idx === currentIdx;
              const completed = idx < currentIdx;
              return (
                <div
                  key={item.step}
                  style={{
                    background: active ? "var(--surface-2)" : "var(--background)",
                    border: `1px solid ${active ? "#8b4528" : completed ? "rgba(70, 163, 110, 0.4)" : "var(--border)"}`,
                    borderRadius: 8,
                    padding: "8px 10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: active ? "#8b4528" : completed ? "#46a36e" : "var(--muted)",
                      }}
                    >
                      STEP {item.step}
                    </span>
                    {completed && <CheckCircle2 size={13} color="#46a36e" />}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)" }}>{item.title}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{item.sub}</div>
                </div>
              );
            })}
          </div>
        </div>

        {step !== "input" && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => setStep("input")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 13px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                cursor: "pointer",
              }}
            >
              <RotateCcw size={13} color="#8b4528" />
              <span>Scan Another Repository or Code Snippet</span>
            </button>
          </div>
        )}

        {/* Main Workspace Surface */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 28,
          }}
        >
          {step === "input" && <RepoInput onStart={handleStart} />}
          {step === "scanning" && (
            <ScanProgress
              repo={repo}
              language={language}
              engines={engines}
              session={session}
              onComplete={handleScanComplete}
            />
          )}
          {step === "validating" && (
            <PostScanValidation
              repo={repo}
              language={language}
              session={session}
              onFinishToDashboard={handleValidationComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
