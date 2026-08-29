"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Send, FolderOpen, Globe2, Play, History, Shield, LayoutDashboard, Zap } from "lucide-react";

const TOOLS = [
  { href: "/",              icon: LayoutDashboard, label: "Workspace",     badge: undefined },
  { href: "/builder",       icon: Send,            label: "Request Builder" },
  { href: "/collections",   icon: FolderOpen,      label: "Collections",   badge: "3" },
  { href: "/environments",  icon: Globe2,          label: "Environments",  badge: "3" },
  { href: "/runner",        icon: Play,            label: "Runner" },
  { href: "/history",       icon: History,         label: "History",       badge: "8" },
  { href: "/dashboard",     icon: Shield,          label: "Security Scan", badge: "8" },
  { href: "/scan",          icon: Zap,             label: "Quick Scan" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <nav style={{ width: 188, flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Logo */}
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap size={14} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>API Workstation</div>
          <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.07em" }}>POSTMAN × BURP SUITE</div>
        </div>
      </div>
      {/* Env indicator */}
      <div style={{ padding: "5px 14px", borderBottom: "1px solid var(--border)", fontSize: 9.5, color: "var(--muted)", flexShrink: 0 }}>
        <span style={{ color: "var(--green)" }}>●</span> Staging · api.acme.com/v2
      </div>
      {/* Nav */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
        {TOOLS.map(t => {
          const Icon = t.icon;
          const active = pathname === t.href;
          return (
            <Link key={t.href} href={t.href} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", textDecoration: "none",
              background: active ? "rgba(13,148,136,0.1)" : "transparent",
              borderLeft: active ? "2px solid var(--primary)" : "2px solid transparent",
              paddingLeft: active ? 12 : 14,
            }}>
              <Icon size={13} color={active ? "var(--primary)" : "var(--muted)"} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "var(--foreground)" : "#8898a8", flex: 1 }}>{t.label}</span>
              {t.badge && (
                <span style={{ fontSize: 9, fontWeight: 700, color: active ? "var(--primary)" : "var(--muted)", background: "var(--surface-2)", padding: "0 5px", borderRadius: 8 }}>{t.badge}</span>
              )}
            </Link>
          );
        })}
      </div>
      <div style={{ padding: "8px 14px", borderTop: "1px solid var(--border)", fontSize: 9.5, color: "var(--muted)", flexShrink: 0 }}>
        <div>Platform 12 of 34 · v2.0</div>
        <div style={{ color: "var(--primary)", opacity: 0.7, marginTop: 2 }}>Postman + Burp Hybrid</div>
      </div>
    </nav>
  );
}
