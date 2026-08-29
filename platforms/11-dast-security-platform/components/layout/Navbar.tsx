"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Crosshair, Menu, X, ChevronRight, Layers, ExternalLink } from "lucide-react";

const NAV = [{ label: "Home", href: "/" }, { label: "Scan", href: "/scan" }, { label: "Dashboard", href: "/dashboard" }];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ borderColor: "var(--border)", background: "rgba(10,6,8,0.88)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(225,29,72,0.12)", border: "1px solid rgba(225,29,72,0.3)" }}>
              <Crosshair className="w-4 h-4" style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">DAST Security</div>
              <div className="text-[10px]" style={{ color: "var(--muted)" }}>Platform 11 of 34</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(l => (
              <Link key={l.href} href={l.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ color: pathname === l.href ? "var(--primary)" : "var(--muted)", background: pathname === l.href ? "rgba(225,29,72,0.08)" : "transparent" }}>
                {l.label}
              </Link>
            ))}
          </nav>
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

            <Link href="/scan"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(135deg, #e11d48, #be123c)", color: "#fff" }}>
              <Crosshair className="w-3.5 h-3.5" /> Run DAST Scan
            </Link>
          </div>
          <button className="md:hidden p-2" style={{ color: "var(--muted)" }} onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="px-4 py-4 space-y-1">
            <a
              href="https://18-unified-integration-layer.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-bold"
              style={{ color: "#10b981", background: "rgba(16,185,129,0.1)" }}
            >
              <span className="flex items-center gap-2"><Layers className="w-4 h-4" /> Unified Integration Layer</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            {NAV.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-sm"
                style={{ color: pathname === l.href ? "var(--primary)" : "var(--muted)", background: pathname === l.href ? "rgba(225,29,72,0.08)" : "transparent" }}>
                {l.label}<ChevronRight className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
