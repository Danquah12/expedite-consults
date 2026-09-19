"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Brain, LayoutDashboard, Radio, Flame, GitMerge,
  Globe, Shield, Bot, SearchCode, Crosshair,
  Map, FlipHorizontal2, Wand2, Shuffle, Activity,
  ListOrdered, SlidersHorizontal, ScrollText, Layers, Target, Settings, Zap,
  MessageSquare, Share2, Store, Package, Lock, ClipboardList, Network,
  FolderOpen, Server, GitBranch, CheckSquare, TrendingUp, Workflow,
  ShieldAlert, Swords, Waypoints, Sparkles, Search
} from "lucide-react";

const SECTIONS = [
  {
    title: "Command Center",
    items: [
      { href: "/app",             icon: Swords,           label: "ÆGIS · SOC Portal", badge: "PRO", hot: true },
      { href: "/",                icon: LayoutDashboard,  label: "Security Overview" },
      { href: "/engine",          icon: Brain,            label: "Engine Brain",      badge: "AUTO", hot: true },
      { href: "/live-scan",       icon: Waypoints,        label: "4-Stage Pipeline",  badge: "LIVE", hot: true },
    ],
  },
  {
    title: "AI & Threat Intel",
    items: [
      { href: "/copilot",         icon: MessageSquare,    label: "AXIOM Copilot",     badge: "AI",   hot: true },
      { href: "/knowledge-graph", icon: Share2,           label: "Knowledge Graph",   badge: "GNN",  hot: true },
      { href: "/ai",              icon: Bot,              label: "Autonomous Analyst" },
    ],
  },
  {
    title: "Dynamic Interceptor",
    items: [
      { href: "/proxy",           icon: Radio,            label: "Traffic Interceptor", badge: "8" },
      { href: "/repeater",        icon: Flame,            label: "Attack Forge" },
      { href: "/match-replace",   icon: GitMerge,         label: "Rule Mutation Engine" },
    ],
  },
  {
    title: "Active Attack & Probe",
    items: [
      { href: "/scanner",         icon: Crosshair,        label: "Vuln Probe Matrix", badge: "24" },
      { href: "/intruder",        icon: Shuffle,          label: "Fuzz Engine" },
      { href: "/crawler",         icon: Globe,            label: "Web Spider" },
      { href: "/api-scanner",     icon: SearchCode,       label: "API Inspector" },
      { href: "/exploit",         icon: Zap,              label: "Exploit Engine",    hot: true },
      { href: "/post-exploit",    icon: ShieldAlert,      label: "Priv Esc / Lateral",badge: "NEW", hot: true },
    ],
  },
  {
    title: "Recon & Surface",
    items: [
      { href: "/auth",            icon: Shield,           label: "Auth Manager",      hot: true },
      { href: "/parameters",      icon: SlidersHorizontal,label: "Parameter Lab" },
      { href: "/planner",         icon: Layers,           label: "Attack Planner",    hot: true },
      { href: "/profiles",        icon: Target,           label: "Scan Profiles" },
      { href: "/sitemap",         icon: Map,              label: "Application Map" },
      { href: "/scope",           icon: Target,           label: "Scope Guard" },
      { href: "/oob",             icon: Network,          label: "OOB Monitor",       hot: true },
      { href: "/scan-queue",      icon: ListOrdered,      label: "Scan Queue" },
    ],
  },
  {
    title: "Enterprise Governance",
    items: [
      { href: "/projects",        icon: FolderOpen,       label: "Projects & Orgs",   hot: true },
      { href: "/assets",          icon: Server,           label: "Asset Inventory",   hot: true },
      { href: "/pipeline",        icon: GitBranch,        label: "Findings Pipeline", hot: true },
      { href: "/validation",      icon: CheckSquare,      label: "Validation Service",hot: true },
      { href: "/risk-engine",     icon: TrendingUp,       label: "Risk Engine",       hot: true },
      { href: "/workflow",        icon: Workflow,         label: "Workflow Engine",   hot: true },
      { href: "/marketplace",     icon: Store,            label: "Marketplace",       badge: "HUB", hot: true },
      { href: "/plugins",         icon: Package,          label: "Plugin Manager",    badge: "5" },
      { href: "/rbac",            icon: Lock,             label: "Access Control",    hot: true },
      { href: "/audit",           icon: ClipboardList,    label: "Audit Log",         badge: "SOC2",hot: true },
    ],
  },
  {
    title: "Forensic Utilities",
    items: [
      { href: "/decoder",         icon: Wand2,            label: "Transform Lab" },
      { href: "/comparer",        icon: FlipHorizontal2,  label: "Diff Inspector" },
      { href: "/sequencer",       icon: Activity,         label: "Entropy Lab" },
      { href: "/logger",          icon: ScrollText,       label: "Full Trace Log" },
      { href: "/evidence",        icon: Layers,           label: "Evidence Vault",    hot: true },
      { href: "/settings",        icon: Settings,         label: "Global Settings" },
    ],
  },
];

