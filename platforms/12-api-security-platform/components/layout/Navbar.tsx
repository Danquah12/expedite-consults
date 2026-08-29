"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Globe2, Menu, X, ChevronRight } from "lucide-react";

const NAV = [{ label: "Home", href: "/" }, { label: "Scan", href: "/scan" }, { label: "Dashboard", href: "/dashboard" }];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ borderColor: "var(--border)", background: "rgba(6,12,12,0.88)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(13,148,136,0.12)", border: "1px solid rgba(13,148,136,0.3)" }}>
              <Globe2 className="w-4 h-4" style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">API Security</div>
              <div className="text-[10px]" style={{ color: "var(--muted)" }}>Platform 12 of 34</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(l => (
              <Link key={l.href} href={l.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ color: pathname === l.href ? "var(--primary)" : "var(--muted)", background: pathname === l.href ? "rgba(13,148,136,0.08)" : "transparent" }}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex">
            <Link href="/scan"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)", color: "#fff" }}>
              <Globe2 className="w-3.5 h-3.5" /> Scan API
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
            {NAV.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-sm"
                style={{ color: pathname === l.href ? "var(--primary)" : "var(--muted)", background: pathname === l.href ? "rgba(13,148,136,0.08)" : "transparent" }}>
                {l.label}<ChevronRight className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
