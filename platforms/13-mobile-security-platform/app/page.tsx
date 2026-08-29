"use client";
import Link from "next/link";
import { FINDINGS, SCAN_SUMMARY, APPS } from "@/data/findings";
import { sevColor, sevBg, platformColor, platformBg, categoryIcon } from "@/lib/utils";
import { 
  Smartphone, ArrowRight, Play, Shield, Search, Zap, 
  FileCode, ShieldCheck, Bug, GraduationCap, Cpu, Lock, Terminal 
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const TOOLS = [
  "MobSF", "Frida", "objection", "apktool", "jadx-gui", "drozer", 
  "OWASP ZAP Mobile", "Burp Suite Pro", "Proxyman", "Corellium", "Detekt"
];

const MASVS = [
  "MASVS-STORAGE", "MASVS-CRYPTO", "MASVS-AUTH", "MASVS-NETWORK", 
  "MASVS-PLATFORM", "MASVS-CODE", "MASVS-RESILIENCE"
];

const PLATFORM_FEATURES = [
  {
    icon: Play,
    title: "Static & Dynamic Scanner",
    desc: "Scan APK and IPA binaries using automated MobSF analysis, DEX decompilers, and real-time terminal output logs.",
    href: "/scan",
    color: "#ec4899",
    badge: "CORE"
  },
  {
    icon: Cpu,
    title: "Frida & Objection Studio",
    desc: "Generate and test runtime hooking scripts for SSL Pinning bypass, biometric authentication override, and crypto key extraction.",
    href: "/frida",
    color: "#a855f7",
    badge: "DYNAMIC"
  },
  {
    icon: FileCode,
    title: "Bytecode & Manifest Decompiler",
    desc: "Inspect decompiled Java/Smali/Swift source trees, AndroidManifest.xml exported components, and exposed AWS/Firebase cloud keys.",
    href: "/decompiler",
    color: "#3b82f6",
    badge: "STATIC"
  },
  {
    icon: ShieldCheck,
    title: "OWASP MASVS 2.1 Audit Matrix",
    desc: "Interactive compliance checklist covering all 7 MASVS domains and MASTG test cases with one-click report export.",
    href: "/masvs",
    color: "#10b981",
    badge: "COMPLIANCE"
  },
  {
    icon: Bug,
    title: "Bug Bounty Lab & Case Studies",
    desc: "Real-world walkthroughs from TCM Security PMPA course: Joann Fabrics, Zaxby's, Nike, Kohl's, and InjuredAndroid Flags 1–4.",
    href: "/bug-bounty",
    color: "#f59e0b",
    badge: "EXAM LABS"
  },
  {
    icon: GraduationCap,
    title: "PMPA Knowledge Hub (72% Tracked)",
    desc: "Complete TCM Security Mobile Pentesting syllabus tracking, study planner, and command reference cheatsheets.",
    href: "/learning",
    color: "#06b6d4",
    badge: "ROADMAP"
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a060d] text-white">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)" }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold"
              style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.25)", color: "var(--primary)" }}>
              <Smartphone className="w-3.5 h-3.5" /> Platform 13 of 34 — Mobile Application Security Testing (MAST)
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
              Static · Dynamic · Swarm.<br />
              <span className="bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 bg-clip-text text-transparent">
                Mobile Security Perfected.
              </span>
            </h1>

            <p className="text-base sm:text-lg max-w-3xl mx-auto mb-10 text-slate-300 leading-relaxed">
              Comprehensive Android &amp; iOS security assessment platform aligned with <span className="text-white font-semibold">OWASP MASVS 2.1</span> and the <span className="text-white font-semibold">TCM Security Practical Mobile Pentest Associate (PMPA)</span> curriculum.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/scan"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold hover:opacity-90 hover:scale-105 transition-all shadow-lg shadow-pink-600/30"
                style={{ background: "linear-gradient(135deg, #ec4899, #be185d)", color: "#fff" }}>
                <Play className="w-4 h-4" /> Launch App Scanner
              </Link>
              <Link href="/frida"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-[#140c1a] border border-pink-500/40 hover:bg-[#1a0f24] text-pink-300 transition-all">
                <Cpu className="w-4 h-4" /> Frida Hooking Studio
              </Link>
              <Link href="/learning"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold bg-[#120b17] border border-slate-800 text-slate-300 hover:text-white transition-all">
                <GraduationCap className="w-4 h-4" /> PMPA Roadmap (72%)
              </Link>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
              {[
                { v: SCAN_SUMMARY.apps.toString(),          l: "Apps Audited",       c: "var(--primary)" },
                { v: SCAN_SUMMARY.criticalCount.toString(), l: "Critical Findings",  c: "var(--critical)" },
                { v: SCAN_SUMMARY.highCount.toString(),     l: "High Severity",      c: "var(--high)" },
                { v: `${SCAN_SUMMARY.avgRiskScore}/100`,    l: "Avg Risk Score",     c: "var(--medium)" },
              ].map(s => (
                <div key={s.l} className="rounded-2xl p-5 bg-[#120b17] border border-slate-800 text-left">
                  <div className="text-3xl font-black mb-1" style={{ color: s.c }}>{s.v}</div>
                  <div className="text-xs text-slate-400 font-medium">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Platform Feature Cards Grid */}
            <div className="text-left mb-16">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Security Testing Modules &amp; Toolchain
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PLATFORM_FEATURES.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <Link
                      key={feat.title}
                      href={feat.href}
                      className="group p-6 rounded-2xl bg-[#120b17] border border-slate-800 hover:border-pink-500/50 hover:bg-[#160d1d] transition-all shadow-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-pink-500/10 border border-pink-500/20 text-pink-400 group-hover:scale-110 transition-transform">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {feat.badge}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-pink-400 transition-colors flex items-center gap-1.5">
                        {feat.title}
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Target App Inventory */}
            <div className="text-left mb-16">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Target Mobile App Testbed</h2>
                <Link href="/dashboard" className="text-xs font-bold text-pink-400 hover:underline">
                  View All Findings →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {APPS.slice(0, 3).map(app => (
                  <div key={app.id} className="rounded-2xl p-5 bg-[#120b17] border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: platformBg(app.platform), color: platformColor(app.platform) }}>
                        {app.platform}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">v{app.version}</span>
                    </div>
                    <div className="text-sm font-bold text-white mb-1">{app.name}</div>
                    <div className="text-xs font-mono text-slate-400 mb-3">{app.bundleId}</div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                      <span className="text-rose-400 font-bold">{app.findings} Findings</span>
                      <span className="font-bold text-amber-400">Risk {app.riskScore}/100</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OWASP MASVS Badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {MASVS.map(m => (
                <span key={m} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-pink-500/5 border border-pink-500/20 text-pink-300">
                  📱 {m}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
