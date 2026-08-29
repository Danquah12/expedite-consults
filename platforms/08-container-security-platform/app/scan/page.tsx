"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Container, Play, CheckCircle2, ChevronRight, Layers } from "lucide-react";

const SAMPLE_IMAGES = [
  { name: "acme/customer-api:latest",  registry: "registry.acme.com", expectedVulns: 44 },
  { name: "acme/auth-service:v2.1.3",  registry: "registry.acme.com", expectedVulns: 21 },
  { name: "python:3.9-slim",           registry: "docker.io",         expectedVulns: 60 },
  { name: "nginx:1.24-alpine",         registry: "docker.io",         expectedVulns: 7  },
];

const ALL_LOGS = [
  "[INIT]     Pulling image manifest from registry...",
  "[INIT]     Extracting 14 layers (524 MB total)...",
  "[SBOM]     Generating SBOM with Syft...",
  "[SBOM]     Found 312 OS packages, 187 application packages",
  "[TRIVY]    Scanning against NVD, GHSA, RedHat, Ubuntu advisories...",
  "[TRIVY]    🔴 CVE-2023-4911 in glibc@2.31-13 (CRITICAL 9.8) — Looney Tunables",
  "[TRIVY]    🔴 CVE-2023-44487 in nghttp2@1.40.0 (CRITICAL 7.5) — HTTP/2 Rapid Reset",
  "[TRIVY]    🔴 CVE-2022-3602 in openssl@3.0.2 (CRITICAL 9.8) — Buffer Overflow",
  "[GRYPE]    Cross-validating 44 vulnerabilities...",
  "[GRYPE]    Confirmed 42/44 findings, 2 false positives removed",
  "[MISCONFIG] Checking Dockerfile against CIS Docker Benchmark...",
  "[MISCONFIG] ❌ FAIL CIS-4.1: Container running as root user",
  "[MISCONFIG] ❌ FAIL CIS-5.7: Privileged mode enabled",
  "[MISCONFIG] ❌ FAIL CIS-5.12: Root filesystem is writable",
  "[DONE]     Scan complete — 44 CVEs, 3 critical misconfigurations",
];

const PHASES = [
  { label: "Pull & Extract Layers",    threshold: 15 },
  { label: "Generate SBOM",            threshold: 35 },
  { label: "CVE Database Scan (Trivy)",threshold: 60 },
  { label: "Cross-validate (Grype)",   threshold: 80 },
  { label: "Misconfiguration Check",   threshold: 100 },
];

