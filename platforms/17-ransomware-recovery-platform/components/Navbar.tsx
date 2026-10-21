"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Zap,
  Lock,
  Cpu,
  ShieldCheck,
  Terminal,
  Activity,
  FileText,
  CheckCircle2,
  Layers,
  FlaskConical,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Front Desk", badge: "P17", icon: ShieldAlert },
  { href: "/synthetic-attack-lab", label: "Resilience & Validation Lab", badge: "SIM-001..007", icon: FlaskConical },
  { href: "/resilience-score", label: "Readiness Score", badge: "82–91%", icon: ShieldCheck },
  { href: "/triage", label: "Incident Triage", badge: "LockBit 3.0", icon: Zap },
  { href: "/crypto-analysis", label: "Crypto & Evidence", badge: "FRE 901", icon: Lock },
  { href: "/recovery-ops", label: "Recovery Ops", badge: "24 Hosts", icon: Cpu },
  { href: "/reinfection-risk", label: "Reinfection Guard", badge: "Clean-Room", icon: ShieldCheck },
  { href: "/soc-analyst", label: "SOC Workspace", icon: Terminal },
  { href: "/executive", label: "Executive Impact", icon: Activity },
  { href: "/cases", label: "Case Desk", badge: "3 Active", icon: Layers },
  { href: "/reports", label: "IR Reports", icon: FileText },
];

export function Navbar() {
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
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="desk-kicker">XTRIKE RANSOMWARE RECOVERY &middot; PLATFORM 17</div>
              <div
                className="text-lg font-bold leading-tight font-editorial"
                style={{ color: "var(--foreground)" }}
              >
                XTRIKE Recovery Desk &mdash; Forensic Decryption &amp; Clean-Room Restoration
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
              <span>95.0% Backup Readiness &middot; Case IR-2026-089</span>
            </div>

            <Link
              href="/triage"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
              style={{
                background: "var(--accent)",
                color: "#fbf8f3",
                border: "1px solid #72361d",
              }}
            >
              Launch Triage Studio
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

export default Navbar;
