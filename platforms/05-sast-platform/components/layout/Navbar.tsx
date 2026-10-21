"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Cpu, CheckCircle2, Play, BarChart3, Layers, GitGraph, Bot, Box, Printer } from "lucide-react";

const NAV_LINKS = [
  { label: "Front Desk", href: "/", badge: "P05", icon: Shield },
  { label: "Scan Workspace", href: "/scan", badge: "1360px", icon: Play },
  { label: "Proof Engine", href: "/validation-engine", badge: "6 Stages", icon: Cpu },
  { label: "Triage Desk", href: "/dashboard", badge: "Split", icon: BarChart3 },
  { label: "Report Engine", href: "/reports", badge: "Print/PDF", icon: Printer },
  { label: "XTRIKE Fusion", href: "/fusion-engine", icon: Layers },
  { label: "Taint Graph", href: "/taint-graph", icon: GitGraph },
  { label: "AI-BOM", href: "/ai-bom", icon: Box },
  { label: "Dev Assist", href: "/developer-assist", icon: Bot },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 border-b no-print"
      style={{
        background: "rgba(243, 238, 228, 0.94)",
        backdropFilter: "blur(10px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3">
        {/* Top Masthead Row */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0" style={{ textDecoration: "none" }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: "var(--accent)",
                color: "#fbf8f3",
              }}
            >
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="desk-kicker">XTRIKE SAST SECURITY &middot; PLATFORM 05</div>
              <div
                className="text-lg font-bold leading-tight font-editorial"
                style={{ color: "var(--foreground)" }}
              >
                XTRIKE SAST DESK &mdash; Proof-Driven SAST Validation
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--muted)",
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--success)" }} />
              <span>PTES &amp; NIST 800-115 &middot; 6-Stage Proof Pipeline</span>
            </div>

            <Link
              href="/reports"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
              style={{
                background: "var(--surface)",
                color: "var(--accent)",
                border: "1px solid var(--accent)",
                textDecoration: "none",
              }}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </Link>

            <Link
              href="/scan"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
              style={{
                background: "var(--accent)",
                color: "#fbf8f3",
                border: "1px solid #72361d",
                textDecoration: "none",
              }}
            >
              New Hybrid Scan
            </Link>
          </div>
        </div>

        {/* Desk Note Pill Navigation Row */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {NAV_LINKS.map(({ href, label, badge, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
                style={{
                  background: active ? "var(--accent)" : "var(--surface)",
                  color: active ? "#fbf8f3" : "var(--foreground)",
                  border: active
                    ? "1px solid #72361d"
                    : "1px solid var(--border)",
                  boxShadow: "0 1px 2px rgba(31, 27, 24, 0.04)",
                  textDecoration: "none",
                }}
              >
                <Icon
                  className="w-3.5 h-3.5"
                  style={{
                    color: active ? "#fbf8f3" : "var(--muted)",
                  }}
                />
                <span>{label}</span>
                {badge && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: active ? "#fbf8f3" : "var(--accent-soft)",
                      color: "var(--accent)",
                    }}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
