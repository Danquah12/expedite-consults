"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Package, Upload, FileJson, ChevronRight, Play, CheckCircle2 } from "lucide-react";
import { SAMPLE_MANIFESTS } from "@/data/findings";

const ALL_LOGS = [
  "[INIT]     Parsing manifest file...",
  "[INIT]     Resolving dependency tree (1,847 packages)...",
  "[OSV]      Querying OSV.dev database for CVEs...",
  "[NVD]      Cross-referencing NVD vulnerability database...",
  "[GHSA]     Checking GitHub Advisory Database...",
  "[LICENSE]  Analyzing license compatibility for 1,847 packages...",
  "[OSV]      CVE-2021-44228 confirmed: log4j-core@2.14.1 (CRITICAL)",
  "[NVD]      CVE-2022-22965 confirmed: spring-webmvc@5.3.17 (CRITICAL)",
  "[GHSA]     CVE-2020-8203 confirmed: lodash@4.17.15 (HIGH)",
  "[OSV]      CVE-2021-3749 confirmed: axios@0.21.1 (HIGH)",
  "[LICENSE]  GPL-3.0 violation detected: gpl-library@3.2.1",
  "[REACHABILITY] Analyzing call graph for reachability...",
  "[REACHABILITY] 6/8 vulnerabilities confirmed reachable in runtime",
  "[SBOM]     Generating CycloneDX SBOM...",
  "[DONE]     Scan complete — 8 findings, 2 license violations",
];

const PHASES = [
  { label: "Dependency Resolution", threshold: 15 },
  { label: "CVE Database Query",    threshold: 40 },
  { label: "License Analysis",      threshold: 65 },
  { label: "Reachability Check",    threshold: 85 },
  { label: "SBOM Generation",       threshold: 100 },
];

function ScanProgress({ manifest, onComplete }: { manifest: string; onComplete: () => void }) {
  const [logs,     setLogs]     = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [done,     setDone]     = useState(false);
  const logRef          = useRef<HTMLDivElement>(null);
  const onCompleteRef   = useRef(onComplete);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const timers:    ReturnType<typeof setTimeout>[]   = [];
    const intervals: ReturnType<typeof setInterval>[]  = [];

    let logIdx = 0;
    const logIv = setInterval(() => {
      if (logIdx < ALL_LOGS.length) {
        setLogs(l => [...l, ALL_LOGS[logIdx]]);
        logIdx++;
      } else {
        clearInterval(logIv);
        setDone(true);
      }
    }, 430);
    intervals.push(logIv);

    const progIv = setInterval(() => {
      setProgress(p => Math.min(100, p + Math.random() * 6 + 2));
    }, 90);
    intervals.push(progIv);

    const t = setTimeout(() => {
      clearInterval(progIv);
      setProgress(100);
      onCompleteRef.current();
    }, 7000);
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
        <span style={{ color: "var(--primary)" }}>{manifest}</span>
      </div>

      {/* Phase progress */}
      <div className="space-y-2.5">
        {PHASES.map(phase => {
          const active = progress >= phase.threshold;
          const pct    = Math.max(0, Math.min(100, (progress - (phase.threshold - 25)) * 4));
          return (
            <div key={phase.label} className="flex items-center gap-3">
              {active
                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--low)" }} />
                : <div className="w-4 h-4 rounded-full border flex-shrink-0"
                    style={{ borderColor: pct > 0 ? "var(--primary)" : "var(--border)" }} />}
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface)" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: active ? "100%" : `${pct}%`, background: active ? "var(--low)" : "var(--primary)" }} />
              </div>
              <span className="text-xs w-44 flex-shrink-0 text-right"
                style={{ color: active ? "var(--low)" : pct > 0 ? "var(--foreground)" : "var(--muted)" }}>
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Overall bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--muted)" }}>
          <span>Overall Progress</span>
          <span style={{ color: "var(--primary)" }}>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface)" }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #10b981, #059669)" }} />
        </div>
      </div>

      {/* Terminal log */}
      <div className="terminal">
        <div className="terminal-header">
          <div className="terminal-dot" style={{ background: "#ff5f57" }} />
          <div className="terminal-dot" style={{ background: "#febc2e" }} />
          <div className="terminal-dot" style={{ background: "#28c840" }} />
          <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>sca-scanner — {manifest}</span>
        </div>
        <div ref={logRef} className="p-4 h-44 overflow-y-auto space-y-1">
          {logs.filter(Boolean).map((log, i) => (
            <div key={i} className="text-xs" style={{
              color: log.startsWith("[DONE]")          ? "var(--low)"
                   : log.startsWith("[OSV]")           ? "var(--primary)"
                   : log.startsWith("[NVD]")           ? "#60a5fa"
                   : log.startsWith("[GHSA]")          ? "#a78bfa"
                   : log.startsWith("[LICENSE]")       ? "var(--high)"
                   : log.startsWith("[REACHABILITY]")  ? "#fb923c"
                   : log.startsWith("[SBOM]")          ? "#34d399"
                   : "var(--muted)",
            }}>{log}</div>
          ))}
          {!done && <div className="text-xs cursor-blink" style={{ color: "var(--primary)" }}>$ </div>}
        </div>
      </div>

      {done && (
        <div className="rounded-xl px-5 py-4 flex items-center gap-3 text-sm font-semibold"
          style={{ background: "rgba(52,199,89,0.08)", border: "1px solid rgba(52,199,89,0.3)" }}>
          <CheckCircle2 className="w-5 h-5" style={{ color: "var(--low)" }} />
          <span style={{ color: "var(--low)" }}>
            Scan complete — 8 vulnerabilities, 2 license issues. Redirecting to dashboard...
          </span>
        </div>
      )}
    </div>
  );
}

