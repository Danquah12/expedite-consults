"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Shield, Sparkles, Layers, ExternalLink, Menu, X, Cpu, GitGraph, Box, Terminal, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Overview", href: "/" },
  { label: "Scan Workspace", href: "/scan" },
  { label: "Validation Engine", href: "/validation-engine", badge: "PROOF" },
  { label: "AXIOM Fusion", href: "/fusion-engine", badge: "HYBRID" },
  { label: "Dev Assist Agent", href: "/developer-assist", badge: "AI" },
  { label: "AI-BOM Inventory", href: "/ai-bom", badge: "NEW" },
  { label: "Taint Graph", href: "/taint-graph" },
  { label: "MCP Server", href: "/mcp-server", badge: "IDE" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "5px 16px",
        fontSize: 11.5,
        fontWeight: 500,
        textAlign: "center",
        color: "var(--muted)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }}>
        <span style={{ color: "#ececef", fontWeight: 600 }}>
          Gartner Leader
        </span>
        <span>
          &middot; Rule-based precision plus AI triage, so you only see findings that matter
        </span>
      </div>

      <header
        style={{
          height: 60,
          background: "rgba(22, 25, 31, 0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 50
        }}
      >
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "#7aa2f7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "none"
            }}>
              <Shield size={18} color="#0f1115" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.06em", color: "#ececef" }}>
                  AXIOM <span style={{ color: "#7aa2f7" }}>SAST</span>
                </span>
                <span style={{
                  fontSize: 9,
                  fontWeight: 800,
                  padding: "1px 5px",
                  borderRadius: 4,
                  background: "rgba(122, 162, 247, 0.15)",
                  color: "#7aa2f7",
                  border: "1px solid var(--border)"
                }}>
                  FUSION v4.2
                </span>
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>
                Next-Gen Static Application Security &middot; Platform 05
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: active ? 800 : 600,
                    color: active ? "#7aa2f7" : "#c3c7cf",
                    background: active ? "rgba(122, 162, 247, 0.12)" : "transparent",
                    border: active ? "1px solid var(--border)" : "1px solid transparent",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span style={{
                      fontSize: 8.5,
                      fontWeight: 800,
                      padding: "1px 4px",
                      borderRadius: 3,
                      background: "var(--surface-3)",
                      color: "var(--muted)"
                    }}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            

            <Link
              href="/scan"
              style={{
                background: "#7aa2f7",
                color: "#0f1115",
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 800,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "none"
              }}
            >
              <Sparkles size={13} />
              <span>New Hybrid Scan</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
