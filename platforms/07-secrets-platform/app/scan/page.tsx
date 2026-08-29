"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { KeyRound, Github, Play, CheckCircle2, ChevronRight, GitBranch } from "lucide-react";

const SAMPLE_REPOS = [
  { name: "customer-api",   url: "github.com/acme/customer-api",    lang: "Node.js", expectedSecrets: 4 },
  { name: "payment-service",url: "github.com/acme/payment-service", lang: "Java",    expectedSecrets: 2 },
  { name: "auth-service",   url: "github.com/acme/auth-service",    lang: "Python",  expectedSecrets: 3 },
];

const SCAN_TARGETS = ["Source Code", "Git History (15,847 commits)", "CI/CD Pipelines", "Docker Layers", "Config Files", ".env Files", "IaC Templates"];

const ALL_LOGS = [
  "[INIT]     Cloning repository...",
  "[INIT]     Indexing 48,291 files across 15,847 commits...",
  "[TRUFFLEHOG] Scanning git history for high-entropy strings...",
  "[GITLEAKS]  Running 140 detection rules...",
  "[DETECT]   🔴 MATCH: AWS Access Key — src/services/storage.js:47 (entropy: 6.4)",
  "[VERIFY]   ✓ VERIFIED LIVE — AWS key responds to sts:GetCallerIdentity",
  "[DETECT]   🔴 MATCH: Stripe Live Key — config/stripe.ts:12 (entropy: 7.1)",
  "[VERIFY]   ✓ VERIFIED LIVE — Stripe key active, full API access confirmed",
  "[DETECT]   🟠 MATCH: GitHub PAT — scripts/deploy.sh:8 (entropy: 5.8)",
  "[VERIFY]   ✓ VERIFIED LIVE — Token grants repo:* + admin:org scope",
  "[HISTORY]  Scanning git history — found 3 secrets buried in old commits",
  "[DETECT]   🔴 MATCH: RSA Private Key — keys/prod_rsa.pem:1",
  "[DETECT]   🟡 MATCH: Slack Webhook — alerts/alertmanager.yml:34",
  "[DETECT]   🔴 MATCH: Database URL (PostgreSQL admin) — docker-compose.prod.yml:23",
  "[DONE]     Scan complete — 8 secrets detected, 5 critical, 3 verified live",
];

