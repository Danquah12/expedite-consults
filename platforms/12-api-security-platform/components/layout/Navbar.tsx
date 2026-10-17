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
  { href: "/", label: "Overview", icon: Globe2 },
  { href: "/scan", label: "Scan & Fuzzer", icon: Play },
  { href: "/validation-engine", label: "Validation Engine", icon: Cpu },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
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
        background: "rgba(15, 17, 21, 0.92)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--accent-soft)",
              border: "1px solid rgba(122, 162, 247, 0.28)",
            }}
          >
            <Globe2 className="w-4 h-4" style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-semibold tracking-tight"
                style={{ color: "var(--foreground)" }}
              >
                API Security Platform
              </span>
              <span
                className="text-[11px] px-1.5 py-0.5 rounded font-mono"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                P12
              </span>
            </div>
            <div className="text-[11px]" style={{ color: "var(--muted)" }}>
              OWASP API Top 10:2023 &middot; Proof-Driven Validation
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
                style={{
                  background: active ? "var(--surface-2)" : "transparent",
                  color: active ? "var(--foreground)" : "var(--muted)",
                  border: active
                    ? "1px solid var(--border)"
                    : "1px solid transparent",
                }}
              >
                <Icon
                  className="w-3.5 h-3.5"
                  style={{
                    color: active ? "var(--accent)" : "var(--subtle)",
                  }}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden xl:flex items-center gap-2.5 shrink-0">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs"
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
            <span>83 Endpoints Indexed</span>
          </div>

          <Link
            href="/scan"
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--accent)",
              color: "#0f1115",
            }}
          >
            Launch API Scan
          </Link>
        </div>
      </div>
    </header>
  );
}
