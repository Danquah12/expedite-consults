"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, GitBranch, Shield, Waypoints
} from "lucide-react";

type NavItem = {
  href: string;
  icon: any;
  label: string;
  badge?: string;
  hot?: boolean;
};

type Section = {
  title: string;
  items: NavItem[];
};

const SECTIONS: Section[] = [
  {
    title: "Overview",
    items: [
      { href: "/", icon: LayoutDashboard, label: "Dashboard" }
    ]
  },
  {
    title: "Threat Modeling",
    items: [
      { href: "/threat-model", icon: Shield, label: "STRIDE Modeler", badge: "STRIDE" }
    ]
  },
  {
    title: "Visualizer",
    items: [
      { href: "/attack-chain", icon: GitBranch, label: "Attack Chain Map", hot: true }
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      style={{
        width: 240,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flexShrink: 0
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "24px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, #00d4ff, #0098b8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0a0f1a",
            fontWeight: 800
          }}
        >
          <Waypoints size={18} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#fff", lineHeight: 1.1 }}>AXIOM Modeling</div>
          <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>Threat Modeler & Chain</div>
        </div>
      </div>

      {/* Nav List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 12px" }}>
        {SECTIONS.map((sec, sIdx) => (
          <div key={sIdx} style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--muted)",
                marginBottom: 8,
                paddingLeft: 12
              }}
            >
              {sec.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {sec.items.map((item, iIdx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={iIdx}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 600,
                      color: isActive ? "#fff" : "var(--fg-2)",
                      background: isActive ? "rgba(0, 212, 255, 0.08)" : "transparent",
                      border: isActive ? "1px solid rgba(0, 212, 255, 0.15)" : "1px solid transparent",
                      transition: "all 0.2s"
                    }}
                  >
                    <Icon size={16} style={{ color: isActive ? "var(--blue)" : "var(--muted)" }} />
                    <span>{item.label}</span>
                    
                    {item.badge && (
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 9,
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "rgba(0, 212, 255, 0.12)",
                          color: "#00d4ff"
                        }}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.hot && (
                      <span
                        style={{
                          marginLeft: "auto",
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#00d4ff"
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border)",
          fontSize: 10.5,
          color: "var(--muted)",
          display: "flex",
          flexDirection: "column",
          gap: 4
        }}
      >
        <div>SYSTEM STATUS: <span style={{ color: "var(--green)" }}>ONLINE</span></div>
        <div>MODEL VERSION: <span style={{ color: "#fff" }}>v1.2.0</span></div>
      </div>
    </div>
  );
}
