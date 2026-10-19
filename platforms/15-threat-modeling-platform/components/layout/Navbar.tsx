"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GitBranch,
  Shield,
  Layers,
  Network,
  Target,
  FileCode2,
  CheckCircle2,
  ClipboardList,
  Compass,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Front Desk", badge: "P15", icon: GitBranch },
  { href: "/threat-model", label: "STRIDE Checklist", badge: "10 Checks", icon: ClipboardList },
  { href: "/attack-chain", label: "Attack Chain", badge: "4 Nodes", icon: Network },
  { href: "/stride-analyzer", label: "STRIDE Studio", badge: "6 Categories", icon: Shield },
  { href: "/dfd-studio", label: "DFD Canvas", badge: "v4.2", icon: Layers },
  { href: "/attack-trees", label: "Attack Trees", icon: Target },
  { href: "/mitre-capec-bridge", label: "MITRE & CAPEC", icon: Compass },
  { href: "/countermeasure-planner", label: "Countermeasures", icon: FileCode2 },
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
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="desk-kicker">XTRIKE SECURITY DESK &middot; PLATFORM 15</div>
              <div
                className="text-lg font-bold leading-tight font-editorial"
                style={{ color: "var(--foreground)" }}
              >
                XTRIKE Desk Note &mdash; STRIDE, DFD &amp; Attack Tree Verification
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
              <span>42 Threats Mapped &middot; 91% Mitigated</span>
            </div>

            <Link
              href="/threat-model"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
              style={{
                background: "var(--accent)",
                color: "#fbf8f3",
                border: "1px solid #72361d",
              }}
            >
              Open STRIDE Modeler
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