type Step = "input" | "scanning";

export default function ScanPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step,     setStep]     = useState<Step>("input");
  const [manifest, setManifest] = useState("");
  const router                  = useRouter();

  const handleStart    = (m: string) => { setManifest(m); setStep("scanning"); };
  const handleComplete = ()          => setTimeout(() => router.push("/dashboard"), 1500);

  const stepLabels = ["Manifest", "Scanning", "Results"];
  const currentIdx = step === "input" ? 0 : 1;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <Package className="w-7 h-7" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Scan Your Dependencies</h1>
            <p style={{ color: "var(--muted)" }}>Upload a manifest or pick a sample vulnerable project to scan.</p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-3 mb-12">
            {stepLabels.map((label, idx) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: idx <= currentIdx ? "rgba(16,185,129,0.2)" : "var(--surface)",
                      border: `1px solid ${idx <= currentIdx ? "var(--primary)" : "var(--border)"}`,
                      color: idx <= currentIdx ? "var(--primary)" : "var(--muted)",
                    }}>
                    {idx + 1}
                  </div>
                  <span className="text-sm hidden sm:block"
                    style={{ color: idx <= currentIdx ? "var(--primary)" : "var(--muted)" }}>
                    {label}
                  </span>
                </div>
                {idx < stepLabels.length - 1 && (
                  <div className="w-8 h-px" style={{ background: "var(--border)" }} />
                )}
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {step === "input" && (
              <div className="space-y-6">
                <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
                  Choose a sample vulnerable project:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SAMPLE_MANIFESTS.map(s => (
                    <button key={s.name} onClick={() => setManifest(s.file)}
                      className="text-left rounded-xl p-4 transition-all hover:scale-[1.02]"
                      style={{
                        background: manifest === s.file ? "rgba(16,185,129,0.1)" : "var(--background)",
                        border: `1px solid ${manifest === s.file ? "rgba(16,185,129,0.4)" : "var(--border)"}`,
                      }}>
                      <div className="text-xs font-bold text-white mb-1">{s.name}</div>
                      <div className="text-xs mb-2" style={{ color: "var(--muted)" }}>{s.language}</div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded"
                          style={{ background: "var(--border)", color: "var(--muted)" }}>
                          <FileJson className="w-3 h-3" />{s.file}
                        </span>
                        <span className="text-xs" style={{ color: "var(--primary)" }}>~{s.expectedFindings}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Or upload your own manifest</label>
                  <div
                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
                    style={{ borderColor: "var(--border)" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--muted)" }} />
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                      Drop <span className="text-white">pom.xml</span>,{" "}
                      <span className="text-white">package.json</span>,{" "}
                      <span className="text-white">requirements.txt</span>, or{" "}
                      <span className="text-white">.csproj</span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                      Supports npm · Maven · PyPI · NuGet · Go · Cargo
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleStart(manifest || SAMPLE_MANIFESTS[0].file)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all hover:opacity-90 hover:scale-[1.01]"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}
                >
                  <Play className="w-5 h-5" />
                  Start SCA Scan
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {step === "scanning" && (
              <ScanProgress manifest={manifest} onComplete={handleComplete} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
