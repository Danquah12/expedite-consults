"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RepoInput, { type AttachedSourceFile } from "@/components/scan/RepoInput";
import ScanProgress from "@/components/scan/ScanProgress";
import PostScanValidation from "@/components/scan/PostScanValidation";
import type { LiveScanTelemetry } from "@/lib/enterprise-sast-engine";
import { Shield, CheckCircle2 } from "lucide-react";

type Step = "input" | "scanning" | "validating";

export default function ScanPage() {
  const [step, setStep] = useState<Step>("input");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [commitSha, setCommitSha] = useState("a4f92c81e03b4d12");
  const [language, setLanguage] = useState("Java");
  const [engines, setEngines] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachedSourceFile[]>([]);
  const [telemetry, setTelemetry] = useState<LiveScanTelemetry | null>(null);
  const router = useRouter();

  const handleStart = (params: {
    repoUrl: string;
    branch: string;
    commitSha: string;
    language: string;
    engines: string[];
    attachedFiles: AttachedSourceFile[];
  }) => {
    setRepo(params.repoUrl);
    setBranch(params.branch);
    setCommitSha(params.commitSha);
    setLanguage(params.language);
    setEngines(params.engines);
    setAttachedFiles(params.attachedFiles);
    setStep("scanning");
  };

  const handleScanComplete = (scanTelemetry?: LiveScanTelemetry) => {
    if (scanTelemetry) {
      setTelemetry(scanTelemetry);
    }
    setTimeout(() => setStep("validating"), 700);
  };

  const handleValidationComplete = () => {
    router.push("/dashboard");
  };

  const stepLabels = [
    { step: 1, title: "Repository & 10-Lang AST", sub: "Repo URL or Attached Codebase" },
    { step: 2, title: "400-Plugin Multi-Engine Scan", sub: "XTRIKE XQL · DeepFlow · StructSCA · DepGuard" },
    { step: 3, title: "Finding Validation (A–F)", sub: "6-Point Proof Contract" },
    { step: 4, title: "Verified Dashboard", sub: "Triage & remediation" },
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
                Scan &amp; Proof Validation Workspace
              </h1>
              <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 4 }}>
                Connect a code repository or attach source code across 10 languages, execute XTRIKE XQL / XTRIKE DeepFlow / XTRIKE StructSCA + 400 OWASP/NIST plugins, and verify 6-point proof contracts.
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
              branch={branch}
              commitSha={commitSha}
              language={language}
              engines={engines}
              attachedFiles={attachedFiles}
              onComplete={handleScanComplete}
            />
          )}
          {step === "validating" && (
            <PostScanValidation
              repo={repo}
              language={language}
              telemetry={telemetry}
              onFinishToDashboard={handleValidationComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
