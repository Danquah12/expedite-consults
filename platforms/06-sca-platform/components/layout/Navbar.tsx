"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Package, Menu, X, ChevronRight, BarChart3 } from "lucide-react";

const NAV_LINKS = [
  { label: "Home",      href: "/" },
  { label: "Scan",      href: "/scan" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ borderColor: "var(--border)", background: "rgba(10,15,26,0.85)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <Package className="w-4 h-4" style={{ color: "var(--primary)" }} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-white">SCA Platform</span>
              <span className="text-[10px]" style={{ color: "var(--muted)" }}>Platform 6 of 34</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ color: pathname === link.href ? "var(--primary)" : "var(--muted)", background: pathname === link.href ? "rgba(16,185,129,0.08)" : "transparent" }}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}>
              <BarChart3 className="w-3.5 h-3.5" />
              View Dashboard
            </Link>
          </div>

          <button className="md:hidden p-2 rounded-lg" style={{ color: "var(--muted)" }}
            onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium"
                style={{ color: pathname === link.href ? "var(--primary)" : "var(--muted)", background: pathname === link.href ? "rgba(16,185,129,0.08)" : "transparent" }}>
                {link.label}<ChevronRight className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
