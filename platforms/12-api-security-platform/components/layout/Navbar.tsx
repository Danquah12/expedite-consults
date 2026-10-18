"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe2,
  Shield,
  BarChart3,
  Lock,
  FileJson,
  Activity,
  KeyRound,
  Cpu,
  CheckCircle2,
  Play,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Front Desk", badge: "P12", icon: Globe2 },
  { href: "/scan", label: "Scan & Fuzzer", badge: "83", icon: Play },
  { href: "/validation-engine", label: "Proof Engine", badge: "6 Verified", icon: Cpu },
  { href: "/dashboard", label: "Triage Desk", badge: "8 Alerts", icon: BarChart3 },
  { href: "/bola-matrix", label: "BOLA Matrix", icon: Lock },
  { href: "/bfla-hunter", label: "BFLA Hunter", icon: Shield },
  { href: "/openapi-ingest", label: "OpenAPI 3.1", icon: FileJson },
  { href: "/rate-limit-tester", label: "Rate Limits", icon: Activity },
  { href: "/jwt-guard", label: "JWT Guard", icon: KeyRound },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(243, 238, 228, 0.94)",
        backdropFilter: "blur(10px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3">
        {/* Top Row: Editorial Desk Masthead & Actions */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: "var(--accent)",
                color: "#fbf8f3",
              }}
            >
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <div className="desk-kicker">XTRIKE API SECURITY &middot; PLATFORM 12</div>
              <div
                className="text-lg font-bold leading-tight font-editorial"
                style={{ color: "var(--foreground)" }}
              >
                XTRIKE API DESK &mdash; Proof-Driven API Security
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
              <CheckCircle2
                className="w-3.5 h-3.5"
                style={{ color: "var(--success)" }}
              />
              <span>83 Endpoints Indexed &middot; Commit 9f4c2a1e</span>
            </div>

            <Link
              href="/scan"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
              style={{
                background: "var(--accent)",
                color: "#fbf8f3",
                border: "1px solid #72361d",
              }}
            >
              Launch API Scan
            </Link>
          </div>
        </div>

        {/* Second Row: Desk Note Pill Navigation Bar */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {navItems.map(({ href, label, badge, icon: Icon }) => {
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
