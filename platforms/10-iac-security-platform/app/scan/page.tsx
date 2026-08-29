"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Code2, Play, CheckCircle2, ChevronRight, FolderOpen } from "lucide-react";

const SAMPLE_REPOS = [
  { name: "acme/infrastructure",      framework: "Terraform",       files: 87,  provider: "AWS"   },
  { name: "acme/azure-infra",          framework: "Terraform",       files: 34,  provider: "Azure" },
  { name: "acme/cloudformation-stacks",framework: "CloudFormation",  files: 22,  provider: "AWS"   },
];

const ALL_LOGS = [
  "[INIT]     Discovering IaC files in repository...",
  "[INIT]     Found 87 Terraform files, 22 CloudFormation templates",
  "[CHECKOV]  Running 500+ security policies (Checkov v3)...",
  "[CHECKOV]  🔴 CKV_AWS_20: aws_s3_bucket.customer_data — Public ACL set",
  "[CHECKOV]  🔴 CKV_AWS_25: aws_security_group_rule.ssh_ingress — SSH open to 0.0.0.0/0",
  "[CHECKOV]  🔴 CKV_AWS_17: aws_db_instance.customer_postgres — storage_encrypted=false",
  "[TFSEC]    Running tfsec deep analysis...",
  "[TFSEC]    🟠 HIGH: aws_iam_policy.app_policy — Wildcard action on all resources",
  "[TFSEC]    🟠 HIGH: aws_cloudtrail.main — Multi-region trail not enabled",
  "[TERRASCAN] Scanning against NIST 800-53, PCI DSS, CIS AWS...",
  "[TERRASCAN] 🟠 HIGH: aws_instance.api_server — IMDSv1 enabled (CVE pattern: Capital One breach)",
  "[REGULA]   Evaluating OPA policies...",
  "[REGULA]   🟡 MEDIUM: aws_vpc.production — VPC Flow Logs not enabled",
  "[DONE]     87 files, 412 resources — 25 findings (3 Critical, 8 High, 14 Medium)",
];

const PHASES = [
  { label: "Discover IaC Files",     threshold: 15 },
  { label: "Checkov Analysis",        threshold: 40 },
  { label: "tfsec Deep Scan",         threshold: 65 },
  { label: "Terrascan Compliance",    threshold: 85 },
  { label: "OPA Policy Evaluation",  threshold: 100 },
];

