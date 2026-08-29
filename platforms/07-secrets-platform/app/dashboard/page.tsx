"use client";
import { Suspense, useState } from "react";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SECRETS, SCAN_SUMMARY } from "@/data/secrets";
import { severityColor, severityBg, severityBorder, severityGlow, statusColor, statusBg, validationColor, locationIcon, formatAge } from "@/lib/utils";
import { AlertTriangle, ExternalLink, Flame, ShieldAlert, Clock, CheckCircle2, Shield, KeyRound, Terminal, RefreshCw, X, Play, Zap } from "lucide-react";
import type { SecretSeverity } from "@/types/secrets";

function calculateEntropy(str: string): number {
  if (!str) return 0;
  const map: Record<string, number> = {};
  for (const c of str) map[c] = (map[c] || 0) + 1;
  return Object.values(map).reduce((acc, count) => {
    const p = count / str.length;
    return acc - p * Math.log2(p);
  }, 0);
}

function DashboardContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const filter       = (searchParams.get("severity") ?? "All") as SecretSeverity | "All";
  const search       = searchParams.get("q") ?? "";

  // Pre-Commit & Revocation Modal State
  const [showSimulator, setShowSimulator] = useState(false);
  const [commitDiff, setCommitDiff] = useState(`git diff --staged
+ const AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";
+ const AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
+ const STRIPE_LIVE_KEY = "sk_live_51HzT9gL29kNmPqRt8w";`);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{ entropy: number; matchedType: string; status: "BLOCKED" | "PASSED"; message: string } | null>(null);
  const [revoked, setRevoked] = useState(false);

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "All") params.delete(key); else params.set(key, value);
    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const runPreCommitTest = () => {
    setSimulating(true);
    setRevoked(false);
    setTimeout(() => {
      const entropy = calculateEntropy(commitDiff);
      let matchedType = "Generic High Entropy String";
      if (commitDiff.includes("AKIA")) matchedType = "AWS IAM Access Key (AKIA)";
      else if (commitDiff.includes("sk_live_")) matchedType = "Stripe Live Secret Key";

      const isBlocked = entropy > 4.2 || commitDiff.includes("AKIA") || commitDiff.includes("sk_live_");

      setSimResult({
        entropy: Math.round(entropy * 100) / 100,
        matchedType,
        status: isBlocked ? "BLOCKED" : "PASSED",
        message: isBlocked
          ? `[PRE-COMMIT HOOK REJECTED] Detected high-entropy secret (${matchedType}). Commit blocked by TruffleHog/GitLeaks rule.`
          : `[PRE-COMMIT PASSED] No hardcoded credentials detected in staged diff.`
      });
      setSimulating(false);
    }, 600);
  };

  const handleRevokeSecret = () => {
    setRevoked(true);
  };

  let results = [...SECRETS];
  if (filter !== "All") results = results.filter(s => s.severity === filter);
  if (search.trim()) {
    const q = search.toLowerCase();
    results = results.filter(s => s.type.toLowerCase().includes(q) || s.service.toLowerCase().includes(q) || s.locations[0].file.toLowerCase().includes(q));
  }

  const counts = {
    All: SECRETS.length,
    Critical: SECRETS.filter(s => s.severity === "Critical").length,
    High:     SECRETS.filter(s => s.severity === "High").length,
    Medium:   SECRETS.filter(s => s.severity === "Medium").length,
    Low:      SECRETS.filter(s => s.severity === "Low").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Secrets Dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            {SCAN_SUMMARY.reposScanned} repos · {SCAN_SUMMARY.filesScanned.toLocaleString()} files · {SCAN_SUMMARY.commitsScanned.toLocaleString()} commits
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSimulator(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "linear-gradient(135deg, #e8912d, #f59e0b)",
              color: "#0a0f1a",
              fontWeight: 800,
              fontSize: 12,
              borderRadius: 10,
              padding: "9px 16px",
              border: "none",
              cursor: "pointer"
            }}
          >
            <Zap size={14} fill="currentColor" />
            Pre-Commit Hook Simulator
          </button>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
            style={{ background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.3)", color: "var(--critical)" }}>
            <Flame className="w-4 h-4" />
            {SCAN_SUMMARY.activeSecrets} Active · Immediate Action Required
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Secrets",  value: SCAN_SUMMARY.activeSecrets, color: "var(--critical)", bg: "rgba(255,59,48,0.06)", border: "rgba(255,59,48,0.2)" },
          { label: "Critical",        value: SCAN_SUMMARY.criticalCount,  color: "var(--critical)", bg: "rgba(255,59,48,0.06)", border: "rgba(255,59,48,0.2)" },
          { label: "In Git History",  value: SCAN_SUMMARY.inGitHistory,   color: "var(--high)",    bg: "rgba(255,149,0,0.06)", border: "rgba(255,149,0,0.2)" },
          { label: "Public Repos",    value: SCAN_SUMMARY.publicRepos,    color: "var(--medium)",  bg: "rgba(255,204,0,0.06)", border: "rgba(255,204,0,0.2)" },
        ].map(m => (
          <div key={m.label} className="rounded-2xl p-5" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>{m.label}</div>
            <div className="text-4xl font-black" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["All", "Critical", "High", "Medium", "Low"] as const).map(tab => (
          <button key={tab} onClick={() => update("severity", tab)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: filter === tab ? "rgba(245,158,11,0.12)" : "var(--surface)",
              border: `1px solid ${filter === tab ? "rgba(245,158,11,0.4)" : "var(--border)"}`,
              color: filter === tab ? "var(--primary)" : "var(--muted)",
            }}>
            {tab} <span className="text-xs opacity-70">{counts[tab]}</span>
          </button>
        ))}
        <div className="flex-1 max-w-sm">
          <input type="text" value={search} onChange={e => update("q", e.target.value)}
            placeholder="Search type, service, file..."
            className="w-full px-4 py-2 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
        </div>
      </div>

      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        Showing <span className="text-white font-medium">{results.length}</span> of {SECRETS.length} secrets
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {results.map(s => (
          <Link key={s.id} href={`/finding/${s.id}`}
            className="block rounded-2xl p-5 transition-all duration-200 group"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = severityColor(s.severity); el.style.boxShadow = `0 0 30px ${severityGlow(s.severity)}`; el.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.boxShadow = ""; el.style.transform = ""; }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{ background: "var(--background)", color: "var(--muted)" }}>{s.id}</span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{ background: severityBg(s.severity), border: `1px solid ${severityBorder(s.severity)}`, color: severityColor(s.severity) }}>
                  {s.severity}
                </span>
                {s.validation === "Verified Live" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: "rgba(255,59,48,0.15)", color: "var(--critical)", border: "1px solid rgba(255,59,48,0.3)" }}>
                    ⚡ VERIFIED LIVE
                  </span>
                )}
              </div>
              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--muted)" }} />
            </div>

            <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{s.type}</h3>
            <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>{s.service} · {s.environment}</p>

            <div className="redacted text-xs mb-3 truncate">{s.maskedValue}</div>

            <div className="flex items-center gap-2 mb-3 text-xs flex-wrap" style={{ color: "var(--muted)" }}>
              <span>{locationIcon(s.locations[0].locationType)} {s.locations[0].file.split("/").slice(-2).join("/")}:{s.locations[0].line}</span>
              {s.locations.length > 1 && <span>+{s.locations.length - 1} more locations</span>}
              {s.inGitHistory && <span style={{ color: "var(--high)" }}>📜 In git history</span>}
              {s.internetExposed && <span style={{ color: "var(--critical)" }}>🌐 Public repo</span>}
            </div>

            <div className="flex items-center justify-between text-xs pt-3"
              style={{ borderTop: "1px solid var(--border)" }}>
              <span className="px-2 py-1 rounded-lg" style={{ background: statusBg(s.status), color: statusColor(s.status) }}>{s.status}</span>
              <span style={{ color: validationColor(s.validation) }}>{s.validation}</span>
              <span className="flex items-center gap-1" style={{ color: "var(--muted)" }}>
                <Clock className="w-3 h-3" />{formatAge(s.age)} old
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Pre-Commit Hook Simulator & Revocation Modal */}
      {showSimulator && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20
          }}
        >
          <div
            className="animate-scaleIn"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              width: "100%",
              maxWidth: 720,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              position: "relative"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "var(--primary)" }}>
                  TruffleHog & GitLeaks Engine
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <Terminal size={18} style={{ color: "var(--primary)" }} />
                  Pre-Commit Hook & Secret Revocation Lab
                </h3>
              </div>
              <button
                onClick={() => setShowSimulator(false)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16 }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
              Paste code diffs or commit snippets to calculate live Shannon entropy and test whether pre-commit rules block the push before repository ingestion.
            </p>

            <label style={{ fontSize: 11, fontWeight: 700, color: "#00d4ff", display: "block", marginBottom: 6 }}>
              Git Staged Commit Diff (Test Payload)
            </label>
            <textarea
              value={commitDiff}
              onChange={e => setCommitDiff(e.target.value)}
              style={{
                width: "100%",
                height: 120,
                background: "#000",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 12,
                fontSize: 11,
                fontFamily: "monospace",
                color: "#e8912d",
                outline: "none",
                resize: "none",
                marginBottom: 16
              }}
            />

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <button
                onClick={runPreCommitTest}
                disabled={simulating}
                style={{
                  background: "linear-gradient(135deg, #e8912d, #f59e0b)",
                  border: "none",
                  color: "#0a0f1a",
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <Play size={12} fill="currentColor" />
                {simulating ? "Analyzing Entropy..." : "Run Pre-Commit Check"}
              </button>
            </div>

            {simResult && (
              <div style={{
                background: "var(--bg)",
                border: simResult.status === "BLOCKED" ? "1px solid rgba(239,83,80,0.3)" : "1px solid rgba(52,199,89,0.3)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 16
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {simResult.status === "BLOCKED" ? <AlertTriangle size={16} color="#ef5350" /> : <CheckCircle2 size={16} color="var(--green)" />}
                    <strong style={{ color: simResult.status === "BLOCKED" ? "#ef5350" : "var(--green)", fontSize: 13 }}>
                      {simResult.status === "BLOCKED" ? "COMMIT REJECTED" : "COMMIT ALLOWED"}
                    </strong>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--muted)" }}>
                    Shannon Entropy: <strong style={{ color: "#fff" }}>{simResult.entropy} bits/char</strong>
                  </span>
                </div>

                <p style={{ fontSize: 11.5, color: "var(--fg)", lineHeight: 1.5, marginBottom: 12 }}>
                  {simResult.message}
                </p>

                {simResult.status === "BLOCKED" && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>Automated Cloud Remediation:</span>
                    <button
                      onClick={handleRevokeSecret}
                      disabled={revoked}
                      style={{
                        background: revoked ? "rgba(52,199,89,0.15)" : "rgba(239,83,80,0.15)",
                        border: revoked ? "1px solid var(--green)" : "1px solid #ef5350",
                        color: revoked ? "var(--green)" : "#ef5350",
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {revoked ? "✓ Secret Revoked on AWS STS" : "⚡ Revoke & Rotate via AWS API"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-24">
        <Suspense fallback={<div className="text-center py-24" style={{ color: "var(--muted)" }}>Loading...</div>}>
          <DashboardContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
