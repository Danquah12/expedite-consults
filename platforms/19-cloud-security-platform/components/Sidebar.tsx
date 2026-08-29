"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cloud,
  Search,
  ShieldCheck,
  Key,
  GitGraph,
  Play,
  Box,
  Bot,
  Wrench,
  Sliders,
  Radio,
  FileSpreadsheet,
  Globe,
  Lock,
  Layers
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navGroups = [
    {
      group: "🌟 Master Command & Intelligence",
      items: [
        { href: "/", label: "Cloud Command Center", icon: LayoutDashboard, badge: "Master" },
        { href: "/attack-paths", label: "Multi-Cloud Attack Paths", icon: GitGraph, badge: "FLAGSHIP" },
        { href: "/ai-analyst", label: "AI Cloud Security Copilot", icon: Bot, badge: "LLM" },
      ]
    },
    {
      group: "🔍 Discovery & Reconnaissance",
      items: [
        { href: "/discovery", label: "Multi-Cloud Asset Inventory", icon: Search, badge: "Graph" },
        { href: "/recon", label: "External Attack Surface & Recon", icon: Globe, badge: "EASM" },
      ]
    },
    {
      group: "🛡️ Assessment & Posture (CSPM)",
      items: [
        { href: "/cspm", label: "Multi-Cloud CSPM Engine", icon: ShieldCheck, badge: "CIS/NIST" },
        { href: "/iam-analyzer", label: "IAM Privilege Escalation", icon: Key, badge: "PrivEsc" },
        { href: "/kubernetes", label: "Kubernetes & Container Security", icon: Box, badge: "EKS/GKE" },
      ]
    },
    {
      group: "⚡ Authorized PenTest & Remediation",
      items: [
        { href: "/pentest", label: "Cloud PenTest & Exploitation", icon: Play, badge: "Drills" },
        { href: "/remediation", label: "1-Click Automated Remediation", icon: Wrench, badge: "Terraform" },
        { href: "/risk-engine", label: "Multi-Cloud Risk Engine", icon: Sliders, badge: "Scoring" },
      ]
    },
    {
      group: "📊 Telemetry & Compliance",
      items: [
        { href: "/detection-telemetry", label: "Cloud Audit Telemetry & Logs", icon: Radio, badge: "Stream" },
        { href: "/compliance-reporting", label: "Compliance & Board Reports", icon: FileSpreadsheet, badge: "Audit" },
      ]
    }
  ];

  return (
    <aside style={{
      width: 285,
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      overflowY: "auto"
    }}>
      <div style={{ padding: "16px 14px" }}>
        {navGroups.map((group, idx) => (
          <div key={idx} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--muted)",
              marginBottom: 8,
              paddingLeft: 8
            }}>
              {group.group}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {group.items.map(item => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      color: active ? "#f59e0b" : "#cbd5e1",
                      background: active ? "rgba(245,158,11,0.12)" : "transparent",
                      border: active ? "1px solid rgba(245,158,11,0.3)" : "1px solid transparent",
                      textDecoration: "none",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon size={15} color={active ? "#f59e0b" : "#8493a8"} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "1px 5px",
                        borderRadius: 4,
                        background: active ? "rgba(245,158,11,0.25)" : "var(--surface-2)",
                        color: active ? "#f59e0b" : "var(--muted)",
                        fontFamily: "monospace"
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
