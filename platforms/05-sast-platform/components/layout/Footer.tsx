import Link from "next/link";
import { Shield, Github, Globe, Mail } from "lucide-react";

const LINKS = [
  {
    title: "Platform",
    items: [
      { label: "Home",      href: "/" },
      { label: "Run Scan",  href: "/scan" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Coverage",
    items: [
      { label: "OWASP Top 10", href: "/#compliance" },
      { label: "CWE Catalog",  href: "/#compliance" },
      { label: "PCI DSS",      href: "/#compliance" },
      { label: "NIST 800-53",  href: "/#compliance" },
    ],
  },
  {
    title: "Platform Suite",
    items: [
      { label: "Platform 5 — SAST (Current)", href: "/" },
      { label: "Platform 6 — SCA",            href: "#" },
      { label: "Platform 7 — Secrets",        href: "#" },
      { label: "Platform 8 — Container",      href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      className="border-t mt-24"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)" }}
              >
                <Shield className="w-4 h-4" style={{ color: "var(--primary)" }} />
              </div>
              <span className="text-sm font-bold text-white">SAST Platform</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Enterprise static application security testing. Multi-engine analysis
              with graph-backed exploitability validation.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg transition-colors hover:text-white"
                style={{
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="mailto:security@example.com"
                className="p-2 rounded-lg transition-colors hover:text-white"
                style={{
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg transition-colors hover:text-white"
                style={{
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {LINKS.map((group) => (
            <div key={group.title} className="space-y-4">
              <h3 className="text-sm font-semibold text-white">{group.title}</h3>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "var(--muted)" }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            © 2026 SAST Platform · Platform 5 of 34 · Agentic Security Suite
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
            <span>Powered by CodeQL · Semgrep · Joern · AI Reasoning</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