function ScanProgress({ repo, onComplete }: { repo: string; onComplete: () => void }) {
  const [logs, setLogs]         = useState<string[]>([]);
  const [phase, setPhase]       = useState(0);
  const [progress, setProgress] = useState(0);
  const [found, setFound]       = useState(0);
  const [done, setDone]         = useState(false);
  const logRef                  = useRef<HTMLDivElement>(null);
  const onCompleteRef           = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const PHASES = ["Cloning & Indexing", "Pattern Matching", "Live Validation", "Git History", "Report Generation"];

  useEffect(() => {
    const timers:    ReturnType<typeof setTimeout>[]  = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    let logIdx = 0;
    const logIv = setInterval(() => {
      if (logIdx < ALL_LOGS.length) {
        const log = ALL_LOGS[logIdx];
        setLogs(l => [...l, log]);
        if (log.startsWith("[DETECT]")) setFound(f => f + 1);
        logIdx++;
      } else { clearInterval(logIv); setDone(true); }
    }, 440);
    intervals.push(logIv);

    const progIv = setInterval(() => setProgress(p => Math.min(100, p + Math.random() * 5 + 2)), 90);
    intervals.push(progIv);

    [800, 2000, 3500, 5000, 6200].forEach((delay, i) => {
      const t = setTimeout(() => setPhase(i + 1), delay);
      timers.push(t);
    });

    const t = setTimeout(() => { clearInterval(progIv); setProgress(100); onCompleteRef.current(); }, 7500);
    timers.push(t);
    return () => { timers.forEach(clearTimeout); intervals.forEach(clearInterval); };
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      <div className="rounded-xl px-5 py-3.5 text-sm font-mono"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <span style={{ color: "var(--muted)" }}>Scanning: </span>
        <span style={{ color: "var(--primary)" }}>{repo}</span>
      </div>

      {/* Live counter */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Secrets Found", value: found.toString(), color: found > 0 ? "var(--critical)" : "var(--muted)" },
          { label: "Files Scanned", value: `${Math.floor(progress * 482)}`, color: "var(--primary)" },
          { label: "Progress",      value: `${Math.round(progress)}%`, color: "var(--low)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px]" style={{ color: "var(--muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Phases */}
      <div className="space-y-2">
        {PHASES.map((p, i) => (
          <div key={p} className="flex items-center gap-3">
            {i < phase
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--low)" }} />
              : <div className="w-4 h-4 rounded-full border flex-shrink-0"
                  style={{ borderColor: i === phase ? "var(--primary)" : "var(--border)" }} />}
            <span className="text-xs" style={{ color: i < phase ? "var(--low)" : i === phase ? "var(--primary)" : "var(--muted)" }}>
              {p}
            </span>
            {i === phase && <span className="text-[10px] animate-pulse" style={{ color: "var(--muted)" }}>running…</span>}
          </div>
        ))}
      </div>

      {/* Overall bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--muted)" }}>
          <span>Overall</span>
          <span style={{ color: "var(--primary)" }}>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface)" }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #f59e0b, #d97706)" }} />
        </div>
      </div>

      {/* Terminal */}
      <div className="terminal">
        <div className="terminal-header">
          <div className="terminal-dot" style={{ background: "#ff5f57" }} />
          <div className="terminal-dot" style={{ background: "#febc2e" }} />
          <div className="terminal-dot" style={{ background: "#28c840" }} />
          <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>secrets-scanner</span>
        </div>
        <div ref={logRef} className="p-4 h-44 overflow-y-auto space-y-1 text-xs">
          {logs.filter(Boolean).map((log, i) => (
            <div key={i} style={{
              color: log.startsWith("[DONE]")      ? "var(--low)"
                   : log.includes("🔴 MATCH")     ? "var(--critical)"
                   : log.includes("🟠 MATCH")     ? "var(--high)"
                   : log.includes("🟡 MATCH")     ? "var(--medium)"
                   : log.startsWith("[VERIFY]")   ? "var(--primary)"
                   : log.startsWith("[HISTORY]")  ? "#a78bfa"
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
          <span style={{ color: "var(--critical)" }}>8 secrets detected · 5 critical · 3 verified live · Redirecting…</span>
        </div>
      )}
    </div>
  );
}

type Step = "input" | "scanning";

export default function ScanPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step,    setStep]    = useState<Step>("input");
  const [repo,    setRepo]    = useState("");
  const [custom,  setCustom]  = useState("");
  const router                = useRouter();

  const handleStart    = (r: string) => { setRepo(r); setStep("scanning"); };
  const handleComplete = ()          => setTimeout(() => router.push("/dashboard"), 1500);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <KeyRound className="w-7 h-7" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Scan for Exposed Secrets</h1>
            <p style={{ color: "var(--muted)" }}>Deep scan across source code, git history, CI/CD, and container images.</p>
          </div>

          <div className="rounded-2xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {step === "input" && (
              <div className="space-y-6">
                {/* What we scan */}
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Scan Targets</p>
                  <div className="flex flex-wrap gap-2">
                    {SCAN_TARGETS.map(t => (
                      <span key={t} className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "var(--primary)" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sample repos */}
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Sample Repositories</p>
                  <div className="space-y-2">
                    {SAMPLE_REPOS.map(r => (
                      <button key={r.name} onClick={() => setRepo(r.url)}
                        className="w-full text-left rounded-xl p-4 transition-all"
                        style={{
                          background: repo === r.url ? "rgba(245,158,11,0.08)" : "var(--background)",
                          border: `1px solid ${repo === r.url ? "rgba(245,158,11,0.4)" : "var(--border)"}`,
                        }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Github className="w-4 h-4" style={{ color: "var(--muted)" }} />
                            <span className="text-sm font-mono text-white">{r.url}</span>
                            <span className="text-xs px-2 py-0.5 rounded"
                              style={{ background: "var(--border)", color: "var(--muted)" }}>{r.lang}</span>
                          </div>
                          <span className="text-xs" style={{ color: "var(--critical)" }}>
                            ~{r.expectedSecrets} secrets
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom URL */}
                <div>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) { setCustom(e.target.files[0].name); setRepo(e.target.files[0].name); } }} />
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-white">Or enter a repository URL / Browse file</label>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-amber-400 hover:underline cursor-pointer">📁 Browse Local Repo/File</button>
                </div>
                  <input type="text" value={custom}
                    onChange={e => { setCustom(e.target.value); setRepo(e.target.value); }}
                    placeholder="github.com/your-org/your-repo"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                </div>

                <button onClick={() => handleStart(repo || SAMPLE_REPOS[0].url)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000" }}>
                  <Play className="w-5 h-5" /> Start Secrets Scan <ChevronRight className="w-5 h-5" />
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
