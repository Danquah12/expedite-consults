"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Smartphone, Menu, X, ChevronRight, Zap, FileCode, ShieldCheck, Bug, GraduationCap } from "lucide-react";

const NAV = [
  { label: "Overview", href: "/" },
  { label: "Scan APK/IPA", href: "/scan" },
  { label: "Findings", href: "/dashboard" },
  { label: "Decompiler", href: "/decompiler" },
  { label: "Frida Studio", href: "/frida" },
  { label: "MASVS 2.1", href: "/masvs" },
  { label: "Bug Bounty", href: "/bug-bounty" },
  { label: "PMPA Hub", href: "/learning" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ borderColor: "var(--border)", background: "rgba(10,6,13,0.92)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.3)" }}>
              <Smartphone className="w-4 h-4" style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Mobile Security</div>
              <div className="text-[10px]" style={{ color: "var(--muted)" }}>Platform 13 of 34 · MASVS &amp; PMPA</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(l => (
              <Link key={l.href} href={l.href}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ 
                  color: pathname === l.href ? "var(--primary)" : "var(--muted)", 
                  background: pathname === l.href ? "rgba(236,72,153,0.08)" : "transparent" 
                }}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-2">
            <Link href="/scan"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-pink-600/20"
              style={{ background: "linear-gradient(135deg, #ec4899, #be185d)", color: "#fff" }}>
              <Smartphone className="w-3.5 h-3.5" /> Scan App
            </Link>
          </div>

          <button className="lg:hidden p-2" style={{ color: "var(--muted)" }} onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="px-4 py-3 space-y-1">
            {NAV.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold"
                style={{ 
                  color: pathname === l.href ? "var(--primary)" : "var(--muted)", 
                  background: pathname === l.href ? "rgba(236,72,153,0.08)" : "transparent" 
                }}>
                {l.label}
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
