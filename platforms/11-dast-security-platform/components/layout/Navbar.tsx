"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Crosshair, Menu, X, ChevronRight, Layers, ExternalLink,
  Shield, Activity, Zap, Play, Terminal, Flame, Eye, Lock
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [defcon, setDefcon] = useState(2);
  const [reqRate, setReqRate] = useState(148);

  useEffect(() => {
    const iv = setInterval(() => {
      setReqRate(Math.floor(130 + Math.random() * 40));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        borderColor: "var(--border)",
        background: "rgba(6, 8, 13, 0.92)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6)"
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Left Brand & DEFCON */}
          <div className="flex items-center gap-4">
            <Link href="/app" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(225,29,72,0.15)", border: "1px solid rgba(225,29,72,0.4)", boxShadow: "0 0 12px rgba(225,29,72,0.3)" }}>
                <Shield className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <div className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                  ÆGIS · SOC
                  <span className="text-[10px] px-1.5 py-0.2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded font-bold">DAST PLATFORM 11</span>
                </div>
              </div>
            </Link>

            {/* DEFCON Threat Meter */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md border border-rose-500/30 bg-rose-950/20">
              <span className="beacon-crimson" />
              <span className="text-[10px] font-black tracking-wider text-rose-400">DEFCON {defcon} : ELEVATED RECON</span>
            </div>
          </div>

          {/* Center Telemetry HUD */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-slate-800 bg-slate-900/50">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 font-mono text-[11px]">{reqRate} req/s</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-slate-800 bg-slate-900/50">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 font-mono text-[11px]">4 Engines Online</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-slate-800 bg-slate-900/50">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 font-mono text-[11px]">OOB Listener Active</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://18-unified-integration-layer.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.35)",
                color: "#10b981",
                boxShadow: "0 0 10px rgba(16,185,129,0.15)"
              }}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Unified Integration</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <Link href="/live-scan"
              className="btn-primary">
              <Play className="w-3.5 h-3.5" /> Run 4-Stage DAST
            </Link>
          </div>

          <button className="md:hidden p-2 text-slate-400" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-2">
          <Link href="/app" onClick={() => setOpen(false)} className="block px-3 py-2 rounded text-white font-bold bg-rose-500/20 border border-rose-500/40">
            ÆGIS · SOC Standalone Portal
          </Link>
          <Link href="/live-scan" onClick={() => setOpen(false)} className="block px-3 py-2 rounded text-slate-300 hover:bg-slate-900">
            4-Stage Live Scan Pipeline
          </Link>
          <Link href="/evidence" onClick={() => setOpen(false)} className="block px-3 py-2 rounded text-slate-300 hover:bg-slate-900">
            Evidence Vault & Report
          </Link>
          <a href="https://18-unified-integration-layer.vercel.app" target="_blank" rel="noreferrer" className="block px-3 py-2 rounded text-emerald-400 hover:bg-slate-900">
            Unified Integration Layer ↗
          </a>
        </div>
      )}
    </header>
  );
}