export default function Sidebar() {
  const path = usePathname();
  const [filter, setFilter] = useState("");

  return (
    <aside style={{
      width: 220, flexShrink: 0, 
      background: "rgba(11, 15, 23, 0.95)",
      backdropFilter: "blur(20px)",
      borderRight: "1px solid var(--border)", 
      overflowY: "auto",
      display: "flex", flexDirection: "column",
      zIndex: 20
    }}>
      {/* Brand Header */}
      <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/app" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #e11d48, #be123c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(225, 29, 72, 0.5)",
              border: "1px solid rgba(225, 29, 72, 0.6)"
            }}>
              <Swords size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 5 }}>
                ÆGIS · SOC
                <span style={{ fontSize: 9, background: "rgba(0,240,255,0.15)", color: "#00f0ff", border: "1px solid rgba(0,240,255,0.4)", borderRadius: 4, padding: "0 4px", fontWeight: 800 }}>v4.5</span>
              </div>
              <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>AXIOM DAST ENGINE</div>
            </div>
          </div>
        </Link>

        {/* Quick Filter */}
        <div style={{ marginTop: 12, position: "relative" }}>
          <Search size={12} style={{ position: "absolute", left: 8, top: 8, color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Search 40+ studios..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{
              width: "100%", background: "rgba(6, 8, 13, 0.8)", border: "1px solid var(--border)",
              borderRadius: 6, padding: "5px 8px 5px 26px", fontSize: 11, color: "var(--fg)",
              outline: "none"
            }}
          />
        </div>
      </div>

      {/* Navigation Sections */}
      <nav style={{ flex: 1, padding: "8px 6px" }}>
        {SECTIONS.map(section => {
          const matchingItems = section.items.filter(item =>
            !filter || item.label.toLowerCase().includes(filter.toLowerCase())
          );
          if (filter && matchingItems.length === 0) return null;

          return (
            <div key={section.title} style={{ marginBottom: 8 }}>
              <div style={{
                padding: "6px 10px 4px", fontSize: 9, fontWeight: 800,
                color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em",
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <span>{section.title}</span>
                <span style={{ fontSize: 8, color: "var(--muted)" }}>{matchingItems.length}</span>
              </div>
              {matchingItems.map(item => {
                const Icon = item.icon;
                const active = path === item.href || (item.href !== "/" && item.href !== "/app" && path.startsWith(item.href)) || (item.href === "/app" && path === "/app");
                return (
                  <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 10px", margin: "1px 0", borderRadius: 6,
                      background: active ? "rgba(225, 29, 72, 0.15)" : "transparent",
                      border: active ? "1px solid rgba(225, 29, 72, 0.35)" : "1px solid transparent",
                      cursor: "pointer", transition: "all 0.15s ease-out"
                    }}>
                      <Icon size={14} color={active ? "#ff2a5f" : "var(--muted)"} />
                      <span style={{
                        fontSize: 11.5,
                        color: active ? "#fff" : "var(--fg-2)",
                        fontWeight: active ? 700 : 500,
                        flex: 1
                      }}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span style={{
                          fontSize: 8.5, padding: "1px 5px", borderRadius: 4, fontWeight: 800,
                          background: item.hot ? "rgba(225, 29, 72, 0.2)" : "rgba(255,255,255,0.05)",
                          color: item.hot ? "#ff4d79" : "var(--muted)",
                          border: `1px solid ${item.hot ? "rgba(225, 29, 72, 0.4)" : "var(--border)"}`,
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer Telemetry */}
      <div style={{
        padding: "10px 12px", borderTop: "1px solid var(--border)",
        background: "rgba(6, 8, 13, 0.9)", fontSize: 9.5, color: "var(--muted)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 5 }}>
            <span className="beacon-green" /> LIVE RADAR
          </span>
          <span style={{ color: "#00f0ff", fontWeight: 700 }}>4 ENGINES</span>
        </div>
        <div style={{ color: "var(--fg-2)", fontSize: 9 }}>ZAP · Burp · OpenVAS · Nmap</div>
        <div style={{ color: "#10b981", fontWeight: 600, marginTop: 2 }}>● 0 Zero-Day Latency</div>
      </div>
    </aside>
  );
}
