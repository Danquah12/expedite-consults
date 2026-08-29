"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Smartphone, Play, CheckCircle2, Upload } from "lucide-react";

const SAMPLE_APPS = [
  { name: "ACME Banking",  bundle: "com.acme.banking",  platform: "Android", type: "APK", size: "18.4 MB", icon: "🏦" },
  { name: "ACME Shopping", bundle: "com.acme.shopping", platform: "React Native", type: "APK", size: "24.1 MB", icon: "🛒" },
  { name: "ACME Health",   bundle: "com.acme.health",   platform: "Flutter",  type: "IPA", size: "12.8 MB", icon: "🏥" },
];

const SCAN_PHASES = [
  { label: "APK/IPA Extraction",      threshold: 15 },
  { label: "Static Analysis (MobSF)", threshold: 35 },
  { label: "Hardcoded Secret Detection", threshold: 55 },
  { label: "Frida Dynamic Hooks",     threshold: 75 },
  { label: "OWASP MASVS Validation",  threshold: 100 },
];

const ALL_LOGS = [
  "[MOBSF]   Extracting APK with apktool...",
  "[MOBSF]   Decompiling DEX with jadx...",
  "[MOBSF]   Scanning AndroidManifest.xml — 14 permissions detected",
  "[STATIC]  Scanning for hardcoded credentials in classes.dex...",
  "[STATIC]  🔴 CRITICAL: AWS_ACCESS_KEY found — com/acme/banking/utils/AwsHelper.java:23",
  "[STATIC]  🔴 CRITICAL: Stripe SECRET key found — index.android.bundle:4821",
  "[STATIC]  Scanning for insecure storage patterns...",
  "[STATIC]  🔴 CRITICAL: SQLite DB stored unencrypted — /databases/acme_banking.db",
  "[STATIC]  Checking SSL certificate pinning...",
  "[STATIC]  🔴 CRITICAL: No certificate pinning — OkHttpClient.Builder() with no CertificatePinner",
  "[FRIDA]   Attaching Frida to com.acme.banking...",
  "[FRIDA]   Hooking BiometricAuthManager.authenticate()...",
  "[FRIDA]   🟠 HIGH: Biometric auth bypass — boolean flag overrideable via debugger",
  "[FRIDA]   Hooking SharedPreferencesManager...",
  "[FRIDA]   🟠 HIGH: Auth token stored in plaintext SharedPreferences",
  "[FRIDA]   Monitoring Logcat output...",
  "[FRIDA]   🟠 HIGH: Credit card number logged via Log.d() in CheckoutActivity.kt:134",
  "[MASVS]   ⚠️  MEDIUM: Excessive permissions — READ_CONTACTS, RECORD_AUDIO not required",
  "[DONE]    Scan complete — 3 Critical, 4 High, 1 Medium | MASVS Report generated",
];

