"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  Crosshair,
  GitGraph,
  ShieldCheck,
  FileText,
  Terminal,
  Database,
  Share2,
  Cpu,
  Zap,
  Activity,
  Layers
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navGroups = [
    {
      group: "🌐 UNIFIED COMMAND & INTELLIGENCE",
      items: [
        { href: "/", label: "Executive Single-Pane Command", icon: LayoutDashboard, badge: "Master Hub" },
        { href: "/federated-telemetry", label: "Real-Time Telemetry Bus", icon: Radio, badge: "24.5k evt/s" },
        { href: "/shared-threat-intel", label: "Shared Threat Intel Hub", icon: Crosshair, badge: "STIX 2.1" },
      ]
    },
    {
      group: "⚡ ORCHESTRATION & AUTONOMOUS SOAR",
      items: [
        { href: "/cross-platform-playbooks", label: "Cross-Platform SOAR Engine", icon: GitGraph, badge: "Visual DAG" },
        { href: "/webhooks-connectors", label: "SIEM & EDR Connectors", icon: Share2, badge: "10 Live" },
      ]
    },
    {
      group: "🔒 IDENTITY & COMPLIANCE",
      items: [
        { href: "/unified-identity", label: "Unified Identity & RBAC", icon: ShieldCheck, badge: "Zero-Trust" },
        { href: "/unified-reporting", label: "Unified Boardroom Reporting", icon: FileText, badge: "SEC 8-K / HIPAA" },
      ]
    },
    {
      group: "🔌 GATEWAY, DATA LAKE & INFRA",
      items: [
        { href: "/api-gateway", label: "API Gateway & GraphQL", icon: Terminal, badge: "gRPC / REST" },
        { href: "/data-lake", label: "Federated Security Data Lake", icon: Database, badge: "OpenSearch" },
        { href: "/mesh-health", label: "Microservices Mesh Health", icon: Cpu, badge: "OTel Tracing" },
      ]
    }
  ];

  return (
    <aside style={{
      width: 290,
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 56px)",
      overflowY: "auto",
      flexShrink: 0
    }}>
      <div style={{ padding: "14px 10px", display: "flex", flexDirection: "column", gap: 16 }}>
        {navGroups.map((group, gIdx) => (
          <div key={gIdx}>
            <div style={{
              fontSize: 9.5,
              fontWeight: 800,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "4px 8px",
              marginBottom: 4
            }}>
              {group.group}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {group.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "8px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      color: active ? "#10b981" : "var(--fg-2)",
                      background: active ? "rgba(16,185,129,0.12)" : "transparent",
                      border: active ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent",
                      textDecoration: "none",
                      transition: "all 0.12s ease"
                    }}
                  >
                    <Icon size={14} color={active ? "#10b981" : "var(--muted)"} />
                    <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span style={{
                        fontSize: 8.5,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: active ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.04)",
                        color: active ? "#10b981" : "var(--muted)",
                        border: "1px solid var(--border)",
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

      {/* Bottom Sticky Status Card */}
      <div style={{
        marginTop: "auto",
        padding: 12,
        borderTop: "1px solid var(--border)",
        background: "var(--surface-2)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} className="animate-ping" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981" }}>Ecosystem Synchronized</span>
          </div>
          <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>6/6 Fleets</span>
        </div>
        <div style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.4 }}>
          gRPC Message Bus: 1.8ms latency · STIX 2.1 Hub: Active · OpenSearch: 4.8 TB Scanned
        </div>
      </div>
    </aside>
  );
}
