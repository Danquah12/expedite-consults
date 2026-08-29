"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield, Play, CheckCircle2, ChevronRight, Server } from "lucide-react";

const SAMPLE_CLUSTERS = [
  { name: "prod-us-east-1",  version: "v1.28.4", nodes: 12, provider: "AWS EKS" },
  { name: "staging-us-west", version: "v1.27.8", nodes: 4,  provider: "AWS EKS" },
  { name: "dev-cluster",     version: "v1.29.0", nodes: 2,  provider: "kind (local)" },
];

const ALL_LOGS = [
  "[INIT]     Connecting to Kubernetes API server...",
  "[INIT]     Authenticated with kubeconfig context: prod-us-east-1",
  "[DISCOVERY] Enumerating 247 pods across 8 namespaces...",
  "[RBAC]    Auditing 34 ClusterRoles, 127 RoleBindings...",
  "[RBAC]    🔴 CRITICAL: app-admin ClusterRole uses wildcard (*) verbs on all resources",
  "[WORKLOAD] Scanning 28 Deployments for security context issues...",
  "[WORKLOAD] 🔴 CRITICAL: customer-api Deployment — running as root (UID 0)",
  "[WORKLOAD] 🔴 CRITICAL: log-collector DaemonSet — privileged: true",
  "[NETWORK]  Checking NetworkPolicy coverage across namespaces...",
  "[NETWORK]  🔴 CRITICAL: namespace 'production' has NO NetworkPolicy — all traffic allowed",
  "[SECRETS]  Scanning 412 Pods for plaintext secrets in env vars...",
  "[SECRETS]  🟠 HIGH: payment-service Deployment — DB_PASSWORD in plaintext env var",
  "[NODES]    Running CIS Kubernetes Benchmark v1.7 on 12 nodes...",
  "[CIS]     87 checks passed, 55 failed — CIS compliance score: 61%",
  "[DONE]    Audit complete — 4 Critical, 7 High, 12 Medium findings",
];

const PHASES = [
  { label: "API Discovery",     threshold: 15 },
  { label: "RBAC Audit",        threshold: 35 },
  { label: "Workload Analysis", threshold: 60 },
  { label: "Network Audit",     threshold: 80 },
  { label: "CIS Benchmark",     threshold: 100 },
];

function AuditProgress({ cluster, onComplete }: { cluster: string; onComplete: () => void }) {
  const [logs, setLogs]         = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [critical, setCritical] = useState(0);
  const [done, setDone]         = useState(false);
  const logRef        = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const timers:    ReturnType<typeof setTimeout>[]  = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    let logIdx = 0;
    const logIv = setInterval(() => {
      if (logIdx < ALL_LOGS.length) {
        const log = ALL_LOGS[logIdx];
        setLogs(l => [...l, log]);
        if (log.includes("🔴 CRITICAL")) setCritical(c => c + 1);
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
        <span style={{ color: "var(--muted)" }}>☸️ Auditing: </span>
        <span style={{ color: "var(--primary)" }}>{cluster}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Critical",   value: critical.toString(), color: critical > 0 ? "var(--critical)" : "var(--muted)" },
          { label: "CIS Score",  value: progress < 90 ? "…" : "61%",            color: "var(--high)" },
          { label: "Progress",   value: `${Math.round(progress)}%`,              color: "var(--low)" },
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
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #818cf8, #6366f1)" }} />
        </div>
      </div>

      <div className="terminal">
        <div className="terminal-header">
          <div className="terminal-dot" style={{ background: "#ff5f57" }} />
          <div className="terminal-dot" style={{ background: "#febc2e" }} />
          <div className="terminal-dot" style={{ background: "#28c840" }} />
          <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>kube-audit</span>
        </div>
        <div ref={logRef} className="p-4 h-44 overflow-y-auto space-y-1 text-xs">
          {logs.filter(Boolean).map((log, i) => (
            <div key={i} style={{
              color: log.startsWith("[DONE]")     ? "var(--low)"
                   : log.includes("🔴 CRITICAL") ? "var(--critical)"
                   : log.includes("🟠 HIGH")     ? "var(--high)"
                   : log.startsWith("[RBAC]")    ? "#a78bfa"
                   : log.startsWith("[CIS]")     ? "#34d399"
                   : log.startsWith("[NETWORK]") ? "var(--primary)"
                   : log.startsWith("[SECRETS]") ? "var(--high)"
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
          <span style={{ color: "var(--critical)" }}>4 Critical · 7 High · CIS score: 61% · Redirecting to dashboard…</span>
        </div>
      )}
    </div>
  );
}

type Step = "input" | "scanning";

export default function ScanPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step,    setStep]    = useState<Step>("input");
  const [cluster, setCluster] = useState("");
  const router = useRouter();

  const handleStart    = (c: string) => { setCluster(c); setStep("scanning"); };
  const handleComplete = ()          => setTimeout(() => router.push("/dashboard"), 1500);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.3)" }}>
              <Shield className="w-7 h-7" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Audit Kubernetes Cluster</h1>
            <p style={{ color: "var(--muted)" }}>CIS Benchmark audit · RBAC analysis · Network policy gaps · Workload security posture.</p>
          </div>

          <div className="rounded-2xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {step === "input" && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Select Cluster</p>
                  <div className="space-y-2">
                    {SAMPLE_CLUSTERS.map(c => (
                      <button key={c.name} onClick={() => setCluster(c.name)}
                        className="w-full text-left rounded-xl p-4 transition-all"
                        style={{
                          background: cluster === c.name ? "rgba(129,140,248,0.08)" : "var(--background)",
                          border: `1px solid ${cluster === c.name ? "rgba(129,140,248,0.4)" : "var(--border)"}`,
                        }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">☸️</span>
                            <span className="text-sm font-mono text-white">{c.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded"
                              style={{ background: "var(--border)", color: "var(--muted)" }}>{c.version}</span>
                            <span className="text-xs" style={{ color: "var(--muted)" }}>{c.provider}</span>
                          </div>
                          <span className="text-xs" style={{ color: "var(--muted)" }}>{c.nodes} nodes</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-white mb-3">Audit Checks</p>
                  <div className="flex flex-wrap gap-2">
                    {["CIS Benchmark v1.7", "RBAC Permissions", "Network Policies", "Workload Security", "Secret Detection", "Node Hardening"].map(c => (
                      <span key={c} className="px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.2)", color: "var(--primary)" }}>
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>

                <button onClick={() => handleStart(cluster || SAMPLE_CLUSTERS[0].name)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #818cf8, #6366f1)", color: "#fff" }}>
                  <Play className="w-5 h-5" /> Start Cluster Audit <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            {step === "scanning" && <AuditProgress cluster={cluster} onComplete={handleComplete} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