function ScanProgress({ app }: { app: typeof SAMPLE_APPS[0] }) {
  const [logs,     setLogs]     = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [critical, setCritical] = useState(0);
  const [done,     setDone]     = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];
    let idx = 0;
    const logIv = setInterval(() => {
      if (idx < ALL_LOGS.length) {
        const log = ALL_LOGS[idx];
        setLogs(l => [...l, log]);
        if (log.includes("🔴 CRITICAL")) setCritical(c => c + 1);
        idx++;
      } else { clearInterval(logIv); setDone(true); }
    }, 480);
    intervals.push(logIv);
    const progIv = setInterval(() => setProgress(p => Math.min(100, p + Math.random() * 4 + 1.2)), 95);
    intervals.push(progIv);
    const t = setTimeout(() => { clearInterval(progIv); setProgress(100); setTimeout(() => router.push("/dashboard"), 1500); }, 9500);
    timers.push(t);
    return () => { timers.forEach(clearTimeout); intervals.forEach(clearInterval); };
  }, [router]);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      <div className="rounded-xl px-5 py-3.5 text-sm font-mono flex items-center gap-3"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <span className="text-xl">{app.icon}</span>
        <div>
          <div style={{ color: "var(--primary)" }}>{app.name}</div>
          <div style={{ color: "var(--muted)", fontSize: 11 }}>{app.bundle} · {app.platform} · {app.type} · {app.size}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Critical", value: critical.toString(), color: critical > 0 ? "var(--critical)" : "var(--muted)" },
          { label: "Files Scanned", value: `${Math.floor(progress * 4.8)}`, color: "var(--primary)" },
          { label: "Progress", value: `${Math.round(progress)}%`, color: "var(--low)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px]" style={{ color: "var(--muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {SCAN_PHASES.map(phase => {
          const active  = progress >= phase.threshold;
          const current = progress >= phase.threshold - 22 && progress < phase.threshold;
          return (
            <div key={phase.label} className="flex items-center gap-3">
              {active
                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--low)" }} />
                : <div className="w-4 h-4 rounded-full border flex-shrink-0" style={{ borderColor: current ? "var(--primary)" : "var(--border)" }} />}
              <span className="text-xs" style={{ color: active ? "var(--low)" : current ? "var(--primary)" : "var(--muted)" }}>
                {phase.label} {current && <span className="animate-pulse">…</span>}
              </span>
            </div>
          );
        })}
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--muted)" }}>
          <span>Analysis Progress</span><span style={{ color: "var(--primary)" }}>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface)" }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #ec4899, #be185d)" }} />
        </div>
      </div>
      <div className="terminal">
        <div className="terminal-header">
          <div className="terminal-dot" style={{ background: "#ff5f57" }} />
          <div className="terminal-dot" style={{ background: "#febc2e" }} />
          <div className="terminal-dot" style={{ background: "#28c840" }} />
          <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>mobsf-frida-scanner</span>
        </div>
        <div ref={logRef} className="p-4 h-48 overflow-y-auto space-y-1 text-xs">
          {logs.map((log, i) => (
            <div key={i} style={{
              color: log.includes("🔴 CRITICAL") ? "var(--critical)"
                   : log.includes("🟠 HIGH")     ? "var(--high)"
                   : log.includes("⚠️")           ? "var(--medium)"
                   : log.includes("[DONE]")       ? "var(--low)"
                   : log.startsWith("[FRIDA]")    ? "#a78bfa"
                   : log.startsWith("[MOBSF]")    ? "#60a5fa"
                   : log.startsWith("[STATIC]")   ? "#34d399"
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
          <span style={{ color: "var(--critical)" }}>3 Critical · 4 High · 1 Medium — MASVS report ready · Redirecting…</span>
        </div>
      )}
    </div>
  );
}

type Step = "input" | "scanning";
export default function ScanPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("input");
  const [app,  setApp]  = useState(SAMPLE_APPS[0]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.3)" }}>
              <Smartphone className="w-7 h-7" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Scan Mobile App</h1>
            <p style={{ color: "var(--muted)" }}>
              Static analysis with <span className="text-white">MobSF</span> + Dynamic instrumentation with{" "}
              <span className="text-white">Frida</span> · OWASP MASVS 2.1
            </p>
          </div>
          <div className="rounded-2xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {step === "input" ? (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Sample Apps (APK / IPA)</p>
                  <div className="space-y-2">
                    {SAMPLE_APPS.map(a => (
                      <button key={a.name} onClick={() => setApp(a)}
                        className="w-full text-left rounded-xl p-4 transition-all"
                        style={{
                          background: app.name === a.name ? "rgba(236,72,153,0.08)" : "var(--background)",
                          border: `1px solid ${app.name === a.name ? "rgba(236,72,153,0.4)" : "var(--border)"}`,
                        }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{a.icon}</span>
                            <div>
                              <div className="text-sm font-semibold text-white">{a.name}</div>
                              <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>{a.bundle}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-semibold" style={{ color: "var(--primary)" }}>{a.platform}</div>
                            <div className="text-xs" style={{ color: "var(--muted)" }}>{a.type} · {a.size}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <input type="file" ref={fileInputRef} accept=".apk,.ipa,.xapk,.zip" className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) { const f = e.target.files[0]; setApp({ name: f.name.replace(/\.[^/.]+$/, ""), bundle: "com.custom." + f.name.toLowerCase().replace(/[^a-z0-9]/g, ""), platform: f.name.endsWith(".ipa") ? "iOS" : "Android", type: f.name.endsWith(".ipa") ? "IPA" : "APK", size: (f.size / (1024*1024)).toFixed(1) + " MB", icon: f.name.endsWith(".ipa") ? "🍎" : "🤖" }); } }} />
                <div onClick={() => fileInputRef.current?.click()} className="rounded-xl p-4 border-2 border-dashed flex flex-col items-center gap-2 cursor-pointer hover:border-pink-500/60 transition-all"
                  style={{ borderColor: "var(--border)" }}>
                  <Upload className="w-6 h-6" style={{ color: "var(--muted)" }} />
                  <span className="text-sm" style={{ color: "var(--muted)" }}>Upload your own APK / IPA / XAPK</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Analysis Engines</p>
                  <div className="flex flex-wrap gap-2">
                    {["MobSF Static", "MobSF Dynamic", "Frida Instrumentation", "jadx Decompile", "apktool", "drozer", "OWASP MASVS"].map(e => (
                      <span key={e} className="px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)", color: "var(--primary)" }}>
                        ✓ {e}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => setStep("scanning")}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #ec4899, #be185d)", color: "#fff" }}>
                  <Play className="w-5 h-5" /> Start Mobile Scan
                </button>
              </div>
            ) : (
              <ScanProgress app={app} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