function ScanProgress({ image, onComplete }: { image: string; onComplete: () => void }) {
  const [logs,     setLogs]     = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [vulns,    setVulns]    = useState(0);
  const [layers,   setLayers]   = useState(0);
  const [done,     setDone]     = useState(false);
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
        if (log.includes("CVE-")) setVulns(v => v + 1);
        logIdx++;
      } else { clearInterval(logIv); setDone(true); }
    }, 450);
    intervals.push(logIv);

    const progIv = setInterval(() => setProgress(p => Math.min(100, p + Math.random() * 5 + 2)), 90);
    intervals.push(progIv);

    const layerIv = setInterval(() => setLayers(l => Math.min(14, l + 1)), 450);
    intervals.push(layerIv);

    const t = setTimeout(() => { clearInterval(progIv); clearInterval(layerIv); setProgress(100); onCompleteRef.current(); }, 7500);
    timers.push(t);

    return () => { timers.forEach(clearTimeout); intervals.forEach(clearInterval); };
  }, []);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      <div className="rounded-xl px-5 py-3.5 text-sm font-mono"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <span style={{ color: "var(--muted)" }}>🐳 Scanning: </span>
        <span style={{ color: "var(--primary)" }}>{image}</span>
      </div>

      {/* Live counters */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "CVEs Found",     value: vulns.toString(),                color: vulns > 0 ? "var(--critical)" : "var(--muted)" },
          { label: "Layers Scanned", value: `${layers} / 14`,               color: "var(--primary)" },
          { label: "Progress",       value: `${Math.round(progress)}%`,     color: "var(--low)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px]" style={{ color: "var(--muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Phase indicators */}
      <div className="space-y-2">
        {PHASES.map(phase => {
          const active = progress >= phase.threshold;
          const current = progress >= phase.threshold - 25 && progress < phase.threshold;
          return (
            <div key={phase.label} className="flex items-center gap-3">
              {active
                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--low)" }} />
                : <div className="w-4 h-4 rounded-full border flex-shrink-0"
                    style={{ borderColor: current ? "var(--primary)" : "var(--border)" }} />}
              <span className="text-xs"
                style={{ color: active ? "var(--low)" : current ? "var(--primary)" : "var(--muted)" }}>
                {phase.label} {current && <span className="animate-pulse">…</span>}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--muted)" }}>
          <span>Overall</span><span style={{ color: "var(--primary)" }}>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface)" }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #38bdf8, #0284c7)" }} />
        </div>
      </div>

      {/* Terminal */}
      <div className="terminal">
        <div className="terminal-header">
          <div className="terminal-dot" style={{ background: "#ff5f57" }} />
          <div className="terminal-dot" style={{ background: "#febc2e" }} />
          <div className="terminal-dot" style={{ background: "#28c840" }} />
          <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>container-scanner</span>
        </div>
        <div ref={logRef} className="p-4 h-44 overflow-y-auto space-y-1 text-xs">
          {logs.filter(Boolean).map((log, i) => (
            <div key={i} style={{
              color: log.startsWith("[DONE]")      ? "var(--low)"
                   : log.includes("CRITICAL")      ? "var(--critical)"
                   : log.includes("🔴")            ? "var(--critical)"
                   : log.includes("❌ FAIL")       ? "var(--high)"
                   : log.startsWith("[TRIVY]")     ? "var(--primary)"
                   : log.startsWith("[GRYPE]")     ? "#a78bfa"
                   : log.startsWith("[SBOM]")      ? "#34d399"
                   : log.startsWith("[MISCONFIG]") ? "var(--high)"
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
          <span style={{ color: "var(--critical)" }}>44 CVEs · 3 Critical misconfigs · Redirecting to results…</span>
        </div>
      )}
    </div>
  );
}

type Step = "input" | "scanning";

export default function ScanPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step,  setStep]  = useState<Step>("input");
  const [image, setImage] = useState("");
  const [custom, setCustom] = useState("");
  const router = useRouter();

  const handleStart    = (img: string) => { setImage(img); setStep("scanning"); };
  const handleComplete = ()            => setTimeout(() => router.push("/dashboard"), 1500);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)" }}>
              <Container className="w-7 h-7" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Scan Docker Image</h1>
            <p style={{ color: "var(--muted)" }}>Layer-by-layer CVE and misconfiguration analysis powered by Trivy + Grype + Syft.</p>
          </div>

          <div className="rounded-2xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {step === "input" && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Sample Images</p>
                  <div className="space-y-2">
                    {SAMPLE_IMAGES.map(s => (
                      <button key={s.name} onClick={() => setImage(s.name)}
                        className="w-full text-left rounded-xl p-4 transition-all"
                        style={{
                          background: image === s.name ? "rgba(56,189,248,0.08)" : "var(--background)",
                          border: `1px solid ${image === s.name ? "rgba(56,189,248,0.4)" : "var(--border)"}`,
                        }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🐳</span>
                            <span className="text-sm font-mono text-white">{s.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded"
                              style={{ background: "var(--border)", color: "var(--muted)" }}>{s.registry}</span>
                          </div>
                          <span className="text-xs" style={{ color: "var(--critical)" }}>~{s.expectedVulns} CVEs</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Or enter an image reference</label>
                  <input type="text" value={custom}
                    onChange={e => { setCustom(e.target.value); setImage(e.target.value); }}
                    placeholder="registry.example.com/image:tag"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                </div>

                <button onClick={() => handleStart(image || SAMPLE_IMAGES[0].name)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #38bdf8, #0284c7)", color: "#000" }}>
                  <Play className="w-5 h-5" /> Start Container Scan <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            {step === "scanning" && <ScanProgress image={image} onComplete={handleComplete} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
