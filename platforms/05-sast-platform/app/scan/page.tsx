"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RepoInput from "@/components/scan/RepoInput";
import ScanProgress from "@/components/scan/ScanProgress";
import { Shield } from "lucide-react";

type Step = "input" | "scanning";

export default function ScanPage() {
  const [step,     setStep]     = useState<Step>("input");
  const [repo,     setRepo]     = useState("");
  const [language, setLanguage] = useState("Java");
  const [engines,  setEngines]  = useState<string[]>([]);
  const router                  = useRouter();

  const handleStart = (repoUrl: string, lang: string, selectedEngines: string[]) => {
    setRepo(repoUrl);
    setLanguage(lang);
    setEngines(selectedEngines);
    setStep("scanning");
  };

  const handleComplete = () => {
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  const stepLabels = ["Repository", "Scanning", "Complete"];
  const currentIdx = step === "input" ? 0 : 1;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pulse-glow"
            style={{ background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)" }}
            >
              <Shield className="w-7 h-7" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Run a Security Scan</h1>
            <p style={{ color: "var(--muted)" }}>Connect a repository and watch the multi-engine analysis in real time.</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-12">
            {stepLabels.map((label, idx) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: idx <= currentIdx ? "rgba(0,212,255,0.2)" : "var(--surface)",
                      border: `1px solid ${idx <= currentIdx ? "var(--primary)" : "var(--border)"}`,
                      color: idx <= currentIdx ? "var(--primary)" : "var(--muted)",
                    }}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-sm hidden sm:block" style={{ color: idx <= currentIdx ? "var(--primary)" : "var(--muted)" }}>
                    {label}
                  </span>
                </div>
                {idx < stepLabels.length - 1 && <div className="w-8 h-px" style={{ background: "var(--border)" }} />}
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {step === "input"    && <RepoInput    onStart={handleStart} />}
            {step === "scanning" && <ScanProgress repo={repo} language={language} engines={engines} onComplete={handleComplete} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