function ScanProgress({ repo, onComplete }: { repo: string; onComplete: () => void }) {
  const [logs, setLogs]         = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [critical, setCritical] = useState(0);
  const [done, setDone]         = useState(false);
  const logRef        = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    let logIdx = 0;
    const logIv = setInterval(() => {
      if (logIdx < ALL_LOGS.length) {
        const log = ALL_LOGS[logIdx];
        setLogs(l => [...l, log]);
        if (log.includes("🔴")) setCritical(c => c + 1);
        logIdx++;
      } else { clearInterval(logIv); setDone(true); }
    }, 460);
    intervals.push(logIv);

    const progIv = setInterval(() => setProgress(p => Math.min(100, p + Math.random() * 5 + 2)), 90);
    intervals.push(progIv);

    const t = setTimeout(() => { clearInterval(progIv); setProgress(100); onCompleteRef.current(); }, 8000);
    timers.push(t);
    return () => { timers.forEach(clearTimeout); intervals.forEach(clearInterval); };
  }, []);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      <div className="rounded-xl px-5 py-3.5 text-sm font-mono"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <span style={{ color: "var(--muted)" }}>🏗️ Scanning: </span>
        <span style={{ color: "var(--primary)" }}>{repo}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Critical",     value: critical.toString(), color: critical > 0 ? "var(--critical)" : "var(--muted)" },
          { label: "Files",        value: `${Math.floor(progress * 0.87)}`,          color: "var(--primary)" },
          { label: "Progress",     value: `${Math.round(progress)}%`,                color: "var(--low)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px]" style={{ color: "var(--muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {PHASES.map(phase => {
          const active  = progress >= phase.threshold;
          const current = progress >= phase.threshold - 25 && progress < phase.threshold;
          return (
            <div key={phase.label} className="flex items-center gap-3">
              {active
                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--low)" }} />
                : <div className="w-4 h-4 rounded-full border flex-shrink-0"
                    style={{ borderColor: current ? "var(--primary)" : "var(--border)" }} />}
              <span className="text-xs" style={{ color: active ? "var(--low)" : current ? "var(--primary)" : "var(--muted)" }}>
                {phase.label} {current && <span className="animate-pulse">…</span>}
              </span>
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--muted)" }}>
          <span>Overall</span><span style={{ color: "var(--primary)" }}>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface)" }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #f97316, #ea580c)" }} />
        </div>
      </div>

      <div className="terminal">
        <div className="terminal-header">
          <div className="terminal-dot" style={{ background: "#ff5f57" }} />
          <div className="terminal-dot" style={{ background: "#febc2e" }} />
          <div className="terminal-dot" style={{ background: "#28c840" }} />
          <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>iac-scanner</span>
        </div>
        <div ref={logRef} className="p-4 h-44 overflow-y-auto space-y-1 text-xs">
          {logs.filter(Boolean).map((log, i) => (
            <div key={i} style={{
              color: log.startsWith("[DONE]")     ? "var(--low)"
                   : log.includes("🔴")          ? "var(--critical)"
                   : log.includes("🟠")          ? "var(--high)"
                   : log.includes("🟡")          ? "var(--medium)"
                   : log.startsWith("[CHECKOV]")  ? "#f97316"
                   : log.startsWith("[TFSEC]")    ? "#a78bfa"
                   : log.startsWith("[TERRASCAN]")? "#38bdf8"
                   : log.startsWith("[REGULA]")   ? "#34d399"
                   : "var(--muted)",
            }}>{log}</div>
          ))}
          {!done && <div className="cursor-blink" style={{ color: "var(--primary)" }}>$ </div>}
        </div>
      </div>

      {done && (
        <div className="rounded-xl px-5 py-4 flex items-center gap-3 text-sm font-semibold"
          style={{ background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.3)" }}>
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span style={{ color: "var(--critical)" }}>25 findings (3 Critical, 8 High) · Redirecting to dashboard…</span>
        </div>
      )}
    </div>
  );
}

type Step = "input" | "scanning";

export default function ScanPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep]   = useState<Step>("input");
  const [repo, setRepo]   = useState("");
  const router = useRouter();

  const handleStart    = (r: string) => { setRepo(r); setStep("scanning"); };
  const handleComplete = ()          => setTimeout(() => router.push("/dashboard"), 1500);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)" }}>
              <Code2 className="w-7 h-7" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Scan Infrastructure Code</h1>
            <p style={{ color: "var(--muted)" }}>Checkov · tfsec · Terrascan · OPA Regula — 500+ security policies across AWS, Azure, GCP.</p>
          </div>

          <div className="rounded-2xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {step === "input" && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Sample Repositories</p>
                  <div className="space-y-2">
                    {SAMPLE_REPOS.map(r => (
                      <button key={r.name} onClick={() => setRepo(r.name)}
                        className="w-full text-left rounded-xl p-4 transition-all"
                        style={{
                          background: repo === r.name ? "rgba(249,115,22,0.08)" : "var(--background)",
                          border: `1px solid ${repo === r.name ? "rgba(249,115,22,0.4)" : "var(--border)"}`,
                        }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🏗️</span>
                            <span className="text-sm font-mono text-white">{r.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded"
                              style={{ background: "var(--border)", color: "var(--muted)" }}>{r.framework}</span>
                            <span className="text-xs px-2 py-0.5 rounded"
                              style={{ background: "var(--border)", color: "var(--muted)" }}>{r.provider}</span>
                          </div>
                          <span className="text-xs" style={{ color: "var(--muted)" }}>{r.files} files</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-white mb-3">Policies Included</p>
                  <div className="flex flex-wrap gap-2">
                    {["CIS AWS Benchmark", "PCI DSS", "HIPAA", "SOC2", "NIST 800-53", "ISO 27001"].map(p => (
                      <span key={p} className="px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", color: "var(--primary)" }}>
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>

                <button onClick={() => handleStart(repo || SAMPLE_REPOS[0].name)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff" }}>
                  <Play className="w-5 h-5" /> Start IaC Scan <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            {step === "scanning" && <ScanProgress repo={repo} onComplete={handleComplete} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
